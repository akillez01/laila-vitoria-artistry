# Copilot Instructions — laila-vitoria-artistry

## Build, lint, and run commands

- Install deps: `npm install`
- Dev server (Express + Vite middleware): `npm run dev`
- Production build (client + server bundle): `npm run build`
- Run production build: `npm run start`
- Type-check/lint step used in this repo: `npm run lint`
- Seed local data: `npm run seed`
- Create admin user: `npm run create-admin -- <email> "<nome>" ["<cargo>"]`

### Tests

- There is no `test` script configured in `package.json` yet.
- Single-test command is not available in the current setup.

## High-level architecture

- The app is a **single Node process** (`server.ts`) serving both API and frontend.
- In development, Express mounts Vite in middleware mode; in production, it serves static files from `dist/` and falls back to `index.html` for SPA routes.
- Frontend (`src/`) is React 19 + TypeScript SPA with a portfolio view plus protected admin/profile flows.
- Backend (`server/`) is modular Express routers mounted in `server.ts` (`auth`, `portfolio`, `albums`, `galleries`, `packages`, `orders`, `payments`, `instagram`, `adminProfile`).
- Persistence is SQLite via `better-sqlite3` (`server/db.ts` + `server/schema.sql`), including idempotent column upgrades in `db.ts` for older DB files.
- Upload pipeline is local filesystem (`uploads/`) via shared multer factory (`server/upload.ts`) and static serving under `/uploads`.
- Payments:
  - Order lifecycle starts in `orders`/`galleries` routes (`pending` order creation).
  - Checkout can be Mercado Pago (`/payments/preference` + webhook status sync) or static Pix QR payload (`/payments/pix`).
  - Approved orders can download selected gallery photos as ZIP.
- Admin auth is cookie-based JWT (`lv_admin_token`) with `requireAdmin` middleware guarding `/api/admin/*` routes.
- AI assistant flow is handled by `POST /api/chat` using Gemini (`@google/genai`) and environment-provided API key.

## Key conventions specific to this codebase

- API responses/requests use **camelCase**, DB columns use **snake_case**; route files define mapping helpers (e.g., `toOrder`, `toGallery`, `toPackage`, `toPhoto`) and should stay as the translation boundary.
- Keep money in integer cents (`price_cents`, `amount_cents`, `extra_photo_price_cents`), converting only at UI/provider boundaries.
- Gallery access has two first-class modes (`access_mode`): `'code'` and `'email'`; preserve both flows when changing gallery logic.
- Public and admin surfaces are deliberately separated:
  - public endpoints for client access/checkout
  - `/admin/*` endpoints guarded by `requireAdmin`
- Upload security pattern is intentional:
  - validate MIME in `fileFilter`
  - derive extension from MIME (not client filename)
  - generate random server filename
- Ordering in content managers is DB-driven via `sort_order` and explicit SQL ordering; keep insert/update behavior aligned with this.
- Backward compatibility with existing SQLite files matters. When adding schema fields, follow the incremental `ensureColumn(...)` pattern in `server/db.ts` in addition to updating `schema.sql`.
- Frontend network calls should go through `src/lib/api.ts` (`api`/`apiUpload`) to keep cookie credentials and consistent API error handling.
- Environment variables in `.env.example` are part of runtime contracts for auth, payments, Pix, DB path, app URL, and Gemini integration.
