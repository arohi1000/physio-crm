# physio-crm

The clinic's admin dashboard — the doctor's and staff's daily working surface.
Next.js (App Router) + TypeScript (strict) + Tailwind CSS.

This app is **never publicly indexable**. Every response carries
`X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`, and
`/robots.txt` disallows everything. (`next dev` replaces `Cache-Control` with
its own `no-cache, must-revalidate` for HTML; the built server sends `no-store`,
so verify that header against `npm run build && npm start`, not `npm run dev`.)

Repo 2 of 3. See `../Clinic_Demo/physio-crm-PLAN.md` for the full build plan and
`../Clinic_Demo/EXECUTION-PLAN.md` §4 for the code standards this repo is
reviewed against.

**Status: Milestone 3 complete.** Sign-in, the calendar with availability
blocking, appointments, the patient list and record with its merged history
timeline, follow-ups and working hours are all built against the real API.
Messages, Reviews, Coupons, Users, Activity log and the content pages are still
placeholders.

**Phase 1 scope was trimmed on 2026-09-12** — see `../Clinic_Demo/PRD.md`. For
this repo: **Coupons, Reviews and Users come off the navigation** (Phase 2), and
so do the prescription and receipt actions on the patient record. The message
template editor narrows to the follow-up reminder type.

**Phase 1 has exactly one role**, `doctor_admin`. The role-gating logic stays
in place — it is what makes adding staff in Phase 2 a configuration change
rather than a rebuild — it simply has nothing to gate for now.

Nothing is deleted. Deferred pages stay in the repo, disconnected at the
navigation and route level, per `../Clinic_Demo/TRD.md` §9.

---

## Running it

You need **Node 22** (see `.node-version`). Node 25 is not supported and will
fail to build.

```bash
nvm use                # or: export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node --version         # must print v22.x

npm install
cp .env.example .env.local
npm run dev            # http://localhost:3002
```

Ports are fixed across the project and should not be changed:

| App              | Port |
| ---------------- | ---- |
| `physio-website` | 3001 |
| `physio-crm`     | 3002 |
| `physio-api`     | 4000 |

The API does not need to be running. Pages render without it; anything that
calls the API shows an error state instead of crashing.

### Scripts

| Command                      | What it does                                    |
| ---------------------------- | ----------------------------------------------- |
| `npm run dev`                | Dev server on port 3002                         |
| `npm run build`              | Production build                                |
| `npm start`                  | Serve the production build on port 3002         |
| `npm run lint`               | ESLint, zero warnings tolerated                 |
| `npm run typecheck`          | `tsc --noEmit`                                  |
| `npm run format` / `:check`  | Prettier                                        |
| `npm run generate:api-types` | Regenerate TypeScript types from the API's spec |

CI (`.github/workflows/ci.yml`) runs install → lint → typecheck → format check →
build on every push and pull request.

---

## Talking to the API

`lib/api/client.ts` exports `apiRequest`, the only place in the app that should
call `fetch` against `physio-api`. It turns every failure — unreachable API,
non-2xx status, malformed JSON — into an `ApiError`, so screens render one error
state rather than guarding raw `fetch` rejections. It is stateless: the access
token and the silent-refresh retry live one layer up, in
`lib/auth/authorizedRequester.ts`.

The base URL comes from `NEXT_PUBLIC_API_BASE_URL`; see `.env.example` for every
environment variable this app reads.

### Generated types

```bash
npm run generate:api-types
```

Reads `../physio-api/openapi.json` (override with `OPENAPI_SPEC_PATH`) and
writes `lib/api/generated/schema.ts`. **The API has not published a spec yet**,
so today this script exits non-zero with an explanation rather than writing an
empty file. Until it can run, the few types the CRM needs are hand-written and
marked as such — `lib/api/health.ts` is the only one.

### Signing in

The session lives in `lib/auth/` and `components/auth/`:

| Piece                     | What it owns                                                        |
| ------------------------- | ------------------------------------------------------------------- |
| `AccessTokenHolder.ts`    | The access token, in a private field — never any browser storage    |
| `authRequests.ts`         | One function per endpoint in the auth contract, and nothing else    |
| `authorizedRequester.ts`  | Bearer token, one silent refresh per 401, then one retry            |
| `googleSignIn.ts`         | The only module that knows how the Google button produces a session |
| `SessionProvider.tsx`     | Session state, silent restore on load, sign-out, idle timeout       |
| `useIdleTimeout.ts`       | 30 minutes idle, warned in the last 2                               |
| `app/(app)/navigation.ts` | Which nav sections and routes each role sees                        |

Rules this milestone is held to:

- **No token, and no patient or user data, in `localStorage` or
  `sessionStorage`** (TRD §7.3). The refresh token is an httpOnly cookie the
  browser holds and JavaScript cannot read; the access token is in memory and is
  gone when the tab closes. Every load therefore starts with a silent
  `POST /auth/refresh` and shows a loading state, not a login flash.
- **Client-side role gating is UX, not security.** Hidden links and the
  redirect off a doctor-only route are a courtesy to staff; the API's guards are
  the boundary, and the RBAC audit in Phase 7 checks the API, not the menu.

**Google is not wired up yet.** There is no OAuth client, so the button calls
the API's `POST /auth/dev-login` bypass (EXECUTION-PLAN.md decision B6 — tracked
debt, must be replaced before any deploy). Swapping in the real thing touches
`lib/auth/googleSignIn.ts` and nothing else. Alongside it, a development-only
panel signs in as either seeded role so role-specific UI can be exercised; it is
gated on `NODE_ENV !== "production"` and is absent from a production build.

### Mocking the API

Mock Service Worker lets CRM screens be built before the matching endpoints
exist. Handlers live in `mocks/handlers.ts` and each one is deleted in the
milestone that ships the real endpoint.

- **Browser / dev:** set `NEXT_PUBLIC_API_MOCKING=enabled` in `.env.local`.
  `components/MockApiProvider.tsx` starts the worker before anything renders.
  With the variable unset, MSW is never loaded. If the browser refuses to
  register the service worker, the app still renders and calls go to the real
  API — the failure is logged, it never leaves a blank page.
- **Tests:** `mocks/server.ts` exports a configured `setupServer`, which
  `vitest.setup.ts` starts and stops around every run. `npm test` runs Vitest
  once; unmocked requests fail the test rather than reaching the network.

The mock auth accounts (`mocks/authHandlers.ts`) mirror the allow-list the API
will hold:

| Email                       | Role           | Signs in?                     |
| --------------------------- | -------------- | ----------------------------- |
| `doctor@physio.local`       | `doctor_admin` | Yes                           |
| `staff@physio.local`        | `staff`        | Yes                           |
| `admin@physio.local`        | `doctor_admin` | Password only (`break-glass`) |
| `former.staff@physio.local` | `staff`        | No — deactivated              |
| anything else               | —              | No — not provisioned          |

`mocks/mockRefreshCookie.ts` stands in for the API's httpOnly refresh cookie: a
service worker cannot set one, so the mock keeps a readable cookie holding an
opaque account id. **No application code reads it** — only the handlers — and it
exists so a reload still restores a session while mocking.

### `/dev/health`

`http://localhost:3002/dev/health` calls `GET /api/v1/health` and renders the
response, or a clean error state when the API is down. It is **throwaway
scaffolding** proving the network path works end to end; it is not linked from
the app shell and is deleted once a real authenticated screen exercises the same
path.

---

## Styling

Tailwind utility-first, **design tokens only — no raw hex values in components.**

The palette is the calm transactional one (sage / paper). The marketing brand
chrome belongs to `physio-website` and must not appear here.

- `app/globals.css` declares the **complete** light palette on `:root`, then
  overrides those same variables inside `@media (prefers-color-scheme: dark)`.
  No colour is ever defined only inside a media query.
- `tailwind.config.ts` maps each token to a Tailwind colour, so `bg-paper`,
  `text-ink-soft`, `border-line`, `text-sage-deep` and `text-clay` work
  unchanged in both themes.

| Token          | Light     | Dark      |
| -------------- | --------- | --------- |
| `paper`        | `#F5F6F1` | `#12140F` |
| `paper-raised` | `#FFFFFF` | `#1B1E16` |
| `ink`          | `#1E241E` | `#EAEBE2` |
| `ink-soft`     | `#5B6156` | `#A7AC9C` |
| `line`         | `#DBDFD3` | `#303427` |
| `sage`         | `#4B6852` | `#7FAE8B` |
| `sage-deep`    | `#33473A` | `#9FC9AA` |
| `clay`         | `#8A5522` | `#DBA05C` |
| `scrim`        | 45% ink   | 65% black |

This project uses Tailwind v4, whose default configuration is CSS-first. A
`tailwind.config.ts` is still used — loaded by the `@config` directive at the top
of `app/globals.css` — because the token definitions are easier to review in one
typed file than spread across CSS at-rules.

Also enforced in review: no `!important`, no inline `style` except for genuinely
dynamic values, mobile-first breakpoints, visible focus states, and tap targets
of at least 44px.

---

## Structure

```
app/
  layout.tsx                    root layout, fonts, MSW bootstrap
  globals.css                   design tokens + Tailwind entry
  robots.ts                     disallow everything
  login/                        sign-in
  dev/health/                   throwaway API connectivity check
  (app)/                        the signed-in shell
    layout.tsx                  hands the group to AppShell
    navigation.ts               nav sections and route access, per role
    page.tsx                    today dashboard
    calendar/ appointments/ patients/ patients/[id]/ follow-ups/
    messages/ reviews/ coupons/ activity/
    content/blog/ content/blog/[id]/ content/about/ content/services/
    settings/hours/ settings/templates/ settings/users/
components/
  AppShell.tsx                  the signed-in chrome and the gate in front of it
  AppSidebar.tsx                navigation with active-route state
  Button.tsx                    the one button, primary and quiet
  LoadingScreen.tsx             shown while the session is being restored
  MockApiProvider.tsx           starts MSW when mocking is enabled
  PlaceholderPage.tsx           the "not built yet" shell used by every stub
  auth/                         sign-in panel, session provider, idle warning
  data-table/                   sortable, searchable, paginated table (M2)
  calendar/                     day / week / month views (M2)
  forms/                        shared form controls (M2+)
  print/                        receipt + prescription print layouts (M3)
lib/
  api/                          typed client, config, generated types
  auth/                         session, refresh, role helpers
mocks/                          MSW handlers, browser worker, node server
scripts/                        generate-api-types.mjs
```

Naming follows `EXECUTION-PLAN.md` §4.5: PascalCase files and exports for React
components, `use` prefix for hooks, kebab-case plural routes.
