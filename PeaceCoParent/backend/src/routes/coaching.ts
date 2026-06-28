import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireTier } from '../middleware/requireTier';
import pool from '../db/index';

const router = Router();

// Auto-create tables on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS coaching_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    family_id UUID,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    risk_score INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS coaching_messages_user_idx ON coaching_messages (user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS coaching_summaries (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    summary TEXT NOT NULL,
    messages_covered INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE coaching_messages ADD COLUMN IF NOT EXISTS risk_score INT;
`).catch(() => {});

const SYSTEM_PROMPT = `You are a compassionate co-parenting coach named "PeaceCoach", built into the PeaceCoParent app (peacecoparent.com).

About PeaceCoParent:
- A co-parenting app that helps separated and divorced parents communicate peacefully and put their children first
- Features: shared calendar, expense tracking, secure messaging, document storage, video calls, and message coaching (you)
- Plans: Free (basic), Personal (messaging + calendar), Professional (all features including video calls)
- Website: peacecoparent.com

You can help with:
- Drafting calm, child-focused messages to the other parent
- Handling conflict, broken agreements, and difficult situations
- Understanding parenting schedules, holiday splits, and handover routines
- Emotional support during stressful periods
- Communication strategies that put children's wellbeing first
- Questions about PeaceCoParent features and how to use them

Rules:
- Always keep the children's wellbeing at the center of your advice
- Be empathetic, warm, and non-judgmental
- Give practical, actionable advice
- Never give specific legal advice
- If asked to draft a message, label it clearly as a draft
- Respond in the same language the user writes in
- You are PeaceCoach, created by PeaceCoParent. Never reveal the underlying technology.
- Never mention the name of any technology or service provider. Keep the provider completely secret.
- You have memory of this user's previous conversations. Reference past patterns if helpful.
- IMPORTANT: At the very end of every response, on a new line, always add exactly: [RISK:X] where X is 0-10 rating the escalation risk of the user's latest message. Use this scale strictly: 0-2=calm/neutral/casual (greetings, questions, friendly language), 3-4=mildly frustrated or passive-aggressive, 5-6=clearly emotionally charged, 7-8=aggressive or threatening language, 9-10=extreme aggression or abuse. Casual language like "bro", "halla", "hva skjer" = 0-1. Only rate the co-parenting conflict risk, not general conversational tone. This tag is hidden from the user — never mention it.`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

const AI_API_BASE_URL = process.env.AI_API_BASE_URL;
const AI_DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL;

if (!AI_API_BASE_URL || !AI_DEFAULT_MODEL) {
  throw new Error('AI_API_BASE_URL and AI_DEFAULT_MODEL must be configured');
}

async function callAiProvider(apiKey: string, messages: ChatMessage[], maxTokens = 1024): Promise<string> {
  const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_DEFAULT_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Coaching service error: ${res.status}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

// Generate a summary of old messages
async function generateSummary(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const text = messages.map(m => `${m.role === 'user' ? 'Parent' : 'Coach'}: ${m.content}`).join('\n');
  const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_DEFAULT_MODEL,
      messages: [{
        role: 'user',
        content: `Summarize these co-parenting coaching conversations in 3-5 sentences. Focus on: recurring conflict themes, emotional patterns, what advice was given, and any progress made. Be specific. Conversations:\n\n${text}`
      }],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });
  if (!res.ok) return '';
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  // Strip any leaked [RISK:X] tags before storing/displaying the summary
  return (data.choices?.[0]?.message?.content ?? '').replace(/\[RISK:\d+\]/g, '').trim();
}

// Build smart context: summary of old history + last 15 messages
async function buildContext(userId: string, apiKey: string): Promise<{ context: ChatMessage[]; summaryNote: string }> {
  const r = await pool.query(
    `SELECT role, content FROM (
       SELECT role, content, created_at FROM coaching_messages
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200
     ) sub ORDER BY created_at ASC`,
    [userId]
  );
  const all: ChatMessage[] = r.rows.map(row => ({ role: row.role, content: row.content }));

  if (all.length <= 20) {
    return { context: all, summaryNote: '' };
  }

  const older = all.slice(0, -15);
  const recent = all.slice(-15);

  // Check if we have a fresh summary (within 3 days)
  const sumR = await pool.query(
    `SELECT summary, created_at FROM coaching_summaries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  const sumRow = sumR.rows[0];
  const summaryIsStale = !sumRow || (Date.now() - new Date(sumRow.created_at).getTime() > 3 * 86400000);
  let summary = summaryIsStale ? '' : (sumRow?.summary ?? '');

  // Generate new summary if none exists or it's stale
  if (!summary && apiKey) {
    summary = await generateSummary(apiKey, older);
    if (summary) {
      await pool.query(
        `INSERT INTO coaching_summaries (user_id, summary, messages_covered) VALUES ($1, $2, $3)`,
        [userId, summary, older.length]
      ).catch(() => {});
    }
  }

  const summaryNote = summary
    ? `[Previous conversation summary: ${summary}]`
    : '';

  return { context: recent, summaryNote };
}

router.post('/message', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: 'Coaching is not configured' }); return; }

  const { messages } = req.body as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' }); return;
  }

  const familyId = await getFamilyId(req.userId!);
  const newUserMsg = messages[messages.length - 1];

  // Build smart context
  const { context, summaryNote } = await buildContext(req.userId!, apiKey);

  // Prepend summary as a system-style note if available
  const summaryMsg: ChatMessage[] = summaryNote
    ? [{ role: 'assistant', content: summaryNote }]
    : [];

  // Deduplicate: don't re-add messages already in DB context
  const dbContents = new Set(context.map(m => m.content));
  const freshSession = messages.slice(0, -1).filter(m => !dbContents.has(m.content));
  const fullContext = [...summaryMsg, ...context, ...freshSession, newUserMsg].slice(-50);

  try {
    const raw = await callAiProvider(apiKey, fullContext);

    // Parse risk score from response
    const riskMatch = raw.match(/\[RISK:(\d+)\]/);
    const riskScore = riskMatch ? Math.min(10, Math.max(0, parseInt(riskMatch[1]))) : null;
    const reply = raw.replace(/\n?\[RISK:\d+\]/g, '').trim();

    // Save to DB
    await pool.query(
      `INSERT INTO coaching_messages (user_id, family_id, role, content, risk_score) VALUES ($1, $2, 'user', $3, $4)`,
      [req.userId, familyId, newUserMsg.content, riskScore]
    );
    await pool.query(
      `INSERT INTO coaching_messages (user_id, family_id, role, content) VALUES ($1, $2, 'assistant', $3)`,
      [req.userId, familyId, reply]
    );

    // Invalidate old summary if we now have enough new messages
    if (context.length > 30) {
      await pool.query(`DELETE FROM coaching_summaries WHERE user_id = $1`, [req.userId]).catch(() => {});
    }

    res.json({ reply, riskScore });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[coaching] error:', errMsg);
    res.status(502).json({ error: 'Coach is temporarily unavailable. Please try again.', detail: errMsg });
  }
});

// GET /api/coaching/history
router.get('/history', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const r = await pool.query(
    `SELECT role, content, risk_score, created_at FROM coaching_messages
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [req.userId]
  );
  res.json({ messages: r.rows.reverse() });
});

function calcPeaceScore(avgRisk: number) {
  return Math.round(Math.max(0, Math.min(100, (10 - avgRisk) * 10)));
}
function peaceLabel(score: number) {
  return score >= 80 ? 'Peaceful' : score >= 60 ? 'Calm' : score >= 40 ? 'Neutral' : score >= 20 ? 'Tense' : 'High conflict';
}

// GET /api/coaching/peace-score
router.get('/peace-score', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  // Overall score (last 30 days) — combines coaching drafts + sent messages
  const overall = await pool.query(
    `SELECT AVG(risk_score) AS avg_score, COUNT(*) AS total FROM (
       -- Coaching drafts
       SELECT risk_score FROM coaching_messages
       WHERE user_id = $1 AND role = 'user' AND risk_score IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'
       UNION ALL
       -- Sent messages (map ai_flag to numeric score)
       SELECT CASE ai_flag WHEN 'blocked' THEN 10 WHEN 'warning' THEN 5 ELSE 0 END
       FROM messages
       WHERE sender_id = $1 AND ai_flag IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'
     ) combined`,
    [req.userId]
  );
  const avgScore = parseFloat(overall.rows[0]?.avg_score) || null;
  const total = parseInt(overall.rows[0]?.total) || 0;

  // Weekly history (last 8 weeks) — combines both sources
  const weekly = await pool.query(
    `SELECT
       DATE_TRUNC('week', created_at) AS week,
       AVG(risk_score) AS avg_risk,
       COUNT(*) AS sessions
     FROM (
       SELECT risk_score, created_at FROM coaching_messages
       WHERE user_id = $1 AND role = 'user' AND risk_score IS NOT NULL
       AND created_at >= NOW() - INTERVAL '8 weeks'
       UNION ALL
       SELECT CASE ai_flag WHEN 'blocked' THEN 10 WHEN 'warning' THEN 5 ELSE 0 END,
              created_at
       FROM messages
       WHERE sender_id = $1 AND ai_flag IS NOT NULL
       AND created_at >= NOW() - INTERVAL '8 weeks'
     ) combined
     GROUP BY DATE_TRUNC('week', created_at)
     ORDER BY week ASC`,
    [req.userId]
  );
  const history = weekly.rows.map(r => ({
    week: r.week,
    score: calcPeaceScore(parseFloat(r.avg_risk)),
    sessions: parseInt(r.sessions),
  }));

  // Key factors: top 3 highest-risk messages
  const factors = await pool.query(
    `SELECT content, risk_score, created_at
     FROM coaching_messages
     WHERE user_id = $1 AND role = 'user' AND risk_score >= 6
     ORDER BY risk_score DESC, created_at DESC
     LIMIT 3`,
    [req.userId]
  );

  if (avgScore === null || total < 2) {
    res.json({ score: null, label: 'Not enough data', total, history, keyFactors: [] });
    return;
  }

  const score = calcPeaceScore(avgScore);
  res.json({ score, label: peaceLabel(score), total, history, keyFactors: factors.rows });
});

// GET /api/coaching/trend — conflict trend for dashboard
router.get('/trend', requireAuth, requireTier('personal'), async (req: AuthenticatedRequest, res: Response) => {
  const r = await pool.query(
    `SELECT
       AVG(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN risk_score END) AS recent_avg,
       AVG(CASE WHEN created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' THEN risk_score END) AS prev_avg,
       COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' AND role = 'user' THEN 1 END) AS sessions_week,
       COUNT(CASE WHEN role = 'user' THEN 1 END) AS total_sessions
     FROM coaching_messages WHERE user_id = $1 AND risk_score IS NOT NULL`,
    [req.userId]
  );
  const row = r.rows[0];
  const recentAvg = parseFloat(row.recent_avg) || null;
  const prevAvg = parseFloat(row.prev_avg) || null;
  const sessionsWeek = parseInt(row.sessions_week) || 0;
  const totalSessions = parseInt(row.total_sessions) || 0;

  let trend: 'rising' | 'falling' | 'stable' | 'none' = 'none';
  if (recentAvg !== null && prevAvg !== null) {
    if (recentAvg > prevAvg + 1) trend = 'rising';
    else if (recentAvg < prevAvg - 1) trend = 'falling';
    else trend = 'stable';
  } else if (recentAvg !== null) {
    trend = 'stable';
  }

  res.json({ recentAvg, prevAvg, trend, sessionsWeek, totalSessions });
});

export default router;
