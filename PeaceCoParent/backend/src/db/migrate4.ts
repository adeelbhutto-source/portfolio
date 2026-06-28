/**
 * Migration 4 — reminder_sent flag on events, caregiver_access table
 */
import pool from './index';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add reminder_sent to events
    await client.query(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE
    `);

    // Caregiver / babysitter access to child profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS caregiver_access (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        granted_by   UUID NOT NULL REFERENCES users(id),
        name         TEXT NOT NULL,
        email        TEXT,
        phone        TEXT,
        access_level TEXT NOT NULL DEFAULT 'basic' CHECK (access_level IN ('basic','full')),
        pin_hash     TEXT,
        expires_at   TIMESTAMPTZ,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_caregiver_family ON caregiver_access(family_id)
    `);

    await client.query('COMMIT');
    console.log('Migration 4 completed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration 4 failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
