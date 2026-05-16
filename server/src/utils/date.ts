/** Calendar-day helpers (UTC) for timezone-safe daily claims. */

export function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function utcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addUtcDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function daysBetweenUtc(a: Date, b: Date): number {
  const ms = utcDateOnly(b).getTime() - utcDateOnly(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
