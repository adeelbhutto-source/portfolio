/**
 * Migration 3 — Push subscriptions, attorney access
 * Run with: npx tsx src/db/migrate3.ts
 */
import pool from './index';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Web push subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint    TEXT NOT NULL,
        p256dh      TEXT NOT NULL,
        auth        TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, endpoint)
      )
    `);

    // Attorney / mediator access (read-only to family data)
    await client.query(`
      CREATE TABLE IF NOT EXISTS attorney_access (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        attorney_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        granted_by  UUID NOT NULL REFERENCES users(id),
        role        TEXT NOT NULL DEFAULT 'attorney' CHECK (role IN ('attorney','mediator')),
        expires_at  TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (family_id, attorney_id)
      )
    `);

    await client.query('COMMIT');
    console.log('Migration 3 completed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration 3 failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
