/**
 * Attorney / mediator read-only access to family data.
 * Professional+ plan families can grant access to attorneys.
 *
 * POST   /api/attorney/grant      — grant access to an attorney by email
 * DELETE /api/attorney/:id        — revoke access
 * GET    /api/attorney/my-access  — attorney sees families they have access to
 * GET    /api/attorney/family/:id — attorney reads family data (read-only)
 */
import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserTier } from '../middleware/requireTier';

const router = Router();

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

// POST /api/attorney/grant
router.post('/grant', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const tier = await getUserTier(req.userId!);
  if (tier !== 'professional' && tier !== 'enterprise') {
    res.status(403).json({ error: 'upgrade_required', message: 'Attorney access requires Professional plan or above' });
    return;
  }

  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const { email, role = 'attorney', expiresInDays = 90 } = req.body as {
    email: string; role?: 'attorney' | 'mediator'; expiresInDays?: number;
  };

  if (!email) { res.status(400).json({ error: 'email is required' }); return; }

  // Look up attorney by email (they must have an account)
  const attorneyRow = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase()]);
  if (!attorneyRow.rows[0]) {
    res.status(404).json({ error: 'No user found with that email. The attorney must create a free account first.' });
    return;
  }

  const attorney = attorneyRow.rows[0];

  // Prevent granting access to family members
  const isMember = await pool.query(
    'SELECT 1 FROM family_members WHERE family_id = $1 AND user_id = $2',
    [familyId, attorney.id]
  );
  if (isMember.rows.length > 0) {
    res.status(400).json({ error: 'This person is already a family member' }); return;
  }

  const expiresAt = new Date(Date.now() + expiresInDays * 86400000);

  await pool.query(
    `INSERT INTO attorney_access (family_id, attorney_id, granted_by, role, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (family_id, attorney_id) DO UPDATE SET role = $4, expires_at = $5, granted_by = $3`,
    [familyId, attorney.id, req.userId, role, expiresAt]
  );

  res.json({
    granted: true,
    attorney: { id: attorney.id, name: attorney.name, email: attorney.email },
    role,
    expiresAt,
  });
});

// GET /api/attorney/list — list all attorneys with access to my family
router.get('/list', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    `SELECT aa.id, aa.role, aa.expires_at, aa.created_at, u.name, u.email
     FROM attorney_access aa
     JOIN users u ON u.id = aa.attorney_id
     WHERE aa.family_id = $1 AND (aa.expires_at IS NULL OR aa.expires_at > NOW())
     ORDER BY aa.created_at DESC`,
    [familyId]
  );
  res.json({ attorneys: result.rows });
});

// DELETE /api/attorney/:id — revoke access
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  await pool.query(
    'DELETE FROM attorney_access WHERE id = $1 AND family_id = $2',
    [req.params.id, familyId]
  );
  res.json({ revoked: true });
});

// GET /api/attorney/my-access — attorney sees their family access list
router.get('/my-access', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const result = await pool.query(
    `SELECT aa.id, aa.role, aa.expires_at, f.name as family_name, f.id as family_id
     FROM attorney_access aa
     JOIN families f ON f.id = aa.family_id
     WHERE aa.attorney_id = $1 AND (aa.expires_at IS NULL OR aa.expires_at > NOW())
     ORDER BY aa.created_at DESC`,
    [req.userId]
  );
  res.json({ access: result.rows });
});

// GET /api/attorney/family/:id — read-only family data for attorney
router.get('/family/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = req.params.id;

  // Verify attorney has valid access + grantor is still an active family member
  const accessRow = await pool.query(
    `SELECT aa.role FROM attorney_access aa
     WHERE aa.family_id = $1 AND aa.attorney_id = $2
       AND (aa.expires_at IS NULL OR aa.expires_at > NOW())
       AND EXISTS (
         SELECT 1 FROM family_members fm
         WHERE fm.family_id = $1 AND fm.user_id = aa.granted_by
       )`,
    [familyId, req.userId]
  );
  if (!accessRow.rows[0]) {
    res.status(403).json({ error: 'No access to this family' }); return;
  }

  const [family, members, messages, expenses, events, children, peaceScoreData] = await Promise.all([
    pool.query('SELECT id, name FROM families WHERE id = $1', [familyId]),
    pool.query(
      `SELECT fm.role, fm.color, u.name FROM family_members fm JOIN users u ON u.id = fm.user_id WHERE fm.family_id = $1`,
      [familyId]
    ),
    pool.query(
      `SELECT m.body, m.created_at, m.ai_flag, u.name as sender_name
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.family_id = $1 ORDER BY m.created_at DESC LIMIT 200`,
      [familyId]
    ),
    pool.query(
      `SELECT e.title, e.amount, e.currency, e.category, e.status, e.created_at, e.receipt_url, u.name as submitter_name
       FROM expenses e JOIN users u ON u.id = e.submitted_by
       WHERE e.family_id = $1 ORDER BY e.created_at DESC LIMIT 200`,
      [familyId]
    ),
    // Include soft-deleted events — attorneys need the full audit trail
    pool.query(
      `SELECT ev.title, ev.start_date, ev.end_date, ev.type,
              u.name as creator_name, ev.deleted_at,
              du.name as deleted_by_name
       FROM events ev
       JOIN users u ON u.id = ev.created_by
       LEFT JOIN users du ON du.id = ev.deleted_by
       WHERE ev.family_id = $1 ORDER BY ev.start_date DESC LIMIT 200`,
      [familyId]
    ),
    pool.query(
      `SELECT name, date_of_birth, allergies, medications, school_name, doctor_name, emergency_contact
       FROM children WHERE family_id = $1`,
      [familyId]
    ),
    pool.query(
      `SELECT
         AVG(cm.risk_score) AS avg_risk,
         COUNT(CASE WHEN cm.risk_score IS NOT NULL THEN 1 END) AS total,
         DATE_TRUNC('week', cm.created_at) AS week
       FROM coaching_messages cm
       JOIN family_members fm ON fm.user_id = cm.user_id
       WHERE fm.family_id = $1 AND cm.role = 'user' AND cm.risk_score IS NOT NULL
       AND cm.created_at >= NOW() - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', cm.created_at)
       ORDER BY week ASC`,
      [familyId]
    ),
  ]);

  const calcScore = (avg: number) => isNaN(avg) ? 50 : Math.round(Math.max(0, Math.min(100, (10 - avg) * 10)));
  const scoreLabel = (s: number) => s >= 80 ? 'Peaceful' : s >= 60 ? 'Calm' : s >= 40 ? 'Neutral' : s >= 20 ? 'Tense' : 'High conflict';
  const weeklyHistory = peaceScoreData.rows.map(r => ({
    week: r.week,
    score: calcScore(parseFloat(r.avg_risk)),
    sessions: parseInt(r.total),
  }));
  const totalMessages = peaceScoreData.rows.reduce((sum, r) => sum + parseInt(r.total), 0);
  const overallAvg = totalMessages > 0
    ? peaceScoreData.rows.reduce((sum, r) => sum + parseFloat(r.avg_risk) * parseInt(r.total), 0) / totalMessages
    : null;
  const peaceScore = overallAvg !== null ? {
    score: calcScore(overallAvg),
    label: scoreLabel(calcScore(overallAvg)),
    weeklyHistory,
  } : null;

  res.json({
    accessRole: accessRow.rows[0].role,
    family: family.rows[0],
    members: members.rows,
    messages: messages.rows,
    expenses: expenses.rows,
    events: events.rows,
    children: children.rows,
    peaceScore,
  });
});

export default router;
