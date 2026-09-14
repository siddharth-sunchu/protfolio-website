// Shared config for the custom scheduler. Imported by the /api endpoints.

export const CONSULTATION = {
  priceCents: 6999, // $69.99
  currency: 'usd',
  slotMinutes: 60,
  productName: 'EB-1A Consultation (60 Min)',
  timeZone: 'America/Chicago', // owner's timezone (US Central, DST-aware)
  minNoticeHours: 24, // cannot book within 24h
  maxDaysAhead: 60, // how far out bookings are allowed
  holdMinutes: 30, // how long a slot is held during checkout (Stripe session min expiry is 30m)
  calendarId: 'primary', // the owner's primary Google Calendar
};

// Recurring weekly availability in the owner's timezone (local 24h time).
// 0=Sun … 6=Sat. Real Google Calendar events further trim these via free/busy.
// Shalmali's consultation hours in US Central time.
export const WEEKLY_AVAILABILITY = {
  1: [['17:00', '19:00']], // Mon 5–7pm
  2: [['16:00', '19:00']], // Tue 4–7pm
  3: [['16:00', '19:00']], // Wed 4–7pm
  4: [['16:00', '19:00']], // Thu 4–7pm
  5: [['17:00', '18:00']], // Fri 5–6pm (one slot)
};

// Per-session Checkout branding became available in this stable API version.
export const STRIPE_API_VERSION = '2025-09-30.clover';

export const CHECKOUT_BRANDING = {
  displayName: 'Shalmali Patil',
  logoUrl: 'https://www.shalmalipatil.com/initials.svg',
};

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
];
