# Claude Code community marketplace checklist

## Status

**Ready after manual account work** — bundle prepared; submit via Claude community marketplace process (`anthropics/claude-plugins-community`).

QA notes (2026-07-19):
- `.mcp.json` includes required `"type": "http"` (without this Claude skips remote MCP as broken stdio).
- `displayName: "AudioDN"` and `defaultEnabled: false` (opt-in for external MCP).
- Marketplace entry includes category, tags, author, homepage.

## Validation

When Claude Code CLI is installed:

```bash
claude plugin validate ./dist/claude --strict
```

If CLI is unavailable in CI/dev environments, note that in the PR and validate locally before submit.

## Local installation

```bash
claude --plugin-dir ./dist/claude
# or marketplace add pointing at this repo / dist/claude per current docs
```

Expected namespaced skills/commands once enabled (pattern `audiodn:...` / plugin-scoped names per Claude Code version).

## Community marketplace requirements

- Public GitHub repository
- `.claude-plugin/plugin.json` in the plugin root (`dist/claude`)
- Root `.claude-plugin/marketplace.json` listing `./dist/claude`
- No reliance on root `CLAUDE.md` for plugin context (skills carry instructions)
- Submit to **community** marketplace, not the curated official Anthropic marketplace

## Public repository and plugin path

- Repo: https://github.com/audiodn/ai-plugin
- Plugin path: `dist/claude`

## MCP approval behaviour

Plugin ships `.mcp.json` with hosted Streamable HTTP URL. Claude Code prompts for MCP approval on first use. Knowledge tools work without an API key; live tools need user-configured auth.

## Known review risks

- MCP connecting to an external network service (`openWorld` live tools).
- Concise skill description is intentional (token cost); details in references.
- Do not claim community listing until the catalog pin appears.
