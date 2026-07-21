# Processing and variants

After bytes upload, AudioDN processes the track (probe, waveform/levels, variant
generation, optional fallback processing, cover extraction). A track is not
immediately playable.

## Readiness

- **Poll** (server, Bearer): `GET /v1/track/{track_id}` until
  `track.track_status_id === 'ready'`.
- Terminal statuses also include `incomplete` (some variants failed but at least
  one may play), `error`, `init_error`.
- Transitional: `initialized` / processing states, `fallback`, `fallback_processing`
  (prefer live `track_status_id` over simplified OpenAPI `status` enums when they differ).
- **Webhook** (preferred in production): Track Processing webhook fires on
  terminal outcomes / when the file set completes (`files_completed_at`), not on
  every transitional status. Dashboard-configured; header `X-ADN-Event: track.status_changed`.
  See `references/webhooks.md` for all three webhooks (processing, track files, collection sync).

Do not assume a just-uploaded track is ready. The uploader component’s
`file-uploaded` event means bytes were stored — not that processing finished.

## Variants (format standardization)

- A **variant** is a reusable recipe (`variant_type_id`, delivery `index` such as `hq`, `lq`, `voice`).
- A **track file** is the stored output of applying a variant.
- Track-specific API creation supports types such as `transcode` and `preview`
  (lossy codecs include `aac`, `mp3`, `ogg`, `opus` per docs). Org-wide recipes
  (analysis, waveform assets, original) are configured in the dashboard.

Endpoints: `GET /v1/variant`, `GET /v1/variant/{variant_id}`,
`POST /v1/track/{track_id}/variant`.

## Terminology — “normalization”

AudioDN does **not** perform LUFS loudness normalization, true-peak limiting,
dynamic-range processing, or gain normalization unless explicitly documented
elsewhere (it is not part of the current product API). Prefer:

- Format standardization
- Playback standardization
- Transcoding to a consistent variant

Say “supported input formats,” not “every audio format.”

Waveform **levels** may be scaled 0–1 for visualization (`is_normalize` in
analysis/waveform contexts) — that is display data, not loudness mastering.

Canonical: https://audiodeliverynetwork.com/docs/variant-types and
`/docs/webhooks/track-processing`.
