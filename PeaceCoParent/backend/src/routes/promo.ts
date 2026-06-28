import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { sendEmail, promoTrialEmail } from '../services/emailService';

const router = Router();

// Auto-create tables
pool.query(`
  CREATE TABLE IF NOT EXISTS onboarding_emails (
    user_id UUID NOT NULL,
    step INT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, step)
  );
  ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
  CREATE TABLE IF NOT EXISTS promo_redemptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    code TEXT NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id)
  );
`).catch(() => {});

const PROMO_CODES: Record<string, { tier: string; days: number; description: string }> = {
  'OFW30FREE': { tier: 'professional', days: 30, description: '30 days free Professional for OFW switchers' },
  'WELCOME14': { tier: 'personal', days: 14, description: '14 days free Personal plan' },
};

// POST /api/promo/redeem
router.post('/redeem', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body as { code: string };
  if (!code) { res.status(400).json({ error: 'code is required' }); return; }

  const promo = PROMO_CODES[code.toUpperCase().trim()];
  if (!promo) { res.status(404).json({ error: 'Invalid promo code' }); return; }

  // Check if already redeemed
  const existing = await pool.query(
    'SELECT 1 FROM promo_redemptions WHERE user_id = $1',
    [req.userId]
  );
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'You have already used a promo code' }); return;
  }

  // Check if already on paid plan
  const userRow = await pool.query(
    'SELECT name, email, subscription_tier FROM users WHERE id = $1',
    [req.userId]
  );
  const user = userRow.rows[0];
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (user.subscription_tier !== 'free') {
    res.status(409).json({ error: 'Promo codes are only available for free plan users' }); return;
  }

  const trialEndsAt = new Date(Date.now() + promo.days * 24 * 60 * 60 * 1000);

  await pool.query(
    `UPDATE users SET subscription_tier = $1, subscription_status = 'trialing', trial_ends_at = $2 WHERE id = $3`,
    [promo.tier, trialEndsAt, req.userId]
  );

  await pool.query(
    'INSERT INTO promo_redemptions (user_id, code) VALUES ($1, $2)',
    [req.userId, code.toUpperCase().trim()]
  );

  await sendEmail(
    user.email,
    `Your ${promo.days}-day free trial is active!`,
    promoTrialEmail(user.name, promo.tier, promo.days)
  );

  res.json({ ok: true, tier: promo.tier, trialEndsAt, days: promo.days });
});

export default router;
