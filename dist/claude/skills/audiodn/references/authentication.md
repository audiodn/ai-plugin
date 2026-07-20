# Authentication

## Credential types

| Type | Where | Role |
|------|-------|------|
| **API Access** | Server only | Full API access via `Authorization: Bearer <key>`. Mint client keys; create upload/play sessions; manage resources. Created in the dashboard, not via public `POST /v1/api_key`. |
| **Client-Side Player** (`player`) | Browser / app / `<audiodn-player>` | Playback-scoped |
| **Client-Side Uploader** (`uploader`) | Browser / app / `<audiodn-uploader>` | Upload to a scoped collection |
| **Inline Share** (`share`) | Public share path | Single-variant inline share (dashboard) |
| **URL Signing key** | Server / edge only | HMAC-SHA256 signed delivery URLs |
| **Session IDs** | Path capability tokens | Authorize specific upload/play endpoints without Bearer |

`POST /v1/api_key` (Bearer required) can create `player`, `uploader`, or `share`
keys only.

## Session-gated endpoints (no Bearer)

- `GET /v1/upload_session/{upload_session_id}`
- `POST /v1/upload/{upload_session_id}/track`
- `GET /v1/play/{play_session_id}/{play_track_id}`
- `GET /v1/play/{play_session_id}/{play_track_id}/{variant_index}/download`

## Rules

- Secrets come from environment variables or the platform’s secure credential mechanism.
- Never hardcode `adn_...` keys or Bearer tokens in source, samples, or logs.
- Never put API Access keys in browser bundles, mobile apps, or `public/` assets.
- Client-side keys only in their documented component/API scopes.
- Errors typically use `{ ok: false, message, api_request_id }` with 400/401/404/500.

Canonical: https://audiodeliverynetwork.com/docs/api and
https://audiodeliverynetwork.com/openapi.json
