import pool from './index';

async function migrate6() {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Soft delete for events: preserve evidence, never destroy records
      ALTER TABLE events
        ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS deleted_by  UUID REFERENCES users(id);

      -- Expense audit trail: who approved/rejected and when
      ALTER TABLE expenses
        ADD COLUMN IF NOT EXISTS responded_by  UUID REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS responded_at  TIMESTAMPTZ;

      -- Webhook idempotency: prevent duplicate Stripe event processing
      CREATE TABLE IF NOT EXISTS processed_webhook_events (
        event_id    TEXT PRIMARY KEY,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_events_deleted ON events(deleted_at) WHERE deleted_at IS NULL;
    `);
    console.log('Migration 6 complete: soft delete on events, expense audit trail, webhook idempotency');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate6().catch(console.error);
