# Upload flow

The upload lifecycle is multi-step. A session alone uploads nothing.

> Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.

## Required sequence

1. **Create an upload session** (server, Bearer)  
   `POST /v1/upload_session`  
   Body typically includes `collection_id` (and optional metadata / `expires_in`).  
   Returns `upload_session_id`.

2. **Create a separate track inside that upload session** (no Bearer — session ID is the credential)  
   `POST /v1/upload/{upload_session_id}/track`  
   Body includes `file_name` (and related track fields as documented).  
   Returns `track_id` and `track_upload` with `method`, `upload_url`, TTL/expiry.

3. **Receive the track-specific upload URL** from that track-creation response  
   (`track_upload.upload_url`). Do this once per file.

4. **Upload bytes** to that URL using `track_upload.method` (typically `PUT`).  
   The URL is short-lived and single-use — do not store it in a database or config.

5. **Wait for processing readiness** — poll `GET /v1/track/{track_id}` (Bearer) until a terminal status, or use the Track Processing webhook (preferred in production; see `references/webhooks.md`).

6. **Request playback or delivery** only after the required variant/track file is ready.

## Persist the IDs (link uploads to playback)

The upload returns **durable** handles — store these in your database and treat
them as the long-lived reference to the audio:

- `track_id` — the durable ID for one track.
- `collection_id` — the durable grouping the track belongs to.
- variant delivery `index` (e.g. `hq`, `lq`) — the durable variant selector.

Later, create a play session (or sign a delivery URL) from the stored
`track_id` / `collection_id` to play or download — that is how an upload links to
playback.

Do **not** store these **ephemeral** values; re-request them when needed:

- `track_upload.upload_url` (short-lived, single-use)
- `upload_session_id` / `play_session_id` (short-lived capability tokens)
- signed delivery URLs (expire on the signature TTL)

## Optional convenience (first file only)

OpenAPI allows an optional nested `track` object on `POST /v1/upload_session`,
which may return a first-file `track_upload`. That does **not** replace the rule
above for multi-track uploads: every additional track still needs
`POST /v1/upload/{upload_session_id}/track`. Prefer teaching the explicit
per-track request so agents never skip step 2.

## Critical pitfalls

- Expecting `upload_url` from session create alone
- Treating `upload_url` as permanent
- Starting playback before `track_status_id` is ready (or terminal `incomplete` with a usable file)
- Using the marketing host for `/v1/` calls

Canonical: https://audiodeliverynetwork.com/docs/api/upload-sessions  
OpenAPI operationIds: `createUploadSession`, `createUploadSessionTrack`.
