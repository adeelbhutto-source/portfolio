'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { apiFetch } from '@/lib/api';
import { API_URL } from '@/lib/env';
import type { CalendarEvent, EventType, CreateEventRequest } from '@/types/shared';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Pill } from '@/components/V3';
import { Modal, Input, Textarea, Select } from '@/components/ui';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { fmtTime } from '@/lib/format';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  custody: 'Custody',
  pickup: 'Pickup',
  dropoff: 'Dropoff',
  appointment: 'Appointment',
  activity: 'Activity',
  holiday: 'Holiday',
  other: 'Other',
};

// Event type colors matching design spec
const EVENT_TYPE_COLORS: Record<string, string> = {
  pickup:      'var(--green)',
  handover:    'oklch(62% 0.12 280)',
  dropoff:     'oklch(62% 0.12 280)',
  medical:     'oklch(58% 0.12 25)',
  appointment: 'oklch(58% 0.12 25)',
  school:      'oklch(58% 0.12 230)',
  activity:    'oklch(58% 0.12 230)',
  other:       'oklch(62% 0.1 55)',
  custody:     'oklch(62% 0.1 55)',
  holiday:     'oklch(62% 0.1 55)',
};

function eventColor(ev: CalendarEvent): string {
  return ev.color ?? EVENT_TYPE_COLORS[ev.type] ?? EVENT_TYPE_COLORS.other;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ── Draggable event chip ──────────────────────────────────────────────────────

function EventChip({ event, onDelete }: {
  event: CalendarEvent & { creatorRole?: string };
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  const color = eventColor(event);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: color,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      {...listeners}
      {...attributes}
      className="group relative mb-0.5 overflow-hidden rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium text-white select-none whitespace-nowrap text-ellipsis"
      title={event.title}
    >
      <span>{event.title}</span>
      <button
        type="button"
        aria-label={`Delete event: ${event.title}`}
        title="Delete event"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
        className="absolute right-0.5 top-0 hidden h-full w-4 cursor-pointer items-center justify-center border-none bg-transparent text-[13px] text-white/80 group-hover:!flex"
      >
        ×
      </button>
    </div>
  );
}

// ── Droppable day cell ────────────────────────────────────────────────────────

function DayCell({ date, isToday, isCurrentMonth, events, onAddClick, onDelete }: {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onAddClick: (date: Date) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateKey(date), data: { date } });
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      onClick={() => onAddClick(date)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cal-day-cell"
      style={{
        minHeight: 100,
        padding: 8,
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        backgroundColor: isOver
          ? 'var(--green-tint)'
          : hovered
            ? 'var(--bg)'
            : isCurrentMonth ? 'var(--card)' : 'oklch(97.5% 0.008 85)',
        opacity: isCurrentMonth ? 1 : 0.35,
      }}
    >
      {/* Day number */}
      <div
        className="mb-[3px] flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-semibold"
        style={{
          backgroundColor: isToday ? 'var(--green)' : 'transparent',
          color: isToday ? 'white' : 'var(--ink)',
          boxShadow: isToday ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {date.getDate()}
      </div>

      {/* Event chips */}
      <div>
        {events.map((ev) => (
          <EventChip key={ev.id} event={ev} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

// ── Add Event Modal ───────────────────────────────────────────────────────────

const EVENT_TEMPLATES: { label: string; title: string; type: EventType }[] = [
  { label: '🚗 Pickup', title: 'Pickup', type: 'pickup' },
  { label: '🏠 Dropoff', title: 'Dropoff', type: 'dropoff' },
  { label: '🏥 Doctor', title: 'Doctor appointment', type: 'appointment' },
  { label: '🏫 School', title: 'School event', type: 'activity' },
  { label: '🌍 Holiday', title: 'Holiday', type: 'holiday' },
  { label: '⚽ Activity', title: 'Activity', type: 'activity' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Every month' },
];

function AddEventModal({ date, onClose, onSave, parentColor }: {
  date: Date;
  onClose: () => void;
  onSave: (payload: CreateEventRequest) => Promise<unknown>;
  parentColor: string;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('custody');
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [recurrence, setRecurrence] = useState('none');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pad = (n: number) => String(n).padStart(2, '0');
  const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    // Validate that end time is after start time for timed events
    if (!allDay && startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      const startISO = allDay
        ? new Date(localDate + 'T00:00:00').toISOString()
        : new Date(localDate + 'T' + startTime + ':00').toISOString();
      const endISO = allDay
        ? new Date(localDate + 'T23:59:59').toISOString()
        : new Date(localDate + 'T' + endTime + ':00').toISOString();

      await onSave({
        title: title.trim(),
        startDate: startISO,
        endDate: endISO,
        allDay,
        type,
        color: parentColor,
        notes: notes.trim() || undefined,
        recurrence: recurrence !== 'none' ? recurrence : undefined,
      } as CreateEventRequest);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div>
        {/* Modal header */}
        <h2 className="mb-1 text-[22px] font-normal text-[var(--ink)]" style={{ fontFamily: 'var(--serif)' }}>
          Add Event
        </h2>
        <p className="mb-5 text-[13px] text-[var(--ink-soft)]">
          {MONTH_NAMES[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
        </p>

        {error && (
          <div className="mb-4 rounded-xl px-3.5 py-2.5 text-[13px]"
            style={{ backgroundColor: 'oklch(97% 0.015 25)', border: '1px solid oklch(88% 0.04 25)', color: 'oklch(45% 0.14 25)' }}>
            {error}
          </div>
        )}

        {/* Quick add templates */}
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-soft)]">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TEMPLATES.map(t => (
              <button key={t.label} type="button"
                onClick={() => { setTitle(t.title); setType(t.type); }}
                className="cursor-pointer rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-[12px] font-medium text-[var(--ink)] transition-all hover:border-[var(--green)] hover:text-[var(--green)]"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          <Input autoFocus label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emma's soccer game" />

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value as EventType)}>
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div>
              <Select label="Repeat" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                {RECURRENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>

          {/* All-day toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--ink-soft)]">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}
              className="h-[15px] w-[15px]" style={{ accentColor: 'var(--green)' }} />
            All-day event
          </label>

          {!allDay && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-[5px] block text-[11px] font-semibold text-[var(--ink-soft)]">Start time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="pcp-input" />
              </div>
              <div>
                <label className="mb-[5px] block text-[11px] font-semibold text-[var(--ink-soft)]">End time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="pcp-input" />
              </div>
            </div>
          )}

          <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          {/* Buttons */}
          <div className="mt-1 flex gap-2.5">
            <button type="button" onClick={onClose}
              className="pcp-btn-secondary flex-1 rounded-[12px] py-2.5 text-[14px] font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="pcp-btn-primary flex-1 rounded-[12px] py-2.5 text-[14px] font-semibold disabled:opacity-70">
              {saving ? 'Saving…' : 'Save event'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ── Google Calendar sync button ───────────────────────────────────────────────

function GoogleCalendarButton() {
  const { tier } = useSubscription();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const params = useSearchParams();

  useEffect(() => {
    apiFetch<{ connected: boolean }>('/google-calendar/status')
      .then((d) => setConnected(d.connected))
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    const code = params.get('code');
    if (params.get('gcal') !== 'callback' || !code) return;
    apiFetch('/google-calendar/callback', { method: 'POST', body: JSON.stringify({ code }) })
      .then(() => { setConnected(true); setSyncMsg('Google Calendar connected!'); })
      .catch(() => setSyncMsg('Connection failed'))
      .finally(() => {
        const url = new URL(window.location.href);
        ['gcal', 'code', 'scope', 'authuser', 'prompt'].forEach(k => url.searchParams.delete(k));
        window.history.replaceState({}, '', url.toString());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    const { url } = await apiFetch<{ url: string }>('/google-calendar/auth-url');
    window.location.href = url;
  }

  async function sync() {
    setSyncing(true); setSyncMsg('');
    try {
      const { synced } = await apiFetch<{ synced: number }>('/google-calendar/sync', { method: 'POST' });
      setSyncMsg(`Synced ${synced} events!`);
    } catch (e: unknown) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 4000);
    }
  }

  if (tier === 'free') {
    return (
      <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Btn kind="ghost" tone="dark">Google Sync — Personal</Btn>
      </Link>
    );
  }

  if (connected === null) return null;

  const googleIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {syncMsg && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-deep)' }}>{syncMsg}</span>}
      {connected ? (
        <Btn kind="ghost" tone="dark" icon={googleIcon} onClick={sync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync Google'}
        </Btn>
      ) : (
        <Btn kind="ghost" tone="dark" icon={googleIcon} onClick={connect}>
          Connect Google
        </Btn>
      )}
    </div>
  );
}

// ── Upcoming events side list ─────────────────────────────────────────────────

function UpcomingEvents({ events, today }: { events: CalendarEvent[]; today: Date }) {
  const upcoming = useMemo(() => {
    return [...events]
      .filter(ev => new Date(ev.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 12);
  }, [events, today]);

  if (upcoming.length === 0) {
    return (
      <p style={{ padding: '8px 0', fontSize: 12, color: 'var(--ink-soft)' }}>
        No upcoming events this month.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {upcoming.map(ev => {
        const d = new Date(ev.startDate);
        const color = eventColor(ev);
        const dayNum = d.getDate();
        const dayName = DAY_NAMES[d.getDay()].toUpperCase();
        const timeStr = ev.allDay ? 'All day' : fmtTime(d);

        return (
          <div key={ev.id} style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr',
            gap: 10,
            padding: '10px 12px',
            background: 'var(--bg)',
            borderRadius: 10,
          }}>
            <div style={{
              width: 44, padding: '4px 0', textAlign: 'center',
              background: 'var(--card)',
              border: `1px solid ${color}40`,
              borderRadius: 8,
            }}>
              <div className="pcp-mono" style={{ fontSize: 9, color: 'var(--ink-mute)' }}>{dayName}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1, color: 'var(--ink)' }}>{dayNum}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{timeStr}</div>
              <div style={{
                display: 'inline-block', marginTop: 3,
                padding: '2px 7px', borderRadius: 4,
                fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
                background: color, color: 'white',
              }}>
                {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Inner calendar (uses useSearchParams) ────────────────────────────────────

function CalendarInner() {
  const { user, familyMember, logout } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [addingDate, setAddingDate] = useState<Date | null>(null);

  const { events, loading, error, addEvent, moveEvent, removeEvent } = useEvents(year, month);

  const parentColor = familyMember?.color ?? '#6366f1';

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const grid: Date[] = [];
    for (let i = 0; i < 42; i++) {
      grid.push(new Date(year, month, 1 - startOffset + i));
    }
    return grid;
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.startDate);
      const key = dateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ev = active.data.current?.event as CalendarEvent;
    const targetDate = over.data.current?.date as Date;
    if (!ev || !targetDate) return;
    const duration = new Date(ev.endDate).getTime() - new Date(ev.startDate).getTime();
    const newStart = new Date(targetDate);
    newStart.setHours(new Date(ev.startDate).getHours(), new Date(ev.startDate).getMinutes());
    const newEnd = new Date(newStart.getTime() + duration);
    moveEvent(ev.id, newStart, newEnd);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Get week number
  const weekNum = useMemo(() => {
    const d = new Date(year, month, 1);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }, [year, month]);

  // Conflict events (events that might overlap)
  const conflictEvents = useMemo(() => {
    return events.filter(ev => {
      const evDate = new Date(ev.startDate);
      return evDate.getMonth() === month && evDate.getFullYear() === year;
    }).slice(0, 2);
  }, [events, month, year]);

  void user; void logout;

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .cal-day-cell { min-height: 56px !important; padding: 4px !important; }
          .cal-day-num  { font-size: 11px !important; }
          .cal-wday     { padding: 6px 4px !important; font-size: 9px !important; }
          .cal-view-toggle { display: none !important; }
        }
      `}</style>
      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl px-4 py-2.5 text-[13px]"
          style={{ backgroundColor: 'oklch(97% 0.015 25)', borderColor: 'oklch(88% 0.04 25)', color: 'oklch(45% 0.14 25)', border: '1px solid oklch(88% 0.04 25)' }}>
          {error}
        </div>
      )}

      {/* PageHero */}
      <PageHero
        eyebrow={`${MONTH_NAMES[month]} ${year} · Week ${weekNum}`}
        title={<>Two homes. <em>One plan.</em></>}
        subtitle="Pickup, handover, doctor, school. Conflict warnings appear before they happen — so you can sort them by message, not in the parking lot."
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Btn
              kind="ghost"
              tone="dark"
              onClick={async () => {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${API_URL}/events/ical`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'PeaceCoParent.ics'; a.click();
                URL.revokeObjectURL(url);
              }}
            >
              iCal
            </Btn>
            <GoogleCalendarButton />
            <Btn
              kind="primary"
              tone="dark"
              icon={<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
              onClick={() => {
                const viewingCurrentMonth = year === today.getFullYear() && month === today.getMonth();
                setAddingDate(viewingCurrentMonth ? today : new Date(year, month, 1));
              }}
            >
              Add event
            </Btn>
          </div>
        }
      />

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>

        {/* Left: calendar grid */}
        <Card pad={0}>
          {/* Month header */}
          <div style={{
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)', fontSize: 18, lineHeight: 1, padding: '4px 6px', borderRadius: 8, fontFamily: 'var(--sans)' }}
              >‹</button>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                {MONTH_NAMES[month]} {year}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)', fontSize: 18, lineHeight: 1, padding: '4px 6px', borderRadius: 8, fontFamily: 'var(--sans)' }}
              >›</button>
            </div>
            <div className="cal-view-toggle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {['Day', 'Week', 'Month'].map((v) => (
                <span key={v} style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  background: v === 'Month' ? 'var(--green)' : 'transparent',
                  color: v === 'Month' ? '#F1ECDF' : 'var(--ink-mute)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--border)',
          }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="pcp-eyebrow cal-wday" style={{ padding: '12px 16px', color: 'var(--ink-mute)', fontSize: 10 }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: 'var(--ink-soft)', fontSize: 13 }}>
              Loading…
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {days.map((date) => (
                  <DayCell
                    key={dateKey(date)}
                    date={date}
                    isToday={isSameDay(date, today)}
                    isCurrentMonth={date.getMonth() === month}
                    events={eventsByDay.get(dateKey(date)) ?? []}
                    onAddClick={setAddingDate}
                    onDelete={removeEvent}
                  />
                ))}
              </div>
            </DndContext>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div style={{ margin: '16px', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg)', borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>No events this month</p>
                <p style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-soft)' }}>Click any day to add pickups, handovers, appointments, or activities.</p>
              </div>
            </div>
          )}
        </Card>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Conflict catcher card */}
          {conflictEvents.length > 0 && (
            <div style={{
              background: 'var(--warn-tint)',
              border: '1px solid #E8B898',
              borderRadius: 18,
              padding: 18,
            }}>
              <div className="pcp-eyebrow" style={{ color: 'var(--warn)' }}>Conflict catcher</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 4, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                Potential overlap
              </div>
              <div style={{
                marginTop: 12, padding: '12px 14px',
                background: '#FBE8DC', border: '1px solid var(--clay-tint)', borderRadius: 12,
              }}>
                <div style={{ fontSize: 13, color: '#7A2E1E', lineHeight: 1.5 }}>
                  Check your schedule for potential conflicts this month.
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <Btn kind="primary">Send coached msg</Btn>
                  <Btn kind="ghost">Resolve later</Btn>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming events */}
          <Card pad={0}>
            <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
              <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Upcoming · this month</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 4, letterSpacing: '-0.01em' }}>Events</div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <UpcomingEvents events={events} today={today} />
            </div>
          </Card>

          {/* Legend card */}
          <Card>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Legend</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8, fontSize: 13 }}>
              {[
                { c: 'var(--green)', l: '● You', textColor: 'var(--green)' },
                { c: 'var(--clay)',  l: '● Co-parent', textColor: 'var(--clay)' },
                { c: 'oklch(58% 0.12 25)',  l: 'Medical', textColor: 'var(--ink-soft)' },
                { c: 'oklch(58% 0.12 230)', l: 'School / Activity', textColor: 'var(--ink-soft)' },
              ].map((x, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: x.c, display: 'inline-block', flexShrink: 0 }}/>
                  <span style={{ color: x.textColor, fontWeight: i < 2 ? 600 : 400 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {addingDate && (
        <AddEventModal
          date={addingDate}
          onClose={() => setAddingDate(null)}
          onSave={addEvent}
          parentColor={parentColor}
        />
      )}
    </AppLayout>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Calendar() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 13 }}>
        Loading…
      </div>
    }>
      <CalendarInner />
    </Suspense>
  );
}
