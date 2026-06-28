import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { sendEmail, subscriptionConfirmEmail } from '../services/emailService';

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Stripe Price IDs — set these in your .env after creating products in Stripe Dashboard
const PRICE_IDS: Record<string, string | undefined> = {
  personal:     process.env.STRIPE_PRICE_PERSONAL,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise:   process.env.STRIPE_PRICE_ENTERPRISE,
};

async function getOrCreateStripeCustomer(userId: string, email: string, name: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');

  const r = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
  const existingId: string | undefined = r.rows[0]?.stripe_customer_id;

  if (existingId) {
    try {
      await stripe.customers.retrieve(existingId);
      return existingId;
    } catch {
      // Customer doesn't exist in this Stripe mode (e.g. old test customer) — create a new one
      await pool.query('UPDATE users SET stripe_customer_id = NULL WHERE id = $1', [userId]);
    }
  }

  const customer = await stripe.customers.create({ email, name, metadata: { userId } });
  await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, userId]);
  return customer.id;
}

// POST /api/subscriptions/checkout
// Body: { tier: 'personal' | 'professional' | 'enterprise' }
router.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!stripe) { res.status(503).json({ error: 'Payments not configured' }); return; }

    const { tier } = req.body as { tier: string };
    const priceId = PRICE_IDS[tier];
    if (!priceId) { res.status(400).json({ error: 'Invalid tier' }); return; }

    const userRow = await pool.query('SELECT email, name FROM users WHERE id = $1', [req.userId]);
    const user = userRow.rows[0];
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const customerId = await getOrCreateStripeCustomer(req.userId!, user.email, user.name);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: req.userId!, tier },
      subscription_data: { metadata: { userId: req.userId!, tier } },
    });

    if (!session.url) { res.status(502).json({ error: 'Stripe returned no checkout URL' }); return; }
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed', detail: (err as Error).message });
  }
});

// GET /api/subscriptions/portal
router.get('/portal', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!stripe) { res.status(503).json({ error: 'Payments not configured' }); return; }

    const r = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
    const customerId = r.rows[0]?.stripe_customer_id;
    if (!customerId) { res.status(404).json({ error: 'No subscription found' }); return; }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to open billing portal', detail: (err as Error).message });
  }
});

// GET /api/subscriptions/me
// Returns the highest tier in the family — one subscription covers both parents.
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  // Founder/admin accounts always get full access
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase());
  const userEmailRow = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
  const userEmail = userEmailRow.rows[0]?.email?.toLowerCase() ?? '';
  if (adminEmails.includes(userEmail)) {
    res.json({ tier: 'professional', status: 'active' });
    return;
  }

  const r = await pool.query(
    `SELECT u.subscription_tier, u.subscription_status
     FROM users u
     JOIN family_members fm ON fm.user_id = u.id
     WHERE fm.family_id = (
       SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1
     )
     AND u.subscription_status IN ('active', 'trialing')
     AND u.subscription_tier != 'free'
     ORDER BY
       CASE u.subscription_tier
         WHEN 'enterprise'    THEN 4
         WHEN 'professional'  THEN 3
         WHEN 'personal'      THEN 2
         ELSE 1
       END DESC
     LIMIT 1`,
    [req.userId]
  );

  if (r.rows[0]) {
    res.json({ tier: r.rows[0].subscription_tier, status: r.rows[0].subscription_status });
    return;
  }

  // Fall back to own tier (handles users without a family yet)
  const own = await pool.query(
    'SELECT subscription_tier, subscription_status FROM users WHERE id = $1',
    [req.userId]
  );
  const row = own.rows[0];
  res.json({ tier: row?.subscription_tier ?? 'free', status: row?.subscription_status ?? 'active' });
});

// POST /api/subscriptions/webhook  (Stripe webhook)
router.post('/webhook', async (req: Request, res: Response) => {
  if (!stripe || !process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET) { res.json({ received: true }); return; }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET as string
    );
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' }); return;
  }

  // Idempotency — skip already-processed events
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS processed_webhooks (
        event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ DEFAULT NOW()
      )`
    );
    const existing = await pool.query(
      'SELECT 1 FROM processed_webhooks WHERE event_id = $1', [event.id]
    );
    if (existing.rows.length > 0) { res.json({ received: true }); return; }
    await pool.query('INSERT INTO processed_webhooks (event_id) VALUES ($1)', [event.id]);
  } catch { /* table may not exist yet — continue */ }

  async function updateTierFromSubscription(sub: Stripe.Subscription) {
    const userId = sub.metadata?.userId;
    const tier = sub.metadata?.tier ?? 'free';
    if (!userId) return;

    let status: string;
    switch (sub.status) {
      case 'active':    status = 'active'; break;
      case 'trialing':  status = 'trialing'; break;
      case 'canceled':  status = 'canceled'; break;
      case 'past_due':  status = 'past_due'; break;
      default:          status = 'canceled';
    }

    const activeTier = (status === 'active' || status === 'trialing') ? tier : 'free';
    await pool.query(
      `UPDATE users SET subscription_tier = $1, subscription_status = $2 WHERE id = $3`,
      [activeTier, status, userId]
    );

    // Send confirmation email when activated
    if (status === 'active' && activeTier !== 'free') {
      const userRow = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
      const user = userRow.rows[0];
      if (user) {
        sendEmail(user.email, `Your ${activeTier} plan is active ✓`, subscriptionConfirmEmail(user.name, activeTier)).catch(() => {});
      }
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateTierFromSubscription(sub);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await updateTierFromSubscription(event.data.object as Stripe.Subscription);
      break;
  }

  res.json({ received: true });
});

export default router;
