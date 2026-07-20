# Playback and delivery

Gate all delivery on processing readiness.

## Play sessions (per-listener)

`POST /v1/play_session/{scope}` (server, Bearer), scope `track` or `collection`
(`playlist` is reserved and returns 400):

- Body must include a non-empty `variants` array (OpenAPI), plus `track_id` or
  `collection_id`, optional `expires_in`, `is_downloadable`.
- Returns `play_session_id` and `first_track` with signed
  `variants[].url`, waveform `levels`, and cover sizes.
- More tracks: `GET /v1/play/{play_session_id}/{play_track_id}` (no Bearer —
  session ID authorizes).
- Downloads: `GET /v1/play/.../{variant_index}/download` only if the session is
  downloadable; response includes a short-lived download URL.

## Signed delivery (public / entitled)

Sign delivery URLs on your server or edge with a URL Signing key (HMAC-SHA256).
Append the `verify` query parameter last. The signing secret never goes to the
client. Suitable when play sessions are not required for every listen.

## Inline share

Documented separately: stream via share key path on the API host (302). Prefer
OpenAPI + share docs; do not invent paths.

## Components

Pass a Client-Side Player key **or** a server-provisioned `play-session-id` to
`<audiodn-player>`. Never embed an API Access key.

Canonical: https://audiodeliverynetwork.com/docs/api/play-sessions and
https://audiodeliverynetwork.com/docs/integration/signed-delivery  
OpenAPI: `createPlaySession`, `getPlayTrack`, `downloadPlayTrackVariant`.
