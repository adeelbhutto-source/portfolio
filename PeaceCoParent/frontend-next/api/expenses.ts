import { apiFetch } from '@/lib/api';
import type { Expense, CreateExpenseRequest } from '@/types/shared';

export async function fetchExpenses(): Promise<Expense[]> {
  const data = await apiFetch<{ expenses: Expense[] }>('/expenses');
  return data.expenses;
}

export async function createExpense(payload: CreateExpenseRequest): Promise<Expense> {
  const data = await apiFetch<{ expense: Expense }>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.expense;
}

export async function respondExpense(id: string, action: 'approve' | 'reject', reason?: string): Promise<Expense> {
  const data = await apiFetch<{ expense: Expense }>(`/expenses/${id}/respond`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reason }),
  });
  return data.expense;
}
