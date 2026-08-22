// Reusable date helpers so attendance/leave/payroll logic stays consistent.

/** Number of calendar days between two dates, inclusive of both ends. */
function daysBetweenInclusive(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/** Hours between two timestamps, rounded to 2 decimals. Returns 0 if either is missing. */
function hoursBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round((ms / (1000 * 60 * 60)) * 100) / 100);
}

/** Returns YYYY-MM-DD for "today" in server-local time. */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/** First and last day of the month containing `date` (defaults to today). */
function monthRange(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { first: first.toISOString().split('T')[0], last: last.toISOString().split('T')[0] };
}

module.exports = { daysBetweenInclusive, hoursBetween, todayISO, monthRange };
