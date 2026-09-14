// Best-effort owner notification. The bound service can only email the verified
// owner address, so customer-supplied fields cannot turn this into an open relay.

export async function notifyOwnerOfBooking(env, booking) {
  if (!env.BOOKING_EMAIL) return { sent: false, reason: 'not_configured' };

  const response = await env.BOOKING_EMAIL.fetch('https://booking-email.internal/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    throw new Error(`Owner booking notification failed (${response.status})`);
  }
  return { sent: true };
}
