// Shared config for the custom scheduler. Imported by the /api endpoints.

export const CONSULTATION = {
  priceCents: 5000, // $50.00
  currency: 'usd',
  slotMinutes: 30,
  productName: 'EB-1A Consultation (30 Min)',
  timeZone: 'America/Chicago', // owner's timezone (US Central, DST-aware)
  minNoticeHours: 24, // cannot book within 24h
  maxDaysAhead: 60, // how far out bookings are allowed
  holdMinutes: 30, // how long a slot is held during checkout (Stripe session min expiry is 30m)
  calendarId: 'primary', // the owner's primary Google Calendar
};

// Recurring weekly availability in the owner's timezone (local 24h time).
// 0=Sun … 6=Sat. Real Google Calendar events further trim these via free/busy.
// Derived from the owner's Google appointment-schedule (Mon/Wed/Thu/Fri afternoons).
export const WEEKLY_AVAILABILITY = {
  1: [['15:00', '19:00']], // Mon 3–7pm
  2: [], // Tue — closed
  3: [['16:00', '19:00']], // Wed 4–7pm
  4: [['17:00', '19:00']], // Thu 5–7pm
  5: [['15:00', '18:00']], // Fri 3–6pm
};

export const STRIPE_API_VERSION = '2023-10-16';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
];
