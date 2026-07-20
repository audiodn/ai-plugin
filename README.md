# AudioDN AI Plugin

Skills, workflows, and MCP integration that help coding agents build **AudioDN** upload, format standardization, and playback — for Cursor, Claude Code, and OpenAI/Codex.

This repository is the public **AudioDN plugin**, not a separate AudioDN product.

## What it does

- Teaches agents the secure upload sequence (session → **per-track** create → PUT → readiness → playback)
- Packages an `audiodn` skill with on-demand references
- Optional workflows: add upload, add playback, build an audio site, audit an integration
- Wires the hosted AudioDN MCP server by default
- Ships deterministic platform bundles under `dist/` for marketplace review

## How it differs from related packages

| Package | Role |
|---------|------|
| **This plugin** (`audiodn/ai-plugin`) | Marketplace skills + workflows + MCP config for AI coding tools |
| [`@audiodn/mcp`](https://www.npmjs.com/package/@audiodn/mcp) | MCP server (hosted HTTP or local stdio) exposing docs + optional live API tools |
| [`@audiodn/agent-kit`](https://www.npmjs.com/package/@audiodn/agent-kit) | CLI that installs guidance files into an application repo |

## Supported platforms

| Platform | Bundle | Marketplace pointer |
|----------|--------|---------------------|
| Cursor | `dist/cursor` | `.cursor-plugin/marketplace.json` |
| Claude Code | `dist/claude` | `.claude-plugin/marketplace.json` |
| OpenAI / Codex | `dist/openai` | `.agents/plugins/marketplace.json` |

**Marketplace status:** Not claimed approved. See `submission/` for checklists and blockers.

## Upload and playback (high level)

1. Create an upload session (`POST /v1/upload_session`).
2. Create each track (`POST /v1/upload/{upload_session_id}/track`).
3. Upload bytes to `track_upload.upload_url`.
4. Wait until the track is ready (poll or webhook).
5. Create a play session or use signed delivery / web components.

Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.

## Security boundaries

- Server API Access keys never in browser/mobile code
- Client Player/Uploader keys only in documented scopes
- Secrets from env / platform credential stores
- Do not log Authorization headers or API keys
- Verify unfamiliar calls against [OpenAPI](https://audiodeliverynetwork.com/openapi.json)

## MCP

- **Default (hosted):** `https://mcp.audiodelivery.net/mcp`  
  Knowledge tools work without a key; live API tools need a Bearer API Access key configured in the host.
- **Registry:** `net.audiodelivery/mcp`
- **Local:** `npx -y @audiodn/mcp` with `ADN_API_KEY`

## Local testing

```bash
npm ci
npm run build
npm run validate
npm test
```

### Cursor

```bash
ln -s "$(pwd)/dist/cursor" ~/.cursor/plugins/local/audiodn
```

### Claude Code

```bash
claude plugin validate ./dist/claude --strict   # if CLI installed
claude --plugin-dir ./dist/claude
```

### OpenAI / Codex

Use `.agents/plugins/marketplace.json` (points at `./dist/openai`) with the ChatGPT desktop / Codex local marketplace flow.

## Development

Canonical content lives in `src/`. Run `npm run build` to regenerate `dist/` (committed; no symlinks).

```bash
npm run sync -- --local    # reviewable sync against sibling monorepo when present
npm run validate:openapi
npm run validate:mcp
npm run check:links
```

## Versioning

Semver in `package.json` (`private: true` — this repo is not published to npm). Bump version when shipping marketplace updates; rebuild and commit `dist/`.

## License

MIT
