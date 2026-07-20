# Web components

Package: `@audiodn/components`  
CDN example: `unpkg.com/@audiodn/components@latest/dist/{player,uploader,waveform}.js`

## `<audiodn-player>`

Key attributes:

- `api-key` **or** `play-session-id` (not a server API Access key)
- `scope` — `track` | `collection`
- `id` — track or collection id matching scope
- `variants` — comma list of delivery indexes (e.g. `hq,lq`)
- `size` — `small` | `regular` | `large` (default `large`)
- `theme` — `auto` | `dark` | `light`
- `volume`, `autoplay`, `downloadable` (request only; key must allow downloads)
- `session-ttl`
- Waveform-related attrs forwarded to the waveform component

## `<audiodn-uploader>`

- `api-key` **or** `upload-session-id`
- `collection-id`
- `accent-color`, `theme`, `disabled`, `limit`
- Event `file-uploaded` ⇒ bytes stored, **not** processing complete

## `<audiodn-waveform>`

- JS property `levels`
- `variant` — `vertical` | `wavy` | `reflection`
- `height`, `line-width`, `line-color`, `gap`, `scale-strength`, `progress`, `duration`

Theming uses `--adn-*` CSS custom properties.

Canonical: https://audiodeliverynetwork.com/docs/components/player (and uploader / waveform pages).
