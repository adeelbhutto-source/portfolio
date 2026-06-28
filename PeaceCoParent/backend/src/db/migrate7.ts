import pool from './index';

async function migrate7() {
  const client = await pool.connect();
  try {
    // This column was previously only added via a runtime ALTER in index.ts.
    // Moving it to a proper migration for cleanliness and reliability.
    await client.query(`
      ALTER TABLE coaching_messages 
      ADD COLUMN IF NOT EXISTS risk_score INT;
    `);
    console.log('Migration 7 complete: ensured risk_score column exists on coaching_messages');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate7().catch(console.error);