---
name: store-agent-audio
description: Store audio this agent generated or found in AudioDN so it can be played, previewed, and reused
---

# Store agent audio in AudioDN

Use this when the user wants a durable place to keep audio from the session
(generated files, downloads, voice notes, repo assets) — not only when building
an upload UI.

## Before doing anything

1. Confirm an **API Access** key is configured in the host (Cursor: **Plugins →
   AudioDN → Configure** → `ADN_API_KEY`). Do not write the key into the repo.
   Knowledge MCP tools work without it; storing and playback need the key so live
   tools appear (`adn_list_collections`, `adn_create_upload_session`, …).
2. Locate the audio files on disk (path, filename, MIME/extension).
3. Reuse an existing collection if the user has one; otherwise create one
   (for example “Cursor agent audio”). Persist `collection_id`.

## Store each file

Follow `skills/audiodn/references/upload-flow.md`:

1. `adn_create_upload_session` (or `POST /v1/upload_session`) with `collection_id`.
2. For **each** file, `adn_create_track_in_upload_session` (or
   `POST /v1/upload/{upload_session_id}/track`) with `file_name`.
3. PUT the bytes to `track_upload.upload_url` (method is PUT). Do not store that URL.
4. Persist `track_id`. Poll `adn_get_track` until `track.track_status_id` is
   `ready` (or report a terminal error). Do not play before readiness.

Creating an upload session does not itself return the final upload URL for each
track. Each track requires its own track-creation request.

## Then use it

Pick what the user asked for — they can mix these:

- **Preview / play now:** `adn_create_play_session` (`scope: track`) and hand
  back time-gated variant URLs. Do not persist signed URLs.
- **Keep in the app:** save `collection_id` + `track_id` (and variant `index`
  values) in the project; later playback uses a play session or
  `<audiodn-player>` with a Client-Side Player key or server-minted session.
- **Share a clip:** wait for readiness, then a preview variant or a
  server-signed delivery URL (`skills/audiodn/references/playback-and-delivery.md`).

Never put the API Access key in client or component code. Never set both
`api-key` and a session ID on a component.

## After

Report collection/track IDs, readiness, and how to play or preview. Do not
invent variant indexes — list org variants with MCP or OpenAPI first.
