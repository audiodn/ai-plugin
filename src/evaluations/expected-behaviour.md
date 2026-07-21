# Expected evaluation behaviour

Agents using this plugin should:

1. Load the `audiodn` skill for AudioDN tasks.
2. Prefer OpenAPI and reference files over invention.
3. Enforce the upload sequence including per-track create.
4. Keep API Access keys server-side.
5. Refuse or correct LUFS/loudness-normalization and invented endpoints.
6. Run the validator when auditing or finishing an integration.
7. Use MCP knowledge tools without requiring a key; request secure setup before live mutating API tools.
8. Pick one integration path per surface (Web, Mobile, Server-side, Hybrid, Signed delivery) and not mix credentials/flows: never both `api-key` and a session id on a component, and no signed URLs fed to the ADN Player.

Positive and negative case prompts live in `positive.json` and `negative.json`.
OpenAI submission expands these into full reviewer test cases under `submission/openai/`.
