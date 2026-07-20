# MCP readiness audit (OpenAI / marketplace)

**Audited:** 2026-07-19  
**Hosted URL:** `https://mcp.audiodelivery.net/mcp`  
**Registry:** `net.audiodelivery/mcp`  
**npm:** `@audiodn/mcp` (v0.3.3 at audit time)  
**Do not modify `mcp` in the ai-plugin task** — blockers below require a separate `mcp` change.

## Transport / auth

| Mode | Auth |
|------|------|
| Hosted Streamable HTTP | Knowledge tools: no key. Live API tools: `Authorization: Bearer adn_...` or `X-ADN-API-Key`. Delete tools **not** exposed on hosted. |
| Local stdio `npx -y @audiodn/mcp` | `ADN_API_KEY` required for live tools; `ADN_MCP_ALLOW_DELETE=1` gates deletes. |

## Annotation gap (OpenAI blocker)

In `mcp/src/tools/types.ts`, presets:

- `WRITE` / `WRITE_IDEMPOTENT` set `readOnlyHint: false`, `openWorldHint: true`, but **omit `destructiveHint: false`**.
- MCP / OpenAI clients that default `destructiveHint` to `true` for write tools will mis-label creates/updates as destructive.
- Knowledge / read tools omit explicit `destructiveHint: false` (lower risk if defaults treat read-only as non-destructive, but OpenAI asks for all three hints explicitly).

**Must fix in `mcp` before OpenAI MCP submission:** set `destructiveHint: false` on all non-destructive tools; keep `true` only on delete tools.

## Per-tool matrix

| Tool | Purpose | Read-only | Changes state | Publicly visible state | Destructive | Expected RO | Expected OW | Expected DEST | Schema clear | Output schema | Description OK | Leaks secrets | Notes |
|------|---------|-----------|---------------|------------------------|-------------|-------------|-------------|---------------|--------------|---------------|----------------|---------------|-------|
| adn_about | Product overview | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST hint |
| adn_search_docs | Search docs | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST |
| adn_list_operations | List OpenAPI ops | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST |
| adn_get_operation | Get one op | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST |
| adn_get_guide | Topic guide | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST |
| adn_list_variant_types | Variant types | Y | N | N | N | true | false | false | Y | N | Y | N | missing DEST |
| adn_list_creators | List creators | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_get_creator | Get creator | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_list_collections | List collections | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_get_collection | Get collection | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_list_tracks | List tracks | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_get_track | Get track | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_get_upload_session | Get upload session | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_get_play_session | Get play session | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_list_variants | List variants | Y | N | N | N | true | true | false | Y | N | Y | N | missing DEST |
| adn_create_creator | Create creator | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** missing DEST false |
| adn_create_collection | Create collection | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_create_upload_session | Create upload session | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_create_track_in_upload_session | Create track + upload URL | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_create_play_session | Create play session | N | Y | Session URLs | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_update_creator | Update creator | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_update_collection | Update collection | N | Y | Org-visible | N | false | true | **false** | Y | N | Y | N | **BLOCKER** |
| adn_delete_creator | Delete creator | N | Y | Org-visible | Y | false | true | true | Y | N | Y | N | Gated; not on hosted |
| adn_delete_collection | Delete collection | N | Y | Org-visible | Y | false | true | true | Y | N | Y | N | Gated; not on hosted |

## Output schemas

Most tools return free-form JSON text without strict MCP output schemas. Prefer adding output schemas where OpenAI review expects them; not a hard blocker if annotations and descriptions are precise, but improves review.

## Marketing language note

`server.json` description includes the word “normalize.” Plugin skill content clarifies this means **format standardization**, not LUFS. Consider aligning MCP package marketing copy in a future `mcp` PR.

## Domain verification

Manual OpenAI requirement: host portal token at `/.well-known/openai-apps-challenge` on MCP host or allowed parent. **Do not fabricate the token.**
