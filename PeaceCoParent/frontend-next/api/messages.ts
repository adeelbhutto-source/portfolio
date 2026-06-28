import { apiFetch } from '@/lib/api';
import type { Message, AiReviewResponse } from '@/types/shared';

export async function fetchMessages(before?: Date): Promise<Message[]> {
  const params = new URLSearchParams({ limit: '50' });
  if (before) params.set('before', before.toISOString());
  const data = await apiFetch<{ messages: Message[] }>(`/messages?${params}`);
  return data.messages;
}

export async function reviewMessage(body: string): Promise<AiReviewResponse> {
  return apiFetch<AiReviewResponse>('/messages/review', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function sendMessage(body: string): Promise<{ message: Message; aiSuggestion: string | null }> {
  return apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function markRead(id: string): Promise<void> {
  await apiFetch(`/messages/${id}/read`, { method: 'PATCH' });
}
