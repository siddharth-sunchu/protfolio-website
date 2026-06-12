// POST /api/stripe-webhook — the authoritative confirmation path.
// checkout.session.completed -> finalize (create calendar event + Meet + invite).
// checkout.session.expired   -> release the unpaid hold so the slot reopens.

import { verifyWebhook } from './_lib/stripe.js';
import { finalizePaidSession } from './_lib/finalize.js';
import { releaseHold } from './_lib/reservations.js';

export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('stripe-signature');
  const raw = await request.text(); // RAW body is required for signature verification

  let event;
  try {
    event = await verifyWebhook(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid') await finalizePaidSession(env, session);
    } else if (event.type === 'checkout.session.expired') {
      await releaseHold(env.DB, event.data.object.id);
    }
  } catch (e) {
    // 500 -> Stripe retries (handles transient Google errors).
    return new Response('Handler error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
}
