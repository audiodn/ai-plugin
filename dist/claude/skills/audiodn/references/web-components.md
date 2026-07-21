# Web components

Package: `@audiodn/components`
CDN example: `unpkg.com/@audiodn/components@latest/dist/{player,uploader,waveform}.js`

Components are fed by **one** of two integration paths. Set exactly one
credential input per component — never both, and never an API Access key.

- **`api-key` = Web path** — a scoped Client-Side Player/Uploader key. Minted in
  the dashboard or via `POST /v1/api_key` (see `references/authentication.md`).
  Long-lived (or `expires_at`-bounded), scoped by collection/track/creator/
  variants; the component self-serves all API calls, no backend.
- **`play-session-id` / `upload-session-id` = Hybrid path** — the server mints
  the session with an API Access key (applying entitlement checks) and passes
  only the session ID. Short-lived, per-listener / per-upload.

## `<audiodn-player>`

Key attributes:

- `api-key` **or** `play-session-id` (never both; never a server API Access key)
- `scope` — `track` | `collection`
- `id` — track or collection id matching scope
- `variant` (single) / `variants` — delivery index(es), e.g. `hq,lq`
- `size` — `small` | `regular` | `large` (default `large`)
- `theme` — `auto` | `dark` | `light`
- `volume`, `autoplay`, `downloadable` (request only; the key/session must allow downloads)
- `session-ttl`
- Waveform-related attrs forwarded to the waveform component

## `<audiodn-uploader>`

- `api-key` **or** `upload-session-id` (never both)
- `collection-id` — omit when the key/session is already collection-scoped
- `accent-color`, `theme`, `disabled`, `limit`
- Event `file-uploaded` ⇒ bytes stored, **not** processing complete

## `<audiodn-waveform>`

- JS property `levels`
- `variant` — `vertical` | `wavy` | `reflection`
- `height`, `line-width`, `line-color`, `gap`, `scale-strength`, `progress`, `duration`

Theming uses `--adn-*` CSS custom properties.

Canonical: https://audiodeliverynetwork.com/docs/components/player (and uploader / waveform pages).
