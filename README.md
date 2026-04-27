# Sara Wellness

A mobile-first PWA for nutrition and wellness, built with Vite + React. AI meal suggestions are powered by Claude via a Cloudflare Worker proxy.

**Live site:** `https://<your-github-username>.github.io/sara-wellness/`

---

## Project structure

```
sara-wellness/
├── src/
│   ├── App.jsx          # Main app component
│   └── main.jsx         # React entry point
├── public/
│   └── manifest.json    # PWA manifest
├── worker/
│   ├── index.js         # Cloudflare Worker (API proxy)
│   └── wrangler.toml    # Wrangler config
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions → GitHub Pages
├── .env.example         # Required environment variables
├── index.html
└── vite.config.js
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/sara-wellness.git
cd sara-wellness
npm install
```

### 2. Deploy the Cloudflare Worker

> The worker proxies requests to the Anthropic API so your key is never exposed to the browser.

**Prerequisites:** [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and a free Cloudflare account.

```bash
cd worker
npm install -g wrangler   # if not already installed
wrangler login
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
wrangler deploy
```

Copy the Worker URL printed at the end (e.g. `https://sara-wellness-worker.your-subdomain.workers.dev`).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_WORKER_URL=https://sara-wellness-worker.your-subdomain.workers.dev
```

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173/sara-wellness/`.

---

## Deploy to GitHub Pages

### One-time GitHub setup

1. Push this repo to GitHub under the name `sara-wellness`.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions** and add:
   - `VITE_WORKER_URL` — your Cloudflare Worker URL

### Deploy

Push to `main`. The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) will build and deploy automatically.

```bash
git add .
git commit -m "initial commit"
git push origin main
```

Your app will be live at `https://<your-username>.github.io/sara-wellness/` in ~1 minute.

---

## PWA icons

Add icon files to `public/` to complete the PWA install experience:

- `public/icon-192.png` — 192×192 px
- `public/icon-512.png` — 512×512 px

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `VITE_WORKER_URL` | Yes | URL of your Cloudflare Worker proxy |

**Worker secrets** (set via `wrangler secret put`):

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
