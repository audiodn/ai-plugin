# Expected evaluation behaviour

Agents using this plugin should:

1. Load the `audiodn` skill for AudioDN tasks.
2. Prefer OpenAPI and reference files over invention.
3. Enforce the upload sequence including per-track create.
4. Keep API Access keys server-side.
5. Refuse or correct LUFS/loudness-normalization and invented endpoints.
6. Run the validator when auditing or finishing an integration.
7. Use MCP knowledge tools without requiring a key; request secure setup (Cursor: Plugins → AudioDN → Configure) before live mutating API tools.
8. Treat uploading and playback as two independent tasks; pick one terminal per task per surface and not mix credentials/flows: never both `api-key` and a session id on a component, and no signed URLs fed to the ADN Player.
9. When the user wants to keep agent-found audio, store it in AudioDN (per-track upload, persist IDs, wait for ready) then play or preview — do not leave bytes only on disk without a product decision.

Positive and negative case prompts live in `positive.json` and `negative.json`.
OpenAI submission expands these into full reviewer test cases under `submission/openai/`.
