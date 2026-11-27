# SymptoSense — Local Setup & Run Guide

SymptoSense is a React + Vite + Express symptom triage and plain-language health information guide with multilingual support (English, Bengali, Hindi), deterministic red-flag emergency detection, OTC safety filtering, optional local history, and PDF export, powered by the Gemini API (`@google/genai`).

---

## 1. Prerequisites

- **Node.js** v20+ (with `npm`)
- A **Gemini API key** from Google AI Studio

---

## 2. Get a Gemini API Key

1. Open **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)** and sign in with your Google account.
2. Click **Create API key**.
3. Copy the generated key.
   - **Note on key formats:** Newer Gemini API keys start with `AQ.` (while older keys start with `AIza`). Both formats are completely normal and supported automatically—no prefix changes needed.

---

## 3. Configure `.env`

1. Copy `.env.example` to `.env` (or `.env.local` if you want a higher-precedence local override—`server.ts` loads `.env.local` first, then `.env`):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   Optional model overrides (checked automatically against `ai.models.list()` on startup, with automatic fallback to available Flash / Flash-Lite models):
   ```env
   GEMINI_MODEL=gemini-4-hydrogen
   GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
   ```
3. Never commit `.env` or `.env.local`—both (along with `.env.*`, except `.env.example`) are ignored by `.gitignore`.

---

## 4. Install & Run

### Development mode
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To verify your API key and active models, open:
**[http://localhost:3000/api/health?diag=1](http://localhost:3000/api/health?diag=1)**
When your key is configured, it returns `"configured": true`, `"listError": null`, a masked key (`first4...last4`), and the active `model` / `fallbackModel`.

### Production mode
```bash
npm run build
npm start
```
`npm start` runs `cross-env NODE_ENV=production tsx server.ts` and serves the compiled `dist/` bundle together with the `/api/*` endpoints.

### Unit tests & typecheck
```bash
npx tsc --noEmit
npm test
```

---

## 5. Troubleshooting

| HTTP Code | Cause | How to Fix |
| --- | --- | --- |
| **401 (`UNAUTHENTICATED` / `API_KEY_INVALID`)** | The key in `.env` is invalid, revoked, truncated, or still a placeholder. | Generate a fresh key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), paste it into `.env` as `GEMINI_API_KEY=...`, and restart the server. |
| **403 (`PERMISSION_DENIED`)** | Either the key has HTTP referrer / IP restrictions (blocking Node.js server requests), the Generative Language API is not enabled on its project, or the key does not have access to the configured model. | Use an unrestricted server key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (remove HTTP referrer restrictions), or set `GEMINI_MODEL` in `.env` to a model listed under `sampleListedModels` at `/api/health?diag=1`. |
| **404 (`NOT_FOUND`)** | The configured `GEMINI_MODEL` or `GEMINI_FALLBACK_MODEL` does not exist or is unavailable for your key. | Check `sampleListedModels` at `/api/health?diag=1` and set `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL` in `.env` to valid model IDs. (SymptoSense also auto-selects available Flash / Flash-Lite models at startup.) |
| **429 (`RESOURCE_EXHAUSTED`)** | Free-tier rate limit or quota was reached. | Wait a minute and retry. SymptoSense automatically falls back to `GEMINI_FALLBACK_MODEL` on `429`, `503`, `404`, and model-level `403` errors. |

When an analysis request fails, expand **Scan Diagnostics (Upstream Error Detail)** inside the error banner for the redacted upstream error message.
