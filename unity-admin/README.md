# unity-admin - Modern React Admin Panel

A modern React re-implementation of the legacy AngularJS Admin Panel (served from
`uldb/static` by `tools/admin-server`). It keeps the platform's green theme and the
overall layout (dark sidebar + green header + content) while modernizing the visual
language: refined typography (IBM Plex), soft elevation, rounded surfaces, polished
tables/forms, and a data-driven list + CRUD engine.

It talks to the **same mock API** (`/rest/...`) as the legacy panel and is served
through the **same unity proxy** at `http://localhost:8091/admin` - you switch
between the two implementations with a single flag (see below). It does **not**
touch `ngx-unity`, `ngx-mtp`, or any shared file under `uldb/static`.

## Tech stack

- React 18 + TypeScript
- Vite 2.9 (runs on the portable Node 14.17.6 already in this repo)
- react-router-dom 6 (HashRouter - routes look like `/admin#/servers`)
- lucide-react icons; IBM Plex Sans/Mono via @fontsource v4 - font files are bundled
  LOCALLY into the build (no runtime CDN; works fully offline)
- Zero-dependency `static-server.js` for production serving

## Install and run

All commands are run by you (per project rules). From `unity-admin`:

```bash
npm install
```

### Option A - dev server (hot reload)

```bash
npm run dev          # Vite dev server on http://localhost:8096/admin
```

The dev server proxies `/rest` and `/static` to the local mock (`:3001`) and legacy
static server (`:8095`) so data + shared images work. Make sure the mock API is
running (`cd tools/mock-api && npm start`).

### Option B - production build + static serve (matches the proxy flow)

```bash
npm run build            # type-check + build to dist/  (or: npm run build:nocheck)
npm run static-server    # serves dist/ + /static on http://localhost:8096
```

Then run the mock API and the unity proxy **in React mode**:

```bash
# terminal 1
cd tools/mock-api && npm start          # :3001

# terminal 2  (React admin active)
cd unity-admin && npm run static-server   # :8096

# terminal 3  (proxy pointed at the React admin)
ADMIN_UI=react node tools/proxy/server.js    # :8091
```

Open **http://localhost:8091/admin**.

## Switching legacy vs React

The proxy chooses the admin backend from the `ADMIN_UI` environment variable:

| `ADMIN_UI`           | `/admin` served by                 | Port |
|----------------------|------------------------------------|------|
| _(unset)_ / `legacy` | AngularJS admin-server (unchanged) | 8095 |
| `react`              | React unity-admin static server      | 8096 |

Default is **legacy**, so existing behavior is preserved unless you opt in.

Convenience aliases were added to `dev.sh`:

```bash
buildadmin        # build the React admin
serveadminreact   # serve dist/ on :8096
startproxyreact   # run the proxy with ADMIN_UI=react
```

## How it works

- **Navigation** (`src/config/menu.ts`) is a self-contained port of the legacy
  `menu.json` (the static port of AdminMenuFactory). Every leaf maps to a route.
- **Resource registry** (`src/config/resources.ts`) declares endpoint + columns +
  form fields per resource. Well-known entities (organizations, users, datacenters,
  CPU/OS/disk models, cabinets, VMs, ...) have rich configs; everything else
  auto-derives its columns from the mock data, so **every menu route renders a
  working page**.
- **Generic engine** (`src/pages/GenericListPage.tsx`) provides search, sort,
  pagination, and create/edit (drawer) + delete (confirm) against `/rest/<uri>/`.
  Because the mock echoes writes without persisting, the UI applies optimistic
  updates so create/edit/delete feel real within a session.
- **Dashboard** (`src/pages/DashboardPage.tsx`) renders KPI counts, per-datacenter
  and per-customer health bars, and Host Alerts / Maintenance / Zendesk tables from
  the real dashboard endpoints.
- Specialized tool/cloud views that aren't data lists render a polished
  "migration in progress" placeholder.

## Notes / limitations

- The mock API does not persist writes, so created/edited/deleted rows revert on a
  full reload - this is a mock limitation, not an app bug.
- CRUD uses `POST` (create), `PUT` (update), `DELETE` - matching the legacy contract.
- `npm run build` runs `tsc` first; use `npm run build:nocheck` to skip type-checking.

## Running against LIVE production data

By default the app talks to the local mock API on :3001. It can instead be pointed at a
real deployment. **Reads and writes both go through** - the Delete and Save buttons in this
UI will modify real records.

```bash
cd unity-admin
ADMIN_API=https://cerne.unityone.ai ADMIN_COOKIE="sessionid=<yours>; csrftoken=<yours>"   npm run static-server
```

- `ADMIN_API`    - backend to proxy to. Anything that is not localhost/127.0.0.1 counts as LIVE.
- `ADMIN_COOKIE` - your browser session for that host. Copy it from DevTools > Application >
  Cookies. It is read from the environment only: never committed, never logged, never sent
  anywhere except the configured backend.

The proxy adds what Django expects for a real browser session: the cookie, `Origin`,
`Referer`, and an `X-CSRFToken` header (taken from the `csrftoken` cookie) on POST/PUT/
PATCH/DELETE. Without a valid cookie the backend answers 403 and the UI shows
"Couldn't load data" rather than a misleading empty table.

### Safety behaviour in live mode
- A red hazard-striped banner is pinned above the header on every screen:
  **LIVE PRODUCTION DATA - edits and deletes on this screen change real records**.
- The server prints a matching warning block on startup.
- `GET /__admin_env` reports `{apiTarget, live, authenticated}` so the state is inspectable.

To go back to mock data, just start it normally (`npm run static-server`) - the banner
disappears and nothing can reach production.
