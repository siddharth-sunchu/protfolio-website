// GET /api/google/oauth/start?key=ADMIN_SETUP_TOKEN — one-time admin endpoint.
// Redirects the owner to Google's consent screen to connect their calendar.

import { buildConsentUrl } from '../../_lib/google.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.ADMIN_SETUP_TOKEN || url.searchParams.get('key') !== env.ADMIN_SETUP_TOKEN) {
    return new Response('Forbidden', { status: 403 });
  }
  const redirectUri = `${url.origin}/api/google/oauth/callback`;
  const consent = buildConsentUrl({
    clientId: env.GOOGLE_CLIENT_ID,
    redirectUri,
    state: env.ADMIN_SETUP_TOKEN,
  });
  return Response.redirect(consent, 302);
}
