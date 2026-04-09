# Admin Panel — Complete Codebase Analysis

> **Last Updated**: April 9, 2026  
> **Application URL**: `http://localhost:8061/admin`  
> **Technology**: AngularJS 1.x SPA served via Django (production) / Express (local dev)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Source Code Map](#2-source-code-map)
3. [Module Dependency Chain](#3-module-dependency-chain)
4. [Production Pipeline Bundles](#4-production-pipeline-bundles)
5. [Local Dev Infrastructure](#5-local-dev-infrastructure)
6. [Route Coverage](#6-route-coverage)
7. [Key Observations & Risks](#7-key-observations--risks)
8. [File Statistics Summary](#8-file-statistics-summary)
9. [Execution Commands](#9-execution-commands)
10. [Sidebar Menu Structure](#10-sidebar-menu-structure)

---

## 1. Architecture Overview

The Admin Panel (`/admin`) is a **legacy AngularJS 1.x SPA** served inside a Django application. In production, Django renders the shell template and bundles assets via the `django-pipeline` module. In our local dev environment, we bypass Django entirely using a custom **Express-based Admin Server** that serves static files and dynamically loads AngularJS scripts.

### Local Dev Request Flow

```
Browser (localhost:8061/admin)
    │
    ▼
Proxy Server (:8061)
    ├── /admin, /static, /api/*  ──►  Admin Server (:8095)
    │       ├── Serves launcher.html
    │       ├── /static → uldb/static/
    │       ├── /api/scripts → Dynamic JS file list
    │       └── /api/menu → menu.json
    │
    ├── /rest, /customer, /mcp...  ──►  Mock API (:3001)
    │
    └── Everything else  ──►  ngx-unity (:8060)
```

### Production Request Flow

```
Browser (production-url/admin)
    │
    ▼
Django (Gunicorn/Nginx)
    ├── Renders init.html (Django template with {% pipeline %} tags)
    ├── Includes sidebar.html (recursive menu from AdminMenuFactory)
    ├── Includes end.html (resize logic, dropdown portal, CSRF config)
    ├── Bundles CSS via {% stylesheet 'styles' %}
    └── Bundles JS via {% javascript 'vendor' %}, {% javascript 'unity-app' %}, {% javascript 'v3' %}
```

---

## 2. Source Code Map

### 2.1 Django Backend (Production-Only, Reference)

| File | Location | Purpose |
|------|----------|---------|
| `settings.py` | `uldb/uldb/settings.py` | Pipeline config: CSS bundles (L728-747), JS bundles (L749-931) |
| `ui.py` | `uldb/app/common/ui.py` | `AdminMenuFactory` (L346-600): Python class that builds the sidebar hierarchy |
| `init.html` | `uldb/app/templates/base/admin/init.html` | Production shell template — the **source of truth** for HTML structure |
| `end.html` | `uldb/app/templates/base/snippets/js/end.html` | Production post-bootstrap logic: `resizeMain()`, dropdown portal, scroll disable |
| `sidebar.html` | `uldb/app/templates/base/common/sidebar.html` | Production recursive sidebar template (Django `{% include %}` based) |
| `sidebar.html` | `uldb/app/templates/base/admin/sidebar.html` | Admin-specific sidebar override |

### 2.2 AngularJS Application (`uldb/static/rest/app/`)

| File/Dir | Purpose | Size |
|----------|---------|------|
| `adminApp.js` | **Core module declaration** (`angular.module('uldb', [...])`) + all route definitions (~180 routes, 1472 lines) | 62KB |
| `clientApp.js` | Customer portal module — **MUST BE EXCLUDED** to prevent module redefinition | 155KB |
| `directives.js` | Global directives | 41KB |
| `filters.js` | Global filters | 10KB |
| `script.js` | Utility scripts | 12KB |

#### API Layer (`api/` — 3 files)

| File | Purpose | Size |
|------|---------|------|
| `api/admin-api.js` | `uldbapi` module: ~170 `$resource` factories for all REST endpoints | 47KB |
| `api/uldb-service.js` | `ULDBService2` factory: field definitions, column configs, CRUD operations for all entity types | **234KB** |
| `api/uldb-utils.js` | Utility functions | 24KB |

#### Controllers (`controllers/` — 44 files in root + v3 subdirs)

| Directory | Files | Key Controllers |
|-----------|-------|-----------------|
| `controllers/` (root) | 43 JS files | `generic.js` (**180KB** — the master CRUD controller), `cloud.js` (119KB), `tools.js` (62KB), `types.js` (30KB), `billing.js`, `ticket.js`, `ipv4.js`, `ipv6.js`, `monitoring.js`, `salesforce.js` |
| `controllers/v3/ul-admin/` | 8 files | `uladmincontroller.js` (dashboard), `cloudcontroller.js`, `datacentercontroller.js`, `networks.js`, `customercloudcontroller.js`, `customerdashboardcontroller.js`, `devicereportcontroller.js`, `servicecataloguescontroller.js` |
| `controllers/v3/aws/` | AWS controllers | AWS dashboard, region, user, image, snapshot controllers |
| `controllers/v3/azure/` | Azure controllers | Azure dashboard, resource group controllers |
| `controllers/v3/vmware/` | VMware controllers | VMware view, detail controllers |
| `controllers/v3/openstack/` | OpenStack controllers | OpenStack server, tenant, nova controllers |
| `controllers/v3/networking/` | Network controllers | F5 LB, Citrix VPX, Cisco, Juniper proxy controllers |
| `controllers/v3/` (root) | 1 file | `proxydetailcontroller.js` |

#### Services (`services/` — 18 files in root + v3 subdirs)

| Directory | Files | Key Services |
|-----------|-------|--------------|
| `services/` (root) | 18 files | `abstract.js` (**44KB** — base service), `DjangoService.js` (14KB), `FixtureService.js` (14KB), `ColumnService.js` (14KB), `VMwareService.js` (5KB), `BillingService.js`, `GraphingService.js`, `HostMonitorService.js`, `nagios-service.js`, `task.js`, `privateCloudService.js`, `ControllerFactory.js`, `TemplateService.js`, `URLService.js`, `coreService.js`, `objectService.js`, `ui-service.js`, `RendererService.js` |
| `services/v3/` (root) | 5 files | `CustomDataService.js` (27KB), `DataFormattingService.js` (24KB), `ModalService.js` (11KB), `RestService.js` (5KB), `ValidationService.js` (1KB) |
| `services/v3/ul-admin/` | 2 files | `uladminService.js` (dashboard data), `customerdashboardService.js` |
| `services/v3/aws/` | AWS services |
| `services/v3/azure/` | Azure services |
| `services/v3/openstack/` | OpenStack services |
| `services/v3/vmware/` | VMware services |
| `services/v3/networking/` | Networking services |

#### Directives (`directives/` — 3 files)

| File | Purpose | Size |
|------|---------|------|
| `directives/generic.js` | UI directives: tables, modals, forms, validators, pagination, etc. | **91KB** |
| `directives/datetimepicker.js` | Custom datetime picker directive | 21KB |
| `directives/opaque.js` | Opaque loading directive | 2KB |

#### Templates (`templates/` — 81 HTML files + 16 subdirs)

Key template patterns used across ~180 routes:
- `master_list.html` — Generic list view with search, add, datatable (used by **~50+ routes**)
- `generic.html` — Alternative list view for older pattern (12KB)
- `generic-detail.html` / `generic-detail2.html` — Detail view templates
- `organization_detail.html` — Complex organization detail view (19KB)
- `user_detail.html` / `user_list.html` — User management
- `v3/ul-admin/dashboard.html` — Admin dashboard
- Various `*_add.html` / `*_edit.html` forms per entity type

Template subdirectories:
`aiops/`, `aws/`, `billing/`, `cloud/`, `dev-ops/`, `dynamic/`, `ipam/`, `modal/`, `monitor/`, `openstack/`, `salesforce/`, `server/`, `snippets/`, `support/`, `tenable/`, `v3/`

#### Filters & Constants

| Directory | Contents |
|-----------|----------|
| `filters/v3/` | v3-specific filters |
| `constants/v3/` | v3-specific constants |

---

## 3. Module Dependency Chain

### AngularJS Module: `uldb`

Declared in `adminApp.js` (line 6):

```javascript
var app = angular.module('uldb', [
    'uldbapi',              // admin-api.js — REST $resource factories
    'uldbfilters',          // filters.js
    'ngSanitize',           // angular-sanitize
    'ngRoute',              // angular-route (hash-based routing)
    'ui.bootstrap',         // angular-bootstrap (ui-bootstrap-tpls)
    'nvd3',                 // angular-nvd3 (charts)
    'ui.bootstrap.datetimepicker', // angular-bootstrap-datetimepicker
    'ui.dateTimeInput',     // angular-date-time-input
    'formatFilters',        // custom format filters
    'chart.js',             // angular-charts
    'ngTagsInput',          // ng-tags-input
    'customFilter',         // custom filter module
    'floatThead',           // angular-floatThead
    'ngFileUpload',         // ng-file-upload
    'daterangepicker',      // angular-daterangepicker
    'btorfs.multiselect',   // angular-bootstrap-multiselect
    'ngAnimate',            // angular-animate
    'ngMaterial',           // angular-material
    'ngNotify',             // ng-notify
    'infinite-scroll',      // ng-infinite-scroll
    'datatables',           // angular-datatables
    'datatables.bootstrap', // angular-datatables bootstrap integration
    'angularjs-dropdown-multiselect', // angularjs-dropdown-multiselect
    'cgBusy',               // angular-busy
]);
```

### Loading Order (Critical)

```
1. jQuery + jQuery UI           ← Foundation
2. Bootstrap                    ← UI framework
3. Lodash, Moment, D3           ← Utility libraries
4. Angular Core                 ← Framework
5. Angular Extensions           ← animate, aria, messages, material, route, sanitize, resource
6. Vendor Wrappers              ← nvd3, metisMenu, ui-bootstrap, ng-tags-input, etc.
7. adminApp.js                  ← MODULE DECLARATION (must be before #8)
8. admin-api.js                 ← Declares 'uldbapi' module
9. uldb-service.js              ← Extends 'uldbapi' with ULDBService2
10. uldb-utils.js               ← Extends 'uldbapi' with utilities
11. directives.js, filters.js   ← Global directives/filters
12. controllers/*.js            ← All controllers
13. services/*.js               ← All services
14. controllers/v3/**/*.js      ← v3 controllers
15. services/v3/**/*.js         ← v3 services
```

> **CRITICAL**: `adminApp.js` **must load before** any other application JS file. It creates the module with the dependency array. All other files call `angular.module('uldb')` (without deps) to **retrieve** the existing module. If `clientApp.js` loads, it re-declares the module with a different dependency array and wipes all previously registered components.

---

## 4. Production Pipeline Bundles (from `settings.py`)

### CSS Bundle (`styles`, settings.py L729-746)

```
fonts/Roboto/css/fonts.css
css/bootstrap1.min.css
css/bootstrap-newapp2.min.css
bower_components/nvd3/build/nv.d3.min.css
bower_components/angular-bootstrap-datetimepicker/src/css/datetimepicker.css
bower_components/metisMenu/dist/metisMenu.min.css
bower_components/font-awesome/css/font-awesome.min.css
css/main-layout.css
css/v3/uladmin.css
css/admintemplate.css
bower_components/ng-tags-input/ng-tags-input.bootstrap.min.css
bower_components/ng-tags-input/ng-tags-input.min.css
hijack/hijack-styles.css
WebMKS_SDK_2.1.0/css/wmks-all.css
```

Additional CSS loaded directly in `init.html`:
```
css/angular-datatables.css
lib/datatables.bootstrap.min.css
lib/term.css
bower_components/angular-material/angular-material.min.css
bower_components/angular-busy/dist/angular-busy.min.css
bower_components/ng-notify/src/styles/ng-notify.css
bower_components/bootstrap-daterangepicker/daterangepicker.css
```

Final production overrides (loaded last for highest priority):
```
bower_components/startbootstrap-sb-admin-2/dist/css/sb-admin-2.css
css/admin-layout2.css
```

### JS Bundles

| Bundle | Key Files | Output |
|--------|-----------|--------|
| `angular` (L750-757) | angular-animate, angular-aria, angular-messages, angular-material | `compress/angular.js` |
| `base-app` (L759-768) | prototype.js, angular-simple-logger, angular-strap, vis.js, angular-vis, ng-tags-input | `compress/base-app.js` |
| `vendor` (L770-808) | bootstrap, sb-admin-2, metisMenu, ui-bootstrap, angular-route, angular-resource, d3, nvd3, ng-droplet, moment, datetimepicker, lodash, ng-file-upload, angular-floatThead, angular-charts, jsPDF, angular-drag-and-drop-lists, angular-bootstrap-multiselect, angularjs-dropdown-multiselect, angular-daterangepicker, ngInfiniteScroll | `compress/vendor.js` |
| `unity-app` (L811-820) | `api/*`, `adminApp.js`, `filters.js`, `directives.js`, `controllers/*.js`, `services/*.js` | `compress/unity-app.js` |
| `v3` (L822-847) | `controllers/v3/**/*.js`, `directives/*.js`, `services/v3/**/*.js`, `filters/v3/**/*.js`, `constants/v3/*.js` | `compress/v3.js` |

> **Note**: The `unity-app-customer` bundle (L849-931) includes `clientApp.js` and the `client/` directory — these are **Customer Portal only** and are correctly excluded from our local Admin Server.

---

## 5. Local Dev Infrastructure (`tools/`)

### 5.1 Admin Server (`tools/admin-server/server.js`)

- **Port**: 8095
- **Static files**: `/static` → `uldb/static/`
- **Endpoints**:
  - `GET /api/scripts` — Dynamically scans `uldb/static/rest/app/` for JS files, **excludes** `clientApp.js` and the `/client/` directory
  - `GET /api/menu` — Serves `tools/admin-server/menu.json` (static port of `AdminMenuFactory`)
  - `GET /admin` — Serves `tools/admin-server/launcher.html`
  - `GET /admin/*` — Catch-all SPA routing, also serves `launcher.html`

### 5.2 Proxy Server (`tools/proxy/server.js`)

- **Port**: 8061 (single browser entry point)
- **Routing Rules**:
  - `/admin`, `/static` (not `/static/assets/`), `/api/scripts`, `/api/menu` → Admin Server (8095)
  - `/rest`, `/customer`, `/orchestration`, `/chatbot`, `/mcp`, `/task` → Mock API (3001)
  - Everything else → ngx-unity (8060)

### 5.3 Launcher Shell (`tools/admin-server/launcher.html`)

This is a **static HTML port** of production's `init.html` + `end.html`. Key responsibilities:

1. **CSS Loading** — All stylesheets in correct order, mirroring the pipeline `styles` bundle + supplemental CSS from `init.html`
2. **Vendor JS Loading** — All 30+ vendor libraries loaded via `<script>` tags in dependency order
3. **Sequential App Loader** — Fetches `/api/scripts`, sorts `adminApp.js` to first position, then loads scripts one-by-one via dynamic `<script>` element creation
4. **Bootstrap** — After all scripts load, manually calls `angular.bootstrap(document, ['uldb'])` (since we don't use `ng-app` attribute)
5. **ShellController** — Fetches `/api/menu`, populates sidebar, initializes `metisMenu` jQuery plugin
6. **Resize Logic** — Mirrors production's `resizeMain()` for sidebar/content height management

### 5.4 Menu Data (`tools/admin-server/menu.json`)

Static JSON port of the `AdminMenuFactory` class from `ui.py`. Contains the complete hierarchical menu structure with 5 top-level sections:
- UnitedView (Dashboard, System Monitoring, Activity Log)
- UnitedCloud (Private Cloud, Public Cloud, Devices, IP Management, Colo, UnityConnect)
- UnitedServices (DevOps-as-a-Service)
- Support (Tickets, Change Management, Maintenance)
- UnitedSetup (Tenant Management, Billing, Server Components, Cloud Setup, Supported Hardware, Facilities Config, IP Config, Monitoring, AIOPS, Discovery, Advanced)

---

## 6. Route Coverage

The application defines **~180 AngularJS routes** in `adminApp.js`. Organized by category:

### Dashboard & General
| Route | Controller | Template |
|-------|-----------|----------|
| `/` | `UladminController` | `v3/ul-admin/dashboard.html` |
| `/dashboard` | `UladminController` | `v3/ul-admin/dashboard.html` |
| `/account` | `AccountController` | `settings.html` |
| `/404` (otherwise) | — | `404.html` |

### Devices (UnitedCloud)
| Route | Controller | Template |
|-------|-----------|----------|
| `/servers` | `ServersController` | `servers.html` |
| `/servers/:id/` | `ServerDetailController` | `server-details.html` |
| `/vm` | `VirtualMachineController` | `master_list.html` |
| `/vm/:id/` | `VirtualMachineDetailController` | `virtualserver-detail.html` |
| `/sans` | `SANController` | `servers.html` |
| `/switch` | `SwitchController` | `master_list_tab.html` |
| `/firewall` | `FirewallController` | `master_list_tab.html` |
| `/loadbalancer` | `LoadBalancerController` | `master_list_tab.html` |
| `/terminalserver` | `TerminalServerController` | `master_list.html` |
| `/customdevice` | `CustomDeviceController` | `master_list.html` |

### Colocation
| Route | Controller | Template |
|-------|-----------|----------|
| `/cabinet` | `CabinetController` | `master_list.html` |
| `/pdu` | `PDUController` | `master_list.html` |
| `/cage` | `CageController` | `master_list.html` |
| `/powercircuit` | `PowerCircuitController` | `master_list.html` |
| `/colo_cloud` | `ColoCloudController` | `master_list.html` |

### IP Management
| Route | Controller | Template |
|-------|-----------|----------|
| `/ipv4_public/allocations` | `IPv4AllocationController` | `public_ipv4_alloc.html` |
| `/ipv4_public/assignments` | `IPv4AssignmentController` | `public_ipv4.html` |
| `/ipv4_private/allocations` | `PrivateIPv4AllocationController` | `ipam/ipv4alloc_private.html` |
| `/ipv4_private/assignments` | `PrivateIPv4AssignmentController` | `ipam/ipv4assign_private.html` |
| `/ipv6alloc` | `IPv6ConfigController` | `ipam/ipv6alloc.html` |
| `/ipv6blocks` | `IPv6BlockAllocationController` | `master_list.html` |
| `/vlan` | `VlanController` | `servers.html` |

### Server Components
| Route | Controller | Template |
|-------|-----------|----------|
| `/cpu` | `CPUController` | `master_list.html` |
| `/memory` | `MemoryController` | `master_list.html` |
| `/disk` | `DiskController` | `master_list.html` |
| `/motherboard` | `MotherboardController` | `master_list.html` |
| `/nic` | `NICController` | `master_list.html` |
| `/ipmi` | `IPMIController` | `generic.html` |
| `/os` | `OperatingSystemController` | `master_list.html` |

### Models & Types (~25 routes)
| Route | Controller |
|-------|-----------|
| `/cputype` | `CPUTypeController` |
| `/memorytype` | `MemoryModelController` |
| `/disktype` | `DiskTypeController` |
| `/nictype` | `NICTypeController` |
| `/ipmi_model` | `IPMIModelController` |
| `/server_model` | `ServerModelController` |
| `/switchmodel` | `SwitchModelController` |
| `/firewallmodel` | `FirewallModelController` |
| `/loadbalancermodel` | `LoadBalancerModelController` |
| `/pdumodel` | `PDUModelController` |
| `/motherboardmodel` | `MotherboardModelController` |
| `/storage_model` | `StorageModelController` |
| `/mobile_model` | `MobileDeviceModelController` |
| `/terminalservermodel` | `TerminalServerModelController` |
| `/manufacturers` | `ManufacturerController` |
| `/pdu_manufacturers` | `PDUManufacturerController` |
| `/storage_manufacturers` | `StorageManufacturerController` |
| `/system_manufacturers` | `SystemManufacturerController` |
| `/mobile_manufacturers` | `MobileDeviceManufacturerController` |

### Facilities Config
| Route | Controller |
|-------|-----------|
| `/datacenter` | `DatacenterController` |
| `/location` | `LocationController` |
| `/cabinettype` | `CabinetTypesController` |
| `/cabinetoption` | `CabinetOptionsController` |
| `/circuitoption` | `CircuitOptionsController` |
| `/voltagetype` | `VoltageTypesController` |
| `/ampstype` | `AMPSTypesController` |
| `/outlettype` | `OutletTypesController` |
| `/electricalpanel` | `ElectricalPanelController` |
| `/electricalcircuit` | `ElectricalCircuitController` |
| `/producttype` | `ProductTypesController` |
| `/chassistype` | `ChassisTypeController` |
| `/peripheraltype` | `PeripheralTypesController` |
| `/clustertype` | `ClusterTypesController` |
| `/cloudtype` | `CloudTypeController` |
| `/diskcontrollertype` | `DiskControllerTypeController` |
| `/raidcontrollertype` | `RAIDControllerTypeController` |
| `/sascontrollertype` | `SASControllerTypesController` |

### Cloud Management
| Route | Controller |
|-------|-----------|
| `/cloud` | `PrivateCloudController2` |
| `/vmware-dashboard` | `VMwareDashboardController` |
| `/vmware-vcenter` | `VcenterProxyController` |
| `/vmware-esxi` | `EsxiProxyController` |
| `/openstack-dashboard` | `OpenStackDashboardController` |
| `/openstack-proxy` | `OpenstackProxyController2` |
| `/aws-dashboard` | `AwsDashboardController` |
| `/azure-dashboard` | `AzureDashboardController` |
| `/unitedconnect` | `UnitedConnectController` |
| `/manage_unitedconnect` | `MegaportController` |

### Support
| Route | Controller |
|-------|-----------|
| `/admin_tickets` | `TicketsController2` |
| `/tickets` | `TicketsController2` |
| `/change_ticket` | `TicketsController2` |
| `/existing_ticket` | `TicketsController2` |
| `/unity_feedback` | `TicketsController2` |
| `/maintenance-schedules` | `MaintenanceScheduleController` |

### Monitoring
| Route | Controller |
|-------|-----------|
| `/monitoring/configure` | `OrgMonitoringConfigController` |
| `/zabbix/instance` | `ZabbixInstanceController` |
| `/zabbix/customer_instance_map` | `ZabbixInstanceCustomerMapController` |
| `/zabbix/template_definition` | `ZabbixTemplateDefinitionController` |
| `/zabbix/template_mapping` | `ZabbixTemplateMappingController` |
| `/zabbix/device_map` | `ZabbixDeviceMapController` |
| `/zabbix/agent_details` | `ZabbixAgentDetailsController` |
| `/observium/instance` | `ObserviumInstanceController` |
| `/observium/device_map` | `ObserviumDeviceMapController` |
| `/observium/billing_map` | `ObserviumBillingMapController` |
| `/observium/switch_ports` | `SwitchPortMapController` |
| `/aiops/sources` | `AIOPSSourceController` |
| `/discovery/open_audit` | `OrganizationCollectorMapController` |

### Billing & Salesforce
| Route | Controller |
|-------|-----------|
| `/sf_product2` | `SalesforceProduct2Controller` |
| `/sf_opportunity` | `SalesforceOpportunityController` |
| `/sf_import_oppty` | `SalesforceImportOpportunityController` |
| `/service_contract` | `ServiceContractController` |

### Organizations & Users
| Route | Controller |
|-------|-----------|
| `/organization` | `OrganizationController` |
| `/organization/:id/` | `OrganizationDetailController` |
| `/user` | `UserController` |
| `/user/:id/` | `UserDetailController` |
| `/storage_management` | `StorageManagementController` |

### Admin Tools
| Route | Controller |
|-------|-----------|
| `/import2` | `ImporterController` |
| `/hijack` | `HijackController` |
| `/integ/celery_monitor` | `CeleryMonitorController` |
| `/101010` | `MiscToolsController` |
| `/proxy-cookies-1` | `ProxyCookiesController` |
| `/release` | `ReleaseNotesController` |
| `/activity/logs` | `AdminAuditLogController` |
| `/device_reports` | `DeviceReportsController` |
| `/service_catalogue` | `ServiceCataloguesController` |
| `/aws_amis` | `AWSAmisController` |

---

## 7. Key Observations & Risks

### Critical Dependencies

1. **`generic.js` controller** (180KB) is the backbone — it powers most CRUD views via `master_list.html`. A missing dependency or registration error here breaks ~50% of routes.
2. **`uldb-service.js`** (234KB) defines field schemas for ALL entity types. It's the largest single file and a potential failure point.
3. **`abstract.js`** service (44KB) provides base CRUD operations inherited by most controllers.
4. **`directives/generic.js`** (91KB) provides all shared UI components (tables, modals, pagination).

### What Works in Local Dev

- Shell layout (sidebar, header, content area) matches production
- Menu structure matches `AdminMenuFactory` from `ui.py`
- All ~25 vendor dependencies are correctly loaded
- Sequential script loader ensures correct initialization order
- Scrolling is enabled on the content panel with fixed sidebar
- Sidebar indentation uses universal CSS depth selectors (52px → 86px → 120px)

### Known Constraints

- **API Dependency**: All data-driven pages make REST calls to `/rest/api/v1/<resource>/`. These currently hit the Mock API server (:3001). For pages to display real data, the Mock API must return matching response structures with `{ results: [...], count: N }` format (Django REST Framework pagination).
- **No CSRF**: Local dev skips Django's CSRF token injection. The `ShellController` configures `$httpProvider.defaults.withCredentials = true` but doesn't set CSRF headers.
- **No Authentication**: Local dev has no login/session management. All pages are accessible without auth.
- **No `ng-app` Attribute**: Since scripts are loaded dynamically, we use `angular.bootstrap()` instead of `ng-app="uldb"` on the `<html>` tag.

### clientApp.js Exclusion (Critical)

The `clientApp.js` file (155KB) declares `angular.module('uldb', [...])` **with a dependency array**, which in AngularJS means "create a NEW module" — this would wipe all previously registered controllers, services, and directives from `adminApp.js`. The admin server's `getFiles()` function explicitly excludes:
- `clientApp.js` (by filename)
- The entire `client/` directory (by directory name)

---

## 8. File Statistics Summary

| Area | Files | Total Size |
|------|-------|------------|
| AngularJS Core (`adminApp.js`) | 1 | 62KB |
| API Layer (`api/`) | 3 | **305KB** |
| Controllers (all) | ~52 | ~700KB |
| Services (all) | ~25 | ~200KB |
| Directives | 4 | ~155KB |
| Filters | 2 | ~10KB |
| Templates | ~97 | ~300KB |
| **Total AngularJS App** | **~184** | **~1.7MB** |
| CSS in pipeline | 14+ | varies |
| Vendor JS libs | ~30 | varies |

---

## 9. Execution Commands

```bash
# Terminal 1: Admin Server (serves the AngularJS shell + static files)
agserveadmin          # Starts Express on :8095

# Terminal 2: Mock API (provides REST API responses)
startmock             # Starts Mock API on :3001

# Terminal 3: Proxy (unified entry point)
agstartproxy          # Starts Proxy on :8061

# Access in browser
http://localhost:8061/admin
```

### Alias Definitions (from `dev.sh`)

These aliases should be defined in your shell environment:
```bash
alias agserveadmin="cd tools/admin-server && node server.js"
alias startmock="cd tools/mock-server && node server.js"
alias agstartproxy="cd tools/proxy && node server.js"
```

---

## 10. Sidebar Menu Structure

The sidebar menu hierarchy (from `AdminMenuFactory` / `menu.json`):

```
├── UnitedView
│   ├── Dashboard
│   ├── System Monitoring
│   │   └── Networking
│   └── Activity Log
│
├── UnitedCloud
│   ├── Private Cloud
│   ├── Public Cloud
│   │   ├── AWS
│   │   └── Azure
│   ├── Devices
│   │   ├── Servers, VMs, SANs, Switches
│   │   ├── Firewalls, Load Balancers
│   │   ├── Terminal Servers, Other Device
│   │   └── ...
│   ├── IP Management
│   │   ├── Public IPv4, Private IPv4
│   │   ├── IPv6, VLANs
│   │   └── ...
│   ├── Colo
│   │   ├── Cabinets, PDUs, Cages
│   │   ├── Power Circuits, Colocation Cloud
│   │   └── ...
│   └── UnityConnect
│       ├── UnityConnect, UCPort, VXC
│       └── ...
│
├── UnitedServices
│   └── DevOps-as-a-Service
│       ├── DevOps Scripts, Terraform
│       ├── VM Migration, VM Backup
│       └── DB Instance, Patch Mgmt...
│
├── Support
│   ├── Admin Tickets
│   ├── Change Management
│   ├── Incident Management
│   ├── Service Requests
│   ├── Unity Feedback
│   └── Maintenance
│
└── UnitedSetup
    ├── Tenant Management
    │   ├── Organizations, Users, Storage
    │   └── ...
    ├── Billing & Invoicing
    │   ├── Products, Opportunities
    │   ├── Service Contracts, Import
    │   └── ...
    ├── Customer Integrations
    │   └── Zendesk Integration
    ├── Server Components
    │   ├── CPUs, Memory, Disks
    │   ├── Motherboard, NICs, IPMI
    │   └── Operating Systems
    ├── Cloud Setup
    │   ├── Private Cloud
    │   ├── VMware (vCenter, Proxy, ESXi)
    │   ├── OpenStack (API, Proxy)
    │   └── Networking (Switches, FW, LB)
    ├── Supported Hardware
    │   ├── Manufacturers (PDU, Storage, Mobile, System)
    │   ├── Models (PDU, Switch, FW, LB, Server, Storage...)
    │   ├── Controller Types (SAS, Disk, RAID)
    │   └── Miscellaneous (Product, Chassis, Peripheral...)
    ├── Facilities Config
    │   ├── Datacenters, Locations
    │   ├── Cabinet Types/Options
    │   ├── Circuit Options, Voltage/Amp/Outlet Types
    │   └── Electrical Panels/Circuits
    ├── IP Config
    │   ├── IPv4 ARIN Allocations
    │   ├── IPv6 Allocations
    │   └── Private Allocations
    ├── Monitoring
    │   ├── Configuration
    │   ├── Zabbix (Instance, Maps, Templates, Agents)
    │   └── Observium (Instance, Device/Bill/Port Maps)
    ├── AIOPS
    │   └── Sources
    ├── Discovery
    │   └── OpenAudit
    ├── AWS AMI
    ├── Device Reports
    ├── Service Catalogues
    └── Advanced
        ├── Import Tool
        ├── Impersonate User
        ├── Celery Jobs
        ├── Developer Options
        ├── Proxy Cookies
        └── Release Notes
```

---

## Appendix: Key CSS Files & Their Roles

| CSS File | Role |
|----------|------|
| `css/bootstrap1.min.css` | Bootstrap 3.x base |
| `css/bootstrap-newapp2.min.css` | Bootstrap customizations |
| `css/main-layout.css` | Core layout (wrapperbody, page-wrapper, sidebar) |
| `css/v3/uladmin.css` | UL Admin v3 styles (dashboard, cards, tables) |
| `css/admintemplate.css` | Admin template overrides |
| `css/admin-layout2.css` | **Final production overrides** (sidebar colors, logo, margins) |
| `sb-admin-2.css` | SB Admin 2 theme base (sidebar accordion, navbar) |
| `metisMenu.min.css` | MetisMenu accordion animations |
| `font-awesome.min.css` | Icon library |
| `angular-material.min.css` | Material Design components |
