---
name: audit-audiodn-integration
description: Audit an existing AudioDN integration for security and flow correctness
---

# Audit an AudioDN integration

## Inspect

1. Scan for API Access keys in client/mobile/`public` code.
2. Confirm upload uses session + per-track create + short-lived `upload_url`.
3. Confirm playback waits for readiness.
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
