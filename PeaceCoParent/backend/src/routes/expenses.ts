import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { checkExpenseLimit, incrementExpenseUsage } from '../middleware/requireTier';
import { sendPushToUser } from '../services/pushNotifications';
import { sendEmail, expenseRespondedEmail } from '../services/emailService';
import { validate, expenseSchema } from '../utils/validate';
import type { CreateExpenseRequest, RespondExpenseRequest } from '../types/shared';

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const s3 = process.env.AWS_ACCESS_KEY_ID
  ? new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

function rowToExpense(r: Record<string, unknown>) {
  return {
    id: r.id,
    familyId: r.family_id,
    submittedBy: r.submitted_by,
    submitterName: r.submitter_name,
    submitterColor: r.submitter_color,
    title: r.title,
    amount: r.amount,
    currency: r.currency,
    category: r.category,
    receiptUrl: r.receipt_url,
    notes: r.notes,
    splitPercent: r.split_percent,
    status: r.status,
    stripePaymentIntentId: r.stripe_payment_intent_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// GET /api/expenses
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    `SELECT e.*, u.name as submitter_name, fm.color as submitter_color
     FROM expenses e
     JOIN users u ON u.id = e.submitted_by
     JOIN family_members fm ON fm.user_id = e.submitted_by AND fm.family_id = e.family_id
     WHERE e.family_id = $1
     ORDER BY e.created_at DESC
     LIMIT 100`,
    [familyId]
  );

  res.json({ expenses: result.rows.map(rowToExpense) });
});

// POST /api/expenses
router.post('/', requireAuth, validate(expenseSchema), async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const { title, amount, currency = 'usd', category, notes, splitPercent = 50 } = req.body as CreateExpenseRequest;

  if (!title || !amount || !category) {
    res.status(400).json({ error: 'title, amount and category are required' });
    return;
  }
  if (amount <= 0) { res.status(400).json({ error: 'amount must be positive (in cents)' }); return; }
  if (splitPercent < 0 || splitPercent > 100) { res.status(400).json({ error: 'splitPercent must be 0–100' }); return; }

  // Free tier limit: 3 expenses per month
  const limit = await checkExpenseLimit(req.userId!);
  if (!limit.allowed) {
    res.status(403).json({
      error: 'upgrade_required',
      message: `Free plan allows 3 expenses per month. You've used ${limit.used}/${limit.limit}. Upgrade to Personal for unlimited expenses.`,
      used: limit.used,
      limit: limit.limit,
    });
    return;
  }

  const result = await pool.query(
    `INSERT INTO expenses (family_id, submitted_by, title, amount, currency, category, notes, split_percent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [familyId, req.userId, title, amount, currency, category, notes ?? null, splitPercent]
  );

  await incrementExpenseUsage(req.userId!);

  const userRow = await pool.query(
    'SELECT u.name, fm.color FROM users u JOIN family_members fm ON fm.user_id = u.id AND fm.family_id = $2 WHERE u.id = $1',
    [req.userId, familyId]
  );

  const r = { ...result.rows[0], submitter_name: userRow.rows[0]?.name, submitter_color: userRow.rows[0]?.color };
  res.status(201).json({ expense: rowToExpense(r) });
});

// POST /api/expenses/:id/receipt-upload-url
router.post('/:id/receipt-upload-url', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!s3 || !process.env.AWS_S3_BUCKET) { res.status(503).json({ error: 'Storage not configured' }); return; }

  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const expenseRow = await pool.query(
    'SELECT * FROM expenses WHERE id = $1 AND family_id = $2 AND submitted_by = $3',
    [req.params.id, familyId, req.userId]
  );
  if (!expenseRow.rows[0]) { res.status(404).json({ error: 'Expense not found' }); return; }

  const { mimeType = 'image/jpeg' } = req.body as { mimeType?: string };
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const s3Key = `receipts/${familyId}/${req.params.id}/${uuidv4()}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: s3Key,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });

  // Store the receipt URL in advance (key will be valid after upload)
  const receiptUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
  await pool.query('UPDATE expenses SET receipt_url = $1, updated_at = NOW() WHERE id = $2 AND family_id = $3', [receiptUrl, req.params.id, familyId]);

  res.json({ uploadUrl, receiptUrl, s3Key });
});

// PATCH /api/expenses/:id/respond  (the OTHER parent approves or rejects)
router.patch('/:id/respond', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const { action } = req.body as RespondExpenseRequest;
  if (!['approve', 'reject'].includes(action)) {
    res.status(400).json({ error: 'action must be approve or reject' });
    return;
  }

  const client = await pool.connect();
  let expense: Record<string, unknown>;
  let updated: { rows: Record<string, unknown>[] };
  try {
    await client.query('BEGIN');

    // Lock row to prevent double-approval race condition
    const expenseResult = await client.query(
      'SELECT * FROM expenses WHERE id = $1 AND family_id = $2 FOR UPDATE',
      [req.params.id, familyId]
    );
    expense = expenseResult.rows[0];
    if (!expense) { await client.query('ROLLBACK'); res.status(404).json({ error: 'Expense not found' }); return; }
    if (expense.submitted_by === req.userId) {
      await client.query('ROLLBACK');
      res.status(403).json({ error: 'You cannot respond to your own expense' }); return;
    }
    if (expense.status !== 'pending') {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Expense is no longer pending' }); return;
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    let paymentIntentId: string | null = null;

    if (action === 'approve' && stripe) {
      try {
        const owedAmount = Math.round((expense.amount as number) * ((expense.split_percent as number) / 100));
        const intent = await stripe.paymentIntents.create({
          amount: owedAmount,
          currency: expense.currency as string,
          metadata: { expenseId: expense.id as string, familyId, submittedBy: expense.submitted_by as string },
        });
        paymentIntentId = intent.id;
      } catch (stripeErr) {
        console.error('Stripe error:', stripeErr);
      }
    }

    updated = await client.query(
      `UPDATE expenses
         SET status = $1,
             stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
             responded_by = $3,
             responded_at = NOW(),
             updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [newStatus, paymentIntentId, req.userId, expense.id]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Push + email to the expense submitter
  const actionWord = action === 'approve' ? 'approved' : 'rejected';
  sendPushToUser(expense.submitted_by as string, {
    title: `Expense ${actionWord}`,
    body: `"${expense.title}" was ${actionWord}`,
    url: '/expenses',
  }).catch(() => {});
  const submitterRow = await pool.query('SELECT email, name FROM users WHERE id = $1', [expense.submitted_by]);
  if (submitterRow.rows[0]) {
    await sendEmail(
      submitterRow.rows[0].email,
      `Expense ${actionWord}: ${expense.title as string}`,
      expenseRespondedEmail(submitterRow.rows[0].name, expense.title as string, actionWord, expense.amount as number)
    ).catch((err) => console.error('[expenses] email failed:', err));
  }

  const userRow = await pool.query(
    'SELECT u.name, fm.color FROM users u JOIN family_members fm ON fm.user_id = u.id AND fm.family_id = $2 WHERE u.id = $1',
    [expense.submitted_by, familyId]
  );
  const r = { ...updated.rows[0], submitter_name: userRow.rows[0]?.name, submitter_color: userRow.rows[0]?.color };
  res.json({ expense: rowToExpense(r) });
});

// POST /api/expenses/:id/pay-checkout  — create a Stripe Checkout Session for the payer
router.post('/:id/pay-checkout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!stripe) { res.status(503).json({ error: 'Payments not configured' }); return; }

  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const expenseResult = await pool.query(
    'SELECT * FROM expenses WHERE id = $1 AND family_id = $2',
    [req.params.id, familyId]
  );
  const expense = expenseResult.rows[0];
  if (!expense) { res.status(404).json({ error: 'Expense not found' }); return; }
  if (expense.submitted_by === req.userId) {
    res.status(403).json({ error: 'You cannot pay your own expense' }); return;
  }
  if (expense.status !== 'approved') {
    res.status(409).json({ error: 'Expense is not approved yet' }); return;
  }

  const owedAmount = Math.round(expense.amount * (expense.split_percent / 100));
  if (owedAmount <= 0) { res.status(400).json({ error: 'Nothing owed on this expense' }); return; }

  const userRow = await pool.query('SELECT email, name, stripe_customer_id FROM users WHERE id = $1', [req.userId]);
  const user = userRow.rows[0];
  let customerId: string = user.stripe_customer_id;
  if (!customerId && stripe) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: req.userId! } });
    await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, req.userId]);
    customerId = customer.id;
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'https://peacecoparent.com';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: expense.currency,
        unit_amount: owedAmount,
        product_data: {
          name: expense.title,
          description: `Co-parenting expense — your share (${expense.split_percent}%)`,
        },
      },
      quantity: 1,
    }],
    success_url: `${frontendUrl}/expenses?paid=1`,
    cancel_url: `${frontendUrl}/expenses`,
    metadata: { expenseId: expense.id, familyId },
  });

  res.json({ url: session.url });
});

// POST /api/expenses/webhook  (Stripe webhook — mark as paid)
router.post('/webhook', async (req: Request, res: Response) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) { res.json({ received: true }); return; }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  // Idempotency: skip if this webhook event was already processed
  const already = await pool.query(
    'SELECT 1 FROM processed_webhook_events WHERE event_id = $1',
    [event.id]
  );
  if (already.rows[0]) { res.json({ received: true }); return; }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    await pool.query(
      `UPDATE expenses SET status = 'paid', updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [intent.id]
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const expenseId = session.metadata?.expenseId;
    if (expenseId) {
      await pool.query(
        `UPDATE expenses SET status = 'paid', updated_at = NOW() WHERE id = $1`,
        [expenseId]
      );
    }
  }

  // Mark event as processed
  await pool.query(
    'INSERT INTO processed_webhook_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING',
    [event.id]
  );

  res.json({ received: true });
});

export default router;
