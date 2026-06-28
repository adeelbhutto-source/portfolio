import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validate, eventSchema } from '../utils/validate';
import type { CreateEventRequest, UpdateEventRequest } from '../types/shared';

const router = Router();

// Helper: get the familyId for the current user
async function getFamilyId(userId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return result.rows[0]?.family_id ?? null;
}

// GET /api/events?start=ISO&end=ISO
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) {
    res.status(403).json({ error: 'You are not part of a family' });
    return;
  }

  const { start, end } = req.query as { start?: string; end?: string };

  let query = `
    SELECT e.*, u.name as creator_name,
           fm.color as creator_color, fm.role as creator_role
    FROM events e
    JOIN users u ON u.id = e.created_by
    JOIN family_members fm ON fm.user_id = e.created_by AND fm.family_id = e.family_id
    WHERE e.family_id = $1 AND e.deleted_at IS NULL
  `;
  const params: (string | Date)[] = [familyId];

  if (start) {
    const d = new Date(start as string);
    if (isNaN(d.getTime())) { res.status(400).json({ error: 'Invalid start date' }); return; }
    params.push(d);
    query += ` AND e.end_date >= $${params.length}`;
  }
  if (end) {
    const d = new Date(end as string);
    if (isNaN(d.getTime())) { res.status(400).json({ error: 'Invalid end date' }); return; }
    params.push(d);
    query += ` AND e.start_date <= $${params.length}`;
  }
  query += ' ORDER BY e.start_date ASC';

  const result = await pool.query(query, params);

  const events = result.rows.map((r) => ({
    id: r.id,
    familyId: r.family_id,
    title: r.title,
    startDate: r.start_date,
    endDate: r.end_date,
    allDay: r.all_day,
    type: r.type,
    createdBy: r.created_by,
    color: r.color ?? r.creator_color,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    creatorName: r.creator_name,
    creatorRole: r.creator_role,
  }));

  res.json({ events });
});

// POST /api/events
router.post('/', requireAuth, validate(eventSchema), async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) {
    res.status(403).json({ error: 'You are not part of a family' });
    return;
  }

  const { title, startDate, endDate, allDay, type, color, notes } = req.body as CreateEventRequest;

  if (!title || !startDate || !endDate || !type) {
    res.status(400).json({ error: 'title, startDate, endDate and type are required' });
    return;
  }

  const result = await pool.query(
    `INSERT INTO events (family_id, title, start_date, end_date, all_day, type, created_by, color, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [familyId, title, new Date(startDate), new Date(endDate), allDay ?? true, type, req.userId, color ?? null, notes ?? null]
  );

  const r = result.rows[0];
  res.status(201).json({
    event: {
      id: r.id,
      familyId: r.family_id,
      title: r.title,
      startDate: r.start_date,
      endDate: r.end_date,
      allDay: r.all_day,
      type: r.type,
      createdBy: r.created_by,
      color: r.color,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    },
  });
});

// PUT /api/events/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) {
    res.status(403).json({ error: 'You are not part of a family' });
    return;
  }

  // Verify event belongs to this family
  const existing = await pool.query(
    'SELECT id FROM events WHERE id = $1 AND family_id = $2',
    [req.params.id, familyId]
  );
  if (existing.rows.length === 0) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const { title, startDate, endDate, allDay, type, color, notes } = req.body as UpdateEventRequest;

  const result = await pool.query(
    `UPDATE events SET
       title      = COALESCE($1, title),
       start_date = COALESCE($2, start_date),
       end_date   = COALESCE($3, end_date),
       all_day    = COALESCE($4, all_day),
       type       = COALESCE($5, type),
       color      = COALESCE($6, color),
       notes      = COALESCE($7, notes),
       updated_at = NOW()
     WHERE id = $8 AND family_id = $9
     RETURNING *`,
    [
      title ?? null,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      allDay ?? null,
      type ?? null,
      color ?? null,
      notes ?? null,
      req.params.id,
      familyId,
    ]
  );

  const r = result.rows[0];
  res.json({
    event: {
      id: r.id,
      familyId: r.family_id,
      title: r.title,
      startDate: r.start_date,
      endDate: r.end_date,
      allDay: r.all_day,
      type: r.type,
      createdBy: r.created_by,
      color: r.color,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    },
  });
});

// GET /api/events/ical — Apple Calendar / iCal export
router.get('/ical', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const familyRow = await pool.query('SELECT name FROM families WHERE id = $1', [familyId]);
  const familyName = familyRow.rows[0]?.name ?? 'PeaceCoParent';

  const events = await pool.query(
    `SELECT ev.*, u.name as creator_name FROM events ev JOIN users u ON u.id = ev.created_by
     WHERE ev.family_id = $1 ORDER BY ev.start_date ASC`,
    [familyId]
  );

  function icalDate(d: Date, allDay: boolean) {
    if (allDay) return d.toISOString().replace(/[-:]/g, '').slice(0, 8);
    return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  }
  function escapeIcal(s: string) {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  const now = icalDate(new Date(), false);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PeaceCoParent//EN',
    `X-WR-CALNAME:${escapeIcal(familyName)} (PeaceCoParent)`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const ev of events.rows) {
    const start = new Date(ev.start_date);
    const end = new Date(ev.end_date);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@peacecoparent`);
    lines.push(`DTSTAMP:${now}`);
    if (ev.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${icalDate(start, true)}`);
      lines.push(`DTEND;VALUE=DATE:${icalDate(end, true)}`);
    } else {
      lines.push(`DTSTART:${icalDate(start, false)}`);
      lines.push(`DTEND:${icalDate(end, false)}`);
    }
    lines.push(`SUMMARY:${escapeIcal(ev.title)}`);
    if (ev.notes) lines.push(`DESCRIPTION:${escapeIcal(ev.notes)}`);
    lines.push(`CATEGORIES:${escapeIcal(ev.type)}`);
    lines.push(`ORGANIZER;CN=${escapeIcal(ev.creator_name)}:mailto:noreply@peacecoparent.com`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="peacecoparent-${familyId.slice(0,8)}.ics"`);
  res.send(lines.join('\r\n'));
});

// DELETE /api/events/:id — soft delete to preserve audit trail for court reports
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) {
    res.status(403).json({ error: 'You are not part of a family' });
    return;
  }

  const result = await pool.query(
    `UPDATE events SET deleted_at = NOW(), deleted_by = $3
     WHERE id = $1 AND family_id = $2 AND deleted_at IS NULL RETURNING id`,
    [req.params.id, familyId, req.userId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json({ message: 'Event deleted' });
});

export default router;
