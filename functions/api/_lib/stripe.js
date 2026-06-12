// Stripe helpers (REST via fetch — no SDK, Workers-native). Includes manual
// webhook signature verification using Web Crypto.

import { CONSULTATION, STRIPE_API_VERSION } from './config.js';

const STRIPE_BASE = 'https://api.stripe.com/v1';

function authHeaders(env) {
  return { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Stripe-Version': STRIPE_API_VERSION };
}

export async function createCheckoutSession(env, {
  slotStartISO, firstName, lastName, email, phone, successUrl, cancelUrl, expiresAtUnix,
}) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('allow_promotion_codes', 'true');
  body.set('expires_at', String(expiresAtUnix));
  if (email) body.set('customer_email', email);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', CONSULTATION.currency);
  body.set('line_items[0][price_data][unit_amount]', String(CONSULTATION.priceCents));
  body.set('line_items[0][price_data][product_data][name]', CONSULTATION.productName);
  // Slot + contact data ride along as metadata so the webhook can finalize the booking.
  body.set('metadata[slot_start]', slotStartISO);
  body.set('metadata[first_name]', firstName || '');
  body.set('metadata[last_name]', lastName || '');
  body.set('metadata[phone]', phone || '');

  const res = await fetch(`${STRIPE_BASE}/checkout/sessions`, {
    method: 'POST',
    headers: { ...authHeaders(env), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe session create failed');
  return data;
}

export async function retrieveSession(env, sessionId) {
  const res = await fetch(`${STRIPE_BASE}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: authHeaders(env),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe session retrieve failed');
  return data;
}

// Verify a Stripe webhook signature manually (HMAC-SHA256 over `${t}.${rawBody}`).
// `payload` MUST be the raw, unparsed request body string. Returns the parsed event.
export async function verifyWebhook(payload, sigHeader, secret) {
  const parts = Object.fromEntries(
    (sigHeader || '').split(',').map((kv) => kv.split('=').map((s) => s.trim())),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) throw new Error('Missing signature');

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, '0')).join('');

  if (expected.length !== v1.length) throw new Error('Signature mismatch');
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  if (diff !== 0) throw new Error('Signature mismatch');
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) throw new Error('Timestamp outside tolerance');

  return JSON.parse(payload);
}
