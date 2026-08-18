# EduFlow — Frontend

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui web client for the
[EduFlow backend](https://github.com/karus-cmd/eduflow-backend). A **separate** project so the
backend's Railway deploy stays untouched. Deploy target: Vercel.

> **Status — F1 (student revenue path):** on top of F0 (login → httpOnly-cookie session with silent
> refresh → role-based routing → one live dashboard per role), the full student money path is built:
> **browse catalog → course detail → checkout with referral (Razorpay TEST) → provisioning poll →
> My Learning → course player (HLS + progress) → profile**. The remaining role areas (counselor F2,
> admin content F3, managers/money F4, polish F5) are planned in `../eduflow-backend/PROGRESS.md`.

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

## Contract gaps found (reported, not silently patched)
- **Response bodies are untyped in `openapi.json`.** The backend types every request body (from DTOs)
  but responses show `200` with no schema (the swagger plugin can't infer untyped service returns).
  Frontend response types are hand-mirrored for now; the backend fix is typed `@ApiOkResponse` DTOs.
- **`/dashboard/admin` returns only top-stats, not the manager list** (the blueprint describes "stats +
  manager list"). The manager list here comes from `GET /counselors` instead.
- **No self-service profile update.** `PATCH /users/:id` requires `user.update` (admin only), so a
  student can't edit their own name/email/phone. The profile page shows details read-only + reports this.
  _Fix:_ a `PATCH /me` (self, non-privileged) endpoint.
- **No authenticated change-password.** Only public `POST /auth/forgot-password` / `reset-password`
  (email-token) exist. The profile Security tab uses the email reset flow. _Fix:_ `POST /auth/change-password`.
- **No per-lesson progress read.** `GET /me/enrollments` gives the rolled-up `progressPct` but nothing
  exposes which lessons are already complete (or `lastPositionSec`) on load. The player marks lessons
  complete as you finish them in-session and treats `progressPct` as authoritative (refreshed after each
  action); on reload the per-lesson checkmarks reset. _Fix:_ `GET /me/lessons/:id/progress` (or embed
  progress in the course tree / enrollment).
- **Free (₹0) courses can't be self-enrolled.** `POST /orders/:id/checkout` rejects a non-positive total,
  and there's no zero-price enrol path, so the catalog disables enrol on free courses. _Fix:_ a free-enrol
  endpoint, or allow ₹0 orders to provision directly.

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
