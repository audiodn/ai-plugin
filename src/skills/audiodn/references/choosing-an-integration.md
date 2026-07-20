# Choosing an integration

Inspect the existing project framework, auth, and server routes before adding
AudioDN. Prefer extending what exists.

## Decision guide

| Situation | Prefer |
|-----------|--------|
| Quick web embed / admin tools | Web components (`<audiodn-uploader>`, `<audiodn-player>`) with scoped client keys or session IDs |
| Mobile or custom UI | Direct API from your backend; pass session IDs or signed URLs to clients |
| Multi-tenant SaaS | Hybrid: server mints upload/play sessions; client never holds API Access keys |
| Agent scaffolding / docs lookup | Hosted MCP knowledge tools; live API tools only with a secured API Access key |
| Public catalog with entitlement | Signed delivery (HMAC) from server/edge |
| Offline DAW, WebRTC realtime, or LUFS mastering | AudioDN is likely the wrong fit (no loudness/LUFS mastering) |

## Security boundary (always)

- API Access keys stay on the server (env / secret store).
- Browsers and mobile apps get Client-Side Player/Uploader keys (documented scopes only) or short-lived session IDs / signed URLs.
- Agents must not silently enable destructive delete operations.

## Related AudioDN packages

| Package / resource | Role |
|--------------------|------|
| This plugin | Marketplace skills, workflows, MCP wiring for coding agents |
| `@audiodn/mcp` | MCP server (stdio or hosted HTTP) |
| `@audiodn/agent-kit` | Installs guidance files into a project (`AGENTS.md`, rules, skill copy) |
| `@audiodn/components` | Web components |

Do not duplicate documentation wholesale; link to canonical docs and OpenAPI.
