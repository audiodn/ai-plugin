# OpenAI listing draft

## Plugin name

AudioDN

## Short description

Build secure audio upload, format standardization, and playback with AudioDN.

## Long description

See [../marketplace-copy.md](../marketplace-copy.md).

## Recommended category

Developer Tools

## Website URL

https://audiodeliverynetwork.com

## Support URL

https://audiodeliverynetwork.com/for-ai-agents/

## Privacy-policy URL

https://audiodeliverynetwork.com/privacy

## Terms URL

https://audiodeliverynetwork.com/terms

## Logo

- File: `assets/logo.png` (412×478 PNG) and `assets/logo.svg`
- Prefer square crop for directory if required during upload

## MCP server URL

https://mcp.audiodelivery.net/mcp

## Authentication description

Knowledge and documentation tools on the hosted MCP server work without authentication. Live AudioDN API tools require an AudioDN API Access key sent as `Authorization: Bearer <key>` (or equivalent platform MCP header configuration). Keys must be stored in the platform’s secure credential mechanism — never in the plugin bundle. Destructive delete tools are not exposed on the hosted server.

## Data-handling explanation

When authenticated, live tools call the AudioDN REST API (`https://api.audiodelivery.net`) on behalf of the key’s organization (creators, collections, tracks, upload/play sessions). Knowledge tools read bundled/public documentation and OpenAPI. AudioDN’s privacy policy applies to audio and account data: https://audiodeliverynetwork.com/privacy. This plugin does not embed custom ChatGPT UI resources.

## Proposed country availability

Worldwide where AudioDN service and OpenAI plugin directory policies allow. Confirm legal readiness before selecting countries in the portal.

## Initial release notes

See [../release-notes.md](../release-notes.md).

## Starter prompts

See [../starter-prompts.md](../starter-prompts.md).

## Test cases

See [positive-tests.md](./positive-tests.md) and [negative-tests.md](./negative-tests.md).
