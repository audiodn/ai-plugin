# Source audit (internal)

Last validated: 2026-07-19

| Source | Claim | Kind |
|--------|-------|------|
| https://audiodeliverynetwork.com/openapi.json | Upload/play/variant paths and methods used in skill | API behaviour |
| www/public/openapi.json (local when present) | Same, for local sync | API behaviour |
| agent-kit/assets/skill/* | Upload sequence, auth types, validator rules | Documentation guidance |
| mcp/src/tools/types.ts + api/knowledge tools | 24 tools; WRITE missing destructiveHint false | API / MCP behaviour |
| mcp/server.json | Hosted URL, registry name, npm package | API behaviour |
| www docs upload-sessions / play-sessions / components | Endpoint auth (Bearer vs session), component attrs | Documentation guidance |
| www for-ai-agents / examples FAQ | No LUFS loudness normalization | Documentation guidance |
| Marketing site copy (“normalize”) | Must be interpreted as format standardization in skill | Marketing language |
| https://audiodeliverynetwork.com/privacy \| /terms | Listing legal URLs | Documentation guidance |
| https://mcp.audiodelivery.net/mcp | Host responds (405 without MCP session is OK) | API behaviour |

Do not invent endpoints, status names, or loudness features beyond these sources.
