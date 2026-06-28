import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { sendEmail, welcomeEmail } from '../services/emailService';
import { validate, registerSchema, loginSchema } from '../utils/validate';
import type { RegisterRequest, LoginRequest } from '../types/shared';

const router = Router();

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function issueTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, name } = req.body as RegisterRequest;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password and name are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const result = await client.query(
      `INSERT INTO users (email, name, password_hash, subscription_tier, subscription_status, trial_ends_at)
       VALUES ($1, $2, $3, 'professional', 'trialing', $4)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), name.trim(), passwordHash, trialEndsAt]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = issueTokens(user.id);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Send welcome email (non-blocking)
    sendEmail(user.email, 'Welcome to PeaceCoParent 👋', welcomeEmail(user.name)).catch(() => {});

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
      family: null,
      familyMember: null,
      tokens: { accessToken, refreshToken },
    });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Fetch family info if any
    const memberResult = await client.query(
      `SELECT fm.family_id, fm.role, fm.color, fm.joined_at, f.name as family_name, f.invite_code
       FROM family_members fm
       JOIN families f ON f.id = fm.family_id
       WHERE fm.user_id = $1
       LIMIT 1`,
      [user.id]
    );

    const memberRow = memberResult.rows[0] || null;
    const family = memberRow
      ? { id: memberRow.family_id, name: memberRow.family_name, inviteCode: memberRow.invite_code, createdAt: memberRow.joined_at }
      : null;
    const familyMember = memberRow
      ? { userId: user.id, familyId: memberRow.family_id, role: memberRow.role, color: memberRow.color, joinedAt: memberRow.joined_at }
      : null;

    const { accessToken, refreshToken } = issueTokens(user.id);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
      family,
      familyMember,
      tokens: { accessToken, refreshToken },
    });
  } finally {
    client.release();
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row || new Date(row.expires_at) < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Rotate: delete old, issue new
    await client.query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);

    const { accessToken, refreshToken: newRefreshToken } = issueTokens(row.user_id);
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [row.user_id, newHash, expiresAt]
    );

    res.json({ tokens: { accessToken, refreshToken: newRefreshToken } });
  } finally {
    client.release();
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }
  res.json({ message: 'Logged out' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: 'email is required' }); return; }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()]);
    // Always return success to prevent email enumeration
    if (!result.rows.length) { res.json({ message: 'If that email exists, a reset link has been sent.' }); return; }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens for this user
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
    await client.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'https://peacecoparent.com'}/reset-password?token=${token}`;
    const { sendEmail } = await import('../services/emailService');
    await sendEmail(
      email.toLowerCase(),
      'Reset your PeaceCoParent password',
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0284c7">Reset your password</h2>
        <p style="color:#334155">Hi ${user.name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0284c7;color:#fff;border-radius:8px;padding:12px 24px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset password
        </a>
        <p style="color:#94a3b8;font-size:12px">If you didn't request this, ignore this email. Your password won't change.</p>
        <p style="color:#94a3b8;font-size:11px">PeaceCoParent · <a href="https://peacecoparent.com" style="color:#94a3b8">peacecoparent.com</a></p>
      </div>`
    );

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } finally {
    client.release();
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  if (!token || !password) { res.status(400).json({ error: 'token and password are required' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      res.status(400).json({ error: 'Reset link is invalid or has expired.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, row.user_id]);
    await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [row.id]);
    // Invalidate all sessions
    await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [row.user_id]);

    res.json({ message: 'Password reset successfully. Please log in.' });
  } finally {
    client.release();
  }
});

// GET /api/auth/google — redirect to Google consent screen
router.get('/google', (req: Request, res: Response) => {
if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: 'Google login is not configured' });
    return;
  }
  const mobile = req.query.mobile === 'true';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${backendUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: mobile ? 'mobile' : 'web',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// GET /api/auth/google/callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const { code } = req.query;

  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.redirect(`${frontendUrl}/login?error=google_failed`);
    return;
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

    // Exchange code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${backendUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) {
      res.redirect(`${frontendUrl}/login?error=google_failed`);
      return;
    }

    // Get Google user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json() as { email?: string; name?: string };
    if (!googleUser.email) {
      res.redirect(`${frontendUrl}/login?error=google_failed`);
      return;
    }

    const email = googleUser.email.toLowerCase();
    const client = await pool.connect();
    try {
      // Find existing user or create new one
      let userId: string;
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);

      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
      } else {
        // Create user — Google users get a random unusable password hash
        const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
        const userName = googleUser.name ?? email.split('@')[0];
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const created = await client.query(
          `INSERT INTO users (email, name, password_hash, subscription_tier, subscription_status, trial_ends_at) VALUES ($1, $2, $3, 'professional', 'trialing', $4) RETURNING id`,
          [email, userName, randomHash, trialEndsAt]
        );
        userId = created.rows[0].id;
        // Send welcome email to new Google users (non-blocking)
        sendEmail(email, 'Welcome to PeaceCoParent 👋', welcomeEmail(userName)).catch(() => {});
      }

      // Issue our own JWT tokens
      const { accessToken, refreshToken } = issueTokens(userId);
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
      );

      // Redirect — mobile gets deep link, web gets frontend URL
      const isMobile = req.query.state === 'mobile';
      if (isMobile) {
        res.redirect(`peacecoparent://auth/callback?at=${encodeURIComponent(accessToken)}&rt=${encodeURIComponent(refreshToken)}`);
      } else {
        res.redirect(`${frontendUrl}/auth/callback?at=${encodeURIComponent(accessToken)}&rt=${encodeURIComponent(refreshToken)}`);
      }
    } finally {
      client.release();
    }
  } catch {
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, email, name, created_at FROM users WHERE id = $1`,
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const memberResult = await client.query(
      `SELECT fm.family_id, fm.role, fm.color, fm.joined_at, f.name as family_name, f.invite_code
       FROM family_members fm
       JOIN families f ON f.id = fm.family_id
       WHERE fm.user_id = $1
       LIMIT 1`,
      [user.id]
    );
    const memberRow = memberResult.rows[0] || null;
    const family = memberRow
      ? { id: memberRow.family_id, name: memberRow.family_name, inviteCode: memberRow.invite_code, createdAt: memberRow.joined_at }
      : null;
    const familyMember = memberRow
      ? { userId: user.id, familyId: memberRow.family_id, role: memberRow.role, color: memberRow.color, joinedAt: memberRow.joined_at }
      : null;

    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
      family,
      familyMember,
    });
  } finally {
    client.release();
  }
});

export default router;
