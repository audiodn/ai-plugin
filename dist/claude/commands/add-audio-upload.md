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

Follow `skills/audiodn/references/upload-flow.md`:

1. Server creates `POST /v1/upload_session` with Bearer API Access key from env.
2. For each file, create a track via `POST /v1/upload/{upload_session_id}/track`.
3. Client or server PUTs bytes to `track_upload.upload_url`.
4. Document readiness polling/webhook before playback.

Creating an upload session does not itself return the final upload URL for each
track. Each track requires its own track-creation request.

## After editing

- Validate paths against OpenAPI.
- Run project tests if present.
- Run `node skills/audiodn/scripts/validate-audiodn-project.mjs .`
- Report unresolved product decisions (collection IDs, variant indexes, webhooks) instead of inventing them.
