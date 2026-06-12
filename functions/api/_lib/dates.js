// Timezone-aware date helpers (no deps; uses Intl). Everything is compared in
// UTC; availability is defined in the owner's local TZ and converted to UTC
// instants in a DST-aware way.

// Offset (ms) of `timeZone` at a given UTC instant: localWallTime - utcTime.
export function tzOffsetMs(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = {};
  for (const part of dtf.formatToParts(instant)) p[part.type] = part.value;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - instant.getTime();
}

// Convert a wall-clock time in `timeZone` to the corresponding UTC Date (DST-aware).
export function zonedWallTimeToUtc(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = tzOffsetMs(new Date(guess), timeZone);
  let utc = guess - offset;
  const offset2 = tzOffsetMs(new Date(utc), timeZone);
  if (offset2 !== offset) utc = guess - offset2; // correct across a DST boundary
  return new Date(utc);
}

// Calendar Y/M/D + weekday (0=Sun) of an instant, as seen in `timeZone`.
export function ymdInTz(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const p = {};
  for (const part of dtf.formatToParts(instant)) p[part.type] = part.value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { year: +p.year, month: +p.month, day: +p.day, weekday: wd[p.weekday] };
}
