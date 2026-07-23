# Playback and delivery

Gate all delivery on processing readiness. Pick one playback terminal per surface
(`references/choosing-an-integration.md`) and keep it consistent.

Consumers are broad: the ADN Player component, a custom web/native player,
**downloads**, or a **programmatic / non-visual** consumer (e.g. telephony /
answering-machine playback). A server-created session returns signed variant URLs
any of these can use.

## Play sessions (per-listener)

`POST /v1/play_session/{scope}`, scope `track` or `collection` (`playlist` is
reserved and returns 400). Authorized by a **Bearer** key that is **either** an
API Access key on the server **or** a scoped Client-Side Player key used
in-client (the two calls look nearly identical; only the key differs):

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

Sign delivery URLs on your server or edge with a URL Signing key (HMAC-SHA256),
bypassing play sessions and the ADN round trip at play time. Append the `verify`
query parameter **last**. The signing secret never goes to the client. Deliver the
signed URL to the client directly or via a server redirect. This skips play
sessions entirely — do not also mint a play session for the same stream, and do
not feed signed URLs to the ADN Player (the player accepts only a client key or
`play-session-id`).

Build the URL to sign from the `track.base_url` returned by every
track-creation response (a durable prefix on the organization's unique
`audiodelivery.net` subdomain): append the variant suffix and extension, e.g.
`{base_url}_128.mp3`, then sign. `track.base_path` is the same prefix without
the host, for when you construct the host yourself.

## Inline share

Documented separately: stream via share key path on the API host (302). Prefer
OpenAPI + share docs; do not invent paths.

## Components

Pass a Client-Side Player key **or** a server-provisioned `play-session-id` to
`<audiodn-player>` — never both, and never an API Access key. See
`references/web-components.md`.

Canonical: https://audiodeliverynetwork.com/docs/api/play-sessions and
https://audiodeliverynetwork.com/docs/integration/playback?playback=signed-delivery
OpenAPI: `createPlaySession`, `getPlayTrack`, `downloadPlayTrackVariant`.
