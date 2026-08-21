# Cursor Marketplace checklist

## Status

**Ready after manual asset work** — bundle and manifests are prepared; real product screenshots still needed; submission is a manual form step.

QA notes (2026-07-19): square `logo-square.png` referenced; rule is opt-in; remote MCP uses Cursor `url` schema.

## Local installation test

```bash
ln -s "$(pwd)/dist/cursor" ~/.cursor/plugins/local/audiodn
# Developer: Reload Window
```

Verify in Customize: skill `audiodn`, rule `audiodn` (not always-on), commands, MCP `audiodn` → `https://mcp.audiodelivery.net/mcp`.

## Manifest validation

- [x] `dist/cursor/.cursor-plugin/plugin.json` — name `audiodn`, displayName `AudioDN`, version, description, author, logo SVG, primaryColor, optional `variables.ADN_API_KEY`, keywords
- [x] `mcp.json` hosted URL + `Authorization: Bearer ${ADN_API_KEY}`
- [x] Root `.cursor-plugin/marketplace.json` → `dist/cursor`
- [x] Skill / rule / command frontmatter present
- [x] Rule `alwaysApply: false`
- [x] No symlinks in `dist/cursor`
- [x] `mcp.json` hosted URL correct

## Component inventory

| Component | Path |
|-----------|------|
| Skill | `skills/audiodn/` |
| Rule | `rules/audiodn.mdc` |
| Commands | `commands/*.md` (5, including `store-agent-audio`) |
| MCP | `mcp.json` |
| Assets | `assets/logo.svg` (icon), `logo-square.png`, `logo.png` |

## Marketplace description

See [marketplace-copy.md](./marketplace-copy.md).

## Keywords / category

`audio`, `upload`, `playback`, `transcoding`, `mcp`, `audiodn`, `cdn` — category **Developer Tools**.

## Repository URL

https://github.com/audiodn/ai-plugin

## Submission URL

https://cursor.com/marketplace/publish

## Screenshots / assets still required

- [ ] 2–3 screenshots under `assets/screenshots/` (no secrets)
- [ ] Optional: marketplace may still prefer a raster square — `logo-square.png` is the official mark on a 512×512 field

## Known review risks

- Hosted MCP requires optional Bearer for live API tools — document clearly in listing.
- Rule must remain opt-in (`alwaysApply: false`) — already set.
- Do not claim marketplace acceptance until Cursor lists the plugin.
