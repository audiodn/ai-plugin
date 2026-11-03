# Changelog

## 1.1.1

- Player attribute preferred name is `outputs` (`output-indexes` and `variants`
  remain compatible aliases; layout `variant` unchanged).

## 1.1.0

- Default skill language uses **output presets / outputs**; legacy “variant”
  names mentioned briefly where wire fields or paths still use them.
- Player docs prefer `output-indexes` (`variants` still works); layout `variant`
  unchanged.
- `known-endpoints.json` adds canonical `/v1/output_preset` and
  `/v1/track/{track_id}/output` (legacy paths retained).
- Updated processing, playback, upload, webhooks, product overview, and related
  references.

## 1.0.2 — 2026-08-21

- Cursor plugin **Configure** field for optional `ADN_API_KEY` so hosted MCP live tools (list, store, play) can run
- Hosted MCP configs use the bare URL for OAuth account login (no pasted Authorization header)
- Copy and skill describe AudioDN as a hosted library to store, play, and preview agent audio
- New `/store-agent-audio` workflow; install steps in README

## 1.0.1 — 2026-08-21

- Show **AudioDN** as the plugin title (Cursor `displayName`) instead of lowercase `audiodn`
- Use the Audio Delivery Network mark (official bar logo SVG + existing square/wide PNGs)
- Align listing author, brand color, and marketplace metadata with product branding

## 1.0.0 — 2026-07-19

- Initial independent repository with canonical `src/` and generated `dist/{cursor,claude,openai}`
- AudioDN skill, four workflows, opt-in Cursor rule, hosted MCP wiring
- Validation scripts (manifests, OpenAPI, MCP audit, links) and GitHub Actions CI
- Submission drafts for Cursor, Claude community, and OpenAI (with MCP readiness blockers documented)
