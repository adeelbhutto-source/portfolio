import webpush from 'web-push';
import pool from '../db/index';

// Generate VAPID keys once and put in .env:
// node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k))"
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'hello@peacecoparent.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/** Send push notification to all subscriptions for a user */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!process.env.VAPID_PUBLIC_KEY) {
    console.warn('[push] VAPID_PUBLIC_KEY not set — push notifications disabled');
    return;
  }

  const subs = await pool.query(
    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );

  const data = JSON.stringify(payload);
  const promises = subs.rows.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        data
      );
    } catch (err: unknown) {
      // Remove invalid/expired subscriptions
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await pool.query(
          'DELETE FROM push_subscriptions WHERE endpoint = $1',
          [sub.endpoint]
        );
      }
    }
  });

  await Promise.allSettled(promises);
}

/** Send push to all members of a family except the sender */
export async function sendPushToFamily(familyId: string, excludeUserId: string, payload: PushPayload) {
  const members = await pool.query(
    'SELECT user_id FROM family_members WHERE family_id = $1 AND user_id != $2',
    [familyId, excludeUserId]
  );
  await Promise.allSettled(
    members.rows.map((m) => sendPushToUser(m.user_id, payload))
  );
}
