---
name: build-audio-site
description: Scaffold or extend a site with AudioDN-backed upload and playback (inspect-first)
---

# Build an AudioDN-backed audio site

## Before editing

1. Detect framework (Next.js, Nuxt, plain Node, Cloudflare Worker, etc.).
2. Reuse existing server conventions and secret loading.
3. Prefer hybrid security: server holds API Access key; clients use sessions or scoped keys.

## Implement

1. Decide fit (`skills/audiodn/references/choosing-an-integration.md`).
2. Add upload path (per-track create required).
3. Add processing readiness gate.
4. Add playback via play session or components.
5. Link to canonical docs rather than pasting large doc sections.

Do not claim loudness/LUFS normalization. Describe format standardization via variants.

## After editing

- Run validator and project tests.
- List remaining product decisions (org setup, variants, webhooks, pricing assumptions).
