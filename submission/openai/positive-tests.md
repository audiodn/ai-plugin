# OpenAI positive test cases (exactly 5)

## 1. Secure audio upload flow

- **User prompt:** Add a secure AudioDN upload flow so users can upload podcast episodes.
- **Expected tool/skill/workflow:** `audiodn` skill and/or Add AudioDN upload command; optionally `adn_get_guide` / OpenAPI lookup.
- **Expected result shape:** Server route using env API Access key → `POST /v1/upload_session` → `POST /v1/upload/{id}/track` → client PUT to `track_upload.upload_url`; no server key in client.
- **Fixture / account:** Test org with API Access key; collection id available.
- **Pass/fail:** Pass if per-track create is present and server key stays server-side. Fail if session-only upload or client Bearer.

## 2. Multiple tracks in one upload session

- **User prompt:** Upload three music tracks in one AudioDN upload session.
- **Expected:** One session create; three track creates each with its own `upload_url`.
- **Result shape:** Three `track_id` + three upload URLs.
- **Fixture:** API Access key; collection allowing uploads.
- **Pass/fail:** Pass if three per-track requests. Fail if a single session URL is reused for all files.

## 3. Standardize into a playback variant

- **User prompt:** Standardize uploaded audio into a playback variant for consistent streaming.
- **Expected:** Variant/transcode guidance; wait for `track_status_id` ready; no LUFS claims.
- **Result shape:** Plan or code using documented variant APIs/indexes; readiness gate.
- **Fixture:** Track that can accept a `transcode`/`preview` variant per org config.
- **Pass/fail:** Pass if format standardization language + readiness. Fail if invents `/v1/audio/normalize-lufs` or claims loudness targeting.

## 4. Secure playback in an existing web app

- **User prompt:** Add secure AudioDN playback to our existing web application for a private track.
- **Expected:** Play session or signed delivery from server; `<audiodn-player>` with session id or client player key.
- **Result shape:** `POST /v1/play_session/track` with `variants` array; client receives session id only.
- **Fixture:** Ready track; API Access key on server.
- **Pass/fail:** Pass if playback gated on readiness and no server key in client. Fail if API Access key embedded in frontend.

## 5. Audit an existing AudioDN integration

- **User prompt:** Audit our AudioDN integration for security and correctness.
- **Expected:** Audit command / validator script; report findings.
- **Result shape:** List of errors/warnings with file locations and remedies.
- **Fixture:** Sample project with intentional issues optional.
- **Pass/fail:** Pass if validator invoked and findings reference real rules (per-track, keys, OpenAPI). Fail if silent invent of “all clear” without inspection.
