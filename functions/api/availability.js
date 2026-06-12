// GET /api/availability — open 30-min slots (ISO UTC) for the booking window.
// Availability = weekly rules − Google free/busy − active D1 holds/recent bookings.

import { CONSULTATION } from './_lib/config.js';
import { generateCandidateSlots, filterFreeSlots } from './_lib/availability.js';
import { getBusyIntervals, getAccessToken } from './_lib/google.js';
import { getTakenStarts, getConfig } from './_lib/reservations.js';

export async function onRequestGet({ env }) {
  try {
    const candidates = generateCandidateSlots(new Date());
    if (candidates.length === 0) {
      return json({ slots: [], timeZone: CONSULTATION.timeZone, slotMinutes: CONSULTATION.slotMinutes });
    }
    const fromISO = candidates[0].toISOString();
    const toISO = new Date(candidates[candidates.length - 1].getTime() + CONSULTATION.slotMinutes * 60_000).toISOString();

    let busy = [];
    try {
      const refreshToken = env.DB ? await getConfig(env.DB, 'google_refresh_token') : null;
      if (refreshToken) {
        const accessToken = await getAccessToken(env, refreshToken);
        busy = await getBusyIntervals(accessToken, fromISO, toISO);
      }
    } catch (e) {
      // If Google isn't connected/readable yet, fall back to rules-only availability.
    }

    const taken = env.DB ? await getTakenStarts(env.DB, fromISO, toISO) : new Set();
    const free = filterFreeSlots(candidates, busy, taken);
    return json({
      slots: free.map((s) => s.toISOString()),
      timeZone: CONSULTATION.timeZone,
      slotMinutes: CONSULTATION.slotMinutes,
    });
  } catch (err) {
    return json({ error: 'Could not load availability.' }, 500);
  }
}

function json(d, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } });
}
