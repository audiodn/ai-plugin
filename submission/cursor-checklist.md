# Cursor Marketplace checklist

## Status

**Ready after manual asset work** — bundle and manifests are prepared; screenshots still needed; submission is a manual form step.

## Local installation test

```bash
ln -s "$(pwd)/dist/cursor" ~/.cursor/plugins/local/audiodn
# Developer: Reload Window
```

Verify in Customize: skill `audiodn`, rule `audiodn` (not always-on), commands, MCP `audiodn` → `https://mcp.audiodelivery.net/mcp`.

## Manifest validation

- [x] `dist/cursor/.cursor-plugin/plugin.json` — name `audiodn`, version, description, author, logo, keywords
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
| Commands | `commands/*.md` (4) |
| MCP | `mcp.json` |
| Assets | `assets/logo.png`, `logo.svg` |

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
- [ ] Optional: refine logo if marketplace requires square PNG only

## Known review risks

- Hosted MCP requires optional Bearer for live API tools — document clearly in listing.
- Rule must remain opt-in (`alwaysApply: false`) — already set.
- Do not claim marketplace acceptance until Cursor lists the plugin.
