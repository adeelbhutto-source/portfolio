import type { AiReviewResponse } from '../types/shared';

const SYSTEM_PROMPT = `You are a co-parenting communication coach. Review messages between co-parents.

Classify every message as:
- "ok"      — neutral, child-focused, or constructive
- "warning" — passive-aggressive, blaming, emotionally charged, or could escalate
- "blocked" — aggressive, threatening, manipulative, abusive, or personal attacks

IMPORTANT RULES:
1. For "warning" or "blocked": ALWAYS provide a concrete rewrite in "suggestion". Never leave it null.
2. The suggestion must say the same thing but calmly, factually, and child-focused.
3. Keep suggestions short (1-3 sentences max). Never be preachy or lecture.
4. Use conversation history to detect escalating patterns even if the current message seems mild.

Respond ONLY with valid JSON:
{
  "flag": "ok" | "warning" | "blocked",
  "reason": null | "one sentence explaining why",
  "suggestion": null | "concrete rewrite — REQUIRED for warning/blocked"
}`;

export interface MessageHistoryItem {
  senderName: string;
  body: string;
}

// Terms that always force a blocked flag regardless of coaching output.
// Phrases with spaces use direct includes; single words use word-boundary regex.
const BLOCKED_PHRASES = [
  'piss off', 'shut up', 'hate you', 'hate u',
  'will never let you', 'will never let u',
  'take the kids', 'take my kid',
];
const BLOCKED_WORDS = ['fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dickhead', 'idiot', 'moron'];

// Normalise "u" → "you", "ur" → "your" etc. so phrase matching catches text-speak
function normalise(text: string): string {
  return text.toLowerCase()
    .replace(/\bu\b/g, 'you')
    .replace(/\bur\b/g, 'your')
    .replace(/\bya\b/g, 'you');
}

function containsBlockedTerm(text: string): boolean {
  const n = normalise(text);
  if (BLOCKED_PHRASES.some(p => n.includes(p))) return true;
  return BLOCKED_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(n));
}

const FALLBACK_SUGGESTION = 'I would like to discuss this. Can we keep our messages focused on the children?';

export async function reviewMessage(
  body: string,
  history: MessageHistoryItem[] = []
): Promise<AiReviewResponse> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error('AI_API_KEY is not configured');

  const mustBlock = containsBlockedTerm(body);

  const recentHistory = history.slice(-10);
  const senderNames = [...new Set(recentHistory.map((m) => m.senderName))];
  const anonymise = (name: string) => senderNames.indexOf(name) === 0 ? 'Parent A' : 'Parent B';
  const historyText = recentHistory.length > 0
    ? `Recent conversation:\n${recentHistory.map((m) => `${anonymise(m.senderName)}: "${m.body}"`).join('\n')}\n\nNew message:`
    : 'Message to review:';

  const aiBaseUrl = process.env.AI_API_BASE_URL;
  const aiModel = process.env.AI_DEFAULT_MODEL;

  if (!aiBaseUrl || !aiModel) {
    throw new Error('AI_API_BASE_URL and AI_DEFAULT_MODEL must be configured');
  }

  const res = await fetch(`${aiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: aiModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${historyText}\n"${body}"` },
      ],
      max_tokens: 256,
      temperature: 0.1,
    }),
  });

  if (!res.ok) throw new Error(`Coaching service error: ${res.status}`);

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? '{}';
  const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  const result = JSON.parse(text) as AiReviewResponse;

  // Override flag for messages with obviously offensive terms — coaching still provides the contextual suggestion
  if (mustBlock) result.flag = 'blocked';

  // The coaching service sometimes ignores the instruction to always include a suggestion — use fallback
  if (result.flag !== 'ok' && !result.suggestion) result.suggestion = FALLBACK_SUGGESTION;

  return result;
}
