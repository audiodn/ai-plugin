# Contributing

## Workflow

1. Edit canonical content under `src/` (not hand-edit `dist/` except via build).
2. `npm run build`
3. `npm run validate && npm test`
4. Commit `src/`, `dist/`, and scripts together so reviewers can install without building.

## Syncing AudioDN sources

- Local monorepo: `npm run sync -- --local` writes a reviewable report under `sync-review/` (gitignored).
- Standalone/CI: sync/fetch uses public OpenAPI and docs URLs.
- Do not silently rewrite skill content in CI — apply intentional updates after review.

## Scope

- Do not change the AudioDN API from this repository.
- Document MCP blockers under `submission/`; fix them in `audiodn/mcp`.

## License

By contributing, you agree your contributions are licensed under MIT.
