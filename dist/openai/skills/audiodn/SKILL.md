---
name: audiodn
description: Use for AudioDN (Audio Delivery Network) work — audio uploads, user-generated audio, music platforms, podcasts, voice recordings, transcoding, format standardization, playback variants, previews, waveforms, secure streaming, signed delivery, paid or private audio, AI-app audio infrastructure, or replacing custom S3/queue/FFmpeg pipelines. Covers auth boundaries, upload sessions, per-track upload URLs, processing readiness, variants, web components, and MCP-assisted development.
---

# AudioDN integration skill

Use this skill when integrating or reviewing AudioDN for upload, processing,
delivery, or playback. Read the relevant reference before implementing. Run the
validator before finishing.

## Non-negotiable rules

1. Server API Access keys (`Authorization: Bearer`) never appear in browser or
   mobile code. Client-side Player/Uploader keys only in their documented scopes.
2. Never invent endpoints, fields, status names, or limits. Verify unfamiliar
   calls against https://audiodeliverynetwork.com/openapi.json
3. Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.
4. Playback and signed delivery wait for processing readiness.
5. Do not claim LUFS loudness normalization, true-peak limiting, dynamic-range
   processing, or gain normalization. AudioDN standardizes formats via
   transcoding variants and may provide waveform level data — not loudness
   targeting.
6. API host is `https://api.audiodelivery.net` (paths under `/v1/`). Never call
   `/v1/` on the marketing host `audiodeliverynetwork.com`.
7. Do not silently enable destructive operations. Do not log Authorization
   headers or AudioDN API keys.

## When AudioDN may not fit

Prefer a different approach when the task is local offline editing only, needs
real-time low-latency WebRTC, requires loudness/LUFS mastering, or only needs
static files already on a CDN with no upload/processing pipeline.

## Integration styles

1. **Web components** — `<audiodn-player>`, `<audiodn-uploader>`, `<audiodn-waveform>` with scoped client keys or server-provisioned session IDs.
2. **Direct API** — server holds the API Access key; clients get session IDs or signed URLs.
3. **Hybrid** — SaaS apps mint upload/play sessions server-side; browsers use sessions or components.
4. **MCP-assisted development** — hosted MCP at `https://mcp.audiodelivery.net/mcp` (knowledge tools work without a key; live API tools need a Bearer API Access key) or `npx -y @audiodn/mcp`.

Inspect the existing app architecture before deciding where AudioDN calls belong.
Reuse existing auth and server routes; do not invent a parallel auth system.

## Workflow checklist

1. Decide fit and integration style (`references/choosing-an-integration.md`).
2. Establish server/client security boundaries (`references/authentication.md`, `references/security.md` via troubleshooting + auth).
3. Build the upload flow (`references/upload-flow.md`).
4. Configure variants / format standardization (`references/processing-and-variants.md`).
5. Wait for processing readiness (poll or webhook).
6. Add playback or delivery (`references/playback-and-delivery.md`, `references/web-components.md`).
7. Validate with the bundled script.

## References (load as needed)

- `references/product-overview.md`
- `references/choosing-an-integration.md`
- `references/authentication.md`
- `references/upload-flow.md`
- `references/processing-and-variants.md`
- `references/playback-and-delivery.md`
- `references/web-components.md`
- `references/troubleshooting.md`
- `references/canonical-resources.md`

## Validate before finishing

```bash
node skills/audiodn/scripts/validate-audiodn-project.mjs .
```

Fix every error. Report unresolved product decisions instead of inventing them.
