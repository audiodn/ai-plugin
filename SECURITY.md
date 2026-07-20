# Security Policy

## Reporting a vulnerability

Email security concerns related to this plugin repository to the AudioDN team via the contacts on https://audiodeliverynetwork.com or open a private security advisory on https://github.com/audiodn/ai-plugin if enabled.

Do not include production API keys in GitHub issues.

## Plugin security expectations

- This plugin must not ship API keys, demo secrets, or private audio.
- Marketplace bundles must not include install-time shell hooks or unnecessary permissions.
- Agents following the skill must keep API Access keys server-side and must not log Authorization headers.

## MCP

The hosted MCP endpoint is operated by AudioDN. Report MCP server vulnerabilities against the [`audiodn/mcp`](https://github.com/audiodn/mcp) repository.
