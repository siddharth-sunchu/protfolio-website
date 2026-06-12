// Shared, idempotent finalize logic for a paid Checkout Session: atomically
// claim the held slot, create the Google Calendar event (Meet + invite), and
// record the result. Used by BOTH the Stripe webhook and the confirmation page.

import { CONSULTATION } from './config.js';
import { getAccessToken, createCalendarEvent } from './google.js';
import { getConfig, getReservationBySession } from './reservations.js';

async function createEventForReservation(env, reservation, session) {
  const db = env.DB;
  const startDate = new Date(reservation.slot_start);
  const endDate = new Date(startDate.getTime() + CONSULTATION.slotMinutes * 60_000);

  const refreshToken = await getConfig(db, 'google_refresh_token');
  if (!refreshToken) throw new Error('Google Calendar not connected');
  const accessToken = await getAccessToken(env, refreshToken);

  const fullName = [reservation.first_name, reservation.last_name].filter(Boolean).join(' ') || 'Guest';
  const email = reservation.email || session.customer_details?.email || null;
  const phone = reservation.phone || '';
  const description =
    `EB-1A consultation with ${fullName}.\n` +
    `Email: ${email || 'n/a'}\nPhone: ${phone || 'n/a'}\n\nBooked via shalmalipatil.com.`;

  const { eventId, meetLink } = await createCalendarEvent(accessToken, {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    summary: `EB-1A Consultation — ${fullName}`,
    description,
    attendees: email ? [{ email }] : [],
  });

  const discounted = session.total_details && session.total_details.amount_discount > 0;
  await db
    .prepare(
      `UPDATE slot_reservations
          SET amount_total=?, currency=?, coupon=?, calendar_event_id=?, meet_link=?, updated_at=?
        WHERE stripe_session_id=?`,
    )
    .bind(
      session.amount_total ?? null,
      session.currency || CONSULTATION.currency,
      discounted ? 'applied' : null,
      eventId,
      meetLink,
      new Date().toISOString(),
      session.id,
    )
    .run();
  return { eventId, meetLink };
}

// Returns { meetLink, slotStartISO, pending? }. Idempotent + race-safe.
export async function finalizePaidSession(env, session) {
  const db = env.DB;
  const sessionId = session.id;
  const existing = await getReservationBySession(db, sessionId);
  if (!existing) throw new Error('No reservation found for session');

  if (existing.status === 'booked' && existing.calendar_event_id) {
    return { meetLink: existing.meet_link, slotStartISO: existing.slot_start };
  }
  // Booked but event missing (a prior attempt failed mid-way) -> retry creating it.
  if (existing.status === 'booked' && !existing.calendar_event_id) {
    const { meetLink } = await createEventForReservation(env, existing, session);
    return { meetLink, slotStartISO: existing.slot_start };
  }

  // Atomically claim the held slot so only one finalizer creates the event.
  const claim = await db
    .prepare("UPDATE slot_reservations SET status='booked', updated_at=? WHERE stripe_session_id=? AND status='held'")
    .bind(new Date().toISOString(), sessionId)
    .run();
  if ((claim.meta?.changes || 0) === 0) {
    const reread = await getReservationBySession(db, sessionId);
    return { meetLink: reread?.meet_link || null, slotStartISO: existing.slot_start, pending: !reread?.calendar_event_id };
  }
  const { meetLink } = await createEventForReservation(env, existing, session);
  return { meetLink, slotStartISO: existing.slot_start };
}
