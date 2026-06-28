import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireTier } from '../middleware/requireTier';
import { reviewMessage } from '../services/aiCoach';
import { sendPushToFamily } from '../services/pushNotifications';
import { sendEmail, newMessageEmail } from '../services/emailService';
import { validate, messageSchema } from '../utils/validate';
import type { SendMessageRequest } from '../types/shared';

const router = Router();

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

// GET /api/messages?before=ISO&limit=50
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 100);
  const before = req.query.before ? new Date(req.query.before as string) : new Date();

  const result = await pool.query(
    `SELECT m.id, m.family_id, m.sender_id, m.body, m.read_at,
            m.ai_flag, m.ai_flag_reason, m.created_at,
            u.name as sender_name, fm.color as sender_color
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     JOIN family_members fm ON fm.user_id = m.sender_id AND fm.family_id = m.family_id
     WHERE m.family_id = $1 AND m.created_at < $2
     ORDER BY m.created_at DESC
     LIMIT $3`,
    [familyId, before, limit]
  );

  const messages = result.rows.map((r) => ({
    id: r.id,
    familyId: r.family_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    senderColor: r.sender_color,
    body: r.body,
    readAt: r.read_at,
    aiFlag: r.ai_flag,
    aiFlagReason: r.ai_flag_reason,
    createdAt: r.created_at,
  })).reverse();

  res.json({ messages });
});

// POST /api/messages/review — check before sending (Personal+ only)
router.post('/review', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const { body } = req.body as SendMessageRequest;
  if (!body?.trim()) { res.status(400).json({ error: 'body is required' }); return; }

  const familyId = await getFamilyId(req.userId!);

  // Fetch recent history for context
  let history: { senderName: string; body: string }[] = [];
  if (familyId) {
    const historyResult = await pool.query(
      `SELECT m.body, u.name as sender_name FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.family_id = $1 ORDER BY m.created_at DESC LIMIT 10`,
      [familyId]
    );
    history = historyResult.rows.reverse().map((r) => ({ senderName: r.sender_name, body: r.body }));
  }

  // Strip attachment tags — don't review attachments
  const textForReview = body.replace(/\[ATTACH:[^\]]+\]/g, '').trim();
  if (!textForReview) {
    res.json({ flag: 'ok', reason: null, suggestion: null });
    return;
  }

  try {
    const review = await reviewMessage(textForReview, history);
    res.json(review);
  } catch {
    res.status(503).json({ error: 'Coaching review unavailable' });
  }
});

// POST /api/messages
router.post('/', requireAuth, validate(messageSchema), async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const { body } = req.body as SendMessageRequest;
  if (!body?.trim()) { res.status(400).json({ error: 'body is required' }); return; }

  // Fetch conversation history for coaching context
  const historyResult = await pool.query(
    `SELECT m.body, u.name as sender_name FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.family_id = $1 ORDER BY m.created_at DESC LIMIT 10`,
    [familyId]
  );
  const history = historyResult.rows.reverse().map((r) => ({ senderName: r.sender_name, body: r.body }));

  // Strip attachment tags before coaching review — attachments are not messages
  const textForReview = body.replace(/\[ATTACH:[^\]]+\]/g, '').trim();

  let review: { flag: string; reason: string | null; suggestion: string | null };
  let aiUnavailable = false;
  try {
    if (!textForReview) {
      // Message is attachment-only — skip coaching review
      review = { flag: 'ok', reason: null, suggestion: null };
    } else {
      review = await reviewMessage(textForReview, history);
    }
  } catch {
    // Coaching is down — allow the message through but record that review was unavailable
    // so the audit trail accurately reflects the state rather than showing 'ok'
    review = { flag: 'ai_unavailable', reason: 'Coaching review was unavailable at send time', suggestion: null };
    aiUnavailable = true;
  }

  void aiUnavailable; // flag is stored in ai_flag column for audit purposes

  if (review.flag === 'blocked') {
    res.status(422).json({
      error: 'Message blocked by coach',
      aiFlag: review.flag,
      reason: review.reason,
      suggestion: review.suggestion,
    });
    return;
  }

  const result = await pool.query(
    `INSERT INTO messages (family_id, sender_id, body, ai_flag, ai_flag_reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, family_id, sender_id, body, read_at, ai_flag, ai_flag_reason, created_at`,
    [familyId, req.userId, body.trim(), review.flag, review.reason]
  );

  const r = result.rows[0];
  const userRow = await pool.query(
    'SELECT u.name, fm.color FROM users u JOIN family_members fm ON fm.user_id = u.id AND fm.family_id = $2 WHERE u.id = $1',
    [req.userId, familyId]
  );
  const senderName = userRow.rows[0]?.name ?? 'Your co-parent';

  // Push + email to other parent (non-blocking)
  const otherMembers = await pool.query(
    `SELECT u.id, u.name, u.email FROM users u
     JOIN family_members fm ON fm.user_id = u.id
     WHERE fm.family_id = $1 AND u.id != $2`,
    [familyId, req.userId]
  );
  const preview = body.length > 80 ? body.slice(0, 80) + '…' : body;
  sendPushToFamily(familyId, req.userId!, {
    title: `New message from ${senderName}`,
    body: preview,
    url: '/messages',
  }).catch(() => {});
  for (const other of otherMembers.rows) {
    sendEmail(other.email, `New message from ${senderName}`, newMessageEmail(other.name, senderName, preview)).catch(() => {});
  }

  res.status(201).json({
    message: {
      id: r.id,
      familyId: r.family_id,
      senderId: r.sender_id,
      senderName: senderName,
      senderColor: userRow.rows[0]?.color,
      body: r.body,
      readAt: r.read_at,
      aiFlag: r.ai_flag,
      aiFlagReason: r.ai_flag_reason,
      createdAt: r.created_at,
    },
    aiSuggestion: review.flag === 'warning' ? review.suggestion : null,
  });
});

// PATCH /api/messages/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  await pool.query(
    `UPDATE messages SET read_at = NOW()
     WHERE id = $1 AND family_id = $2 AND sender_id != $3 AND read_at IS NULL`,
    [req.params.id, familyId, req.userId]
  );
  res.json({ ok: true });
});

export default router;
