---
name: audit-audiodn-integration
description: Audit an AudioDN integration for key leaks, broken upload/play flows, and invented APIs
---

# Audit an AudioDN integration

## Inspect

1. Scan for API Access keys in client/mobile/`public` code (scoped Client-Side keys and session IDs are fine client-side).
2. Confirm upload uses session + per-track create + short-lived `upload_url`.
3. Confirm playback waits for readiness and keeps one terminal per surface — no mixed credentials (both `api-key` and a session ID), no signed URLs fed to the ADN Player (`skills/audiodn/references/choosing-an-integration.md`).
4. Confirm API host is `api.audiodelivery.net` for `/v1/`.
5. Confirm no invented endpoints; spot-check against OpenAPI.
6. Confirm secrets are not logged.
7. Note any unsupported loudness-normalization claims in comments/docs.

## Run

```bash
node skills/audiodn/scripts/validate-audiodn-project.mjs .
```

## Report

Produce findings with severity, file locations, and remedies. Do not auto-enable
destructive operations. Do not invent missing product configuration.
