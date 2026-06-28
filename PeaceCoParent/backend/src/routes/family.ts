import { Router, Response } from 'express';
import crypto from 'crypto';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import type { CreateFamilyRequest, JoinFamilyRequest } from '../types/shared';
import { sendEmail, coParentJoinedEmail, inviteCoParentEmail } from '../services/emailService';

const router = Router();

const PARENT1_COLOR = '#6366f1'; // indigo
const PARENT2_COLOR = '#ec4899'; // pink

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
}

// POST /api/family/create
router.post('/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { familyName } = req.body as CreateFamilyRequest;
  if (!familyName || !familyName.trim()) {
    res.status(400).json({ error: 'familyName is required' });
    return;
  }

  const client = await pool.connect();
  try {
    // Check if already in a family
    const existing = await client.query(
      'SELECT family_id FROM family_members WHERE user_id = $1',
      [req.userId]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'You are already part of a family' });
      return;
    }

    await client.query('BEGIN');

    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const check = await client.query('SELECT id FROM families WHERE invite_code = $1', [inviteCode]);
      if (check.rows.length === 0) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const familyResult = await client.query(
      `INSERT INTO families (name, invite_code) VALUES ($1, $2) RETURNING id, name, invite_code, created_at`,
      [familyName.trim(), inviteCode]
    );
    const family = familyResult.rows[0];

    await client.query(
      `INSERT INTO family_members (user_id, family_id, role, color) VALUES ($1, $2, 'parent1', $3)`,
      [req.userId, family.id, PARENT1_COLOR]
    );

    await client.query('COMMIT');

    res.status(201).json({
      family: { id: family.id, name: family.name, inviteCode: family.invite_code, createdAt: family.created_at },
      familyMember: { userId: req.userId, familyId: family.id, role: 'parent1', color: PARENT1_COLOR, joinedAt: new Date().toISOString() },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/family/join
router.post('/join', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { inviteCode } = req.body as JoinFamilyRequest;
  if (!inviteCode) {
    res.status(400).json({ error: 'inviteCode is required' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if already in a family
    const existing = await client.query(
      'SELECT family_id FROM family_members WHERE user_id = $1',
      [req.userId]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'You are already part of a family' });
      return;
    }

    // Lock the family row to prevent concurrent joins exceeding the 2-parent limit
    const familyResult = await client.query(
      `SELECT id, name, invite_code, created_at FROM families WHERE invite_code = $1 FOR UPDATE`,
      [inviteCode.toUpperCase()]
    );
    if (familyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }
    const family = familyResult.rows[0];

    // Check if family already has 2 parents (now safe — row is locked)
    const memberCount = await client.query(
      'SELECT COUNT(*) FROM family_members WHERE family_id = $1',
      [family.id]
    );
    if (parseInt(memberCount.rows[0].count) >= 2) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'This family already has two parents' });
      return;
    }

    await client.query(
      `INSERT INTO family_members (user_id, family_id, role, color) VALUES ($1, $2, 'parent2', $3)`,
      [req.userId, family.id, PARENT2_COLOR]
    );

    // Notify parent1 that their co-parent has joined
    const parent2Result = await client.query(
      `SELECT name, email FROM users WHERE id = $1`, [req.userId]
    );
    const parent1Result = await client.query(
      `SELECT u.name, u.email FROM users u
       JOIN family_members fm ON fm.user_id = u.id
       WHERE fm.family_id = $1 AND fm.role = 'parent1'`, [family.id]
    );
    if (parent1Result.rows.length > 0 && parent2Result.rows.length > 0) {
      const p1 = parent1Result.rows[0];
      const p2 = parent2Result.rows[0];
      sendEmail(p1.email, `${p2.name ?? 'Your co-parent'} has joined PeaceCoParent`, coParentJoinedEmail(p1.name ?? 'there', p2.name ?? 'Your co-parent', family.name)).catch(() => {});
    }

    await client.query('COMMIT');

    res.json({
      family: { id: family.id, name: family.name, inviteCode: family.invite_code, createdAt: family.created_at },
      familyMember: { userId: req.userId, familyId: family.id, role: 'parent2', color: PARENT2_COLOR, joinedAt: new Date().toISOString() },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/family/invite-email — send invite code to co-parent by email
router.post('/invite-email', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT f.name, f.invite_code, u.name AS sender_name
       FROM families f
       JOIN family_members fm ON fm.family_id = f.id
       JOIN users u ON u.id = fm.user_id
       WHERE fm.user_id = $1`, [req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'You are not in a family yet' });
      return;
    }
    const { name: familyName, invite_code: inviteCode, sender_name: senderName } = result.rows[0];
    await sendEmail(email.trim().toLowerCase(), `${senderName ?? 'Someone'} invited you to PeaceCoParent`, inviteCoParentEmail(senderName ?? 'Your co-parent', familyName, inviteCode));
    res.json({ ok: true });
  } finally {
    client.release();
  }
});

// GET /api/family/my
router.get('/my', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT fm.user_id, fm.role, fm.color, fm.joined_at,
              u.email, u.name as user_name,
              f.id as family_id, f.name as family_name, f.invite_code, f.created_at
       FROM family_members fm
       JOIN families f ON f.id = fm.family_id
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = (
         SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1
       )`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.json({ family: null, members: [] });
      return;
    }

    const first = result.rows[0];
    const family = {
      id: first.family_id,
      name: first.family_name,
      inviteCode: first.invite_code,
      createdAt: first.created_at,
    };

    const members = result.rows.map((r) => ({
      userId: r.user_id,
      familyId: r.family_id,
      role: r.role,
      color: r.color,
      joinedAt: r.joined_at,
      name: r.user_name,
      email: r.email,
    }));

    res.json({ family, members });
  } finally {
    client.release();
  }
});

export default router;
