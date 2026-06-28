import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { validateEnv } from './utils/validateEnv';
import { initSentry, captureException } from './utils/sentry';
import logger from './utils/logger';
import authRouter from './routes/auth';
import familyRouter from './routes/family';
import eventsRouter from './routes/events';
import messagesRouter from './routes/messages';
import expensesRouter from './routes/expenses';
import documentsRouter from './routes/documents';
import reportsRouter from './routes/reports';
import childrenRouter from './routes/children';
import subscriptionsRouter from './routes/subscriptions';
import googleCalendarRouter from './routes/googleCalendar';
import accountRouter from './routes/account';
import attorneyRouter from './routes/attorney';
import caregiverRouter from './routes/caregiver';
import coachingRouter from './routes/coaching';
import callsRouter from './routes/calls';
import promoRouter from './routes/promo';
import { startScheduler } from './services/scheduler';

dotenv.config();
validateEnv();
initSentry();

// Schema changes go through migration scripts in backend/src/db/
import pool from './db/index';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);
const PORT = parseInt(process.env.PORT || '4000', 10);

const ALLOWED_ORIGINS = [
  'https://peacecoparent.com',
  'https://www.peacecoparent.com',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some(o => origin === o || origin.endsWith('.vercel.app'))) {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Stripe webhooks need raw body — MUST be registered BEFORE express.json()
app.use('/api/expenses/webhook', express.raw({ type: 'application/json' }));
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/webhook'),
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRouter);
app.use('/api/family', familyRouter);
app.use('/api/events', eventsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/children', childrenRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/google-calendar', googleCalendarRouter);
app.use('/api/account', accountRouter);
app.use('/api/attorney', attorneyRouter);
app.use('/api/caregiver', caregiverRouter);
app.use('/api/coaching', coachingRouter);
app.use('/api/calls', callsRouter);
app.use('/api/promo', promoRouter);

app.get('/privacy', (_req, res) => {
  const url = `${process.env.FRONTEND_URL || 'https://peacecoparent.com'}/privacy`;
  res.redirect(301, url);
});

app.get('/health', async (_req, res) => {
  try {
    const { runDatabaseHealthCheck } = await import('./services/backup');
    const db = await runDatabaseHealthCheck();
    res.status(200).json({
      status: db.ok ? 'ok' : 'degraded',
      db: db.ok ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(200).json({ status: 'degraded', db: 'error', timestamp: new Date().toISOString() });
  }
});

// Catch unhandled async errors in Express 4 route handlers
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  captureException(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});



app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start as a server when running directly (not in Vercel serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    logger.info(`PeaceCoParent backend running on port ${PORT}`);
    startScheduler();
  });
}

export default app;
