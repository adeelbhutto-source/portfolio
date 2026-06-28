import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
  });
}

export function captureException(err: unknown) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  } else {
    // logger imported lazily to avoid circular deps
    import('./logger').then(({ default: logger }) => logger.error(err instanceof Error ? err.message : String(err), { err }));
  }
}
