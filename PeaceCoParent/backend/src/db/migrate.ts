import pool from './index';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS families (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        TEXT NOT NULL,
        invite_code CHAR(8) UNIQUE NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        role        TEXT NOT NULL CHECK (role IN ('parent1', 'parent2')),
        color       TEXT NOT NULL DEFAULT '#6366f1',
        joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, family_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT UNIQUE NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Index for fast token lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
        ON refresh_tokens(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_family_members_family_id
        ON family_members(family_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        start_date  TIMESTAMPTZ NOT NULL,
        end_date    TIMESTAMPTZ NOT NULL,
        all_day     BOOLEAN NOT NULL DEFAULT TRUE,
        type        TEXT NOT NULL DEFAULT 'other',
        created_by  UUID NOT NULL REFERENCES users(id),
        color       TEXT,
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_family_date
        ON events(family_id, start_date, end_date)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        sender_id       UUID NOT NULL REFERENCES users(id),
        body            TEXT NOT NULL,
        read_at         TIMESTAMPTZ,
        ai_flag         TEXT CHECK (ai_flag IN ('ok','warning','blocked')),
        ai_flag_reason  TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_family_created
        ON messages(family_id, created_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id               UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        submitted_by            UUID NOT NULL REFERENCES users(id),
        title                   TEXT NOT NULL,
        amount                  INTEGER NOT NULL CHECK (amount > 0),
        currency                TEXT NOT NULL DEFAULT 'usd',
        category                TEXT NOT NULL DEFAULT 'other',
        receipt_url             TEXT,
        notes                   TEXT,
        split_percent           INTEGER NOT NULL DEFAULT 50 CHECK (split_percent BETWEEN 0 AND 100),
        status                  TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','approved','rejected','paid')),
        stripe_payment_intent_id TEXT,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_family
        ON expenses(family_id, created_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        uploaded_by UUID NOT NULL REFERENCES users(id),
        name        TEXT NOT NULL,
        category    TEXT NOT NULL DEFAULT 'other',
        s3_key      TEXT NOT NULL,
        file_size   INTEGER NOT NULL DEFAULT 0,
        mime_type   TEXT NOT NULL DEFAULT 'application/octet-stream',
        version     INTEGER NOT NULL DEFAULT 1,
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_family
        ON documents(family_id, created_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS children (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id         UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        name              TEXT NOT NULL,
        date_of_birth     DATE NOT NULL,
        allergies         TEXT,
        medications       TEXT,
        school_name       TEXT,
        school_grade      TEXT,
        doctor_name       TEXT,
        doctor_phone      TEXT,
        emergency_contact TEXT,
        notes             TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
