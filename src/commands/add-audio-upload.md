---
name: add-audio-upload
description: Add a secure AudioDN upload flow to the current project (inspect-first)
---

# Add AudioDN upload

## Before editing

1. Inspect the project framework, existing auth, API routes, and env patterns.
2. Confirm whether web components, direct API, or hybrid fit best.
3. Do not introduce a parallel auth system or expose API Access keys to clients.

## Implement

Follow `skills/audiodn/references/upload-flow.md` (path selection:
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
