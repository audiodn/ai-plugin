# OpenAI / Codex submission checklist

## Status summary

| Area | Status |
|------|--------|
| Plugin bundle (`dist/openai`) | Ready |
| Skill readiness | Ready |
| MCP readiness | **Blocked** — see [mcp-readiness.md](./mcp-readiness.md) |
| Tool-annotation readiness | **Blocked** (WRITE tools missing explicit `destructiveHint: false`) |
| Authentication readiness | Partial — hosted knowledge tools OK; live tools need reviewer API key without MFA |
| Domain verification | **Manual** — token not fabricated; host at `/.well-known/openai-apps-challenge` |
| Policy and listing | Draft ready under [openai/](./openai/) |
| Test cases | Ready (5 positive / 3 negative) |

**Recommendation:** Submit as **MCP + skills** after MCP annotation fixes land in `audiodn/mcp`. Skills-only is a fallback if MCP blockers cannot be resolved in time.

## Bundle path

`dist/openai` with `.codex-plugin/plugin.json`, `skills/`, `.mcp.json`.

Local marketplace: `.agents/plugins/marketplace.json` → `./dist/openai`.

## Domain verification (manual)

When the portal issues a challenge for `https://mcp.audiodelivery.net/mcp` (or parent `audiodelivery.net`):

1. Place the **exact** portal token at  
   `https://<challenge-base-host>/.well-known/openai-apps-challenge`
2. Response must be the token only (not JSON, not multi-token).
3. Do not replace another plugin’s token on a shared host without coordination.

## Remaining manual steps

1. Fix MCP annotations in the `mcp` repository (separate PR).
2. Verify OpenAI org business identity + Apps Management write.
3. Provide reviewer demo API Access key (scoped test org) without MFA/SMS.
4. Host domain verification token.
5. Upload skill ZIP / point at repo tree per portal.
6. Complete policy attestations only after materials match production.
