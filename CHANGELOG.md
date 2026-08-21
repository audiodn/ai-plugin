# Changelog

## 1.0.2 — 2026-08-21

- Cursor plugin **Configure** field for optional `ADN_API_KEY` so hosted MCP live tools (list, store, play) can run
- MCP configs send `Authorization: Bearer ${ADN_API_KEY}` (empty key = docs-only tools)
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
