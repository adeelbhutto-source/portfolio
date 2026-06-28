'use client';
import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/types/shared';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/api/events';
import type { CreateEventRequest } from '@/types/shared';

export function useEvents(year: number, month: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      const data = await fetchEvents(start, end);
      setEvents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const addEvent = useCallback(async (payload: CreateEventRequest) => {
    const ev = await createEvent(payload);
    setEvents((prev) => [...prev, ev].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ));
    return ev;
  }, []);

  const moveEvent = useCallback(async (id: string, newStart: Date, newEnd: Date) => {
    setEvents((prev) => prev.map((e) =>
      e.id === id
        ? { ...e, startDate: newStart.toISOString(), endDate: newEnd.toISOString() }
        : e
    ));
    try {
      await updateEvent(id, {
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
      });
    } catch {
      load();
    }
  }, [load]);

  const removeEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteEvent(id);
    } catch {
      load();
    }
  }, [load]);

  return { events, loading, error, reload: load, addEvent, moveEvent, removeEvent };
}
