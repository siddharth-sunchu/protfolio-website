// Cloudflare Pages Function — POST /api/create-checkout-session
//
// Creates a Stripe Checkout Session server-side (using the secret key, which
// never reaches the browser) and returns the hosted-checkout URL. The resulting
// session id is later confirmed by /api/verify-session before the Calendly
// scheduler is revealed, so a booking cannot be reached without a real payment.
//
// Required environment variable (set in Cloudflare Pages → Settings → Variables):
//   STRIPE_SECRET_KEY   e.g. sk_live_... (or sk_test_... for testing)
// Optional:
//   SITE_URL            override the redirect origin (defaults to the request origin)

const CONSULTATION_AMOUNT_CENTS = 5000; // $50.00
const PRODUCT_NAME = 'EB-1A Consultation (30 Min)';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Payments are not configured (missing STRIPE_SECRET_KEY).' }, 500);
  }

  const origin = env.SITE_URL || new URL(request.url).origin;

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  // Stripe replaces {CHECKOUT_SESSION_ID} with the real id on redirect.
  body.set('success_url', `${origin}/?paid=true&session_id={CHECKOUT_SESSION_ID}#booking`);
  body.set('cancel_url', `${origin}/#booking`);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'usd');
  body.set('line_items[0][price_data][unit_amount]', String(CONSULTATION_AMOUNT_CENTS));
  body.set('line_items[0][price_data][product_data][name]', PRODUCT_NAME);
  // Show the "Add promotion code" field on the hosted checkout page so customers
  // can enter a coupon (e.g. SHALWEDECODE70 for 70% off). Stripe validates and
  // applies the discount; only codes that exist in this Stripe account work.
  body.set('allow_promotion_codes', 'true');

  let stripeRes;
  try {
    stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        // Pin a stable API version — this account's default version is newer and
        // rejects some long-standing parameters.
        'Stripe-Version': '2023-10-16',
      },
      body: body.toString(),
    });
  } catch (err) {
    return json({ error: 'Could not reach the payment provider. Please try again.' }, 502);
  }

  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    return json({ error: session?.error?.message || 'Could not start checkout.' }, 502);
  }

  return json({ url: session.url });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
