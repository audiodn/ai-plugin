# Workflows

Guided flows for common AudioDN tasks. On Cursor and Claude these are also slash
commands; on OpenAI/Codex, follow them here. Every workflow is inspect-first:
detect the framework, reuse existing auth/server routes, and pick one integration
path (`references/choosing-an-integration.md`) before editing.

## Add upload

1. Choose the path (Web / Mobile / Server-side / Hybrid) for the upload surface.
2. Create the collection if needed (`POST /v1/collection`) and store `collection_id`.
3. Create an upload session, then a **separate per-track** request
   (`POST /v1/upload/{upload_session_id}/track`) for each file; PUT bytes to the
   returned short-lived `track_upload.upload_url`.
4. Persist the returned `track_id`. Gate playback on readiness (poll or webhook).
   Full detail: `references/upload-flow.md`.

## Add playback

1. Ensure the track is `ready` (or usable `incomplete`).
2. Create a play session (server API Access key, or client-side key on Mobile),
   **or** sign a delivery URL (Signed delivery), **or** embed `<audiodn-player>`.
3. Never put an API Access key in client code; never set both `api-key` and a
   session ID on a component. Detail: `references/playback-and-delivery.md`,
   `references/web-components.md`.

## Build an audio site

1. Decide fit and path (`references/choosing-an-integration.md`).
2. Add the upload path, a processing-readiness gate, and playback (session or
   components). Link to canonical docs instead of pasting large sections.
3. Describe format standardization via variants — not loudness/LUFS.

## Audit an integration

1. Scan for API Access keys in client/mobile/`public` code.
2. Confirm upload uses session + per-track create + short-lived `upload_url`.
3. Confirm playback waits for readiness and stays on one path (no mixed
   credentials, no signed URLs fed to the ADN Player).
4. Confirm the API host is `api.audiodelivery.net` for `/v1/`; no invented
   endpoints; secrets not logged.
5. Run the validator: `node skills/audiodn/scripts/validate-audiodn-project.mjs .`

For reading catalog/metadata (fetch track/collection info), see
`references/reading-catalog.md`; for event-driven sync, `references/webhooks.md`.
