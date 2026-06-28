import { Response, NextFunction } from 'express';
import pool from '../db/index';
import { AuthenticatedRequest } from './auth';

export type Tier = 'free' | 'personal' | 'professional' | 'enterprise';

const TIER_RANK: Record<string, number> = {
  free: 0,
  personal: 1,
  professional: 2,
  enterprise: 3,
};

export async function getUserTier(userId: string): Promise<string> {
  // Admin/founder accounts always get full access
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase());
  const emailRow = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
  if (adminEmails.includes(emailRow.rows[0]?.email?.toLowerCase() ?? '')) return 'professional';

  // Check user's own tier first
  const r = await pool.query(
    `SELECT subscription_tier, subscription_status FROM users WHERE id = $1`,
    [userId]
  );
  const row = r.rows[0];
  const ownTier = (!row || (row.subscription_status !== 'active' && row.subscription_status !== 'trialing'))
    ? 'free'
    : (row.subscription_tier as string);

  // If user has a paid tier, use it
  if (ownTier !== 'free') return ownTier;

  // Otherwise check if the OTHER parent in their family has a paid tier
  // Parent 2 (and all family members) inherit the highest tier in the family — one subscription covers everyone
  const familyR = await pool.query(
    `SELECT u.subscription_tier, u.subscription_status
     FROM family_members fm1
     JOIN family_members fm2 ON fm1.family_id = fm2.family_id AND fm2.user_id != fm1.user_id
     JOIN users u ON u.id = fm2.user_id
     WHERE fm1.user_id = $1
     AND u.subscription_status IN ('active', 'trialing')
     ORDER BY CASE u.subscription_tier
       WHEN 'enterprise' THEN 4 WHEN 'professional' THEN 3
       WHEN 'personal' THEN 2 ELSE 0 END DESC
     LIMIT 1`,
    [userId]
  );

  if (familyR.rows.length > 0) return familyR.rows[0].subscription_tier as string;
  return 'free';
}

export function requireTier(minTier: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tier = await getUserTier(req.userId!);
    if ((TIER_RANK[tier] ?? 0) >= (TIER_RANK[minTier] ?? 0)) {
      next();
    } else {
      res.status(403).json({
        error: 'upgrade_required',
        message: `This feature requires ${minTier} plan or above`,
        currentTier: tier,
        requiredTier: minTier,
      });
    }
  };
}

/** Check free-tier expense limit (3/month). Returns remaining count. */
export async function checkExpenseLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const tier = await getUserTier(userId);
  if (tier !== 'free') return { allowed: true, used: 0, limit: Infinity };

  const ym = new Date().toISOString().slice(0, 7); // "2025-04"
  const r = await pool.query(
    `SELECT count FROM expense_usage WHERE user_id = $1 AND year_month = $2`,
    [userId, ym]
  );
  const used = r.rows[0]?.count ?? 0;
  return { allowed: used < 3, used, limit: 3 };
}

export async function incrementExpenseUsage(userId: string) {
  const ym = new Date().toISOString().slice(0, 7);
  await pool.query(
    `INSERT INTO expense_usage (user_id, year_month, count) VALUES ($1, $2, 1)
     ON CONFLICT (user_id, year_month) DO UPDATE SET count = expense_usage.count + 1`,
    [userId, ym]
  );
}
