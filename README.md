# PriorArt Scout

Evidence-first patent research prototype. The helmet demonstration uses synthetic data. Live technical-feature extraction is available only in authorized local or preview environments.

Investigations are preliminary. They are not a legal opinion and do not assess novelty, patentability, infringement, or freedom to operate.

## Local development (conda `portfolio`)

Use the existing `portfolio` conda environment (Node 22). From the repository root:

```bash
export PATH="/opt/anaconda3/envs/portfolio/bin:$PATH"
npm install
```

Copy the example environment file and add a real server-side key locally:

```bash
cp .env.example .env.local
```

Required in `.env.local` (never commit this file):

- `OPENAI_API_KEY` — server-side only
- `OPENAI_MODEL` — defaults to `gpt-4o-mini` if omitted
- `LIVE_EXTRACTION_ENABLED=true` — enables the serverless endpoint
- `VITE_LIVE_EXTRACTION_ENABLED=true` — shows the live extraction action in the UI

`npm run dev` starts Vite only. It does **not** serve `/api`. Run both:

```bash
# Terminal 1 — Vercel serverless functions (reads .env.local)
npx vercel dev --listen 3000

# Terminal 2 — Vite UI, proxies /api to port 3000
npm run dev
```

Then open the Vite URL (typically `http://127.0.0.1:5173`).

### Sample API request

```bash
curl -sS -X POST http://127.0.0.1:3000/api/extract-features \
  -H 'Content-Type: application/json' \
  -d '{"description":"A bicycle helmet equipped with an accelerometer and gyroscope that detects collisions and sends an emergency notification with GPS coordinates through a connected smartphone."}'
```

### Automated checks

```bash
npm run build
npx eslint . --ext .js,.jsx,.ts,.tsx
npx tsc --noEmit
npm test
```

## Vercel configuration

Set these as **server** environment variables (Production/Preview as appropriate). Do not use `VITE_` for secrets.

| Variable | Production | Local / authorized preview |
|---|---|---|
| `OPENAI_API_KEY` | may be set, unused while gated off | required |
| `OPENAI_MODEL` | optional | optional (`gpt-4o-mini`) |
| `LIVE_EXTRACTION_ENABLED` | **omit or false** | `true` |
| `VITE_LIVE_EXTRACTION_ENABLED` | **omit** | `true` |

Production live extraction stays disabled until durable abuse protection is approved. A disabled endpoint returns `SERVICE_UNAVAILABLE`. The UI does not advertise live extraction unless `VITE_LIVE_EXTRACTION_ENABLED=true`.

Do not use an in-memory request counter: serverless instances do not share memory, so that would reset between invocations and would not protect the public URL.

**Proposed later protection (not implemented):** enable Vercel Firewall / WAF rate limiting on `POST /api/extract-features` (IP + path). Keep `LIVE_EXTRACTION_ENABLED` unset in Production until that rule is verified. Do not add authentication, Redis, or a database unless that gate is insufficient.

## Workflows

- **Try example → Start demonstration** — full synthetic helmet investigation. No API key.
- **Custom description → Extract technical features** — live OpenAI extraction only. No patent search, documents, or evidence report.
