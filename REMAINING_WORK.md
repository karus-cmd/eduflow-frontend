# EduFlow — Remaining Work & Handoff

Handoff notes for picking up EduFlow. Read alongside `eduflow-backend/PROGRESS.md`,
`eduflow-backend/docs/EDUFLOW_MASTER_BLUEPRINT.md`, and both repos' `README.md`.

## The project in one line
An EdTech platform: enrollment **CRM** (leads → conversations → enrolment) + **LMS**
(courses, self-hosted video, live classes) + **commission ledger** (paise-precise payouts),
serving four roles: **student, counsellor/manager, admin, finance**.

## Two repos
| Repo | What | Deploys to | Visibility |
|---|---|---|---|
| `eduflow-frontend` | Next.js 16 web client (this repo) | **Vercel** → https://eduflow-frontend-chi.vercel.app | public |
| `eduflow-backend` | NestJS API + Postgres + Redis | **Railway** | private |

Frontend talks to the backend server-side (BFF): the browser never calls the backend directly.
Only env var the frontend needs is `API_BASE_URL` (set in Vercel → the Railway backend `…/api/v1`).

## Current state (done + live)
- Backend: feature-complete API (auth, CRM, LMS, commission, payouts, reports); ~171 tests green; live on Railway.
- Frontend: all four roles fully wired. Visual world is **"The Prep Deck"** (emerald primary + coral
  accent on warm ivory, Bricolage display font, dimensional cards). Landing, login, and the
  student / counsellor / admin / leads surfaces are bespoke-designed. Deployed on Vercel.
- Demo data seeded in production: 1 admin, 1 manager (Priya), 50 students, 4 courses, 6-month
  commission timeline, leads pipeline. Demo logins (on the sign-in page):
  - Admin `admin@eduflow.local` / `Admin@12345`
  - Manager `manager1@demo.eduflow.local` / `Demo@12345`
  - Student `student1@demo.eduflow.local` / `Demo@12345`

## Remaining work

### A. Frontend polish (no backend change needed)
These pages already inherit the emerald design system but are not yet *bespoke*-designed like the
landing / login / student home:
- [ ] Student: **browse/catalog**, **course detail**, **checkout**, **profile/settings**.
- [ ] Admin: **content studio** (library + course editor), **managers list & detail**, **payouts console**, **reports**, **settings**.
- [ ] Counsellor: **students**, **courses**, **lead detail**, **profile**.
- [ ] Full **mobile pass** across every page.
- [ ] **Accessibility** audit (contrast, focus order, labels) — run a review pass.
- [ ] **Empty / loading / error** states styled in-world everywhere.
- [ ] Frontend **tests** (none yet — add Playwright/Vitest for the critical flows).

### B. Backend features (each needs a new endpoint; unblocks a frontend gap)
These are the known **contract gaps** (documented in `eduflow-frontend/README.md`):
- [ ] **In-browser video upload** — today: register (`POST /videos` → rclone target) → CLI transcode/upload → `POST /videos/:id/finalize`. Needs a **presigned-PUT (or multipart) upload** endpoint for a drag-drop admin experience.
- [ ] **Course unpublish / archive** — publish is one-way. Add a status transition on `PATCH /courses/:id` (draft/archived).
- [ ] **Read a student's per-course progress for staff** — `GET /users/:id/enrollments` (admin) and `GET /me/students` (counsellor). Today "my students" is built from converted leads, without real per-course progress.
- [ ] **Free (₹0) self-enrol** — currently rejected by checkout (product decision to defer).

### C. Backend / infra ops
- [ ] **Deploy the video worker + HLS pipeline** (`VIDEO_HOST`) so real playback works (see `eduflow-backend/DEPLOY_RAILWAY.md`).
- [ ] **Register the Razorpay webhook** against the deployed backend so checkout → provisioning works end-to-end (test flow currently completes only against a local/registered webhook).
- [ ] **Rotate the Railway Postgres password** (it was shared during setup). Railway updates the internal `DATABASE_URL` automatically.
- [ ] (Optional) Custom domain on Vercel + Railway.

## Run it locally (for a fresh machine)
**Backend** (`eduflow-backend`) — uses a **portable Postgres, no Docker needed**:
```
npm install
npm run db:local:up          # downloads+starts portable PG on :55432 (first run ~1 min)
npx prisma migrate deploy
npm run seed                 # base seed: admin + counsellor
npm run seed:demo:dev        # rich demo data
npm run start:dev            # (or: node dist/main.js) → API on :3000
```
**Frontend** (`eduflow-frontend`):
```
npm install
# .env.local:  API_BASE_URL=http://localhost:3000/api/v1
npm run dev                  # → http://localhost:3001
```
Gotcha: don't run `next build` while `next dev` is running on the same repo; if API routes start
404ing in dev, `rm -rf .next` and restart dev.

## Invariants (do not break)
- **Money is paise-as-string** → format only via `formatPaise()`; never floats.
- **Auth stays server-side**: tokens live in httpOnly cookies; the browser never sees them or calls the backend directly (BFF route handlers under `src/app/api/*`).
- **Money flows only through the Razorpay webhook** (the client only routes to a provisioning poller).
- **Design world = "The Prep Deck"**: emerald `#0a7f56` primary, coral `#ff5a36` accent, ivory ground, Bricolage display. Keep new UI non-AI (no purple, no gradient blobs, no glass-as-decoration).
