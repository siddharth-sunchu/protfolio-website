// Cloudflare Pages Function — GET /api/verify-session?session_id=cs_...
//
// Confirms with Stripe that the checkout session was actually paid, and only
// then returns the Calendly scheduling URL. The Calendly URL is held in a
// server-side environment variable (never shipped in the page bundle) so the
// scheduler cannot be opened from page source without a verified payment.
//
// Required environment variables (set in Cloudflare Pages → Settings → Variables):
//   STRIPE_SECRET_KEY   e.g. sk_live_... (or sk_test_... for testing)
//   CALENDLY_URL        e.g. https://calendly.com/shalupatil15/30min

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return json({ paid: false, error: 'Payments are not configured.' }, 500);
  }

  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) {
    return json({ paid: false, error: 'Missing session_id.' }, 400);
  }

  let stripeRes;
  try {
    stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2023-10-16',
        },
      },
    );
  } catch (err) {
    return json({ paid: false, error: 'Could not reach the payment provider.' }, 502);
  }

  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    return json({ paid: false, error: session?.error?.message || 'Could not verify payment.' }, 502);
  }

  // payment_status is 'paid' only once the charge has actually succeeded.
  if (session.payment_status !== 'paid') {
    return json({ paid: false });
  }

  if (!env.CALENDLY_URL) {
    return json({ paid: false, error: 'Scheduling is not configured (missing CALENDLY_URL).' }, 500);
  }

  return json({ paid: true, calendlyUrl: env.CALENDLY_URL });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
