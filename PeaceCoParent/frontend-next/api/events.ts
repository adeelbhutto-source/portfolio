import { apiFetch } from '@/lib/api';
import type { CalendarEvent, CreateEventRequest, UpdateEventRequest } from '@/types/shared';

export async function fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });
  const data = await apiFetch<{ events: CalendarEvent[] }>(`/events?${params}`);
  return data.events;
}

export async function createEvent(payload: CreateEventRequest): Promise<CalendarEvent> {
  const data = await apiFetch<{ event: CalendarEvent }>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.event;
}

export async function updateEvent(id: string, payload: UpdateEventRequest): Promise<CalendarEvent> {
  const data = await apiFetch<{ event: CalendarEvent }>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data.event;
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch(`/events/${id}`, { method: 'DELETE' });
}
