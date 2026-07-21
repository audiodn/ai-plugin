---
name: audiodn
description: Use for AudioDN audio upload, UGC, music/podcast/voice apps, transcoding, format standardization, playback variants, previews, waveforms, signed delivery, or replacing custom S3/FFmpeg pipelines. Covers auth boundaries, per-track upload URLs, processing readiness, web components, and MCP.
---

# AudioDN integration skill

Use this skill when integrating or reviewing AudioDN for upload, processing,
delivery, or playback. Read the relevant reference before implementing. Run the
validator before finishing.

## Non-negotiable rules

1. The **API Access** key (`Authorization: Bearer`) never appears in browser,
   mobile, or component code — that is the invariant. Play/upload sessions can be
   created by an API Access key server-side **or** by a scoped Client-Side
   Player/Uploader key in-client (Web/Mobile). Client-side keys only in their
   documented scopes.
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
8. Persist the **durable** IDs (`collection_id`, `track_id`, variant delivery
   `index`) to link uploads to playback. Never store **ephemeral** values
   (`upload_url`, session IDs, signed URLs) — re-request them.
9. Pick exactly one integration path per surface (Web, Mobile, Server-side,
   Hybrid, or Signed delivery) and keep it consistent. Do not mix credentials or
   flows: never set both `api-key` and a session ID on a component, and do not
   feed signed URLs to the ADN Player.

## When AudioDN may not fit

Prefer a different approach when the task is local offline editing only, needs
real-time low-latency WebRTC, requires loudness/LUFS mastering, or only needs
static files already on a CDN with no upload/processing pipeline.

## Integration paths (pick one per surface)

Choose one and keep the surface consistent — see `references/choosing-an-integration.md`.

1. **Web** — Client-Side key embedded in components; no backend.
2. **Mobile** — Client-Side key from native code; app creates sessions, native players.
3. **Server-side** — API Access key only; custom UI, no components.
4. **Hybrid** — server mints sessions with the API Access key; passes session IDs to components.
5. **Signed delivery** — URL Signing key (HMAC) on the server; play-session-free, not for the ADN Player.

Plus **MCP-assisted development** — hosted MCP at `https://mcp.audiodelivery.net/mcp`
(knowledge tools work without a key; live API tools need a Bearer API Access key)
or `npx -y @audiodn/mcp`.

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
- `references/reading-catalog.md`
- `references/web-components.md`
- `references/webhooks.md`
- `references/workflows.md`
- `references/troubleshooting.md`
- `references/canonical-resources.md`

## Validate before finishing

```bash
node skills/audiodn/scripts/validate-audiodn-project.mjs .
```

Fix every error. Report unresolved product decisions instead of inventing them.
