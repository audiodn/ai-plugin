---
name: add-audio-upload
description: Add a secure AudioDN upload flow so the app can store user or agent audio
---

# Add AudioDN upload

## Before editing

1. Inspect the project framework, existing auth, API routes, and env patterns.
2. Pick the upload terminal: who creates/authorizes the session (Client-Side
   Upload key in-client, or API Access key server-side) and whether files move
   through a web component (Uploader / (voice) Recorder) or a custom interface
   (`skills/audiodn/references/choosing-an-integration.md`).
3. Do not introduce a parallel auth system or expose API Access keys to clients.

## Implement

Follow `skills/audiodn/references/upload-flow.md` (terminal selection:
`skills/audiodn/references/choosing-an-integration.md`; guided steps:
`skills/audiodn/references/workflows.md`):

1. Create the collection if needed (`POST /v1/collection`) and store `collection_id` (`skills/audiodn/references/reading-catalog.md`).
2. Create `POST /v1/upload_session` with a Bearer key (API Access server-side, or a scoped Client-Side key in-client).
3. For each file, create a track via `POST /v1/upload/{upload_session_id}/track`.
4. Client or server PUTs bytes to `track_upload.upload_url`; persist the returned `track_id`.
5. Document readiness polling/webhook before playback (`skills/audiodn/references/webhooks.md`).

Creating an upload session does not itself return the final upload URL for each
track. Each track requires its own track-creation request.

## After editing

- Validate paths against OpenAPI.
- Run project tests if present.
- Run `node skills/audiodn/scripts/validate-audiodn-project.mjs .`
- Report unresolved product decisions (collection IDs, variant indexes, webhooks) instead of inventing them.
