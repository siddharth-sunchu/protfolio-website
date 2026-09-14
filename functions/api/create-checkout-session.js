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

const CONSULTATION_AMOUNT_CENTS = 6999; // $69.99
const PRODUCT_NAME = 'EB-1A Consultation (60 Min)';

export async function onRequestPost(context) {
  const { request, env } = context;

  const stripeSecretKey = env.STRIPE_SECRET_KEY || env.STRIPE_TEST_SECRET_KEY;
  if (!stripeSecretKey) {
    return json({ error: 'Payments are not configured (missing STRIPE_SECRET_KEY).' }, 500);
  }

  const origin = env.SITE_URL || new URL(request.url).origin;

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('branding_settings[display_name]', 'Shalmali Patil');
  body.set('branding_settings[logo][type]', 'url');
  body.set('branding_settings[logo][url]', 'https://www.shalmalipatil.com/initials.svg');
  // Stripe replaces {CHECKOUT_SESSION_ID} with the real id on redirect.
  body.set('success_url', `${origin}/?paid=true&session_id={CHECKOUT_SESSION_ID}#booking`);
  body.set('cancel_url', `${origin}/#booking`);
  body.set('line_items[0][quantity]', '1');
  const isTestMode = stripeSecretKey.startsWith('sk_test_');
  const priceId = isTestMode ? env.STRIPE_TEST_PRICE_ID : env.STRIPE_PRICE_ID;
  if (priceId) {
    body.set('line_items[0][price]', priceId);
  } else {
    body.set('line_items[0][price_data][currency]', 'usd');
    body.set('line_items[0][price_data][unit_amount]', String(CONSULTATION_AMOUNT_CENTS));
    body.set('line_items[0][price_data][product_data][name]', PRODUCT_NAME);
  }
  // Show the "Add promotion code" field on the hosted checkout page so customers
  // can enter a coupon (e.g. SHALWEDECODE70 for 70% off). Stripe validates and
  // applies the discount; only codes that exist in this Stripe account work.
  body.set('allow_promotion_codes', 'true');

  let stripeRes;
  try {
    stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        // Pin the stable version that supports per-session Checkout branding.
        'Stripe-Version': '2025-09-30.clover',
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
