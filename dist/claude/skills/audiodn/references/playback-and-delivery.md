# Playback and delivery

Gate all delivery on processing readiness. Choose one integration path
(`references/choosing-an-integration.md`) and keep the surface consistent.

## Play sessions (per-listener)

`POST /v1/play_session/{scope}`, scope `track` or `collection` (`playlist` is
reserved and returns 400). Authorized by a **Bearer** key that is **either** an
API Access key server-side (Server-side / Hybrid) **or** a scoped Client-Side
Player key in-client (Mobile):

- Body must include a non-empty `variants` array (OpenAPI), plus `track_id` or
  `collection_id`, optional `expires_in` (seconds; default 3600, min 60, max
  86400) and `is_downloadable`.
- Returns `play_session_id` and `first_track` with signed `variants[].url`,
  waveform `levels`, and cover sizes.
- More tracks: `GET /v1/play/{play_session_id}/{play_track_id}` (no Bearer — the
  session ID authorizes).

## Downloads

Downloads require a session created with `is_downloadable: true`.

1. Create the play session with `is_downloadable: true` (and the download variant
   in `variants`).
2. `GET /v1/play/{play_session_id}/{play_track_id}/{variant_index}/download`
   (no Bearer) returns a short-lived download URL.
3. Serve that URL to the client, or use `<audiodn-player downloadable>` — the
   attribute only works when the underlying key/session permits downloads.

## Signed delivery (public / entitled)

Sign delivery URLs on your server or edge with a URL Signing key (HMAC-SHA256).
Append the `verify` query parameter **last**. The signing secret never goes to
the client. This path skips play sessions entirely — do not also mint a play
session for the same stream, and do not feed signed URLs to the ADN Player
(the player accepts only a client key or `play-session-id`).

## Inline share

Documented separately: stream via share key path on the API host (302). Prefer
OpenAPI + share docs; do not invent paths.

## Components

Pass a Client-Side Player key (Web path) **or** a server-provisioned
`play-session-id` (Hybrid path) to `<audiodn-player>` — never both, and never an
API Access key. See `references/web-components.md`.

Canonical: https://audiodeliverynetwork.com/docs/api/play-sessions and
https://audiodeliverynetwork.com/docs/integration/signed-delivery
OpenAPI: `createPlaySession`, `getPlayTrack`, `downloadPlayTrackVariant`.
