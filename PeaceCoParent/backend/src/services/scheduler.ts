/**
 * Background scheduler — runs cron jobs for:
 * 1. Event reminders: push + email 24h before each event
 * 2. Cleanup: delete expired refresh tokens daily
 */
import cron from 'node-cron';
import pool from '../db/index';
import { sendPushToUser } from './pushNotifications';
import { sendEmail, eventReminderEmail, onboardingDay3Email, onboardingDay7Email, trialEndingSoonEmail, trialExpiredEmail } from './emailService';
import { runDatabaseHealthCheck } from './backup';
import logger from '../utils/logger';

export function startScheduler() {
  // ── Event reminders — runs every hour ──────────────────────────────────────
  // Finds events starting in the next 24-25 hours and sends reminder once
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const events = await pool.query(
        `SELECT ev.id, ev.title, ev.start_date, ev.family_id,
                u.name as creator_name, u.email as creator_email
         FROM events ev
         JOIN users u ON u.id = ev.created_by
         WHERE ev.start_date BETWEEN $1 AND $2
           AND ev.reminder_sent IS NOT TRUE`,
        [in24h, in25h]
      );

      for (const ev of events.rows) {
        // Get all family members
        const members = await pool.query(
          `SELECT u.id, u.name, u.email FROM users u
           JOIN family_members fm ON fm.user_id = u.id
           WHERE fm.family_id = $1`,
          [ev.family_id]
        );

        for (const member of members.rows) {
          const eventDate = new Date(ev.start_date);

          // Push notification
          await sendPushToUser(member.id, {
            title: `Tomorrow: ${ev.title}`,
            body: eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            url: '/calendar',
          }).catch(() => {});

          // Email notification
          await sendEmail(
            member.email,
            `Reminder: ${ev.title} is tomorrow`,
            eventReminderEmail(member.name, ev.title, eventDate)
          );
        }

        // Mark reminder sent
        await pool.query(
          'UPDATE events SET reminder_sent = TRUE WHERE id = $1',
          [ev.id]
        );
      }
    } catch (err) {
      logger.error('Reminder job error', { err });
    }
  });

  // ── Clean up expired refresh tokens — runs daily at 3am ──────────────────
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await pool.query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
      );
      logger.info('Token cleanup done', { count: result.rowCount });
    } catch (err) {
      logger.error('Token cleanup error', { err });
    }
  });

  // ── Onboarding emails — runs daily at 9am ────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    try {
      // Day 3 email
      const day3 = await pool.query(
        `SELECT u.id, u.name, u.email FROM users u
         WHERE u.created_at BETWEEN NOW() - INTERVAL '3 days 1 hour' AND NOW() - INTERVAL '3 days'
         AND NOT EXISTS (
           SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = u.id AND oe.step = 3
         )`
      );
      for (const user of day3.rows) {
        await sendEmail(user.email, 'Have you tried PeaceCoach yet?', onboardingDay3Email(user.name));
        await pool.query(
          `INSERT INTO onboarding_emails (user_id, step) VALUES ($1, 3) ON CONFLICT DO NOTHING`,
          [user.id]
        );
      }

      // Day 7 email
      const day7 = await pool.query(
        `SELECT u.id, u.name, u.email, u.subscription_tier FROM users u
         WHERE u.created_at BETWEEN NOW() - INTERVAL '7 days 1 hour' AND NOW() - INTERVAL '7 days'
         AND NOT EXISTS (
           SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = u.id AND oe.step = 7
         )`
      );
      for (const user of day7.rows) {
        const isPaid = user.subscription_tier !== 'free';
        await sendEmail(user.email, isPaid ? 'One week in — how is it going?' : 'One week in — ready to unlock more?', onboardingDay7Email(user.name, isPaid));
        await pool.query(
          `INSERT INTO onboarding_emails (user_id, step) VALUES ($1, 7) ON CONFLICT DO NOTHING`,
          [user.id]
        );
      }

      // Trial ending soon (3 days warning)
      const endingSoon = await pool.query(
        `SELECT u.id, u.name, u.email, u.subscription_tier FROM users u
         WHERE u.subscription_status = 'trialing'
         AND u.trial_ends_at BETWEEN NOW() + INTERVAL '3 days' AND NOW() + INTERVAL '3 days 1 hour'
         AND NOT EXISTS (
           SELECT 1 FROM onboarding_emails oe WHERE oe.user_id = u.id AND oe.step = 97
         )`
      );
      for (const user of endingSoon.rows) {
        await sendEmail(
          user.email,
          'Your free trial ends in 3 days',
          trialEndingSoonEmail(user.name, 3, user.subscription_tier)
        );
        await pool.query(
          `INSERT INTO onboarding_emails (user_id, step) VALUES ($1, 97) ON CONFLICT DO NOTHING`,
          [user.id]
        );
        logger.info('Trial ending soon email sent', { userId: user.id });
      }

      // Expire trials + send expired email
      const expired = await pool.query(
        `UPDATE users SET subscription_tier = 'free', subscription_status = 'active'
         WHERE subscription_status = 'trialing'
         AND trial_ends_at IS NOT NULL AND trial_ends_at < NOW()
         RETURNING id, name, email`
      );
      if (expired.rowCount && expired.rowCount > 0) {
        logger.info('Expired trials', { count: expired.rowCount });
        for (const user of expired.rows) {
          await sendEmail(
            user.email,
            'Your free trial has ended',
            trialExpiredEmail(user.name)
          ).catch(() => {});
        }
      }
    } catch (err) {
      logger.error('Onboarding email job error', { err });
    }
  });

  // ── Daily DB health check ──────────────────────────────────────────────────
  cron.schedule('0 6 * * *', async () => {
    try {
      await runDatabaseHealthCheck();
    } catch (err) {
      logger.error('Health check job error', { err });
    }
  });

  logger.info('Scheduler started');
}
