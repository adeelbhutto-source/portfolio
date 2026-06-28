import { Router, Response } from 'express';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Auto-create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    started_by UUID NOT NULL,
    room_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
  )
`).catch(() => {});

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

async function createOwnerToken(roomName: string): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return null;
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { token?: string };
  return data.token ?? null;
}

async function deleteDailyRoom(roomName: string): Promise<void> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return;
  await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

async function getOrCreateDailyRoom(roomName: string): Promise<{ url: string } | { error: string }> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return { error: 'DAILY_API_KEY not set' };

  // Try creating a fresh public room
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      name: roomName,
      properties: { exp: Math.floor(Date.now() / 1000) + 3600 },
    }),
  });
  const data = await res.json() as { url?: string; error?: string; info?: string };

  if (res.ok && data.url) return { url: data.url };

  // Room already exists — delete it and recreate fresh
  if (!res.ok && data.info?.includes('already exists')) {
    await deleteDailyRoom(roomName);
    const res2 = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        name: roomName,
        properties: { exp: Math.floor(Date.now() / 1000) + 3600 },
      }),
    });
    const data2 = await res2.json() as { url?: string; error?: string; info?: string };
    if (res2.ok && data2.url) return { url: data2.url };
    return { error: `${data2.error ?? 'unknown'}: ${data2.info ?? ''}` };
  }

  return { error: `${data.error ?? 'unknown'}: ${data.info ?? ''}` };
}

// POST /api/calls/start — create or join a call room
router.post('/start', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  if (!process.env.DAILY_API_KEY) {
    res.status(503).json({ error: 'Video calls are not configured yet.' });
    return;
  }

  const roomName = `pcp-${familyId.replace(/-/g, '').slice(0, 16)}`;

  const roomResult = await getOrCreateDailyRoom(roomName);
  if ('error' in roomResult) { res.status(502).json({ error: `Could not create call room: ${roomResult.error}` }); return; }

  await pool.query(
    `INSERT INTO call_logs (family_id, started_by, room_name, started_at)
     VALUES ($1, $2, $3, NOW())`,
    [familyId, req.userId, roomName]
  ).catch(() => {});

  const token = await createOwnerToken(roomName);

  res.json({ roomUrl: roomResult.url, token, roomName });
});

// POST /api/calls/end — log call end
router.post('/end', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const roomName = `pcp-${familyId.replace(/-/g, '').slice(0, 16)}`;
  await pool.query(
    `UPDATE call_logs SET ended_at = NOW()
     WHERE id = (
       SELECT id FROM call_logs
       WHERE family_id = $1 AND room_name = $2 AND ended_at IS NULL
       ORDER BY started_at DESC LIMIT 1
     )`,
    [familyId, roomName]
  ).catch(() => {});

  res.json({ ok: true });
});

// GET /api/calls/status — check if DAILY is configured
router.get('/status', requireAuth, (_req, res: Response) => {
  res.json({ available: !!process.env.DAILY_API_KEY });
});

export default router;
