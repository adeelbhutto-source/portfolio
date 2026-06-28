import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const FROM = `PeaceCoParent <${process.env.SMTP_FROM ?? 'hello@peacecoparent.com'}>`;
const BASE = process.env.FRONTEND_URL ?? 'https://peacecoparent.com';

const BRAND = '#0f172a';
const GREEN = '#22c55e';
const RED   = '#ef4444';

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PeaceCoParent</title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
      <!-- Header -->
      <tr><td style="background:${BRAND};padding:32px;text-align:center">
        <div style="display:inline-block;width:52px;height:52px;background:#fff;border-radius:14px;line-height:52px;font-size:26px;font-weight:900;color:${BRAND};text-align:center;margin-bottom:16px">P</div>
        <p style="margin:0;color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.3px">PeaceCoParent</p>
      </td></tr>
      <!-- Content -->
      <tr><td style="padding:40px 40px 32px">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center">
        <p style="margin:0;color:#94a3b8;font-size:12px">
          &copy; 2026 PeaceCoParent &nbsp;·&nbsp;
          <a href="${BASE}/privacy" style="color:#94a3b8;text-decoration:none">Privacy</a> &nbsp;·&nbsp;
          <a href="${BASE}/terms" style="color:#94a3b8;text-decoration:none">Terms</a> &nbsp;·&nbsp;
          <a href="${BASE}/account" style="color:#94a3b8;text-decoration:none">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(href: string, label: string, color = BRAND) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;border-radius:12px;padding:14px 28px;text-decoration:none;font-weight:700;font-size:14px;margin-top:24px">${label} →</a>`;
}

function highlight(text: string, color = '#f1f5f9', textColor = BRAND) {
  return `<div style="background:${color};border-radius:12px;padding:20px;margin:20px 0;color:${textColor};font-size:14px;line-height:1.6">${text}</div>`;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from: FROM, to, subject, html });
    } catch (err) { console.error('Resend error:', err); }
    return;
  }
  if (!process.env.SMTP_HOST) { console.log(`[DEV] Email to ${to}: ${subject}`); return; }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) { console.error('SMTP error:', err); }
}

export function welcomeEmail(name: string) {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Welcome, ${name}! 👋</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">You've taken the first step toward peaceful co-parenting.</p>
    ${highlight(`
      <strong style="display:block;margin-bottom:8px;font-size:15px">🎉 Your 7-day free trial is active!</strong>
      <p style="margin:4px 0;color:#166534">✓ Full Professional access — all features unlocked</p>
      <p style="margin:4px 0;color:#166534">✓ coach, Peace Score, video calls, attorney portal</p>
      <p style="margin:4px 0;color:#475569;font-size:13px">After 7 days you'll move to the free plan unless you upgrade.</p>
    `, '#f0fdf4', '#166534')}
    ${highlight(`
      <strong style="display:block;margin-bottom:12px;font-size:15px">Get started in 3 steps:</strong>
      <p style="margin:8px 0">① <strong>Create your family</strong> and invite the other parent using a secure code</p>
      <p style="margin:8px 0">② <strong>Add your custody schedule</strong> to the shared calendar</p>
      <p style="margin:8px 0">③ <strong>Send your first message</strong> — coaching included</p>
    `)}
    <p style="color:#64748b;font-size:14px">Your messages, expenses and calendar events are <strong>timestamped and tamper-evident</strong> and can be exported as activity reports at any time.</p>
    ${btn(`${BASE}/setup`, 'Set up your family')}
    <p style="color:#94a3b8;font-size:13px;margin-top:32px">Questions? Reply to this email — we read every one.</p>
  `);
}

export function newMessageEmail(_recipientName: string, senderName: string, preview: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:${BRAND}">New message</h2>
    <p style="color:#64748b;margin-top:0">${senderName} sent you a message</p>
    ${highlight(`<em style="color:#334155">"${preview}"</em>`)}
    <p style="color:#64748b;font-size:14px">This message has been securely logged and timestamped in PeaceCoParent.</p>
    ${btn(`${BASE}/messages`, 'Reply now')}
  `);
}

export function subscriptionConfirmEmail(name: string, tier: string) {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">You're on ${tierLabel}! 🎉</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, your upgrade is live. Both parents have access — no extra cost.</p>
    ${highlight(`
      <p style="margin:6px 0;color:#166534">✓ Unlimited messages & expenses</p>
      <p style="margin:6px 0;color:#166534">✓ message coaching (PeaceCoach)</p>
      <p style="margin:6px 0;color:#166534">✓ Court-ready PDF reports</p>
      <p style="margin:6px 0;color:#166534">✓ Attorney & caregiver portal access</p>
    `, '#f0fdf4', '#166534')}
    ${btn(`${BASE}/dashboard`, 'Go to dashboard', GREEN)}
    <p style="color:#94a3b8;font-size:13px;margin-top:24px">Manage or cancel your subscription anytime in <a href="${BASE}/account" style="color:#6366f1">Account settings</a>.</p>
  `);
}

export function expenseRespondedEmail(recipientName: string, expenseTitle: string, action: string, amount: number) {
  const approved = action === 'approved';
  const color = approved ? GREEN : RED;
  const label = approved ? 'Approved ✓' : 'Rejected ✗';
  const bg = approved ? '#f0fdf4' : '#fef2f2';
  const tc = approved ? '#166534' : '#991b1b';
  return baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:${color}">Expense ${label}</h2>
    <p style="color:#64748b;margin-top:0">Hi ${recipientName}</p>
    ${highlight(`Your expense <strong>${expenseTitle}</strong> ($${(amount / 100).toFixed(2)}) has been <strong>${action}</strong>.`, bg, tc)}
    ${btn(`${BASE}/expenses`, 'View expenses', color)}
  `);
}

export function eventReminderEmail(recipientName: string, eventTitle: string, eventDate: Date) {
  return baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:${BRAND}">Reminder for tomorrow</h2>
    <p style="color:#64748b;margin-top:0">Hi ${recipientName}</p>
    ${highlight(`
      <strong style="font-size:16px">${eventTitle}</strong><br>
      <span style="color:#64748b">${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    `)}
    ${btn(`${BASE}/calendar`, 'Open calendar')}
  `);
}

export function inviteCoParentEmail(inviterName: string, familyName: string, inviteCode: string) {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">${inviterName} invited you</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">You've been invited to join <strong>${familyName}</strong> on PeaceCoParent — a secure co-parenting platform.</p>
    ${highlight(`
      <p style="text-align:center;margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Your invite code</p>
      <p style="text-align:center;margin:0;font-size:32px;font-weight:900;color:${BRAND};letter-spacing:6px;font-family:monospace">${inviteCode}</p>
    `)}
    <p style="color:#64748b;font-size:14px">PeaceCoParent keeps all communication, expenses and scheduling in one tamper-evident place — so both parents have a reliable record.</p>
    ${btn(`${BASE}/register`, 'Create free account')}
  `);
}

export function onboardingDay3Email(name: string) {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Have you tried PeaceCoach yet?</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, it has been a few days. Here is the feature most users say changes everything.</p>
    ${highlight(`
      <strong style="display:block;margin-bottom:10px;font-size:15px">PeaceCoach — Message review</strong>
      <p style="margin:6px 0;color:#475569">Before you send a message to your co-parent, paste it into PeaceCoach. It reviews the emotional tone, gives you an escalation risk score from 0 to 10, and suggests a calmer rewrite.</p>
      <p style="margin:10px 0 0;color:#475569">Over time, it tracks your <strong>Peace Score</strong> — a 0 to 100 number that shows whether your communication is actually improving.</p>
    `)}
    <p style="color:#64748b;font-size:14px">The average user who uses PeaceCoach regularly sees their escalation score drop within two weeks.</p>
    ${btn(`${BASE}/coach`, 'Try PeaceCoach now', GREEN)}
    <p style="color:#94a3b8;font-size:13px;margin-top:24px">This is a 3-day check-in from the PeaceCoParent team. Reply anytime with questions.</p>
  `);
}

export function onboardingDay7Email(name: string, isPaid: boolean) {
  if (isPaid) {
    return baseTemplate(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">One week in — how is it going?</h1>
      <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, you have been using PeaceCoParent for a week. Here is a reminder of everything available to you.</p>
      ${highlight(`
        <p style="margin:6px 0;color:#166534">✓ Coach — 8 coaching modes, memory across sessions</p>
        <p style="margin:6px 0;color:#166534">✓ Peace Score — 0 to 100 conflict tracker with weekly chart</p>
        <p style="margin:6px 0;color:#166534">✓ Shared calendar, expenses, and timestamped activity reports</p>
        <p style="margin:6px 0;color:#166534">✓ Attorney and mediator portal access</p>
      `, '#f0fdf4', '#166534')}
      <p style="color:#64748b;font-size:14px">Your documentation is building. Every message, expense and event is timestamped and ready to export whenever you need it.</p>
      ${btn(`${BASE}/dashboard`, 'Open your dashboard')}
    `);
  }
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">One week in — ready to unlock more?</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, you have been on the free plan for a week. Here is what you are missing.</p>
    ${highlight(`
      <strong style="display:block;margin-bottom:12px;font-size:15px">Personal plan — $14/month, both parents</strong>
      <p style="margin:6px 0;color:#475569">✓ PeaceCoach with memory and Peace Score tracking</p>
      <p style="margin:6px 0;color:#475569">✓ Unlimited expense records and receipts</p>
      <p style="margin:6px 0;color:#475569">✓ Clean timestamped activity reports</p>
      <p style="margin:6px 0;color:#475569">✓ Both parents covered — no extra cost for your co-parent</p>
    `)}
    <p style="color:#64748b;font-size:14px">One plan. Both parents. Cancel anytime. 30-day money-back guarantee.</p>
    ${btn(`${BASE}/pricing`, 'Upgrade to Personal — $14/month', GREEN)}
    <p style="color:#94a3b8;font-size:13px;margin-top:24px">Questions about upgrading? Reply to this email.</p>
  `);
}

export function promoTrialEmail(name: string, tier: string, trialDays: number) {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Your ${trialDays}-day free trial is active!</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, your promo code has been applied. You have full ${tierLabel} access for the next ${trialDays} days.</p>
    ${highlight(`
      <p style="margin:6px 0;color:#166534">✓ PeaceCoach with memory and Peace Score</p>
      <p style="margin:6px 0;color:#166534">✓ Unlimited expenses and timestamped activity reports</p>
      <p style="margin:6px 0;color:#166534">✓ Attorney and mediator portal</p>
      <p style="margin:6px 0;color:#166534">✓ Secure video calls</p>
    `, '#f0fdf4', '#166534')}
    <p style="color:#64748b;font-size:14px">After ${trialDays} days your account returns to the free plan unless you upgrade. No charge, no credit card needed during the trial.</p>
    ${btn(`${BASE}/dashboard`, 'Start your trial', GREEN)}
  `);
}

export function trialEndingSoonEmail(name: string, daysLeft: number, tier: string) {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, your ${tierLabel} trial is almost over. After ${daysLeft} day${daysLeft !== 1 ? 's' : ''} your account will return to the free plan.</p>
    ${highlight(`
      <strong style="display:block;margin-bottom:10px;font-size:15px">You will lose access to:</strong>
      <p style="margin:6px 0;color:#991b1b">✗ PeaceCoach with memory and Peace Score</p>
      <p style="margin:6px 0;color:#991b1b">✗ Unlimited expense records and reports</p>
      <p style="margin:6px 0;color:#991b1b">✗ Attorney and mediator portal</p>
      <p style="margin:6px 0;color:#991b1b">✗ Secure video calls</p>
    `, '#fef2f2', '#991b1b')}
    <p style="color:#64748b;font-size:14px">Upgrade now to keep full access. One plan covers both parents — $14/month for Personal, $39/month for Professional.</p>
    ${btn(`${BASE}/pricing`, 'Keep my access — upgrade now', GREEN)}
    <p style="color:#94a3b8;font-size:13px;margin-top:24px">No action needed if you prefer the free plan. You will keep your messages, expenses and calendar data.</p>
  `);
}

export function trialExpiredEmail(name: string) {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Your free trial has ended</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0">Hi ${name}, your free trial has ended and your account is now on the free plan.</p>
    ${highlight(`
      <p style="margin:0;font-size:14px;color:#475569">Your messages, expenses, calendar events and documents are all still there — nothing has been deleted. You can upgrade at any time to regain full access.</p>
    `)}
    <p style="color:#64748b;font-size:14px">Upgrade to Personal for $14/month to unlock coaching, unlimited expense records, and court-ready reports. One price covers both parents.</p>
    ${btn(`${BASE}/pricing`, 'Upgrade to Personal — $14/month', GREEN)}
    <p style="color:#94a3b8;font-size:13px;margin-top:24px">Questions? Reply to this email — we read every one.</p>
  `);
}

export function coParentJoinedEmail(_parent1Name: string, parent2Name: string, familyName: string) {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND}">Your family is ready 🎉</h1>
    <p style="color:#64748b;font-size:15px;margin-top:0"><strong>${parent2Name}</strong> has joined <strong>${familyName}</strong> on PeaceCoParent.</p>
    ${highlight(`
      <p style="margin:0;font-size:14px;color:#475569">Both parents are now connected. You can start sharing messages, expenses and calendar events — all in one tamper-evident place.</p>
    `)}
    <p style="color:#64748b;font-size:14px">Any messages, expenses or events you've already added are shared with ${parent2Name} immediately.</p>
    ${btn(`${BASE}/dashboard`, 'Go to dashboard')}
  `);
}
