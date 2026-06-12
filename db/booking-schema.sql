-- Custom scheduler — booking data model (Cloudflare D1).
-- Apply:  wrangler d1 execute shalmali-bookings --remote --file db/booking-schema.sql
--
-- Design: we do NOT pre-materialize every bookable slot. Availability is computed
-- on demand from working-hours config minus Google Calendar free/busy minus the
-- rows in this table. We only persist a row when a visitor RESERVES a slot.
--
-- `slot_start` (UTC) is the natural lock: a 30-min slot can be 'held' (pending
-- payment, with an expiry) or 'booked' (paid + calendar event created). Holds
-- that pass expires_at are treated as free and may be overwritten.
--
-- Atomic reserve (in the hold endpoint) — single statement, race-safe in SQLite:
--   INSERT INTO slot_reservations (slot_start,status,expires_at,...)
--   VALUES (?, 'held', ?, ...)
--   ON CONFLICT(slot_start) DO UPDATE SET status='held', expires_at=excluded.expires_at, ...
--     WHERE slot_reservations.status='held'
--       AND slot_reservations.expires_at <= datetime('now');
--   -> then check changes()==1 : 1 = you won the slot, 0 = already held/booked.

CREATE TABLE IF NOT EXISTS slot_reservations (
  slot_start        TEXT PRIMARY KEY,        -- UTC ISO-8601 start, e.g. 2026-07-15T15:00:00Z (also the lock)
  status            TEXT NOT NULL,           -- 'held' | 'booked'
  expires_at        TEXT,                    -- UTC; for 'held' rows, when the hold lapses
  stripe_session_id TEXT,                    -- Stripe Checkout Session id tied to this hold/booking

  -- contact data collected in our own form (the four fields)
  first_name        TEXT,
  last_name         TEXT,
  email             TEXT,
  phone             TEXT,

  -- payment + calendar results (filled on 'booked')
  amount_total      INTEGER,                 -- cents actually charged (after any coupon)
  currency          TEXT,
  coupon            TEXT,                    -- promo code used, if any
  calendar_event_id TEXT,                    -- Google Calendar event id
  meet_link         TEXT,                    -- Google Meet URL

  created_at        TEXT NOT NULL DEFAULT (datetime('now')),  -- UTC
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))   -- UTC
);

CREATE INDEX IF NOT EXISTS idx_slot_status  ON slot_reservations(status, slot_start);
CREATE INDEX IF NOT EXISTS idx_slot_session ON slot_reservations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_slot_email   ON slot_reservations(email);

-- Small key/value store for server-side app config — notably the Google OAuth
-- refresh token captured during the one-time "Connect Google" consent.
-- Only the Pages Functions (with the DB binding) can read this; never exposed to clients.
CREATE TABLE IF NOT EXISTS app_config (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
