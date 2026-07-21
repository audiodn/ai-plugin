# Choosing an integration

Inspect the existing project framework, auth, and server routes before adding
AudioDN. Prefer extending what exists.

AudioDN has **five canonical integration paths**. Pick exactly one path per
surface and keep it internally consistent. Upload and playback may use different
paths, but each surface follows a single path end to end. Do not blend
credentials or flows from different paths.

## The five paths

### Web (components + client-side key)

- **Credential:** Client-Side Player / Uploader key embedded in the component.
- **Sessions:** the component creates play/upload sessions internally.
- **Responsibilities:** no backend required; the component handles all API calls.
- **Playback:** `<audiodn-player>`.
- **Best for:** prototypes, static sites, MVPs, admin tools.
- Docs: https://audiodeliverynetwork.com/docs/integration/web/

### Mobile (native + client-side key)

- **Credential:** Client-Side Player / Uploader key used from native code as
  `Authorization: Bearer <client-side key>`.
- **Sessions:** the app creates play/upload sessions directly, then uses the
  returned session ID (no auth header) for follow-up calls.
- **Responsibilities:** native media players (AVPlayer / ExoPlayer / just_audio).
- **Best for:** iOS, Android, Flutter apps.
- Docs: https://audiodeliverynetwork.com/docs/integration/mobile/

### Server-side (direct API, custom UI)

- **Credential:** API Access key (Bearer), server only.
- **Sessions:** the server creates play/upload sessions and fetches signed
  variant URLs.
- **Responsibilities:** fully custom upload/player UI; no AudioDN components.
- **Best for:** custom platforms, enterprise, full API control. May also sign
  delivery URLs for public tracks (see Signed delivery).
- Docs: https://audiodeliverynetwork.com/docs/integration/server-side/

### Hybrid (server sessions + components)

- **Credential:** API Access key (Bearer) on the server only.
- **Sessions:** the server mints upload/play sessions (applying entitlement /
  subscription / purchase checks), then passes only the `play-session-id` /
  `upload-session-id` to the component.
- **Responsibilities:** backend controls who can upload/play; the component
  handles the UI. The client never holds a key.
- **Best for:** SaaS, paywalled content, multi-tenant apps.
- Docs: https://audiodeliverynetwork.com/docs/integration/hybrid/

### Signed delivery (HMAC URLs, play-session-free)

- **Credential:** URL Signing key (HMAC-SHA256), server / edge only.
- **Sessions:** none — you sign the delivery URL yourself and skip play sessions.
- **Responsibilities:** sign on the server; the `verify` query parameter must be
  appended **last**; the signing secret never reaches the client.
- **Playback:** native `<audio>` / custom player. **Does not work with the ADN
  Player component** (the player takes only a client key or `play-session-id`).
- **Best for:** public catalogs, marketing sites, previews. Every signed request
  counts toward play usage.
- Docs: https://audiodeliverynetwork.com/docs/integration/signed-delivery/

## Decision guide

| Situation | Path |
|-----------|------|
| Quick web embed, no backend | Web |
| iOS / Android / Flutter app | Mobile |
| Fully custom UI / enterprise API control | Server-side |
| Multi-tenant SaaS, paywalled, per-listener auth | Hybrid |
| Public catalog / previews, no per-play auth | Signed delivery |
| Offline DAW, WebRTC realtime, or LUFS mastering | AudioDN is likely the wrong fit (no loudness/LUFS mastering) |

## Do not mix paths

- Pick one path per surface. Do not combine credentials or flows from different
  paths on the same surface.
- Never set both `api-key` and `play-session-id` / `upload-session-id` on the
  same component — choose one (Web vs Hybrid).
- Never place an API Access (Bearer) key in a browser, mobile app, or component.
  Client contexts get a scoped Client-Side key or a session ID.
- Signed delivery is play-session-free: do not also create a play session for the
  same stream, and do not feed signed URLs to the ADN Player.

## Security boundary (always)

- API Access keys stay on the server (env / secret store).
- Browsers and mobile apps get Client-Side Player/Uploader keys (documented
  scopes only) or short-lived session IDs / signed URLs.
- Agents must not silently enable destructive delete operations.

## Related AudioDN packages

| Package / resource | Role |
|--------------------|------|
| This plugin | Marketplace skills, workflows, MCP wiring for coding agents |
| `@audiodn/mcp` | MCP server (stdio or hosted HTTP) |
| `@audiodn/agent-kit` | Installs guidance files into a project (`AGENTS.md`, rules, skill copy) |
| `@audiodn/components` | Web components |

Do not duplicate documentation wholesale; link to canonical docs and OpenAPI.
