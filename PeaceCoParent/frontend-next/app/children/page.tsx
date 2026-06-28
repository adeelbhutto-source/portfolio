'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Icon } from '@/components/V3';

const CHILD_COLORS = [
  'oklch(62% 0.12 280)',
  'oklch(62% 0.12 55)',
  'oklch(62% 0.09 155)',
  'oklch(62% 0.12 25)',
  'oklch(62% 0.1 300)',
  'oklch(62% 0.1 200)',
];

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  allergies: string | null;
  medications: string | null;
  schoolName: string | null;
  schoolGrade: string | null;
  doctorName: string | null;
  doctorPhone: string | null;
  emergencyContact: string | null;
  notes: string | null;
  color?: string;
  createdAt: string;
}

function getAge(dob: string) {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  if (isNaN(ms)) return null;
  return Math.floor(ms / (365.25 * 24 * 3600 * 1000));
}

function fmtDob(dob: string) {
  return new Date(dob + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .9h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 017-7l7 7a4.95 4.95 0 01-7 7z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  );
}

function InfoRow({ icon, label, value, iconColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: 'var(--bg)', color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-[11px] font-bold uppercase tracking-[0.05em]"
          style={{ color: 'var(--ink-soft)', marginBottom: '2px' }}
        >
          {label}
        </div>
        <div className="text-[13px] font-medium leading-snug" style={{ color: 'var(--ink)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, onEdit }: { child: Child; onEdit: (c: Child) => void }) {
  const initial = child.name.trim()[0]?.toUpperCase() ?? '?';
  const color = child.color ?? CHILD_COLORS[0];
  const tags = [child.schoolGrade, child.schoolName?.split(' ').slice(0, 2).join(' ')].filter(Boolean) as string[];

  return (
    <div
      className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)]"
      style={{ background: 'var(--card)', borderRadius: '22px', border: '1px solid var(--border)' }}
    >
      {/* Top */}
      <div className="flex items-center gap-4 p-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-[26px] text-white"
          style={{ background: color, fontFamily: 'var(--serif)', fontWeight: 400 }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div
            className="mb-1 truncate text-[22px]"
            style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}
          >
            {child.name}
          </div>
          <div className="mb-1.5 text-[13px]" style={{ color: 'var(--ink-soft)' }}>
            {getAge(child.dateOfBirth) !== null ? `${getAge(child.dateOfBirth)} years old · ` : ''}Born {fmtDob(child.dateOfBirth)}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--green-tint)', color: 'var(--green-deep)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3.5 p-6">
        {child.doctorName && (
          <InfoRow
            icon={<PhoneIcon />}
            label="Doctor"
            value={`${child.doctorName}${child.doctorPhone ? ' · ' + child.doctorPhone : ''}`}
            iconColor="var(--green)"
          />
        )}
        {child.schoolName && (
          <InfoRow
            icon={<SchoolIcon />}
            label="School"
            value={`${child.schoolName}${child.schoolGrade ? ' · ' + child.schoolGrade : ''}`}
            iconColor="oklch(52% 0.12 230)"
          />
        )}
        {child.allergies && (
          <InfoRow icon={<HeartIcon />} label="Allergies" value={child.allergies} iconColor="oklch(52% 0.12 25)" />
        )}
        {child.medications && (
          <InfoRow icon={<PillIcon />} label="Medications" value={child.medications} iconColor="oklch(52% 0.12 280)" />
        )}
        {child.emergencyContact && (
          <InfoRow icon={<UserIcon />} label="Emergency" value={child.emergencyContact} iconColor="oklch(62% 0.1 300)" />
        )}
        {child.notes && (
          <InfoRow icon={<NoteIcon />} label="Notes" value={child.notes} iconColor="var(--ink-soft)" />
        )}
        {!child.doctorName && !child.schoolName && !child.allergies && !child.medications && !child.emergencyContact && !child.notes && (
          <p className="text-[13px] italic" style={{ color: 'var(--ink-soft)' }}>No details added yet — click or tap Edit profile to fill in.</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-6 pb-5 pt-0" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        <button
          onClick={() => onEdit(child)}
          className="pcp-btn-secondary flex-1 rounded-xl py-2.5 text-[13px] font-semibold"
        >
          Edit profile
        </button>
        <a href="/calendar" className="pcp-btn-primary flex-1 rounded-xl py-2.5 text-[13px] font-bold no-underline text-center">
          View calendar
        </a>
      </div>
    </div>
  );
}

function AddChildCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[260px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[var(--border)] p-12 transition-all duration-200 hover:border-[var(--green)] hover:bg-[var(--green-tint)]"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 group-hover:bg-[var(--green-tint)]"
        style={{ background: 'var(--bg-deep)' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          style={{ color: 'var(--ink-soft)' }}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div className="mb-1.5 text-base font-bold" style={{ color: 'var(--ink)' }}>
        Add another child
      </div>
      <div className="max-w-[200px] text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Add profiles for all children in your family to keep everything organized.
      </div>
    </button>
  );
}

function EmptyChildren({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'var(--green-tint)' }}
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
          style={{ color: 'var(--green)' }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <div
        className="mb-2 text-2xl"
        style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}
      >
        No children added yet
      </div>
      <p className="mb-6 max-w-sm text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Add your children&apos;s profiles to keep medical info, school details, and emergency contacts in one place.
      </p>
      <button
        onClick={onClick}
        className="pcp-btn-primary flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add first child
      </button>
    </div>
  );
}

function ChildModal({ child, onClose, onSave }: {
  child: Partial<Child> | null;
  onClose: () => void;
  onSave: (data: Partial<Child>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Child>>(child || {});
  const [selectedColor, setSelectedColor] = useState(child?.color ?? CHILD_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof Child, value: string) {
    setForm((f) => ({ ...f, [key]: value || null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim() || !form.dateOfBirth?.trim() || isNaN(new Date(form.dateOfBirth).getTime())) {
      setError('Name and date of birth are required');
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, color: selectedColor });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof Child; label: string; type?: string; placeholder?: string }[] = [
    { key: 'allergies', label: 'Allergies', placeholder: 'Peanuts, tree pollen…' },
    { key: 'medications', label: 'Medications', placeholder: 'Ventolin 100mcg…' },
    { key: 'schoolName', label: 'School name', placeholder: 'Majorstua Primary School' },
    { key: 'schoolGrade', label: 'Grade / class', placeholder: 'Class 3B' },
    { key: 'doctorName', label: 'Doctor', placeholder: 'Dr. Lisa Park' },
    { key: 'doctorPhone', label: 'Doctor phone', placeholder: '+47 555 00 100' },
    { key: 'emergencyContact', label: 'Emergency contact', placeholder: 'Grandma Anna: +47 555 00 200' },
    { key: 'notes', label: 'Other notes' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md overflow-y-auto rounded-3xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
        style={{ background: 'var(--card)', maxHeight: '90vh' }}
      >
        <div
          className="mb-5 text-[24px]"
          style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}
        >
          {child?.id ? 'Edit' : 'Add'} Child
        </div>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                First name
              </label>
              <input
                className="pcp-input"
                type="text"
                placeholder="Emma"
                value={form.name?.split(' ')[0] ?? ''}
                onChange={(e) => {
                  const last = (form.name ?? '').split(' ').slice(1).join(' ');
                  set('name', [e.target.value, last].filter(Boolean).join(' '));
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                Last name
              </label>
              <input
                className="pcp-input"
                type="text"
                placeholder="Johnson"
                value={(form.name ?? '').split(' ').slice(1).join(' ')}
                onChange={(e) => {
                  const first = (form.name ?? '').split(' ')[0] ?? '';
                  set('name', [first, e.target.value].filter(Boolean).join(' '));
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
              Date of birth
            </label>
            <input
              className="pcp-input"
              type="date"
              value={form.dateOfBirth ?? ''}
              onChange={(e) => set('dateOfBirth', e.target.value)}
            />
          </div>

          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                {f.label}
              </label>
              <input
                className="pcp-input"
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={(form[f.key] as string) ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
              Avatar color
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {CHILD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  aria-pressed={selectedColor === c}
                  onClick={() => setSelectedColor(c)}
                  className="h-10 w-10 rounded-full transition-all duration-150 hover:scale-110"
                  style={{
                    background: c,
                    border: selectedColor === c ? `3px solid var(--ink)` : '3px solid transparent',
                    transform: selectedColor === c ? 'scale(1.18)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="pcp-btn-secondary flex-1 rounded-xl py-3 text-[14px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="pcp-btn-primary flex-[2] rounded-xl py-3 text-[14px] font-bold disabled:opacity-60"
            >
              {saving ? 'Saving…' : child?.id ? 'Save changes' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden"
      style={{ background: 'var(--card)', borderRadius: '22px', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-4 p-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-full" style={{ background: 'var(--bg-deep)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-lg" style={{ background: 'var(--bg-deep)' }} />
          <div className="h-3 w-1/2 animate-pulse rounded-lg" style={{ background: 'var(--bg-deep)' }} />
        </div>
      </div>
      <div className="space-y-3 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-[9px]" style={{ background: 'var(--bg-deep)' }} />
            <div className="h-4 w-2/3 animate-pulse rounded-lg" style={{ background: 'var(--bg-deep)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChildrenPage() {
  const { familyMember } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState<Partial<Child> | null>(null);

  void familyMember;

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ children: Child[] }>('/children');
      setChildren(data.children);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(data: Partial<Child>) {
    if (data.id) {
      const updated = await apiFetch<{ child: Child }>(`/children/${data.id}`, {
        method: 'PUT', body: JSON.stringify(data),
      });
      setChildren((prev) => prev.map((c) => (c.id === data.id ? updated.child : c)));
    } else {
      const created = await apiFetch<{ child: Child }>('/children', {
        method: 'POST', body: JSON.stringify(data),
      });
      setChildren((prev) => [...prev, created.child]);
    }
  }

  return (
    <AppLayout>
      <PageHero
        eyebrow="Family · profiles"
        title={<>The <em>actual</em> reason this app exists.</>}
        subtitle="Keep each child's allergies, medication, school info, emergency contacts, and pediatrician in one place. Both parents see the same thing — no more 'did you tell the nurse?'"
        action={
          <button
            onClick={() => setEditing({})}
            className="pcp-btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Child
          </button>
        }
      />

      {loadError && (
        <div className="mb-5 rounded-[14px] px-4 py-3 text-[13px]"
          style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
          Could not load children profiles. Check your connection and refresh the page.
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .ch-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="ch-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Left: children list / empty state */}
        <div>
          {loading ? (
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : children.length === 0 ? (
            <Card style={{ padding: 48, textAlign: 'center', minHeight: 420 }}>
              <div style={{ width: 88, height: 88, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                {Icon.children(40)}
              </div>
              <div className="pcp-display" style={{ fontSize: 34, letterSpacing: '-0.02em' }}>
                No profiles <em>just yet.</em>
              </div>
              <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', maxWidth: 420, margin: '12px auto 0' }}>
                Add your children so allergies, meds, school details and emergency contacts live in one secure place. Updates from either parent stay in sync automatically.
              </p>
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 10 }}>
                <Btn kind="primary" big icon={Icon.plus(13)} onClick={() => setEditing({})}>Add first child</Btn>
              </div>
            </Card>
          ) : (
            <>
              <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {children.map((c) => (
                  <ChildCard key={c.id} child={c} onEdit={setEditing} />
                ))}
                <AddChildCard onClick={() => setEditing({})} />
              </div>
              <Link href="/calendar"
                className="flex items-center justify-between rounded-[22px] border p-6 no-underline transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div>
                  <div className="mb-1 text-[18px] font-bold" style={{ color: 'var(--ink)' }}>Custody Schedule</div>
                  <div className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>Manage pickups, handovers and custody events in the shared calendar.</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {Icon.arrow(18)}
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Right: what you'll store */}
        <Card>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>What you&apos;ll store</div>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {[
              { n: 'Basic info', d: 'Name, DOB, photo, custody schedule' },
              { n: 'Medical', d: 'Allergies, medications, blood type, vaccinations' },
              { n: 'School', d: 'School name, grade, teacher, schedule' },
              { n: 'Emergency contacts', d: 'Pediatrician, grandparents, school nurse' },
              { n: 'Activities', d: 'Sports, music, weekly schedule' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-soft)', borderRadius: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.n}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {editing !== null && (
        <ChildModal child={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </AppLayout>
  );
}

