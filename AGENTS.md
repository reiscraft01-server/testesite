# Tebex Headless API Notes

## Content Filter / Username Strategy
- Tebex API blocks usernames containing "pelo" (case-insensitive substring check)
- Error: `{status:404, title:"Invalid Username provided"}`
- **Current solution**: send `username: nickname` (real player nick); if 404 "Invalid Username", fallback to **direct checkout link** (`pay.tebex.io/checkout/{packageId}`)
- **Nickname capture**: done via Tebex checkout page (Minecraft Username field Required) for filtered nicks; via API username for unfiltered nicks

## API Endpoints
- Headless: `https://headless.tebex.io/api/accounts/{publicToken}/baskets` (POST)
- Add package: `POST https://headless.tebex.io/api/baskets/{ident}/packages`
- Authed (privateKey): `Authorization: Basic {base64(publicToken:privateKey)}`
- Direct checkout: `https://pay.tebex.io/checkout/{packageId}`
- Auth methods: `GET /api/accounts/{token}/baskets/{ident}/auth?returnUrl=...` returns empty for offline mode

## Store Info
- ID: 1868466
- Platform: Geyser (Dot Prefix)
- `disabled: true` (but API still works)
- Currency: USD
- Private key: dhQKxTacNvOYQDrU0mZiCrqUKXVPvyjr
- Public token: 141pu-6f0b71e8fb176f3f358f89d13973105efd0e5ae1

## Package IDs
- VIP Ferro: 7588021 ($1.95)
- VIP Diamante: 7588026 ($3.52)
- VIP Netherite: 7588030 ($4.89)
- VIP Rei: 7588032 ($9.78)
- Home Adicional: 7588036 ($0.49)
- Desban: 7588047 ($9.78)
