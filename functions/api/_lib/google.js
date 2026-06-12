// Google Calendar integration: OAuth (refresh→access token, code exchange),
// free/busy lookups, and event creation with an auto Google Meet link + invites.

import { CONSULTATION, GOOGLE_SCOPES } from './config.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CAL_BASE = 'https://www.googleapis.com/calendar/v3';

// Consent URL for the one-time "Connect Google" admin flow.
export function buildConsentUrl({ clientId, redirectUri, state }) {
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent', // force a refresh_token to be returned
    include_granted_scopes: 'true',
    scope: GOOGLE_SCOPES.join(' '),
    state: state || '',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export async function exchangeCodeForTokens(env, code, redirectUri) {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google token exchange failed: ${data.error_description || data.error || res.status}`);
  return data; // { access_token, refresh_token, expires_in, ... }
}

export async function getAccessToken(env, refreshToken) {
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google access-token refresh failed: ${data.error_description || data.error || res.status}`);
  return data.access_token;
}

// Busy intervals [{start: ms, end: ms}] on the owner's calendar in a window.
export async function getBusyIntervals(accessToken, timeMinISO, timeMaxISO, calendarId = CONSULTATION.calendarId) {
  const res = await fetch(`${CAL_BASE}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin: timeMinISO, timeMax: timeMaxISO, items: [{ id: calendarId }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google freeBusy failed: ${JSON.stringify(data.error || data)}`);
  const cal = (data.calendars && data.calendars[calendarId]) || {};
  return (cal.busy || []).map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
}

// Create the booking event with a Google Meet link; emails invites to attendees.
export async function createCalendarEvent(accessToken, {
  startISO, endISO, summary, description, attendees,
  calendarId = CONSULTATION.calendarId, timeZone = CONSULTATION.timeZone,
}) {
  const event = {
    summary,
    description,
    start: { dateTime: startISO, timeZone },
    end: { dateTime: endISO, timeZone },
    attendees: attendees || [],
    conferenceData: {
      createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
    },
    reminders: { useDefault: true },
  };
  const url = `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google event create failed: ${JSON.stringify(data.error || data)}`);
  let meetLink = data.hangoutLink || null;
  if (!meetLink && data.conferenceData?.entryPoints) {
    const vid = data.conferenceData.entryPoints.find((e) => e.entryPointType === 'video');
    meetLink = vid ? vid.uri : null;
  }
  return { eventId: data.id, meetLink, htmlLink: data.htmlLink || null };
}
