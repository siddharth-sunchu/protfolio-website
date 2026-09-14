const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatWhen = (iso, timeZone) => new Intl.DateTimeFormat('en-US', {
  timeZone,
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
}).format(new Date(iso));

const formatMoney = (amount, currency) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: String(currency || 'usd').toUpperCase(),
}).format(Number(amount || 0) / 100);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/notify') {
      return new Response('Not found', { status: 404 });
    }

    const booking = await request.json().catch(() => null);
    if (!booking?.slotStartISO || !booking?.customer?.fullName || !booking?.customer?.email) {
      return json({ error: 'Invalid booking payload' }, 400);
    }

    const timeZone = booking.timeZone || 'America/Chicago';
    const when = formatWhen(booking.slotStartISO, timeZone);
    const amount = formatMoney(booking.amountTotal, booking.currency);
    const name = String(booking.customer.fullName);
    const email = String(booking.customer.email);
    const phone = String(booking.customer.phone || 'Not provided');
    const calendarLink = String(booking.calendarLink || '');
    const meetLink = String(booking.meetLink || '');

    const text = [
      `New consultation booked for ${when}`,
      '',
      `Customer: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Paid: ${amount}`,
      meetLink ? `Google Meet: ${meetLink}` : '',
      calendarLink ? `Open in Google Calendar: ${calendarLink}` : '',
    ].filter(Boolean).join('\n');

    const links = [
      calendarLink ? `<p><a href="${escapeHtml(calendarLink)}">Open in Google Calendar</a></p>` : '',
      meetLink ? `<p><a href="${escapeHtml(meetLink)}">Open Google Meet</a></p>` : '',
    ].join('');

    const result = await env.EMAIL.send({
      to: env.OWNER_EMAIL,
      from: { email: env.SENDER_EMAIL, name: env.SENDER_NAME },
      replyTo: email,
      subject: `New consultation booked — ${when}`,
      text,
      html: `
        <h2>New consultation booked</h2>
        <p><strong>${escapeHtml(when)}</strong></p>
        <p>
          Customer: ${escapeHtml(name)}<br>
          Email: ${escapeHtml(email)}<br>
          Phone: ${escapeHtml(phone)}<br>
          Paid: ${escapeHtml(amount)}
        </p>
        ${links}
      `,
      headers: booking.eventId ? { 'X-Booking-Event-ID': String(booking.eventId) } : undefined,
    });

    return json({ sent: true, messageId: result.messageId });
  },
};
