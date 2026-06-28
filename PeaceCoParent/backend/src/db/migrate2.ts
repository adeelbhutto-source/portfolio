/**
 * Migration 2 — Subscriptions, Google Calendar tokens, audit log, receipt photos
 * Run with: npx tsx src/db/migrate2.ts
 */
import pool from './index';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Subscription columns on users
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS subscription_tier    TEXT NOT NULL DEFAULT 'free'
          CHECK (subscription_tier IN ('free','personal','professional','enterprise')),
        ADD COLUMN IF NOT EXISTS subscription_status  TEXT NOT NULL DEFAULT 'active'
          CHECK (subscription_status IN ('active','canceled','past_due','trialing')),
        ADD COLUMN IF NOT EXISTS stripe_customer_id   TEXT,
        ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
        ADD COLUMN IF NOT EXISTS google_calendar_id   TEXT
    `);

    // Audit log — tamper-proof append-only record of all actions
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
        user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
        action      TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id   UUID,
        metadata    JSONB DEFAULT '{}',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_family ON audit_log(family_id, created_at DESC)
    `);

    // Expense usage counters per user per month
    await client.query(`
      CREATE TABLE IF NOT EXISTS expense_usage (
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        year_month  CHAR(7) NOT NULL,
        count       INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, year_month)
      )
    `);

    // Document version history
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        version     INTEGER NOT NULL,
        s3_key      TEXT NOT NULL,
        file_size   INTEGER NOT NULL DEFAULT 0,
        uploaded_by UUID REFERENCES users(id),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_doc_versions ON document_versions(document_id, version DESC)
    `);

    await client.query('COMMIT');
    console.log('Migration 2 completed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration 2 failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
