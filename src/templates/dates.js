// src/templates/dates.js — "Aug 2026 – present" for roles kept as [year, month].
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const month = ([y, m]) => `${MONTHS[m - 1]} ${y}`;

/** A role's dates, e.g. "Aug 2026 – present" or "Jun 2025 – Jun 2026". */
export function when(r) {
  if (!r.start) return r.end ? '' : 'Current';
  const from = r.yearOnly ? String(r.start[0]) : month(r.start);
  return `${from} – ${r.end ? month(r.end) : 'present'}`;
}
