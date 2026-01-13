# Portfolio (React + Vite)

A space-themed portfolio with an AI chat interface and an “artifact” drawer for rich content:

- **Chat**: asks/answers about Seymur’s work and background
- **Artifacts**: open a gallery (masonry), website previews, contact composer, etc.
- **Writing rail**: sidebar surfaces external posts (Medium/LinkedIn)

## Quickstart

```bash
npm install
cp env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

This app runs fully client-side. Vite exposes **only** variables that start with `VITE_` unless configured. This repo also exposes `CLOUDFLARE_*` (see `vite.config.js`).

- **`VITE_Z_AI_API_KEY`**: API key used by `src/services/chatService.js`
- **`CLOUDFLARE_PUBLIC_API`** (or `VITE_CLOUDFLARE_PUBLIC_API`): JSON endpoint/base URL used to load gallery images
- **`RESEND_API_KEY`**: server-side API key used by the dev email endpoint (do not expose to the browser)
- **`VITE_CONTACT_API_URL`**: optional URL of a deployed email backend (Worker/server). If unset, dev uses `/api/send-email`.

Copy `env.example` to `.env`. (`.env` is intentionally ignored by git.)

## Contact email (Resend)

The Contact artifact sends email via a **server-side endpoint** so the Resend API key is never shipped to the browser.

- **Dev**: Vite registers `POST /api/send-email` (see `vite.config.js`)
- **Prod**: set `VITE_CONTACT_API_URL` to your Worker/server endpoint and keep `RESEND_API_KEY` server-side

## Cloudflare gallery images

The masonry gallery (`GalleryView`) can auto-load images from Cloudflare if the artifact passes no `images` array.

### Option A: Manifest file (simple)

Host a JSON list at one of:

- `.../manifest.json`
- `.../images.json`
- `.../index.json`
- `.../images/images.json`

Example:

```json
{ "images": ["images/photo1.jpg", "images/photo2.jpg"] }
```

Set:

- `CLOUDFLARE_PUBLIC_API=https://<your-public-host>`

### Option B: Worker listing endpoint (recommended)

R2 public hosts (`*.r2.dev`) do **not** provide a “list all objects” API. Use the included Worker template under `cloudflare/worker-gallery/` to return JSON + CORS at `GET /images`.

Set:

- `CLOUDFLARE_PUBLIC_API=https://<your-worker-domain>/images`

## Content sources

- **Profile data**: `me.json` (bio, experience, skills, hobbies, contact)
- **Writing links**: `src/data/writings.json`

## Development scripts

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview the build
- `npm run lint`: ESLint

## Steering docs

See:

- `docs/STEERING.md` (project conventions + UX rules)
- `docs/ARCHITECTURE.md` (how the app fits together)
- `docs/MCP.md` (how “MCP tools” work here, and how to add new ones)
