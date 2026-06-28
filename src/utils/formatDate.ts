/**
 * Date formatting for manifest ISO date strings.
 *
 * Manifest dates are date-only ISO strings (e.g. "2026-06-28"). `new Date()`
 * parses those as UTC midnight, so we must format in UTC too — otherwise
 * users behind UTC see the previous day.
 */

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
