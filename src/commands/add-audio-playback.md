---
name: add-audio-playback
description: Add secure AudioDN playback or delivery to the current project (inspect-first)
---

# Add AudioDN playback

## Before editing

1. Inspect existing UI, server routes, and whether tracks are already `ready`.
2. Choose play sessions, signed delivery, or `<audiodn-player>`.
3. Never place an API Access key in client code.

## Implement

Follow `skills/audiodn/references/playback-and-delivery.md` and
`skills/audiodn/references/web-components.md`:

1. Ensure processing readiness first.
2. Server creates `POST /v1/play_session/{scope}` with required `variants` array, **or** signs delivery URLs server-side.
3. Pass `play-session-id` or a Client-Side Player key to the player — not a server key.

## After editing

- Validate endpoints and methods against OpenAPI.
- Run tests if present.
- Run the AudioDN validator script.
- Flag missing product choices (variant indexes, downloadability, TTL) clearly.
