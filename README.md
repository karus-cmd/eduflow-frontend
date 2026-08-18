# EduFlow — Frontend

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui web client for the
[EduFlow backend](https://github.com/karus-cmd/eduflow-backend). A **separate** project so the
backend's Railway deploy stays untouched. Deploy target: Vercel.

> **Status — F0 (thin vertical slice):** login → httpOnly-cookie session with silent refresh →
> role-based routing, and **one live dashboard per role** (admin / counselor / student) rendering
> real data from the backend. The full screen build-out is planned in `../eduflow-backend/PROGRESS.md`.

## How it talks to the backend
- **Typed against the contract.** `src/lib/api/schema.ts` is generated from the backend's
  `openapi.json` (`npm run gen:api`). Response types (which the spec doesn't yet include — see
  *Contract gaps*) are hand-mirrored in `src/lib/api/types.ts`.
- **Money is paise-as-string.** Format only through `formatPaise()` in `src/lib/money.ts` — never floats.
- **Auth stays server-side.** Login posts to a Next route handler (`/api/auth/login`) that stores the
  access/refresh tokens in **httpOnly cookies**; tokens never reach the browser. Dashboards are Server
  Components that call the backend with the cookie. `src/proxy.ts` (Next 16's renamed middleware)
  guards protected routes and silently refreshes an expired access token via `/auth/refresh`.

## Run it locally
1. **Backend** running on `http://localhost:3000` with demo data:
   ```bash
   cd ../eduflow-backend && npm run db:local:up && npx prisma migrate deploy && npm run seed
   node dist/main.js            # or: npm run start:dev
   npm run seed:demo:dev        # rich demo data (managers, students, commissions)
   ```
   (The backend's `ALLOWED_ORIGINS` already includes `http://localhost:3001`.)
2. **Frontend** on port 3001 (the backend owns 3000):
   ```bash
   npm install
   npm run dev                  # → http://localhost:3001  (script pins -p 3001)
   ```
3. Open **http://localhost:3001** and use a demo login (buttons on the page), password `Demo@12345`
   for demo users / `Admin@12345` for the seeded admin:
   - **Admin** — `admin@eduflow.local` → top-stats + manager list
   - **Manager** — `manager1@demo.eduflow.local` → earnings / pending / leads
   - **Student** — `student1@demo.eduflow.local` → enrolled courses + progress

## Config
`API_BASE_URL` (server-only, in `.env.local`) — the backend API base.
Local `http://localhost:3000/api/v1` · Railway `https://eduflow-backend-production-dae8.up.railway.app/api/v1`.

## Contract gaps found (reported, not silently patched)
- **Response bodies are untyped in `openapi.json`.** The backend types every request body (from DTOs)
  but responses show `200` with no schema (the swagger plugin can't infer untyped service returns).
  Frontend response types are hand-mirrored for now; the backend fix is typed `@ApiOkResponse` DTOs.
- **`/dashboard/admin` returns only top-stats, not the manager list** (the blueprint describes "stats +
  manager list"). The manager list here comes from `GET /counselors` instead.

## Scripts
| Script | What |
|---|---|
| `npm run dev` | Dev server on **:3001** |
| `npm run build` / `npm start` | Production build / serve |
| `npm run gen:api` | Regenerate `src/lib/api/schema.ts` from the backend `openapi.json` |
| `npm run lint` | ESLint |
