/**
 * Centralized date and money formatting for consistency across the app.
 * All app-wide date displays should use these helpers instead of bare toLocaleDateString.
 */

const LOCALE = 'en-US';

/** Short date: "May 7, 2026" */
export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Long date: "Thursday, May 7, 2026" */
export function fmtDateLong(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/** Compact: "Thu, May 7" */
export function fmtDateCompact(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Time: "3:45 PM" */
export function fmtTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Money in cents → "$14.00" */
export function fmtMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}
