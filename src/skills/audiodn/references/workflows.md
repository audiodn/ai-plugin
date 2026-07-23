# Workflows

Guided flows for common AudioDN tasks. On Cursor and Claude these are also slash
commands; on OpenAI/Codex, follow them here. Every workflow is inspect-first:
detect the framework, reuse existing auth/server routes, and resolve the upload
decision and the playback decision independently
(`references/choosing-an-integration.md`) before editing.

## Add upload

1. Pick the upload terminal: who creates/authorizes the session (Client-Side
   Upload key in-client, or API Access key server-side) and whether files move
   through a web component (Uploader / (voice) Recorder) or a custom interface.
2. Create the collection if needed (`POST /v1/collection`) and store `collection_id`.
3. Create an upload session, then a **separate per-track** request
   (`POST /v1/upload/{upload_session_id}/track`) for each file; PUT bytes to the
   returned short-lived `track_upload.upload_url`. (Single-file uploads may nest a
   `track` on session create to get the first upload URL in one request.)
4. Persist the returned `track_id`. For client-side uploads, relay success and the
   durable IDs (and stored `track.base_url`) to your server. Gate playback on
   readiness (poll or webhook). Full detail: `references/upload-flow.md`.

## Add playback

1. Ensure the track is `ready` (or usable `incomplete`).
2. Pick the playback terminal: create a play session (API Access key server-side,
   **or** a scoped Client-Side Player key in-client), **or** sign a delivery URL
   with a URL Signing key (no play session), **or** embed `<audiodn-player>`.
   Consumers include the Player component, a custom player, downloads, or a
   programmatic/non-visual consumer.
3. Never put an API Access key in client code; never set both `api-key` and a
   session ID on a component. Detail: `references/playback-and-delivery.md`,
   `references/web-components.md`.

## Build an audio site

1. Decide fit, then the upload and playback terminals independently (`references/choosing-an-integration.md`).
2. Add the upload flow, a processing-readiness gate, and playback (session or
   components). Link to canonical docs instead of pasting large sections.
3. Describe format standardization via variants — not loudness/LUFS.

## Audit an integration

1. Scan for API Access keys in client/mobile/`public` code.
2. Confirm upload uses session + per-track create + short-lived `upload_url`.
3. Confirm playback waits for readiness and keeps one terminal per surface (no
   mixed credentials, no signed URLs fed to the ADN Player).
4. Confirm the API host is `api.audiodelivery.net` for `/v1/`; no invented
   endpoints; secrets not logged.
5. Run the validator: `node skills/audiodn/scripts/validate-audiodn-project.mjs .`

For reading catalog/metadata (fetch track/collection info), see
`references/reading-catalog.md`; for event-driven sync, `references/webhooks.md`.
