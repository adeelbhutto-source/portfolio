'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchExpenses, createExpense, respondExpense } from '@/api/expenses';
import { apiFetch } from '@/lib/api';
import UpgradeModal from '@/components/UpgradeModal';
import type { Expense, ExpenseCategory, CreateExpenseRequest } from '@/types/shared';
import AppLayout from '@/components/AppLayout';
import { PageHero, Btn, Icon } from '@/components/V3';
import { fmtDate, fmtMoney } from '@/lib/format';

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeColor = 'amber' | 'blue' | 'red' | 'green' | 'indigo' | 'slate';

const CATEGORIES: Record<ExpenseCategory, string> = {
  medical: 'Medical',
  education: 'Education',
  childcare: 'Childcare',
  clothing: 'Clothing',
  food: 'Food',
  activities: 'Activities',
  transport: 'Transport',
  other: 'Other',
};

const STATUS_BADGE: Record<string, { color: BadgeColor; label: string }> = {
  pending:  { color: 'amber', label: 'Pending' },
  approved: { color: 'blue',  label: 'Approved' },
  rejected: { color: 'red',   label: 'Rejected' },
  paid:     { color: 'green', label: 'Paid' },
};

void STATUS_BADGE; // used below in badge rendering

// ── Currencies ────────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'NOK', 'EUR', 'GBP', 'SEK', 'DKK', 'AUD', 'CAD'];

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  highlight,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-[18px] border-[1.5px] border-[var(--border)] p-5"
      style={{ background: highlight ? 'var(--ink)' : 'var(--card)' }}
    >
      <div
        className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ color: highlight ? 'var(--bg-deep)' : 'var(--ink-soft)' }}
      >
        {label}
      </div>
      <div
        className="mb-1 text-[20px] sm:text-[28px] leading-[1.1] truncate"
        style={{ fontFamily: 'var(--serif)', color: highlight ? 'var(--bg)' : (valueColor ?? 'var(--ink)') }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[12px]" style={{ color: highlight ? 'var(--bg-deep)' : 'var(--ink-soft)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let bg = '';
  let color = '';
  if (status === 'pending') {
    bg = 'oklch(95% 0.06 75)';
    color = 'oklch(55% 0.14 75)';
  } else if (status === 'approved') {
    bg = 'var(--green-tint)';
    color = 'var(--green-deep)';
  } else if (status === 'rejected') {
    bg = 'oklch(96% 0.04 20)';
    color = 'oklch(45% 0.18 20)';
  } else if (status === 'paid') {
    bg = 'oklch(94% 0.06 145)';
    color = 'oklch(38% 0.12 145)';
  } else {
    bg = 'var(--bg-deep)';
    color = 'var(--ink-soft)';
  }
  const label = STATUS_BADGE[status]?.label ?? status;
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color,
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

// ── Approve / Reject inline ───────────────────────────────────────────────────

function RejectOrApprove({ onApprove, onReject }: {
  onApprove: () => void;
  onReject: (reason?: string) => void;
}) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try { await onApprove(); } finally { setLoading(false); }
  }

  async function handleReject() {
    setLoading(true);
    try { await onReject(reason || undefined); } finally { setLoading(false); }
  }

  if (showRejectInput) {
    return (
      <div className="mt-2.5 flex flex-col gap-2 border-t border-[var(--border)] pt-2.5">
        <input autoFocus type="text" value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)" className="pcp-input text-[13px]" />
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowRejectInput(false)} disabled={loading}
            className="pcp-btn-secondary flex-1 rounded-full px-3 py-[7px] text-[13px] font-semibold">
            Cancel
          </button>
          <button type="button" onClick={handleReject} disabled={loading}
            className="flex-1 cursor-pointer rounded-full border-[1.5px] px-3 py-[7px] text-[13px] font-semibold disabled:opacity-60"
            style={{ background: 'oklch(96% 0.04 20)', color: 'oklch(45% 0.18 20)', borderColor: 'oklch(88% 0.06 20)', fontFamily: 'inherit' }}>
            {loading ? 'Rejecting…' : 'Confirm rejection'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex gap-2 border-t border-[var(--border)] pt-2.5">
      <button type="button" onClick={handleApprove} disabled={loading}
        className="flex-1 cursor-pointer rounded-full border-[1.5px] border-[var(--green-tint)] bg-[var(--green-tint)] px-3 py-[7px] text-[13px] font-semibold text-[var(--green-deep)] disabled:opacity-60"
        style={{ fontFamily: 'inherit' }}>
        {loading ? '…' : 'Approve'}
      </button>
      <button type="button" onClick={() => setShowRejectInput(true)} disabled={loading}
        className="flex-1 cursor-pointer rounded-full border-[1.5px] px-3 py-[7px] text-[13px] font-semibold disabled:opacity-60"
        style={{ background: 'oklch(96% 0.04 20)', color: 'oklch(45% 0.18 20)', borderColor: 'oklch(88% 0.06 20)', fontFamily: 'inherit' }}>
        Reject
      </button>
    </div>
  );
}

// ── Add Expense Modal ─────────────────────────────────────────────────────────

function AddExpenseModal({ onClose, onSave, parentColor }: {
  onClose: () => void;
  onSave: (p: CreateExpenseRequest, receiptFile?: File) => Promise<void>;
  parentColor: string;
}) {
  void parentColor;
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitPercent, setSplitPercent] = useState(50);
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  void date; // date is stored for UX but not in CreateExpenseRequest

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dollars = parseFloat(amountStr);
    if (isNaN(dollars) || dollars <= 0) { setError('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await onSave(
        { title: title.trim(), amount: Math.round(dollars * 100), currency, category, notes: notes.trim() || undefined, splitPercent },
        receipt ?? undefined,
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.32]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-[24px] bg-[var(--card)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-[24px] font-normal text-[var(--ink)]" style={{ fontFamily: 'var(--serif)' }}>
            Log Expense
          </h2>
          <button type="button" onClick={onClose}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border-none pcp-page-mid text-[18px] text-[var(--ink-soft)]">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-[12px] px-3.5 py-2.5 text-[13px]"
            style={{ background: 'oklch(96% 0.04 20)', color: 'oklch(45% 0.18 20)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Description</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              required placeholder="e.g. Emma's dentist visit" className="pcp-input" />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Amount</label>
              <input type="number" value={amountStr} onChange={(e) => setAmountStr(e.target.value)}
                required min="0.01" step="0.01" placeholder="0.00" className="pcp-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pcp-input" />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="pcp-input cursor-pointer">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="pcp-input cursor-pointer">
              {(Object.entries(CATEGORIES) as [ExpenseCategory, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Split */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">
              Other parent owes:{' '}
              <span className="text-[var(--green)]">{splitPercent}%</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={splitPercent}
              onChange={(e) => setSplitPercent(parseInt(e.target.value))}
              className="w-full" style={{ accentColor: 'var(--green)' }} />
            <div className="mt-0.5 flex justify-between text-[10px] text-[var(--ink-soft)]">
              <span>0%</span><span>50/50</span><span>100%</span>
            </div>
          </div>

          {/* Receipt upload */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Receipt (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-[14px] border-2 border-dashed border-[var(--border)] pcp-page px-3 py-4 text-center transition-colors duration-150 hover:border-[var(--green)]"
            >
              {receipt ? (
                <div className="flex items-center justify-center gap-2 text-[13px] text-[var(--ink-soft)]">
                  <span className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{receipt.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setReceipt(null); }}
                    className="cursor-pointer border-none bg-transparent text-[16px]"
                    style={{ color: 'oklch(45% 0.18 20)' }}>×</button>
                </div>
              ) : (
                <span className="text-[12px] text-[var(--ink-soft)]">Click to attach receipt</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-soft)]">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={2} placeholder="Any extra context…" className="pcp-input resize-y" />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="pcp-btn-secondary flex-1 rounded-full py-3 text-[14px] font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="pcp-btn-primary flex-1 rounded-full py-3 text-[14px] font-semibold disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Inner page (uses useSearchParams) ─────────────────────────────────────────

function ExpensesInner() {
  const { user, familyMember } = useAuth();
  const { tier } = useSubscription();
  const urlParams = useSearchParams();
  const justPaid = urlParams.get('paid') === '1';
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const myColor = familyMember?.color ?? '#6366f1';

  const load = useCallback(async () => {
    setLoading(true);
    try { setExpenses(await fetchExpenses()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(payload: CreateExpenseRequest, receiptFile?: File) {
    try {
      const exp = await createExpense(payload);
      if (receiptFile && exp.id) {
        try {
          const mimeType = receiptFile.type || 'image/jpeg';
          const { uploadUrl } = await apiFetch<{ uploadUrl: string; receiptUrl: string }>(
            `/expenses/${exp.id}/receipt-upload-url`,
            { method: 'POST', body: JSON.stringify({ mimeType }) }
          );
          await fetch(uploadUrl, { method: 'PUT', body: receiptFile, headers: { 'Content-Type': mimeType } });
        } catch {
          setError('Expense saved, but receipt upload failed.');
        }
      }
      setExpenses((prev) => [exp, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (msg.toLowerCase().includes('upgrade') || msg.toLowerCase().includes('free plan')) {
        setUpgradeReason(msg);
        setShowUpgrade(true);
        throw err;
      }
      throw err;
    }
  }

  function handleAddClick() {
    if (tier === 'free') {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const myThisMonth = expenses.filter(
        (e) => e.submittedBy === user?.id && e.createdAt.slice(0, 7) === thisMonth
      ).length;
      if (myThisMonth >= 3) {
        setUpgradeReason(`You've used ${myThisMonth}/3 free expense requests this month.`);
        setShowUpgrade(true);
        return;
      }
    }
    setShowAdd(true);
  }

  async function handleRespond(id: string, action: 'approve' | 'reject', reason?: string) {
    try {
      const updated = await respondExpense(id, action, reason);
      setExpenses((prev) => prev.map((e) => e.id === id ? updated : e));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to respond');
    }
  }

  async function handlePay(id: string) {
    try {
      const { url } = await apiFetch<{ url: string }>(`/expenses/${id}/pay-checkout`, { method: 'POST' });
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start payment');
    }
  }

  // ── Summary numbers ──────────────────────────────────────────────────────
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter((e) => e.createdAt.slice(0, 7) === thisMonth);
  const thisMonthCurrencies = [...new Set(thisMonthExpenses.map(e => e.currency))];
  const thisMonthSingle = thisMonthCurrencies.length <= 1;
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthCurrency = thisMonthCurrencies[0] ?? 'USD';

  const pendingCount = expenses.filter((e) => e.status === 'pending').length;

  const myExpenses = expenses.filter((e) => e.submittedBy === user?.id);
  const myExpCurrencies = [...new Set(myExpenses.map(e => e.currency))];
  const myExpSingle = myExpCurrencies.length <= 1;
  const youPaidTotal = myExpenses.reduce((sum, e) => sum + e.amount, 0);
  const myExpCurrency = myExpCurrencies[0] ?? 'USD';

  const theirExpenses = expenses.filter((e) => e.submittedBy !== user?.id);
  const theirExpCurrencies = [...new Set(theirExpenses.map(e => e.currency))];
  const theirExpSingle = theirExpCurrencies.length <= 1;
  const coParentPaidTotal = theirExpenses.reduce((sum, e) => sum + e.amount, 0);
  const theirExpCurrency = theirExpCurrencies[0] ?? 'USD';

  const freeUsed = tier === 'free'
    ? expenses.filter((e) => e.submittedBy === user?.id && e.createdAt.slice(0, 7) === thisMonth).length
    : null;

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = expenses
    .filter((e) => {
      if (filter !== 'all' && e.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.submitterName.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'date-asc') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'paid', label: 'Paid' },
  ];

  return (
    <AppLayout title="Expenses">
      <PageHero
        eyebrow="Shared finances"
        title={<>Expenses — <em>tracked, split, paid.</em></>}
        subtitle="Log a cost, attach the receipt, request approval. Every line is timestamped and tamper-evident. No more 'I sent you Venmo' debates."
        action={<Btn kind="primary" tone="dark" icon={Icon.plus(12)} onClick={handleAddClick}>Log expense</Btn>}
      />

      {/* Success banner */}
      {justPaid && (
        <div className="mb-4 flex items-center gap-2.5 rounded-[14px] border-[1.5px] px-4 py-3 text-[13px]"
          style={{ background: 'oklch(94% 0.06 145)', borderColor: 'oklch(82% 0.09 145)', color: 'oklch(38% 0.12 145)' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Payment successful — the expense has been marked as paid.
        </div>
      )}

      {/* Free plan usage */}
      {freeUsed !== null && (
        <div className="mb-4 rounded-[14px] border-[1.5px] px-4 py-3"
          style={{ background: 'oklch(97% 0.05 75)', borderColor: 'oklch(88% 0.08 75)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: 'oklch(55% 0.14 75)' }}>
              Free plan: {freeUsed}/3 expenses this month
            </span>
            <Link href="/pricing" className="text-[12px] font-bold no-underline text-[var(--green-deep)]">Upgrade</Link>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'oklch(88% 0.08 75)' }}>
            <div className="h-full rounded-full transition-[width] duration-300"
              style={{ background: 'oklch(65% 0.14 75)', width: `${Math.min((freeUsed / 3) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-[14px] px-4 py-3 text-[13px]"
          style={{ background: 'oklch(96% 0.04 20)', color: 'oklch(45% 0.18 20)' }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="This Month"
          value={thisMonthSingle ? fmtMoney(thisMonthTotal, thisMonthCurrency) : `${thisMonthExpenses.length} expenses`}
          sub={thisMonthSingle ? 'Total shared expenses' : 'Mixed currencies'}
          highlight
        />
        <SummaryCard
          label="Pending"
          value={String(pendingCount)}
          sub={pendingCount === 1 ? 'Awaiting response' : 'Awaiting responses'}
          valueColor="oklch(65% 0.14 75)"
        />
        <SummaryCard
          label="You Paid"
          value={myExpSingle ? fmtMoney(youPaidTotal, myExpCurrency) : `${myExpenses.length} expenses`}
          sub={myExpSingle ? 'Your submitted expenses' : 'Mixed currencies'}
        />
        <SummaryCard
          label="Co-parent Paid"
          value={theirExpSingle ? fmtMoney(coParentPaidTotal, theirExpCurrency) : `${theirExpenses.length} expenses`}
          sub={theirExpSingle ? 'Co-parent submitted expenses' : 'Mixed currencies'}
        />
      </div>

      {/* Filter row */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-full border-[1.5px] border-[var(--border)] bg-[var(--card)] px-3.5 py-2">
          <svg width="14" height="14" fill="none" stroke="var(--ink-soft)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses…"
            className="w-full border-none bg-transparent text-[13px] text-[var(--ink)] outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Filter tabs pill */}
        <div className="flex gap-0.5 rounded-full pcp-page-mid p-[3px]">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`cursor-pointer rounded-full border-none px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150 ${filter === tab.key ? 'bg-[var(--card)] text-[var(--ink)] shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'bg-transparent text-[var(--ink-soft)]'}`}
              style={{ fontFamily: 'inherit' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="cursor-pointer rounded-full border-[1.5px] border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-[13px] text-[var(--ink-soft)] outline-none"
          style={{ fontFamily: 'inherit' }}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      {/* Expense table */}
      {loading ? (
        <div className="overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--card)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`hidden items-center gap-4 px-5 py-[18px] sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_160px] ${i < 2 ? 'border-b border-[var(--border)]' : ''}`}>
              {[180, 80, 80, 100, 80].map((w, j) => (
                <div key={j} className="h-[14px] animate-pulse rounded-[7px] pcp-page-mid" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
          <div className="mb-3 text-[36px]">💸</div>
          <div className="mb-2 text-[20px] text-[var(--ink)]" style={{ fontFamily: 'var(--serif)' }}>
            {search || filter !== 'all' ? 'No matching expenses' : 'No shared expenses yet'}
          </div>
          <div className="mx-auto mb-5 max-w-[340px] text-[13px] text-[var(--ink-soft)]">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Log your first expense so money conversations stay clear, documented, and conflict-free.'}
          </div>
          {!search && filter === 'all' && (
            <button onClick={handleAddClick}
              className="pcp-btn-primary rounded-full px-6 py-2.5 text-[14px] font-semibold">
              + Log Expense
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--card)]">
          {/* Table header — hidden on mobile */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_160px] items-center gap-4 border-b-[1.5px] border-[var(--border)] pcp-page px-5 py-3 sm:grid">
            {['Expense', 'Amount', 'Date', 'Submitted by', 'Status'].map((col) => (
              <div key={col} className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--ink-soft)]">{col}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((e, idx) => {
            const isMe = e.submittedBy === user?.id;
            const owedAmount = Math.round(e.amount * (e.splitPercent / 100));
            const isLast = idx === filtered.length - 1;
            const isCoParentPending = !isMe && e.status === 'pending';

            return (
              <div key={e.id}>
                <div
                  className="grid items-start gap-4 px-5 py-4 transition-colors duration-150 hover:bg-[var(--green-tint)] grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_160px]"
                  style={{ borderBottom: isLast && !isCoParentPending ? 'none' : '1px solid var(--border)' }}
                >
                  {/* Expense col */}
                  <div>
                    <div className="mb-0.5 text-[14px] font-bold text-[var(--ink)]">{e.title}</div>
                    <div className="text-[12px] text-[var(--ink-soft)]">
                      {CATEGORIES[e.category as ExpenseCategory]}{e.notes && ` · ${e.notes}`}
                    </div>
                    {e.receiptUrl && (
                      <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-[var(--green)] no-underline">View receipt →</a>
                    )}
                  </div>

                  {/* Amount col */}
                  <div>
                    <div className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--ink-soft)] sm:hidden">Amount</div>
                    <div className="text-[15px] font-bold text-[var(--ink)]">{fmtMoney(e.amount, e.currency)}</div>
                    {e.splitPercent > 0 && e.status !== 'paid' && (
                      <div className="text-[11px] font-semibold"
                        style={{ color: isMe ? 'var(--green-deep)' : 'oklch(45% 0.18 20)' }}>
                        {isMe ? `They owe: ${fmtMoney(owedAmount, e.currency)}` : `You owe: ${fmtMoney(owedAmount, e.currency)}`}
                      </div>
                    )}
                    {e.status === 'paid' && (
                      <div className="text-[11px] font-semibold" style={{ color: 'oklch(38% 0.12 145)' }}>✓ Paid</div>
                    )}
                  </div>

                  {/* Date col */}
                  <div>
                    <div className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--ink-soft)] sm:hidden">Date</div>
                    <div className="text-[13px] text-[var(--ink-soft)]">{fmtDate(e.createdAt)}</div>
                  </div>

                  {/* Submitted by col */}
                  <div>
                    <div className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--ink-soft)] sm:hidden">Submitted by</div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ background: e.submitterColor || myColor }}>
                        {e.submitterName.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-[13px] text-[var(--ink-soft)]">{e.submitterName.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Status col */}
                  <div>
                    <div className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--ink-soft)] sm:hidden">Status</div>
                    {isCoParentPending ? (
                      <RejectOrApprove
                        onApprove={() => handleRespond(e.id, 'approve')}
                        onReject={(reason) => handleRespond(e.id, 'reject', reason)}
                      />
                    ) : (
                      <StatusBadge status={e.status} />
                    )}
                  </div>
                </div>

                {/* Extra action rows */}
                {isMe && e.status === 'pending' && (
                  <div className="px-5 py-2.5 text-[12px]"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)', color: 'oklch(55% 0.14 75)', background: 'oklch(97% 0.05 75)' }}>
                    Waiting for the other parent to approve this expense.
                  </div>
                )}
                {isMe && e.status === 'rejected' && (
                  <div className="px-5 py-2.5 text-[12px]"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)', color: 'oklch(45% 0.18 20)', background: 'oklch(96% 0.04 20)' }}>
                    This expense was rejected by the other parent.
                  </div>
                )}
                {isMe && e.status === 'approved' && e.splitPercent > 0 && (
                  <div className="px-5 py-2.5 text-[12px] text-[var(--green-deep)] bg-[var(--green-tint)]"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                    Approved — waiting for payment of {fmtMoney(owedAmount, e.currency)}.
                  </div>
                )}
                {!isMe && e.status === 'approved' && e.splitPercent > 0 && (
                  <div className="px-5 py-2.5"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                    <button onClick={() => handlePay(e.id)}
                      className="pcp-btn-primary rounded-full px-5 py-2 text-[13px] font-semibold">
                      Pay {fmtMoney(owedAmount, e.currency)} now →
                    </button>
                  </div>
                )}
                {e.status === 'paid' && (
                  <div className="flex items-center gap-1.5 px-5 py-2 text-[11px]"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)', color: 'oklch(38% 0.12 145)' }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Payment confirmed · Tamper-proof record saved
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleAdd} parentColor={myColor} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} reason={upgradeReason} recommendedTier="personal" />}
    </AppLayout>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Expenses() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>
        Loading…
      </div>
    }>
      <ExpensesInner />
    </Suspense>
  );
}
