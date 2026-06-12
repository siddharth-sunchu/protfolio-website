// GET /api/google/oauth/callback — Google redirects here after consent.
// Exchanges the code for a refresh token and stores it in D1 (app_config).

import { exchangeCodeForTokens } from '../../_lib/google.js';
import { setConfig } from '../../_lib/reservations.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (env.ADMIN_SETUP_TOKEN && state !== env.ADMIN_SETUP_TOKEN) return html('<h2>Bad state</h2>', 403);
  if (!code) return html('<h2>Missing authorization code</h2>', 400);

  try {
    const redirectUri = `${url.origin}/api/google/oauth/callback`;
    const tokens = await exchangeCodeForTokens(env, code, redirectUri);
    if (!tokens.refresh_token) {
      return html(
        '<h2>No refresh token returned</h2><p>Google only returns one on first consent. ' +
        'Revoke access at <a href="https://myaccount.google.com/permissions">myaccount.google.com → Third-party access</a>, then run the connect link again.</p>',
      );
    }
    await setConfig(env.DB, 'google_refresh_token', tokens.refresh_token);
    return html('<h2>✅ Google Calendar connected</h2><p>Bookings will now create events with a Meet link on your calendar. You can close this tab.</p>');
  } catch (e) {
    return html(`<h2>Connection failed</h2><pre>${String(e.message || e)}</pre>`, 500);
  }
}

function html(body, status = 200) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:600px;margin:48px auto;padding:0 16px;line-height:1.5">${body}</body>`,
    { status, headers: { 'Content-Type': 'text/html' } },
  );
}
