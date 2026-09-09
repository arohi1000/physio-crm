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

**Status: Milestone 0 (Foundations).** There is no authentication, no calendar
and no patient management yet — every route under `app/(app)/` is a placeholder
that names what will live there and which milestone builds it.

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
state rather than guarding raw `fetch` rejections. Milestone 1 adds the access
token and the silent-refresh retry inside it.

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
| `clay`         | `#AD6E31` | `#DBA05C` |

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
  login/                        sign-in (Milestone 1)
  dev/health/                   throwaway API connectivity check
  (app)/                        the signed-in shell
    layout.tsx                  sidebar + top bar; role-aware from Milestone 1
    navigation.ts               nav sections; filtered by role from Milestone 1
    page.tsx                    today dashboard
    calendar/ appointments/ patients/ patients/[id]/ follow-ups/
    messages/ reviews/ coupons/ activity/
    content/blog/ content/blog/[id]/ content/about/ content/services/
    settings/hours/ settings/templates/ settings/users/
components/
  AppSidebar.tsx                navigation with active-route state
  MockApiProvider.tsx           starts MSW when mocking is enabled
  PlaceholderPage.tsx           the "not built yet" shell used by every stub
  data-table/                   sortable, searchable, paginated table (M2)
  calendar/                     day / week / month views (M2)
  forms/                        shared form controls (M2+)
  print/                        receipt + prescription print layouts (M3)
lib/
  api/                          typed client, config, generated types
  auth/                         session, refresh, role helpers (M1)
mocks/                          MSW handlers, browser worker, node server
scripts/                        generate-api-types.mjs
```

Naming follows `EXECUTION-PLAN.md` §4.5: PascalCase files and exports for React
components, `use` prefix for hooks, kebab-case plural routes.
