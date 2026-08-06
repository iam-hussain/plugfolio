/** Display-only date formatting, shared across features. */
const shortDateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

/** "Aug 6" — a compact calendar date (deadlines, timestamps in dense rows). */
export function shortDate(date: Date): string {
  return shortDateFormat.format(date);
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 days ago" — a thread's age matters more than its exact timestamp. */
export function relativeTime(date: Date, now: Date = new Date()): string {
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  if (days > -7) return relative.format(days, "day");
  if (days > -30) return relative.format(Math.round(days / 7), "week");
  return relative.format(Math.round(days / 30), "month");
}
