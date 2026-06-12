// Availability engine: generate candidate 30-min slots from the weekly rules,
// then subtract busy time. Source of truth for "taken" is Google free/busy plus
// active D1 holds (and very-recent bookings, to cover free/busy propagation lag).

import { CONSULTATION, WEEKLY_AVAILABILITY } from './config.js';
import { zonedWallTimeToUtc, ymdInTz } from './dates.js';

const SLOT_MS = CONSULTATION.slotMinutes * 60_000;

// Candidate slot start instants (UTC Date[]) for the booking window, honoring
// weekly windows + min-notice + max-days-ahead. De-duplicated.
export function generateCandidateSlots(now = new Date()) {
  const tz = CONSULTATION.timeZone;
  const minStart = now.getTime() + CONSULTATION.minNoticeHours * 3_600_000;
  const maxStart = now.getTime() + CONSULTATION.maxDaysAhead * 86_400_000;
  const seen = new Set();
  const slots = [];

  for (let d = 0; d <= CONSULTATION.maxDaysAhead + 1; d++) {
    const dayInstant = new Date(now.getTime() + d * 86_400_000);
    const { year, month, day, weekday } = ymdInTz(dayInstant, tz);
    const windows = WEEKLY_AVAILABILITY[weekday] || [];
    for (const [start, end] of windows) {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const windowStart = zonedWallTimeToUtc(year, month, day, sh, sm, tz).getTime();
      const windowEnd = zonedWallTimeToUtc(year, month, day, eh, em, tz).getTime();
      for (let t = windowStart; t + SLOT_MS <= windowEnd; t += SLOT_MS) {
        if (t < minStart || t > maxStart) continue;
        const iso = new Date(t).toISOString();
        if (seen.has(iso)) continue;
        seen.add(iso);
        slots.push(new Date(t));
      }
    }
  }
  slots.sort((a, b) => a - b);
  return slots;
}

// Keep only candidate slots that don't overlap a busy interval and aren't taken.
// busyIntervals: [{start: ms, end: ms}], takenStarts: Set<ISOstring>.
export function filterFreeSlots(candidates, busyIntervals, takenStarts) {
  return candidates.filter((s) => {
    const start = s.getTime();
    const end = start + SLOT_MS;
    if (takenStarts.has(s.toISOString())) return false;
    for (const b of busyIntervals) {
      if (start < b.end && end > b.start) return false; // overlap
    }
    return true;
  });
}

// True if a single requested slot start (UTC Date) is a valid, currently-free slot.
export function isSlotBookable(slotStart, candidates, busyIntervals, takenStarts) {
  const iso = slotStart.toISOString();
  if (!candidates.some((c) => c.toISOString() === iso)) return false;
  return filterFreeSlots([slotStart], busyIntervals, takenStarts).length === 1;
}
