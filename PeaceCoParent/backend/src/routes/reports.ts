import { Router, Response } from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserTier } from '../middleware/requireTier';

const router = Router();

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

// All timestamps in court reports must be UTC to ensure consistency across jurisdictions
function toUTC(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function toUTCDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

// Strip characters outside Latin-1 — PDFKit's built-in Helvetica only supports Latin-1
function safe(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\xFF]/g, '?');
}

// Format amount — handles both cents (integer) and dollars (float)
function formatAmount(amount: number): string {
  if (!amount && amount !== 0) return '$0.00';
  const isLikelyCents = Number.isInteger(amount) && amount >= 100;
  const dollars = isLikelyCents ? amount / 100 : amount;
  return `$${dollars.toFixed(2)}`;
}

// GET /api/reports/court-report?start=ISO&end=ISO[&familyId=uuid (attorneys only)]
router.get('/court-report', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let familyId: string | null = null;

    // Attorney access: familyId supplied in query, must have valid attorney_access row
    if (req.query.familyId) {
      const requestedFamilyId = req.query.familyId as string;
      const accessRow = await pool.query(
        `SELECT 1 FROM attorney_access aa
         WHERE aa.family_id = $1 AND aa.attorney_id = $2
           AND (aa.expires_at IS NULL OR aa.expires_at > NOW())
           AND EXISTS (
             SELECT 1 FROM family_members fm
             WHERE fm.family_id = $1 AND fm.user_id = aa.granted_by
           )`,
        [requestedFamilyId, req.userId]
      );
      if (!accessRow.rows[0]) {
        res.status(403).json({ error: 'No attorney access to this family' }); return;
      }
      familyId = requestedFamilyId;
    } else {
      familyId = await getFamilyId(req.userId!);
    }

    if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

    const tier = await getUserTier(req.userId!);
    const isFreeTier = tier === 'free';

    const startRaw = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 90 * 86400000);
    const endRaw = req.query.end ? new Date(req.query.end as string) : new Date();
    if (isNaN(startRaw.getTime()) || isNaN(endRaw.getTime())) {
      res.status(400).json({ error: 'Invalid date range' }); return;
    }
    const start = startRaw;
    const end = endRaw;
    const reportType = (req.query.type as string) || 'full';
    const includeMessages = reportType === 'full' || reportType === 'messages';
    const includeExpenses = reportType === 'full' || reportType === 'expenses';
    const includeEvents   = reportType === 'full' || reportType === 'events';

    const [familyResult, membersResult, messagesResult, expensesResult, eventsResult] = await Promise.all([
      pool.query('SELECT * FROM families WHERE id = $1', [familyId]),
      pool.query(
        `SELECT fm.*, u.name, u.email FROM family_members fm JOIN users u ON u.id = fm.user_id WHERE fm.family_id = $1`,
        [familyId]
      ),
      pool.query(
        `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id = m.sender_id
         WHERE m.family_id = $1 AND m.created_at BETWEEN $2 AND $3 ORDER BY m.created_at ASC`,
        [familyId, start, end]
      ),
      pool.query(
        `SELECT e.*, u.name as submitter_name FROM expenses e JOIN users u ON u.id = e.submitted_by
         WHERE e.family_id = $1 AND e.created_at BETWEEN $2 AND $3 ORDER BY e.created_at ASC`,
        [familyId, start, end]
      ),
      // Include soft-deleted events in court reports — they are legal evidence
      pool.query(
        `SELECT ev.*, u.name as creator_name,
                du.name as deleted_by_name
         FROM events ev
         JOIN users u ON u.id = ev.created_by
         LEFT JOIN users du ON du.id = ev.deleted_by
         WHERE ev.family_id = $1 AND ev.start_date BETWEEN $2 AND $3
         ORDER BY ev.start_date ASC`,
        [familyId, start, end]
      ),
    ]);

    const family   = familyResult.rows[0];
    const members  = membersResult.rows;
    const messages = messagesResult.rows;
    const expenses = expensesResult.rows;
    const events   = eventsResult.rows;

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 56, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // PeaceCoParent brand colors
      const sage     = '#568960';
      const sageDark = '#3d6647';
      const warm     = '#2d2820';
      const mid      = '#7a7268';
      const border   = '#e8e0d8';
      const cream    = '#f8f4ee';
      const pageW    = doc.page.width - 112;
      const col1     = 68;
      const col2     = 150;

      function addWatermark() {
        if (!isFreeTier) return;
        doc.save();
        doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
        doc.fontSize(60).fillColor('#e8e0d8').opacity(0.5)
          .text('FREE PLAN', 80, doc.page.height / 2 - 30, { width: doc.page.width - 160, align: 'center' });
        doc.restore();
        doc.opacity(1);
      }

      function sectionHeader(title: string) {
        doc.moveDown(0.5);
        const headerY = doc.y;
        doc.rect(56, headerY, pageW, 28).fill(sage);
        doc.fontSize(11).fillColor('white').font('Helvetica-Bold')
          .text(title.toUpperCase(), 68, headerY + 8, { width: pageW - 24 });
        doc.font('Helvetica');
        doc.y = headerY + 36;
        doc.moveDown(0.3);
      }

      function divider() {
        doc.moveTo(56, doc.y).lineTo(56 + pageW, doc.y).strokeColor(border).lineWidth(0.5).stroke();
        doc.moveDown(0.4);
      }

      function checkNewPage() {
        if (doc.y > doc.page.height - 140) {
          doc.addPage();
          addWatermark();
        }
      }

      addWatermark();

      // ── Cover header bar ──
      doc.rect(0, 0, doc.page.width, 80).fill(warm);
      doc.fontSize(22).fillColor('white').font('Helvetica-Bold')
        .text('PeaceCoParent', 56, 22);
      doc.fontSize(11).fillColor('#8a8070').font('Helvetica')
        .text('Co-Parenting Activity Report', 56, 50);

      // Report type badge
      const typeLabel =
        reportType === 'messages' ? 'MESSAGES ONLY' :
        reportType === 'expenses' ? 'EXPENSES ONLY' :
        reportType === 'events'   ? 'CALENDAR ONLY' : 'FULL REPORT';
      doc.rect(doc.page.width - 160, 24, 104, 22).fill(sage);
      doc.fontSize(9).fillColor('white').font('Helvetica-Bold')
        .text(typeLabel, doc.page.width - 156, 31, { width: 96, align: 'center' });

      doc.y = 100;
      doc.font('Helvetica');

      // Free plan notice bar
      if (isFreeTier) {
        const noticeY = doc.y;
        doc.rect(56, noticeY, pageW, 22).fill('#fef2f2');
        doc.fontSize(9).fillColor('#dc2626')
          .text(
            'FREE PLAN — Upgrade to Personal to remove this notice: peacecoparent.com/pricing',
            64, noticeY + 6,
            { width: pageW - 16 }
          );
        doc.y = noticeY + 28;
      }

      doc.moveDown(0.5);

      // ── Report details box ──
      const boxStartY = doc.y;
      doc.rect(56, boxStartY, pageW, 72).fill(cream).stroke(border);

      doc.fontSize(10).fillColor(warm).font('Helvetica-Bold')
        .text('Family:', col1, boxStartY + 12);
      doc.font('Helvetica').fillColor(mid)
        .text(safe(family?.name) || 'Unknown', col2, boxStartY + 12, { width: pageW - col2 + 56 - 12 });

      doc.font('Helvetica-Bold').fillColor(warm)
        .text('Period:', col1, boxStartY + 30);
      doc.font('Helvetica').fillColor(mid)
        .text(`${toUTCDate(start)} to ${toUTCDate(end)} (UTC)`, col2, boxStartY + 30, { width: pageW - col2 + 56 - 12 });

      doc.font('Helvetica-Bold').fillColor(warm)
        .text('Generated:', col1, boxStartY + 48);
      doc.font('Helvetica').fillColor(mid)
        .text(toUTC(new Date()) + ' · All timestamps UTC', col2, boxStartY + 48, { width: pageW - col2 + 56 - 12 });

      doc.y = boxStartY + 82;

      // ── Parties ──
      sectionHeader('Parties');
      for (const m of members) {
        const role = m.role === 'parent1' ? 'Parent 1' : 'Parent 2';
        const rowY = doc.y;
        doc.fontSize(10).fillColor(warm).font('Helvetica-Bold')
          .text(`${role}:`, col1, rowY, { width: 70 });
        doc.font('Helvetica').fillColor(mid)
          .text(safe(m.name), col1 + 75, rowY, { width: 150 });
        doc.fillColor(mid)
          .text(safe(m.email), col1 + 230, rowY, { width: pageW - 230 });
        doc.y = rowY + 18;
      }
      doc.moveDown(0.6);

      // ── Messages ──
      if (includeMessages) {
        sectionHeader(`Messages  (${messages.length})`);
        if (messages.length === 0) {
          doc.fontSize(10).fillColor(mid).text('No messages in this period.', 68);
        } else {
          for (const m of messages) {
            checkNewPage();

            // coach flag
            const hasFlag = m.ai_flag && m.ai_flag !== 'ok';
            const flagText = hasFlag ? ` · Coach: ${m.ai_flag.toUpperCase()}` : '';
            const flagColor = '#c2410c';

            // Body — handle attachments
            const bodyText = (!m.body || m.body.startsWith('[ATTACH:'))
              ? '[File attachment]'
              : safe(m.body);

            const metaY = doc.y;
            if (hasFlag) {
              doc.fontSize(8).fillColor(mid).font('Helvetica')
                .text(`${toUTC(m.created_at)}  ·  ${safe(m.sender_name)}`, 68, metaY, { continued: true, width: pageW - 24 });
              doc.fillColor(flagColor).text(flagText);
            } else {
              doc.fontSize(8).fillColor(mid).font('Helvetica')
                .text(`${toUTC(m.created_at)}  ·  ${safe(m.sender_name)}`, 68, metaY, { width: pageW - 24 });
            }

            doc.moveDown(0.2);
            doc.fontSize(10).fillColor(warm).font('Helvetica')
              .text(bodyText, 68, doc.y, { width: pageW - 24 });
            doc.moveDown(0.3);
            divider();
          }
        }
        doc.moveDown(0.5);
      }

      // ── Expenses ──
      if (includeExpenses) {
        if (includeMessages && messages.length > 0) { doc.addPage(); addWatermark(); }
        sectionHeader(`Expenses  (${expenses.length})`);
        if (expenses.length === 0) {
          doc.fontSize(10).fillColor(mid).text('No expenses in this period.', 68);
        } else {
          let totalRaw = 0;
          for (const e of expenses) {
            checkNewPage();

            const statusColor =
              e.status === 'approved' || e.status === 'paid' ? sageDark :
              e.status === 'rejected' ? '#dc2626' : '#c2410c';

            const rowY = doc.y;

            // Date + submitter (left) | Status (right)
            doc.fontSize(8).fillColor(mid).font('Helvetica')
              .text(
                `${toUTCDate(e.created_at)}  ·  ${safe(e.submitter_name)}`,
                68, rowY,
                { width: pageW - 100 }
              );
            doc.fontSize(8).fillColor(statusColor).font('Helvetica-Bold')
              .text(e.status.toUpperCase(), 56, rowY, { align: 'right', width: pageW });

            doc.moveDown(0.2);

            // Title (left) | Amount (right)
            const titleY = doc.y;
            doc.fontSize(10).fillColor(warm).font('Helvetica-Bold')
              .text(safe(e.title), 68, titleY, { width: pageW - 100 });
            doc.fontSize(10).fillColor(sage).font('Helvetica-Bold')
              .text(formatAmount(e.amount), 56, titleY, { align: 'right', width: pageW });

            doc.moveDown(0.2);

            if (e.notes) {
              doc.fontSize(9).fillColor(mid).font('Helvetica')
                .text(safe(e.notes), 68, doc.y, { width: pageW - 24 });
              doc.moveDown(0.2);
            }

            if (e.receipt_url) {
              doc.fontSize(8).fillColor(sage).font('Helvetica')
                .text('Receipt attached', 68);
              doc.moveDown(0.1);
            }

            totalRaw += e.amount || 0;
            doc.moveDown(0.2);
            divider();
          }

          // Total row
          const totalY = doc.y;
          doc.rect(56, totalY, pageW, 26).fill(cream);
          doc.fontSize(11).fillColor(warm).font('Helvetica-Bold')
            .text('Total:', 68, totalY + 7);
          doc.fontSize(11).fillColor(sage).font('Helvetica-Bold')
            .text(formatAmount(totalRaw), 56, totalY + 7, { align: 'right', width: pageW });
          doc.y = totalY + 32;
          doc.font('Helvetica');
        }
        doc.moveDown(0.5);
      }

      // ── Calendar events ──
      if (includeEvents) {
        sectionHeader(`Calendar Events  (${events.length})`);
        if (events.length === 0) {
          doc.fontSize(10).fillColor(mid).text('No events in this period.', 68);
        } else {
          for (const e of events) {
            checkNewPage();
            const deletedNote = e.deleted_at
              ? `  · DELETED ${toUTC(e.deleted_at)} by ${safe(e.deleted_by_name)}`
              : '';
            doc.fontSize(8).fillColor(e.deleted_at ? '#dc2626' : mid).font('Helvetica')
              .text(
                `${toUTCDate(e.start_date)}  ·  ${safe(e.creator_name)}  ·  ${e.type || ''}${deletedNote}`,
                68, doc.y,
                { width: pageW - 24 }
              );
            doc.moveDown(0.2);
            doc.fontSize(10).fillColor(e.deleted_at ? '#dc2626' : warm).font('Helvetica-Bold')
              .text(safe(e.title) + (e.deleted_at ? ' [DELETED]' : ''), 68, doc.y, { width: pageW - 24 });
            doc.font('Helvetica');
            if (e.notes) {
              doc.moveDown(0.1);
              doc.fontSize(9).fillColor(mid)
                .text(safe(e.notes), 68, doc.y, { width: pageW - 24 });
            }
            doc.moveDown(0.3);
            divider();
          }
        }
      }

      // ── Footer ──
      doc.moveDown(2);
      doc.rect(56, doc.y, pageW, 1).fill(border);
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor(mid).font('Helvetica')
        .text(
          'Generated by PeaceCoParent · peacecoparent.com · For organizational use only. Not legal advice. Records are timestamped and tamper-evident.',
          56, doc.y,
          { align: 'center', width: pageW }
        );
      if (isFreeTier) {
        doc.moveDown(0.3);
        doc.fontSize(8).fillColor('#dc2626')
          .text(
            'Upgrade to Personal plan to remove the watermark: peacecoparent.com/pricing',
            { align: 'center', width: pageW }
          );
      }

      doc.end();
    });

    const filename = `PeaceCoParent_Report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(pdfBuffer);

  } catch (err) {
    console.error('[court-report]', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;