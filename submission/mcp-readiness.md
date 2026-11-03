# MCP readiness audit (OpenAI / marketplace)

**Audited:** 2026-11-03  
**Hosted URL:** `https://mcp.audiodelivery.net/mcp`  
**Registry:** `net.audiodelivery/mcp`  
**npm:** `@audiodn/mcp` (local source audited at 0.4.0)  
**Script:** `node scripts/audit-mcp.mjs` (reads `mcp/src/tools/types.ts` and tool inventories)

## Transport / auth

| Mode | Auth |
|------|------|
| Hosted Streamable HTTP | OAuth 2.1 (authorization code + PKCE) against AudioDN account. Legacy API Access key via `Authorization: Bearer` / `X-ADN-API-Key` still works. Unauthenticated `/mcp` → 401 + protected-resource metadata. Full live tools including deletes when authenticated. |
| Local stdio `npx -y @audiodn/mcp` | Knowledge tools without key; `ADN_API_KEY` enables live tools including deletes. |

## Annotation status

In `mcp/src/tools/types.ts` (0.3.4+ / 0.4.0):

- `READ_ONLY`, `WRITE`, `WRITE_IDEMPOTENT`, and `LOCAL_READ_ONLY` all set
  `destructiveHint: false`.
- `DESTRUCTIVE` sets `destructiveHint: true` (delete tools).

**OpenAI annotation blocker from 2026-07-19 is resolved in source.** Re-run
`node scripts/audit-mcp.mjs` after MCP changes; `openaiBlockers` should be empty
when `writePresetHasDestructiveFalse` is true.

Hosted Worker deployment may lag the npm/source version — verify
`https://mcp.audiodelivery.net/` reports the expected package version before
marketplace submission.

## Marketing language note

`mcp/server.json` must **not** claim LUFS or loudness targeting. Current wording is
upload / transcode / stream / deliver variants (no LUFS).
