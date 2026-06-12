// GET /api/booking-status?session_id=cs_... — used by the confirmation page after
// Stripe redirect. Verifies payment and finalizes the booking (idempotent), so the
// page works even if the webhook hasn't fired yet.

import { retrieveSession } from './_lib/stripe.js';
import { finalizePaidSession } from './_lib/finalize.js';
import { getReservationBySession } from './_lib/reservations.js';

export async function onRequestGet({ request, env }) {
  try {
    const sessionId = new URL(request.url).searchParams.get('session_id');
    if (!sessionId) return json({ status: 'error', error: 'Missing session_id' }, 400);

    // Fast path — already fully booked.
    const existing = await getReservationBySession(env.DB, sessionId);
    if (existing && existing.status === 'booked' && existing.calendar_event_id) {
      return json({ status: 'confirmed', meetLink: existing.meet_link, slotStart: existing.slot_start });
    }

    const session = await retrieveSession(env, sessionId);
    if (session.payment_status !== 'paid') return json({ status: 'unpaid' });

    const result = await finalizePaidSession(env, session);
    if (result.pending) return json({ status: 'processing', slotStart: result.slotStartISO });
    return json({ status: 'confirmed', meetLink: result.meetLink, slotStart: result.slotStartISO });
  } catch (err) {
    return json(
      { status: 'error', error: 'We could not confirm your booking. If you were charged, email shalupatil15@gmail.com and we will sort it out.' },
      500,
    );
  }
}

function json(d, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } });
}
