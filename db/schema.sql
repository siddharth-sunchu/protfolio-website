-- D1 schema for the EB-1A consultation site.
-- Apply:  wrangler d1 execute shalmali-bookings --remote --file db/schema.sql
--
-- One row per paid booking. Written by functions/api/verify-session.js ONLY
-- after Stripe confirms payment_status = 'paid'. session_id is the primary key
-- so repeated verify calls (page refreshes) never create duplicates.

CREATE TABLE IF NOT EXISTS bookings (
  session_id     TEXT PRIMARY KEY,   -- Stripe Checkout Session id
  email          TEXT,               -- customer_details.email (Stripe)
  name           TEXT,               -- customer_details.name (Stripe)
  amount_total   INTEGER,            -- cents actually charged (after any coupon)
  currency       TEXT,               -- e.g. 'usd'
  payment_status TEXT,               -- 'paid'
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))  -- UTC
);
