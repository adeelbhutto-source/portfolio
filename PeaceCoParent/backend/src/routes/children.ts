import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

function rowToChild(r: Record<string, unknown>) {
  return {
    id: r.id, name: r.name, dateOfBirth: r.date_of_birth,
    allergies: r.allergies, medications: r.medications,
    schoolName: r.school_name, schoolGrade: r.school_grade,
    doctorName: r.doctor_name, doctorPhone: r.doctor_phone,
    emergencyContact: r.emergency_contact, notes: r.notes, createdAt: r.created_at,
  };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }
  const result = await pool.query('SELECT * FROM children WHERE family_id = $1 ORDER BY date_of_birth', [familyId]);
  res.json({ children: result.rows.map(rowToChild) });
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }
  const { name, dateOfBirth, allergies, medications, schoolName, schoolGrade, doctorName, doctorPhone, emergencyContact, notes } = req.body;
  if (!name || !dateOfBirth) { res.status(400).json({ error: 'name and dateOfBirth required' }); return; }
  const r = await pool.query(
    `INSERT INTO children (family_id, name, date_of_birth, allergies, medications, school_name, school_grade, doctor_name, doctor_phone, emergency_contact, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [familyId, name, dateOfBirth, allergies ?? null, medications ?? null, schoolName ?? null, schoolGrade ?? null, doctorName ?? null, doctorPhone ?? null, emergencyContact ?? null, notes ?? null]
  );
  res.status(201).json({ child: rowToChild(r.rows[0]) });
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }
  const { name, dateOfBirth, allergies, medications, schoolName, schoolGrade, doctorName, doctorPhone, emergencyContact, notes } = req.body;
  const r = await pool.query(
    `UPDATE children SET name=COALESCE($1,name), date_of_birth=COALESCE($2,date_of_birth),
     allergies=$3, medications=$4, school_name=$5, school_grade=$6, doctor_name=$7, doctor_phone=$8, emergency_contact=$9, notes=$10
     WHERE id=$11 AND family_id=$12 RETURNING *`,
    [name ?? null, dateOfBirth ?? null, allergies ?? null, medications ?? null, schoolName ?? null, schoolGrade ?? null, doctorName ?? null, doctorPhone ?? null, emergencyContact ?? null, notes ?? null, req.params.id, familyId]
  );
  if (!r.rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ child: rowToChild(r.rows[0]) });
});

export default router;
