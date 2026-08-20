# EduFlow — Frontend

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui web client for the
[EduFlow backend](https://github.com/karus-cmd/eduflow-backend). A **separate** project so the
backend's Railway deploy stays untouched. Deploy target: Vercel.

> **Status — F2 (counselor/manager) awaiting review:** F0 (auth + role routing) and F1 (student revenue
> path) are merged to `main`. **F2 is on branch `f2-counselor`** — the whole counselor surface: dashboard
> (KPIs + earnings-trend chart), leads pipeline + lead detail (log conversation, follow-ups), my students,
> commission & payouts (read-only), view-only content, and settings. It builds on the **contract-close**
> backend slice (typed OpenAPI responses + `PATCH /me` + `POST /auth/change-password` +
> `GET /me/courses/:id/progress`). Remaining: admin content F3, managers/money F4, polish F5
> (see `../eduflow-backend/PROGRESS.md`).

## F2 — counselor / manager (branch `f2-counselor`, awaiting review)
All under `/counselor/*` (same BFF architecture as F1):

| Route | Screen |
|---|---|
| `/counselor` | **Dashboard** — Total earnings / Awaiting payout / Paid out / Enrollments tiles, a commission earned-over-time area chart (Recharts), recent activity |
| `/counselor/leads` | **Leads pipeline** — own leads, stage-filter pills + search, and a "Today's queue" (due follow-ups with mark-done + new leads) |
| `/counselor/leads/[id]` | **Lead detail** — activity timeline (conversations + follow-ups), log-a-conversation (channel + outcome + notes → advances stage), schedule + complete follow-ups |
| `/counselor/students` | **My students** — converted-lead roster (per-course progress flagged as a gap) |
| `/counselor/commission` | **Commission & payouts** — read-only earned/pending/paid/reversed + signed ledger + payout history (no payout triggers) |
| `/counselor/courses[/id]` | **Content** — view-only course browser + read-only syllabus |
| `/counselor/profile` | **Settings** — edit name (`PATCH /me`) + change password |

## Contract-close (backend, 2026-08-19) — the F1 gaps are now fixed in the API
`PATCH /me`, `POST /auth/change-password`, `GET /me/courses/:id/progress`, and **typed response schemas
on every operation** landed on the backend. The typed client (`src/lib/api/schema.ts`) was regenerated;
the student profile is now editable, passwords are changeable in-app, and the player keeps its checkmarks
+ resume position across reloads.

## F1 — student revenue path (what's built)
All under `/student/*` (guarded by `proxy.ts`; server components fetch with the cookie, the browser
mutates through same-origin `/api/*` BFF route handlers that proxy to the backend with the bearer token):

| Route | Screen |
|---|---|
| `/student` | **My Learning** — enrolled courses, live progress bars, resume CTA, live next-class countdown |
| `/student/browse` | **Catalog** — published courses, instant search, enrolled badges |
| `/student/courses/[id]` | **Course detail** — syllabus tree (free previews playable), overview, sticky purchase card |
| `/student/checkout/[courseId]` | **Checkout** — referral code → Razorpay TEST widget |
| `/student/orders/[id]/provisioning` | **Payment received** — polls order status until the webhook grants access |
| `/student/learn/[courseId]` | **Course player** — HLS.js video, lesson sidebar, throttled progress + mark-complete, resource downloads |
| `/student/profile` | **Profile & settings** — account details + email-based password reset |

**Money still flows only through the webhook** (invariant #3): checkout opens a Razorpay order; the
`payment.captured` webhook on the backend provisions the enrollment + accrues commission. The client's
payment-success callback only routes to the provisioning page, which polls until access is granted.

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

## Contract gaps — status

**✅ Closed by the 2026-08-19 backend contract-close slice:**
- ~~Response bodies untyped in `openapi.json`~~ → every operation now has a typed response schema; client regenerated.
- ~~No self-service profile update~~ → **`PATCH /me`** (basic fields only).
- ~~No authenticated change-password~~ → **`POST /auth/change-password`**.
- ~~No per-lesson progress read~~ → **`GET /me/courses/:id/progress`** (checkmarks + resume survive reload).

**⏳ Still open (reported, not silently patched):**
- **No counselor "my students + progress" endpoint.** Counselors lack `enrollment.read_all`, and
  `GET /me/enrollments` is the *caller's own* enrollments. F2's "My students" is built from the counselor's
  **converted leads** instead — so it shows who they enrolled but **not per-course progress**. _Fix:_ a
  counselor-scoped `GET /me/students` (enrolled students + progress).
- **No counselor commission time-series.** `GET /reports/counselors` is admin-only (`report.read_all`), so
  the dashboard's earnings-trend chart is derived client-side by bucketing `GET /me/commission` **ledger
  accruals** by month. Works, but a counselor-readable monthly rollup would be cleaner.
- **No per-commission payout lifecycle for counselors.** The counselor sees balance (earned/pending/paid/
  reversed) + the ledger + recorded payouts, but not each commission's Awaiting→Processing→Paid state.
  _Fix:_ expose `commission_payouts` on `GET /me/commission`.
- **`/dashboard/admin` returns only top-stats, not the manager list** (F4 territory; the admin manager list
  comes from `GET /counselors`).
- **Free (₹0) courses can't be self-enrolled** (`POST /orders/:id/checkout` rejects a non-positive total).
  Product decision is DEFER — the catalog disables enrol on free courses for now.

## Live verification deferred to the deployed backend (build correct, verify there)
- **Provisioning needs the public Railway backend + a registered Razorpay webhook.** Against a local
  backend the `payment.captured` webhook can't reach it, so the provisioning poller will hit its
  "still provisioning" fallback after a test payment. Verify end-to-end enrolment on the deployed backend.
- **Real playback needs the video Worker deployed + an HLS clip uploaded** (`VIDEO_HOST`). Until then
  `GET /lessons/:id/playback` returns 404 for lessons without a `ready` asset and the player shows its
  "video is being prepared" state.

## Scripts
| Script | What |
|---|---|
| `npm run dev` | Dev server on **:3001** |
| `npm run build` / `npm start` | Production build / serve |
| `npm run gen:api` | Regenerate `src/lib/api/schema.ts` from the backend `openapi.json` |
| `npm run lint` | ESLint |
