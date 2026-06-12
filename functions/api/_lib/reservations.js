// D1 reservation helpers. All timestamps are written as ISO-8601 UTC strings so
// lexicographic comparison == chronological comparison.

const GRACE_MIN = 10; // a freshly 'booked' row blocks for this long before we rely on Google free/busy

// Atomic reserve. Returns true if we won the slot, false if it's already
// actively held or booked. Single statement -> race-safe in SQLite.
export async function tryHold(db, { slotStartISO, expiresAtISO, sessionId, firstName, lastName, email, phone }) {
  const nowISO = new Date().toISOString();
  const res = await db
    .prepare(
      `INSERT INTO slot_reservations
         (slot_start, status, expires_at, stripe_session_id, first_name, last_name, email, phone, created_at, updated_at)
       VALUES (?, 'held', ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slot_start) DO UPDATE SET
         status='held', expires_at=excluded.expires_at, stripe_session_id=excluded.stripe_session_id,
         first_name=excluded.first_name, last_name=excluded.last_name, email=excluded.email,
         phone=excluded.phone, updated_at=excluded.updated_at
       WHERE slot_reservations.status='held' AND slot_reservations.expires_at <= ?`,
    )
    .bind(slotStartISO, expiresAtISO, sessionId, firstName, lastName, email, phone, nowISO, nowISO, nowISO)
    .run();
  return (res.meta?.changes || 0) > 0;
}

// Slot starts considered taken within [fromISO,toISO]: active holds + very-recent
// bookings (older bookings are reflected by Google free/busy instead).
export async function getTakenStarts(db, fromISO, toISO) {
  const nowISO = new Date().toISOString();
  const graceISO = new Date(Date.now() - GRACE_MIN * 60_000).toISOString();
  const { results } = await db
    .prepare(
      `SELECT slot_start FROM slot_reservations
        WHERE slot_start >= ? AND slot_start <= ?
          AND ( (status='held' AND expires_at > ?)
             OR (status='booked' AND updated_at > ?) )`,
    )
    .bind(fromISO, toISO, nowISO, graceISO)
    .all();
  return new Set((results || []).map((r) => r.slot_start));
}

export async function getReservationBySession(db, sessionId) {
  return db.prepare('SELECT * FROM slot_reservations WHERE stripe_session_id = ?').bind(sessionId).first();
}

// Promote a held slot to booked (idempotent: only updates a row still 'held').
export async function markBooked(db, sessionId, { amountTotal, currency, coupon, eventId, meetLink }) {
  const nowISO = new Date().toISOString();
  await db
    .prepare(
      `UPDATE slot_reservations
          SET status='booked', amount_total=?, currency=?, coupon=?, calendar_event_id=?, meet_link=?, updated_at=?
        WHERE stripe_session_id=? AND status='held'`,
    )
    .bind(amountTotal, currency, coupon, eventId, meetLink, nowISO, sessionId)
    .run();
}

// Release an unpaid hold so the slot reopens.
export async function releaseHold(db, sessionId) {
  await db.prepare("DELETE FROM slot_reservations WHERE stripe_session_id=? AND status='held'").bind(sessionId).run();
}

// app_config (e.g. google_refresh_token) — server-only key/value.
export async function getConfig(db, key) {
  const row = await db.prepare('SELECT value FROM app_config WHERE key=?').bind(key).first();
  return row ? row.value : null;
}
export async function setConfig(db, key, value) {
  const nowISO = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
    )
    .bind(key, value, nowISO)
    .run();
}
