# MCP readiness audit (OpenAI / marketplace)

**Audited:** 2026-11-02  
**Hosted URL:** `https://mcp.audiodelivery.net/mcp`  
**Registry:** `net.audiodelivery/mcp`  
**npm:** `@audiodn/mcp` (local source audited at 0.3.5)  
**Script:** `node scripts/audit-mcp.mjs` (reads `mcp/src/tools/types.ts` and tool inventories)

## Transport / auth

| Mode | Auth |
|------|------|
| Hosted Streamable HTTP | Knowledge tools: no key. Live API tools: `Authorization: Bearer adn_...` or `X-ADN-API-Key`. Delete tools **not** exposed on hosted. |
| Local stdio `npx -y @audiodn/mcp` | `ADN_API_KEY` required for live tools; `ADN_MCP_ALLOW_DELETE=1` gates deletes. |

## Annotation status

In `mcp/src/tools/types.ts` (0.3.4+ / 0.3.5):

- `READ_ONLY`, `WRITE`, `WRITE_IDEMPOTENT`, and `LOCAL_READ_ONLY` all set
  `destructiveHint: false`.
- `DESTRUCTIVE` sets `destructiveHint: true` (gated delete tools only).

**OpenAI annotation blocker from 2026-07-19 is resolved in source.** Re-run
`node scripts/audit-mcp.mjs` after MCP changes; `openaiBlockers` should be empty
when `writePresetHasDestructiveFalse` is true.

Hosted Worker deployment may lag the npm/source version — verify
`https://mcp.audiodelivery.net/` reports the expected package version before
marketplace submission.

## Marketing language note

`mcp/server.json` must not claim loudness/LUFS “normalize”. Current wording is
upload / transcode / stream / deliver variants.
