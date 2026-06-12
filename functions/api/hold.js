// POST /api/hold — body { slotStart, firstName, lastName, email, phone }.
// Atomically holds the slot, creates a Stripe Checkout Session (30-min expiry),
// and returns its URL. The hold is keyed to the session so the webhook can finalize.

import { CONSULTATION } from './_lib/config.js';
import { generateCandidateSlots, isSlotBookable } from './_lib/availability.js';
import { getBusyIntervals, getAccessToken } from './_lib/google.js';
import { getTakenStarts, getConfig, tryHold, releaseHold } from './_lib/reservations.js';
import { createCheckoutSession } from './_lib/stripe.js';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured.' }, 500);

    const body = await request.json().catch(() => ({}));
    const { slotStart, firstName, lastName, email, phone } = body;
    if (!slotStart || !firstName || !lastName || !email || !phone) {
      return json({ error: 'Please fill in every field and pick a time.' }, 400);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

    const start = new Date(slotStart);
    if (isNaN(start.getTime())) return json({ error: 'Invalid time slot.' }, 400);
    const slotStartISO = start.toISOString();
    const slotEndISO = new Date(start.getTime() + CONSULTATION.slotMinutes * 60_000).toISOString();

    // Re-validate the slot is currently free (rules + free/busy + active holds).
    const candidates = generateCandidateSlots(new Date());
    let busy = [];
    const refreshToken = await getConfig(env.DB, 'google_refresh_token');
    if (refreshToken) {
      try {
        const at = await getAccessToken(env, refreshToken);
        busy = await getBusyIntervals(at, slotStartISO, slotEndISO);
      } catch (e) { /* fall back */ }
    }
    const taken = await getTakenStarts(env.DB, slotStartISO, slotStartISO);
    if (!isSlotBookable(start, candidates, busy, taken)) {
      return json({ error: 'Sorry, that time is no longer available. Please pick another.' }, 409);
    }

    // Hold FIRST (atomic) under a temporary token so an unwon slot never creates a session.
    const holdToken = `hold_${crypto.randomUUID()}`;
    const expiresAtUnix = Math.floor(Date.now() / 1000) + CONSULTATION.holdMinutes * 60;
    const expiresAtISO = new Date(expiresAtUnix * 1000).toISOString();
    const won = await tryHold(env.DB, { slotStartISO, expiresAtISO, sessionId: holdToken, firstName, lastName, email, phone });
    if (!won) return json({ error: 'Sorry, that time was just taken. Please pick another.' }, 409);

    // Create the Stripe Checkout Session.
    const origin = env.SITE_URL || new URL(request.url).origin;
    let session;
    try {
      session = await createCheckoutSession(env, {
        slotStartISO, firstName, lastName, email, phone,
        successUrl: `${origin}/?booking=confirmed&session_id={CHECKOUT_SESSION_ID}#booking`,
        cancelUrl: `${origin}/?booking=cancelled#booking`,
        expiresAtUnix,
      });
    } catch (e) {
      await releaseHold(env.DB, holdToken); // free the slot if checkout couldn't start
      return json({ error: 'Could not start checkout. Please try again.' }, 502);
    }

    // Tie the hold to the real session id.
    await env.DB
      .prepare('UPDATE slot_reservations SET stripe_session_id=?, updated_at=? WHERE stripe_session_id=?')
      .bind(session.id, new Date().toISOString(), holdToken)
      .run();

    return json({ url: session.url });
  } catch (err) {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}

function json(d, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } });
}
