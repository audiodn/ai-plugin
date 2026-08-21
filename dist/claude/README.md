# AudioDN plugin (Claude Code)

Hosted audio library for agents: store, play, and preview audio, plus secure AudioDN upload and playback skills.

## Security

- Server API Access keys must not appear in browser or mobile code.
- Client-side Player/Uploader keys only in documented scopes.
- Secrets from environment variables or the platform credential mechanism.
- Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.

## MCP

- Hosted (default): `https://mcp.audiodelivery.net/mcp`
- Registry: `net.audiodelivery/mcp`
- Local stdio: `npx -y @audiodn/mcp` with `ADN_API_KEY`
- Knowledge/doc tools work without a key on the hosted server; live API tools need a Bearer API Access key.
- Live API (store/play/preview): set plugin/env `ADN_API_KEY` so `.mcp.json` can send `Authorization: Bearer ${ADN_API_KEY}`.

## Canonical resources

- Docs: https://audiodeliverynetwork.com/docs/
- OpenAPI: https://audiodeliverynetwork.com/openapi.json
- AI guide: https://audiodeliverynetwork.com/for-ai-agents/

## License

MIT — see LICENSE.
