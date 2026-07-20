# Product overview

AudioDN (Audio Delivery Network) is a hosted audio CDN and processing platform:
upload audio, transcode to consistent playback variants, and deliver via play
sessions or signed URLs. It is operated by Audio Delivery Network.

## What it provides

- Upload sessions and per-track signed upload URLs
- Automatic processing (probe, waveform/levels, variant generation)
- Org-defined variants (transcode recipes, previews, analysis assets)
- Play sessions with signed, time-gated variant URLs
- Optional HMAC URL signing for public/entitled delivery
- Web components: player, uploader, waveform
- MCP server for agent-assisted development and optional live API tools

## Pricing model (product guidance)

Public product messaging: storage-based pricing, free processing, unlimited
plays, no egress fees. Confirm current details on the website before quoting
numbers to users.

## Hosts (do not confuse)

| Role | Host |
|------|------|
| Marketing / docs | `https://audiodeliverynetwork.com` |
| API | `https://api.audiodelivery.net` |
| Account dashboard | `https://account.audiodeliverynetwork.com` |
| CDN delivery | `{organization_id}.audiodelivery.net` |
| Hosted MCP | `https://mcp.audiodelivery.net/mcp` |

## Terminology

- **Collection** — grouping of tracks (player “playlist” UI often maps here)
- **Track** — one uploaded audio item
- **Variant** — reusable processing recipe (`variant_type_id`, delivery `index`)
- **Track file** — stored output of applying a variant to a track
- **Format standardization** — transcoding to a consistent codec/bitrate/channels — **not** LUFS loudness normalization

Canonical: https://audiodeliverynetwork.com/for-ai-agents/
