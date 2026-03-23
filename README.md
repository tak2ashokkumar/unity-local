# unity-local

Local development workspace for the **Unity** platform — an enterprise unified IT infrastructure management and observability SaaS. This workspace provides a fully self-contained local environment to develop and test the Angular frontend without needing the Python/Django backend running.

---

## Table of Contents

- [Workspace Overview](#workspace-overview)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [First-Time Setup](#first-time-setup)
  - [Daily Development](#daily-development)
- [Dev Commands Reference](#dev-commands-reference)
- [Tools](#tools)
  - [Mock API Server](#mock-api-server)
  - [Proxy Server](#proxy-server)
  - [Angular Static Server](#angular-static-server)
- [Mock API — Adding New Endpoints](#mock-api--adding-new-endpoints)
- [Applications](#applications)
  - [ngx-unity (Single-Tenant Portal)](#ngx-unity-single-tenant-portal)
  - [ngx-mtp (Multi-Tenant Portal)](#ngx-mtp-multi-tenant-portal)
- [Workspace Preparation (Fresh Import)](#workspace-preparation-fresh-import)
- [Port Reference](#port-reference)
- [Request Flow Diagram](#request-flow-diagram)

---

## Workspace Overview

```
unity-local/
├── tools/                  ← Infrastructure: Node runtime, mock API, proxy
│   ├── node/               ← Portable Node.js 14.17.6 (no system install needed)
│   ├── mock-api/           ← Express mock backend server (port 3001)
│   ├── proxy/              ← HTTP proxy server (port 8091)
│   ├── patch-unity.sh      ← Utility patch script for ngx-unity
│   └── patch-mtp.sh        ← Utility patch script for ngx-mtp
├── uldb/                   ← Angular applications + static assets
│   ├── ngx-unity/          ← Single-tenant portal (Angular 12)
│   ├── ngx-mtp/            ← Multi-tenant portal (Angular 12)
│   └── static/             ← Shared static assets (Python backend output)
├── dev.sh                  ← Developer shell functions (auto-sourced via .bashrc)
├── prepare_workspace.sh    ← Fresh workspace setup from tar.gz exports
├── AI_INDEX.md             ← AI agent guidance index
└── AI_RULES.md             ← AI coding rules for this workspace
```

---

## Folder Structure

```
unity-local/
│
├── tools/
│   │
│   ├── node/                          # Portable Node.js 14.17.6 binary
│   │
│   ├── mock-api/                      # Mock backend server
│   │   ├── server.js                  # Express server — maps URLs to JSON files
│   │   ├── package.json               # Dependencies: express 4.17.1
│   │   ├── generate-api-index.js      # Utility to regenerate MOCK_API_INDEX.md
│   │   ├── MOCK_API_INDEX.md          # Auto-generated index of mocked endpoints
│   │   └── customer/                  # Mock response data (mirrors API URL structure)
│   │       ├── uldbusers.json         # Logged-in user data (permissions, org, roles)
│   │       ├── chatbot/
│   │       │   └── menu.json          # Chatbot menu items
│   │       ├── private_cloud/
│   │       │   └── private_cloud_fast.json
│   │       ├── public_cloud/          # Public cloud mock data
│   │       ├── datacenter/            # Datacenter mock data
│   │       ├── service_catalogues/
│   │       │   └── types.json
│   │       └── users/                 # User management mock data
│   │
│   └── proxy/                         # HTTP proxy server
│       ├── server.js                  # Express proxy — routes /customer/* to mock API
│       └── package.json               # Dependencies: express, http-proxy-middleware
│
├── uldb/
│   ├── ngx-unity/                     # Angular 12 single-tenant portal
│   │   ├── src/                       # Application source code
│   │   ├── dist/                      # Build output (dev)
│   │   ├── angular.json
│   │   ├── package.json
│   │   ├── static-server.js           # Serves dist/ on port 8090
│   │   └── README.md
│   │
│   ├── ngx-mtp/                       # Angular 12 multi-tenant portal
│   │   ├── src/
│   │   ├── dist/
│   │   ├── angular.json
│   │   ├── package.json
│   │   └── static-server.js
│   │
│   └── static/                        # Shared static assets
│       ├── assets/
│       │   ├── images/                # Brand logos, device icons
│       │   └── custom-data/           # Static JSON data files consumed by Angular
│       └── dist/                      # Production build output (shared with Django)
│
├── dev.sh                             # All developer shell functions
└── prepare_workspace.sh               # Workspace initialization script
```

---

## Prerequisites

- **Bash shell** — Git Bash on Windows
- **Node.js 14.17.6** — included as a portable binary at `tools/node/`. Auto-configured via `.bashrc` when inside the `unity-local` folder. No system-level Node.js installation required.

The `.bashrc` configuration automatically sources `dev.sh` and adds `tools/node/` to `PATH` whenever you `cd` into the `unity-local` directory. All commands (`node`, `npm`, `ng`, and all dev functions) are immediately available.

---

## How It Works

The local environment replaces the Django/Python backend with two lightweight Node.js servers:

### 3-Tier Architecture

```
Browser
    │
    │  http://localhost:8091
    ▼
┌────────────────────────────────────────────┐
│           Proxy Server                     │
│        tools/proxy/server.js               │
│              port 8091                     │
└──────────────┬─────────────────────────────┘
               │
               │  URL starts with /customer ?
               │
       YES ────┴──── NO
        │              │
        ▼              ▼
┌──────────────┐  ┌──────────────────────────┐
│  Mock API    │  │  Angular Static Server   │
│  port 3001   │  │       port 8090          │
│  (Express +  │  │   (serves dist/ folder)  │
│  JSON files) │  └──────────────────────────┘
└──────────────┘
```

**Proxy** (`tools/proxy/server.js`) — single entry point on port 8091:
- Requests to `/customer/*` are forwarded to the Mock API (port 3001)
- All other requests are forwarded to the Angular static server (port 8090)
- Test endpoint: `GET http://localhost:8091/test` → returns `"Proxy working"`

**Mock API** (`tools/mock-api/server.js`) — Express server on port 3001:
- Takes the incoming URL path and maps it directly to a JSON file
- URL `/customer/uldbusers/` → reads `tools/mock-api/customer/uldbusers.json`
- Returns 404 with `{ error, request, expectedFile }` if the JSON file doesn't exist

**Angular Static Server** (`uldb/ngx-unity/static-server.js`) — Node.js server on port 8090:
- Serves the compiled Angular app from `dist/`
- Serves shared static assets from `../static/`
- Supports gzip for `.js` and `.css` files

---

## Getting Started

### First-Time Setup

Clone/copy the workspace, then install dependencies for the tools and Angular apps:

```bash
# Install Mock API dependencies
cd tools/mock-api && npm install

# Install Proxy dependencies
cd tools/proxy && npm install

# Install Angular app dependencies
cd uldb/ngx-unity && npm install
```

### Daily Development

Open **4 terminals** from the `unity-local` root (dev commands are auto-available):

**Terminal 1 — Mock API:**
```bash
startmock
# Mock API running at http://localhost:3001
```

**Terminal 2 — Proxy:**
```bash
startproxy
# Proxy running at http://localhost:8091
```

**Terminal 3 — Angular Static Server:**
```bash
serveunity
# Static server running at http://localhost:8090
```

**Terminal 4 — Angular Build (watch mode):**
```bash
buildunity
# Compiles Angular app, rebuilds on every file change
```

Then open: **http://localhost:8091**

> Alternatively, use `serveunitylocal` to start terminals 1–3 as background processes in one command. You still need to run `buildunity` separately.

---

## Dev Commands Reference

All commands are defined in `dev.sh` and are available in any terminal inside `unity-local`.

### Navigation

| Command | Goes to |
|---|---|
| `cdd` | `unity-local/` root |
| `uldb` | `uldb/` |
| `unity` | `uldb/ngx-unity/` |
| `mtp` | `uldb/ngx-mtp/` |
| `mockapi` | `tools/mock-api/` |
| `proxy` | `tools/proxy/` |

### ngx-unity

| Command | What it does |
|---|---|
| `startmock` | Start Mock API server on port 3001 |
| `startproxy` | Start Proxy server on port 8091 |
| `serveunity` | Start Angular static server on port 8090 |
| `buildunity` | Build ngx-unity in watch mode (8GB heap) |
| `serveunitylocal` | Start mock + proxy + static server together (background) |
| `buildprod` | Production build (run from `ngx-unity` or `ngx-mtp` folder) |

### ngx-mtp

| Command | What it does |
|---|---|
| `servemtp` | Start Angular static server for ngx-mtp on port 8090 |
| `buildmtp` | Build ngx-mtp in watch mode (8GB heap) |
| `servemtplocal` | Start mock + proxy + ngx-mtp static server together |

---

## Tools

### Mock API Server

**Location:** `tools/mock-api/`
**Port:** 3001
**Dependencies:** express 4.17.1

The mock API server is a minimal Express app that maps URL paths to JSON files. It requires no configuration — just drop a JSON file in the right place.

**How path mapping works:**

| Incoming request | File read |
|---|---|
| `GET /customer/uldbusers/` | `tools/mock-api/customer/uldbusers.json` |
| `GET /customer/chatbot/menu/` | `tools/mock-api/customer/chatbot/menu.json` |
| `GET /customer/private_cloud_fast/` | `tools/mock-api/customer/private_cloud_fast.json` |

If the file doesn't exist, the server returns:
```json
{
  "error": "Mock API not found",
  "request": "/customer/some/path/",
  "expectedFile": "/path/to/tools/mock-api/customer/some/path.json"
}
```
The `expectedFile` field tells you exactly where to create the mock data file.

**Currently mocked endpoints:**

| Endpoint | File |
|---|---|
| `GET /customer/uldbusers/` | `customer/uldbusers.json` |
| `GET /customer/chatbot/menu/` | `customer/chatbot/menu.json` |
| `GET /customer/private_cloud/private_cloud_fast/` | `customer/private_cloud/private_cloud_fast.json` |
| `GET /customer/service_catalogues/types/` | `customer/service_catalogues/types.json` |

### Proxy Server

**Location:** `tools/proxy/`
**Port:** 8091
**Dependencies:** express 4.17.1, http-proxy-middleware 3.0.5

Routing rules (in order):
1. `GET /test` → returns `"Proxy working"` (health check)
2. Any request starting with `/customer` → forwarded to Mock API (port 3001)
3. All other requests → forwarded to Angular static server (port 8090)

Debug logging is enabled — every proxied request is printed to the terminal with a `→ MOCK:` or `→ UNITY:` prefix.

### Angular Static Server

**Location:** `uldb/ngx-unity/static-server.js`
**Port:** 8090
**Started by:** `serveunity` command

Serves the compiled Angular app (`dist/`) and shared static assets (`../static/`). Accepts command-line flags:
- `--dist=<path>` — override dist folder path
- `--port=<number>` — override port
- `--host=<host>` — bind to specific host
- `--cors=true` — enable CORS headers

---

## Mock API — Adding New Endpoints

When the Angular app calls an API that isn't mocked yet, the browser console will show a 404 from the mock server. The 404 response body includes `expectedFile` — the exact path where you need to create the JSON file.

**Steps to add a new mock endpoint:**

1. Identify the API endpoint URL, e.g. `customer/organizationusers/`
2. Create the JSON file at the matching path:
   ```
   tools/mock-api/customer/organizationusers.json
   ```
3. Put the mock response data in the file (matching the shape the Angular service expects)
4. No server restart needed — the mock server reads files on every request

**Example — mocking a paginated list endpoint:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    { "id": 1, "name": "Item One" },
    { "id": 2, "name": "Item Two" }
  ]
}
```

**Nested paths:** Create matching subfolders.
For `customer/private_cloud/123/widget_data/` → create `customer/private_cloud/123/widget_data.json`

---

## Applications

### ngx-unity (Single-Tenant Portal)

**Location:** `uldb/ngx-unity/`
**Framework:** Angular 12.2.0
**Purpose:** Full-featured portal for a single organization to manage their IT infrastructure

Key capabilities:
- Multi-cloud management (Private: VMware, OpenStack, vCloud, Proxmox, Hyper-V, Nutanix | Public: AWS, Azure, GCP, OCI)
- Real-time monitoring & observability (Zabbix/Observium)
- Network and service topology visualization
- FinOps & cost analysis
- AI/ML event management, anomaly detection, auto-remediation
- DevOps automation & orchestration workflows
- Service catalog & ITSM ticketing (Jira, ServiceNow, MS Dynamics, Zendesk)
- AI chatbot with agentic capabilities
- User & role management (RBAC)

**App bootstrap flow:**
1. Angular loads from static server
2. Two `APP_INITIALIZER` tokens execute before rendering:
   - Saves browser timezone to cookie storage
   - Calls `GET /customer/uldbusers/` to load user + permissions into session storage
3. Navigation sidebar is built dynamically based on the user's `subscribed_modules` and `applicable_module_permissions`
4. Default dashboard or welcome page is shown

**Production build output:** `uldb/static/dist/` (shared with Django backend)

See `uldb/ngx-unity/README.md` for full application documentation.

### ngx-mtp (Multi-Tenant Portal)

**Location:** `uldb/ngx-mtp/`
**Framework:** Angular 12.2.0
**Purpose:** Multi-tenant management portal — allows managing multiple customer organizations from a single interface

Uses the same 3-tier local dev stack as ngx-unity (same mock API, same proxy). Switch between apps by using `buildmtp` + `servemtp` instead of `buildunity` + `serveunity`.

---

## Workspace Preparation (Fresh Import)

When receiving a new code export (`.tar.gz` files), run `prepare_workspace.sh` to set up the workspace:

```bash
# Place the export files in the unity-local root, then:
bash prepare_workspace.sh
```

The script:
1. Removes existing `uldb/ngx-unity` and `uldb/ngx-mtp` folders
2. Extracts `uldb_static_export.tar.gz` → places contents into `uldb/static/`
3. Extracts `unity_export.tar.gz` → places `ngx-unity/` into `uldb/`
4. Extracts `mtp_export.tar.gz` → places `ngx-mtp/` into `uldb/`
5. Runs `npm install` for both apps if `node_modules` is missing
6. Moves processed `.tar.gz` files to `../code/` for archival

**Expected export file names:**

| File | Contents |
|---|---|
| `uldb_static_export.tar.gz` | Static assets (images, custom-data JSON) |
| `unity_export.tar.gz` | ngx-unity Angular app source |
| `mtp_export.tar.gz` | ngx-mtp Angular app source |

---

## Port Reference

| Port | Service | Command |
|---|---|---|
| **8091** | Proxy Server (main entry point) | `startproxy` |
| **8090** | Angular Static Server | `serveunity` / `servemtp` |
| **3001** | Mock API Server | `startmock` |

---

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser                                      │
│                  http://localhost:8091                               │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ All requests
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Proxy Server                                    │
│                 tools/proxy/server.js                                │
│                       :8091                                          │
│                                                                      │
│  if URL starts with /customer  ──────────────────────────────────┐  │
│  else                          ──────────────────────────────┐   │  │
└──────────────────────────────────────────────────────────────┼───┼──┘
                                                               │   │
                   ┌───────────────────────────────────────────┘   │
                   │                                                │
                   ▼                                                ▼
┌──────────────────────────────┐          ┌─────────────────────────────────┐
│       Mock API Server        │          │     Angular Static Server       │
│  tools/mock-api/server.js    │          │  uldb/ngx-unity/static-server   │
│           :3001              │          │             :8090               │
│                              │          │                                 │
│  Maps URL path → .json file  │          │  Serves dist/ + static/assets/  │
│  tools/mock-api/customer/    │          │                                 │
└──────────────────────────────┘          └─────────────────────────────────┘
         │                                          │
         │ JSON response                            │ HTML/JS/CSS/assets
         └──────────────────┐   ┌──────────────────┘
                            │   │
                            ▼   ▼
                    ┌─────────────────┐
                    │  Proxy Server   │
                    │  (merges both)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Browser      │
                    └─────────────────┘
```

**Example — App bootstrap:**
1. Browser requests `http://localhost:8091/` → Proxy → Angular static server → returns `index.html`
2. Angular boots, fires `APP_INITIALIZER`
3. Angular calls `GET /customer/uldbusers/` → Proxy routes to Mock API → returns `uldbusers.json`
4. User permissions and subscribed modules loaded into session storage
5. Sidebar navigation built from permissions
6. Application fully rendered
