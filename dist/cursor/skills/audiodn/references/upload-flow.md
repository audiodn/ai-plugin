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

5. **Wait for processing readiness** — poll `GET /v1/track/{track_id}` (Bearer) until a terminal status, or use the Track Processing webhook.

6. **Request playback or delivery** only after the required variant/track file is ready.

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
