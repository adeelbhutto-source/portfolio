import { Router, Response } from 'express';
import { google } from 'googleapis';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireTier } from '../middleware/requireTier';

const router = Router();

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ?? `${process.env.FRONTEND_URL}/calendar?gcal=callback`,
  );
}

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// GET /api/google-calendar/auth-url
router.get('/auth-url', requireAuth, requireTier('personal'), (_req: AuthenticatedRequest, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: 'Google Calendar not configured' });
    return;
  }
  const url = getOAuth2Client().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.json({ url });
});

// POST /api/google-calendar/callback
// Body: { code: string }
router.post('/callback', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: 'Google Calendar not configured' });
    return;
  }
  const { code } = req.body as { code: string };
  if (!code) { res.status(400).json({ error: 'code is required' }); return; }

  const oauth2 = getOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    res.status(400).json({ error: 'No refresh token received. Revoke app access in Google and try again.' });
    return;
  }

  await pool.query(
    'UPDATE users SET google_refresh_token = $1 WHERE id = $2',
    [tokens.refresh_token, req.userId]
  );
  res.json({ connected: true });
});

// DELETE /api/google-calendar/disconnect
router.delete('/disconnect', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  await pool.query('UPDATE users SET google_refresh_token = NULL, google_calendar_id = NULL WHERE id = $1', [req.userId]);
  res.json({ disconnected: true });
});

// GET /api/google-calendar/status
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const r = await pool.query('SELECT google_refresh_token FROM users WHERE id = $1', [req.userId]);
  res.json({ connected: !!r.rows[0]?.google_refresh_token });
});

// POST /api/google-calendar/sync  — push all family events to Google Calendar
router.post('/sync', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const userRow = await pool.query(
    'SELECT google_refresh_token, google_calendar_id FROM users WHERE id = $1',
    [req.userId]
  );
  const user = userRow.rows[0];
  if (!user?.google_refresh_token) {
    res.status(403).json({ error: 'Google Calendar not connected' });
    return;
  }

  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({ refresh_token: user.google_refresh_token });
  const calendar = google.calendar({ version: 'v3', auth: oauth2 });

  // Get or create PeaceCoParent calendar
  let calendarId = user.google_calendar_id as string | null;
  if (!calendarId) {
    const cal = await calendar.calendars.insert({
      requestBody: {
        summary: 'PeaceCoParent',
        description: 'Shared co-parenting calendar',
        timeZone: 'UTC',
      },
    });
    calendarId = cal.data.id!;
    await pool.query('UPDATE users SET google_calendar_id = $1 WHERE id = $2', [calendarId, req.userId]);
  }

  // Fetch family events (next 90 days)
  const familyRow = await pool.query(
    'SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1',
    [req.userId]
  );
  const familyId = familyRow.rows[0]?.family_id;
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const now = new Date();
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const events = await pool.query(
    `SELECT e.*, u.name as creator_name FROM events e
     JOIN users u ON u.id = e.created_by
     WHERE e.family_id = $1 AND e.start_date >= $2 AND e.start_date <= $3
       AND e.deleted_at IS NULL
     ORDER BY e.start_date`,
    [familyId, now.toISOString(), future.toISOString()]
  );

  let synced = 0;
  for (const ev of events.rows) {
    try {
      await calendar.events.insert({
        calendarId: calendarId!,
        requestBody: {
          summary: ev.title,
          description: ev.notes ? `${ev.notes}\n\nAdded by ${ev.creator_name} via PeaceCoParent` : `Added by ${ev.creator_name} via PeaceCoParent`,
          start: ev.all_day
            ? { date: new Date(ev.start_date).toISOString().slice(0, 10) }
            : { dateTime: new Date(ev.start_date).toISOString() },
          end: ev.all_day
            ? { date: new Date(ev.end_date).toISOString().slice(0, 10) }
            : { dateTime: new Date(ev.end_date).toISOString() },
          extendedProperties: { private: { peacecoparentId: ev.id } },
        },
      });
      synced++;
    } catch (err) {
      console.error('[googleCalendar] event sync failed:', err);
      // Skip events that fail (duplicates, etc.)
    }
  }

  const failed = events.rows.length - synced;
  res.json({ synced, total: events.rows.length, failed });
});

export default router;
