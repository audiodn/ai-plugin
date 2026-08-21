# AudioDN plugin

Skills, workflows, and MCP that help coding agents **store, play, and preview
audio** with **AudioDN** (Audio Delivery Network) — and add the same APIs to an
app — for Cursor, Claude Code, and OpenAI/Codex.

This repository is the public **AudioDN plugin**, not a separate AudioDN product.

## What it does

AudioDN is a hosted library for audio that agents generate or find, and for
apps that need upload, transcoding, previews, and playback without a custom
S3/FFmpeg pipeline.

- Teaches the secure store sequence (session → **per-track** create → PUT → readiness → play/preview)
- Packages an `audiodn` skill with on-demand references
- Workflows: store agent audio, add upload, add playback, build an audio site, audit an integration
- Wires the hosted AudioDN MCP server (docs with no key; live catalog/store/play after you paste an API Access key)
- Ships deterministic platform bundles under `dist/` for marketplace review

## How it differs from related packages

| Package | Role |
|---------|------|
| **This plugin** ([`@audiodn/ai-plugin`](https://www.npmjs.com/package/@audiodn/ai-plugin)) | Marketplace skills + workflows + MCP config for AI coding tools |
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

## Install on Cursor

1. Install the plugin (Marketplace when listed, or local):

```bash
ln -sfn "$(pwd)/dist/cursor" ~/.cursor/plugins/local/audiodn
```

Then **Developer: Reload Window**.

2. **Plugins → AudioDN → Configure.** Paste a server-side **API Access** key from
   [account.audiodeliverynetwork.com](https://account.audiodeliverynetwork.com)
   (Settings → API Keys). The field is `ADN_API_KEY`. Leave it empty if you only
   want docs/knowledge tools.

3. After a key is set, MCP live tools can list collections, store files the
   agent has on disk, poll readiness, and mint play sessions for preview/playback.
   Put bytes with PUT to `track_upload.upload_url`; persist `track_id`, not the URL.

Do not commit the key. Do not put an API Access key in browser or component code.

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

The local symlink in **Install on Cursor** is enough. Reload the window after
rebuilds so `displayName`, logo, and `ADN_API_KEY` pick up.

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

Semver in `package.json`. Bump the version when shipping marketplace updates, rebuild and commit `dist/`, then publish:

```bash
npm run ci          # build + validate + audits + tests
npm publish         # scoped public; runs prepublishOnly (build + validate + test)
```

The published tarball contains only the platform bundles (`dist/`), `README.md`, `LICENSE`, and `CHANGELOG.md` — source, scripts, tests, and `submission/` are excluded via the `files` allowlist.

## License

MIT
