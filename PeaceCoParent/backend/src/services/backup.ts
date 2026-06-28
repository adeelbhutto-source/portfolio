import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import pool from '../db/index';
import logger from '../utils/logger';

const s3 = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  ? new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function runDatabaseHealthCheck() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(result.rows[0].count, 10);
    logger.info('DB health check passed', { userCount });
    return { ok: true, userCount };
  } catch (err) {
    logger.error('DB health check failed', { err });
    return { ok: false };
  }
}

export async function exportDataSnapshot(userId: string) {
  try {
    const [users, families, messages, events, expenses] = await Promise.all([
      pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [userId]),
      pool.query('SELECT f.* FROM families f JOIN family_members fm ON fm.family_id = f.id WHERE fm.user_id = $1', [userId]),
      pool.query('SELECT * FROM messages WHERE sender_id = $1', [userId]),
      pool.query('SELECT * FROM events WHERE created_by = $1', [userId]),
      pool.query('SELECT * FROM expenses WHERE submitted_by = $1', [userId]),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: users.rows[0],
      families: families.rows,
      messages: messages.rows,
      events: events.rows,
      expenses: expenses.rows,
    };
  } catch (err) {
    logger.error('Data export failed', { err, userId });
    throw err;
  }
}

export async function uploadBackupToS3(data: object, filename: string) {
  if (!s3 || !process.env.AWS_S3_BUCKET) {
    logger.warn('S3 not configured, skipping backup upload');
    return;
  }
  const key = `backups/${new Date().toISOString().split('T')[0]}/${filename}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  }));
  logger.info('Backup uploaded to S3', { key });
}
