import {
  CHECKOUT_BRANDING,
  CONSULTATION,
  STRIPE_API_VERSION,
  WEEKLY_AVAILABILITY,
} from '../functions/api/_lib/config';
import { generateCandidateSlots, filterFreeSlots, isSlotBookable } from '../functions/api/_lib/availability';
import { createCheckoutSession } from '../functions/api/_lib/stripe';
import bookingEmailWorker from '../workers/booking-email/src/index';

const localStamp = (date) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: CONSULTATION.timeZone,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.weekday} ${parts.hour}:${parts.minute}`;
};

describe('consultation schedule', () => {
  test('uses the one-hour, $69.99 offering', () => {
    expect(CONSULTATION.slotMinutes).toBe(60);
    expect(CONSULTATION.priceCents).toBe(6999);
    expect(CONSULTATION.productName).toBe('EB-1A Consultation (60 Min)');
  });

  test('matches Shalmali\'s weekly Central-time hours', () => {
    expect(WEEKLY_AVAILABILITY).toEqual({
      1: [['17:00', '19:00']],
      2: [['16:00', '19:00']],
      3: [['16:00', '19:00']],
      4: [['16:00', '19:00']],
      5: [['17:00', '18:00']],
    });

    const slots = generateCandidateSlots(new Date('2026-09-13T12:00:00.000Z'));
    const targetWeek = slots
      .map(localStamp)
      .filter((stamp) => stamp >= '2026-09-14' && stamp < '2026-09-19');

    expect(targetWeek).toEqual([
      '2026-09-14 Mon 17:00',
      '2026-09-14 Mon 18:00',
      '2026-09-15 Tue 16:00',
      '2026-09-15 Tue 17:00',
      '2026-09-15 Tue 18:00',
      '2026-09-16 Wed 16:00',
      '2026-09-16 Wed 17:00',
      '2026-09-16 Wed 18:00',
      '2026-09-17 Thu 16:00',
      '2026-09-17 Thu 17:00',
      '2026-09-17 Thu 18:00',
      '2026-09-18 Fri 17:00',
    ]);
  });

  test('removes a slot that overlaps a busy calendar event', () => {
    const candidate = new Date('2026-09-15T21:00:00.000Z'); // Tue 4 PM Central
    const overlappingBusyTime = [{
      start: new Date('2026-09-15T21:30:00.000Z').getTime(),
      end: new Date('2026-09-15T22:30:00.000Z').getTime(),
    }];
    expect(filterFreeSlots([candidate], overlappingBusyTime, new Set())).toEqual([]);
  });

  test('offers nothing during the Oct 15 – Nov 16, 2026 India trip', () => {
    const candidates = generateCandidateSlots(new Date('2026-10-08T12:00:00.000Z'));
    const stamps = candidates.map(localStamp);

    expect(stamps.filter((stamp) => stamp >= '2026-10-15' && stamp < '2026-11-17')).toEqual([]);
    expect(stamps).toContain('2026-10-14 Wed 18:00'); // last slot before leaving
    expect(stamps).toContain('2026-11-17 Tue 16:00'); // first slot after returning

    // /api/hold re-validates against the same candidates, so a trip slot can't be held.
    const tripSlot = new Date('2026-10-21T21:00:00.000Z'); // Wed Oct 21, 4 PM Central
    expect(isSlotBookable(tripSlot, candidates, [], new Set())).toBe(false);
  });
});

describe('Stripe Checkout price selection', () => {
  const request = {
    slotStartISO: '2026-09-15T21:00:00.000Z',
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    phone: '555-0100',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    expiresAtUnix: 1790000000,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'cs_test_example', url: 'https://checkout.stripe.test/example' }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses the saved site-specific Price in live mode', async () => {
    await createCheckoutSession({
      STRIPE_SECRET_KEY: 'sk_live_example',
      STRIPE_PRICE_ID: 'price_live_shalmali',
    }, request);

    const body = new URLSearchParams(global.fetch.mock.calls[0][1].body);
    expect(body.get('mode')).toBe('payment');
    expect(body.get('line_items[0][price]')).toBe('price_live_shalmali');
    expect(body.has('line_items[0][price_data][unit_amount]')).toBe(false);
    expect(body.get('metadata[duration_minutes]')).toBe('60');
    expect(body.get('branding_settings[display_name]')).toBe(CHECKOUT_BRANDING.displayName);
    expect(body.get('branding_settings[logo][url]')).toBe(CHECKOUT_BRANDING.logoUrl);
    expect(global.fetch.mock.calls[0][1].headers['Stripe-Version']).toBe(STRIPE_API_VERSION);
  });

  test('uses an equivalent inline $69.99 price with local test keys', async () => {
    await createCheckoutSession({
      STRIPE_TEST_SECRET_KEY: 'sk_test_example',
      STRIPE_PRICE_ID: 'price_live_must_not_be_used',
    }, request);

    const body = new URLSearchParams(global.fetch.mock.calls[0][1].body);
    expect(body.has('line_items[0][price]')).toBe(false);
    expect(body.get('line_items[0][price_data][unit_amount]')).toBe('6999');
    expect(body.get('line_items[0][price_data][product_data][name]')).toBe('EB-1A Consultation (60 Min)');
  });
});

describe('owner booking email', () => {
  test('sends the owner the customer, Calendar, and Meet details', async () => {
    const send = jest.fn().mockResolvedValue({ messageId: 'email_123' });
    const response = await bookingEmailWorker.fetch({
      method: 'POST',
      url: 'https://booking-email.internal/notify',
      json: async () => ({
        eventId: 'calendar-event-123',
        calendarLink: 'https://calendar.google.com/event?eid=example',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        slotStartISO: '2026-09-15T21:00:00.000Z',
        timeZone: 'America/Chicago',
        customer: {
          fullName: 'Test Customer',
          email: 'test@example.com',
          phone: '555-0100',
        },
        amountTotal: 6999,
        currency: 'usd',
      }),
    }, {
      EMAIL: { send },
      OWNER_EMAIL: 'shalupatil15@gmail.com',
      SENDER_EMAIL: 'bookings@mail.property-folio.com',
      SENDER_NAME: 'Shalmali Patil Bookings',
    });

    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'shalupatil15@gmail.com',
      replyTo: 'test@example.com',
      subject: expect.stringContaining('New consultation booked'),
      text: expect.stringContaining('https://meet.google.com/abc-defg-hij'),
      headers: { 'X-Booking-Event-ID': 'calendar-event-123' },
    }));
    expect(send.mock.calls[0][0].text).toContain('$69.99');
  });
});
