/**
 * Caregiver / babysitter access to child profiles.
 * POST   /api/caregiver          — add caregiver
 * GET    /api/caregiver          — list caregivers for family
 * DELETE /api/caregiver/:id      — remove caregiver
 * GET    /api/caregiver/profile  — caregiver views child info (by PIN or token)
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireTier } from '../middleware/requireTier';

const router = Router();

// Rate limit PIN attempts: max 5 per minute per IP
const pinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many PIN attempts, please wait a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

// POST /api/caregiver — add caregiver
router.post('/', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const { name, email, phone, accessLevel = 'basic', pin, expiresInDays } = req.body as {
    name: string; email?: string; phone?: string;
    accessLevel?: 'basic' | 'full'; pin?: string; expiresInDays?: number;
  };

  if (!name) { res.status(400).json({ error: 'name is required' }); return; }

  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;

  const result = await pool.query(
    `INSERT INTO caregiver_access (family_id, granted_by, name, email, phone, access_level, pin_hash, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, name, email, phone, access_level, expires_at, created_at`,
    [familyId, req.userId, name, email ?? null, phone ?? null, accessLevel, pinHash, expiresAt]
  );

  res.status(201).json({ caregiver: result.rows[0] });
});

// GET /api/caregiver — list caregivers
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    `SELECT id, name, email, phone, access_level, expires_at, created_at
     FROM caregiver_access WHERE family_id = $1 ORDER BY created_at DESC`,
    [familyId]
  );
  res.json({ caregivers: result.rows });
});

// DELETE /api/caregiver/:id
router.delete('/:id', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  await pool.query('DELETE FROM caregiver_access WHERE id = $1 AND family_id = $2', [req.params.id, familyId]);
  res.json({ removed: true });
});

// POST /api/caregiver/view — caregiver enters PIN to view child info
router.post('/view', pinLimiter, async (req: Request, res: Response) => {
  const { caregiverId, pin } = req.body as { caregiverId: string; pin: string };
  if (!caregiverId || !pin) { res.status(400).json({ error: 'caregiverId and pin required' }); return; }

  const cg = await pool.query(
    `SELECT * FROM caregiver_access WHERE id = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
    [caregiverId]
  );
  const caregiver = cg.rows[0];
  if (!caregiver) { res.status(404).json({ error: 'Access not found or expired' }); return; }

  if (!caregiver.pin_hash) {
    res.status(403).json({ error: 'Access requires a PIN — contact the parent to set one up' });
    return;
  }
  const valid = await bcrypt.compare(pin, caregiver.pin_hash);
  if (!valid) { res.status(401).json({ error: 'Invalid PIN' }); return; }

  // Return child profiles for this family
  const fields = caregiver.access_level === 'full'
    ? `id, name, date_of_birth, allergies, medications, school_name, school_grade,
       doctor_name, doctor_phone, emergency_contact, notes`
    : `id, name, date_of_birth, allergies, medications, emergency_contact`;

  const children = await pool.query(
    `SELECT ${fields} FROM children WHERE family_id = $1 ORDER BY name`,
    [caregiver.family_id]
  );

  res.json({
    caregiverName: caregiver.name,
    accessLevel: caregiver.access_level,
    children: children.rows,
  });
});

export default router;
