/**
 * GDPR account management:
 *   GET  /api/account/export  — download all personal data as JSON
 *   DELETE /api/account        — permanently delete account
 *   POST /api/account/push-subscription — register web push subscription
 *   DELETE /api/account/push-subscription — remove push subscription
 *   GET  /api/account/vapid-public-key  — return VAPID public key for client
 */
import { Router, Response } from 'express';
import Stripe from 'stripe';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const router = Router();

// PATCH /api/account/profile — update name
router.patch('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name?.trim() || name.trim().length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters' }); return;
  }
  const result = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name',
    [name.trim(), req.userId]
  );
  res.json({ user: result.rows[0] });
});

// PATCH /api/account/color — update family member color
router.patch('/color', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { color } = req.body as { color?: string };
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    res.status(400).json({ error: 'Invalid color format' }); return;
  }
  await pool.query(
    `UPDATE family_members SET color = $1
     WHERE user_id = $2 AND family_id = (
       SELECT family_id FROM family_members WHERE user_id = $2 LIMIT 1
     )`,
    [color, req.userId]
  );
  res.json({ color });
});

// GET /api/account/vapid-public-key
router.get('/vapid-public-key', (_req, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) { res.status(503).json({ error: 'Push notifications not configured' }); return; }
  res.json({ publicKey: key });
});

// POST /api/account/push-subscription
router.post('/push-subscription', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { endpoint, keys } = req.body as { endpoint: string; keys: { p256dh: string; auth: string } };
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: 'Invalid subscription object' }); return;
  }
  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4`,
    [req.userId, endpoint, keys.p256dh, keys.auth]
  );
  res.json({ ok: true });
});

// DELETE /api/account/push-subscription
router.delete('/push-subscription', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { endpoint } = req.body as { endpoint: string };
  if (endpoint) {
    await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [req.userId, endpoint]);
  }
  res.json({ ok: true });
});

// GET /api/account/export — GDPR data export
router.get('/export', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const client = await pool.connect();
  try {
    const [userRow, familyRow, messages, expenses, events, documents, children] = await Promise.all([
      client.query('SELECT id, email, name, subscription_tier, created_at FROM users WHERE id = $1', [userId]),
      client.query(
        `SELECT f.*, fm.role, fm.color, fm.joined_at FROM families f
         JOIN family_members fm ON fm.family_id = f.id WHERE fm.user_id = $1`,
        [userId]
      ),
      client.query(
        `SELECT m.body, m.created_at, m.ai_flag FROM messages m
         JOIN family_members fm ON fm.family_id = m.family_id AND fm.user_id = $1
         WHERE m.sender_id = $1 ORDER BY m.created_at DESC`,
        [userId]
      ),
      client.query(
        `SELECT e.title, e.amount, e.currency, e.category, e.status, e.created_at
         FROM expenses e WHERE e.submitted_by = $1 ORDER BY e.created_at DESC`,
        [userId]
      ),
      client.query(
        `SELECT ev.title, ev.start_date, ev.end_date, ev.type, ev.created_at
         FROM events ev WHERE ev.created_by = $1 ORDER BY ev.start_date DESC`,
        [userId]
      ),
      client.query(
        `SELECT d.name, d.category, d.file_size, d.created_at
         FROM documents d WHERE d.uploaded_by = $1 ORDER BY d.created_at DESC`,
        [userId]
      ),
      client.query(
        `SELECT c.name, c.date_of_birth, c.school_name, c.created_at
         FROM children c
         JOIN family_members fm ON fm.family_id = c.family_id AND fm.user_id = $1
         ORDER BY c.name`,
        [userId]
      ),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userRow.rows[0],
      family: familyRow.rows[0] ?? null,
      messages: messages.rows,
      expenses: expenses.rows,
      calendarEvents: events.rows,
      documents: documents.rows,
      children: children.rows,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="peacecoparent-data-${userId.slice(0, 8)}.json"`);
    res.json(exportData);
  } finally {
    client.release();
  }
});

// DELETE /api/account — permanently delete account (GDPR right to erasure)
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { confirm } = req.body as { confirm?: string };
  if (confirm !== 'DELETE MY ACCOUNT') {
    res.status(400).json({ error: 'Send { confirm: "DELETE MY ACCOUNT" } to confirm deletion' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cancel Stripe subscription if exists
    if (stripe) {
      const userRow = await client.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
      const customerId = userRow.rows[0]?.stripe_customer_id;
      if (customerId) {
        const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 5 });
        for (const sub of subs.data) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    }

    // Anonymize messages (keep for other parent's records but remove PII)
    await client.query(`UPDATE messages SET sender_id = NULL WHERE sender_id = $1`, [req.userId]);
    // Delete user (cascades: refresh_tokens, family_members, push_subscriptions, expense_usage)
    await client.query('DELETE FROM users WHERE id = $1', [req.userId]);
    await client.query('COMMIT');
    res.json({ deleted: true, message: 'Your account and all personal data have been permanently deleted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

export default router;
