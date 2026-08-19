
# Project Coding Guidelines

# High Priority
- Never run any powershell / or any other scripts to capture screen shots.
- This is my company laptop and as per the company rules, Codex / ChatGpt / Claude / Gemini Or any other AI Agent as external agents and the screen captures you do as potencially hacking type. So please don't take screen shots in any circumstances.
- Also please don't run any scripts to change anything apart from the content inside unity-local folder.
- Donot add corrupted/non-ASCII section-divider symbols in comments or in any places. Always Keep the comments readable using simple ASCII text. Do not change any component logic, imports, API calls, template, service, or mock files while handling ASCII Text...
- PRODUCTION WRITE SAFETY: whenever the proxy is on a LIVE environment (any API_ENV other
  than mock - prod, ams, play, alpha) the apps are pointed at a REAL system. In that mode you MUST NOT
  trigger any write API - POST / PUT / PATCH / DELETE - without asking me first and getting
  an explicit yes for that specific action. That includes clicking Save / Create / Delete in
  the UI, running a scripted fetch, "just testing" a form, and anything that buys, imports,
  impersonates or otherwise changes state. Read-only GETs are fine.
  If you cannot tell whether something writes, assume it does and ask.
  Before any such action, confirm which environment is active (GET /__admin_env -> "live").
  In mock mode (default) writes are harmless - the mock only echoes them.

# Command Execution Rules
- NEVER use Bash, PowerShell, or any shell tool to run npm, ng, node, or any terminal commands.
- The user runs ALL commands themselves ( except for updating mocks with .har files). Only tell the user what command to run — do not execute it.
- Never run builds. The user will run the build and report back if something goes wrong.
- ALWAYS give commands as the dev.sh aliases, never as raw npm/node/ng lines. dev.sh is
  sourced in this shell, so the alias is what I actually type. If a task needs something
  dev.sh does not cover yet, ADD an alias to dev.sh first, then tell me that alias name.
  dev.sh is grouped by ENVIRONMENT. Pick the group, then the app:
    navigate  : cdd, uldb, unity, mtp, mockapi, proxy, admin, adminreact
    mock api  : startmock                      (Express mock on :3001, needed for MOCK)
    MOCK      : mock-admin, mock-unity, mock-mtp        (+ mock-admin-legacy)
    PROD      : prod-admin, prod-unity, prod-mtp        (+ prod-admin-legacy)
    AMS       : ams-admin, ams-unity, ams-mtp           (+ ams-admin-legacy)
    PLAY      : play-admin, play-unity, play-mtp        (+ play-admin-legacy)
    ALPHA     : alpha-admin, alpha-unity, alpha-mtp     (+ alpha-admin-legacy)
    app builds: buildunity/serveunity, buildmtp/servemtp,
                buildadmin, buildadminwatch, serveadminreact, serveadmin (legacy), buildprod
    python    : pythonlocal
  Only ONE proxy runs at a time - it serves ngx-unity (:8091), the admin panel
  (:8091/admin) and ngx-mtp (:8061) together, so within a group the three app
  commands are equivalent and just state intent.

# Project Scope
- Primary work is inside uldb/ngx-unity/ only.
- Do not touch anything outside the unity-local folder.

# Dev Environment
- Angular 12.2.0, TypeScript 4.3.5, RxJS 6.6
- Node 14.17.6 — auto-configured via .bashrc when inside the unity-local folder.
- Plain npm install works. Do NOT suggest --legacy-peer-deps or any extra install flags.
- Do not modify the portable node setup.
- 3-tier local architecture:
  - Browser -> localhost:8091 (Proxy)
  - Proxy /customer/* -> localhost:3001 (Mock API -- Express + JSON files)
  - Proxy /* -> localhost:8090 (Angular static server)
- Proxy configs must remain in tools/proxy. Do not move or duplicate them.

# Data Source: environments (mock + several live systems)
- ONE setting decides where ALL THREE front ends get their data - API_ENV in
  tools/proxy/server.js. Do not set it by hand; use the dev.sh group for that
  environment (see Command Execution Rules).
      mock   local mock API on :3001   (tools/mock-api JSON files)   [default, safe]
      prod   https://unity.unitedlayer.com
      ams    http://unity-ams.unitedlayer.com
      play   https://play.unityone.ai
      alpha  https://alpha.unityone.ai
- Add a new environment by adding one entry to API_ENVIRONMENTS in tools/proxy/server.js
  and a matching group of aliases in dev.sh. Nothing in any app changes.
- It covers every app, because they all reach data through that one file:
    admin panel (legacy + ngx-admin) : http://localhost:8091/admin
    ngx-unity                        : http://localhost:8091
    ngx-mtp                          : http://localhost:8061
- The mock JSON files always stay in place; switching environments never touches them.
- Auth on a live environment: the API accepts ONLY Django SessionAuthentication - there is
  no API token. Each environment is a separate login, so each needs its own session file:
      tools/proxy/.cookie-<env>      e.g. .cookie-prod, .cookie-play, .cookie-alpha
  (.prod-cookie still works for prod). Gitignored, re-read per request, so refreshing an
  expired session needs no restart. Never commit, print, echo or log a cookie value.
- For writes the proxy adds Origin, Referer and X-CSRFToken, which DRF SessionAuthentication
  requires. An expired session comes back as a clean JSON 401, not login HTML.
- Calling a live backend straight from the browser is impossible by design, so do not try:
  django-cors-headers is disabled in settings.py (no Access-Control-Allow-Origin is ever
  sent) and the Django session cookie is SameSite=Lax (not sent cross-site). The
  server-side proxy is the only path that works.
- GET /__admin_env on either proxy reports { env, label, apiTarget, live, authenticated }
  so the active environment is always checkable. ngx-admin shows a red LIVE banner when
  live. An unreachable host returns a JSON 502 naming the error code.
- Ports are overridable via PROXY_PORT / MTP_PROXY_PORT (defaults 8091 / 8061).

## General
- Use existing project patterns. Do NOT introduce new abstractions unless explicitly requested.
- Keep changes small and scoped.
- Do not rename variables/functions unless required.
- Avoid clever code when straightforward code is enough.

## API Endpoints
- ALL API endpoint constants MUST be declared in `uldb/ngx-unity/src/app/shared/api-endpoint.const.ts`.
  This is the ONLY file intended for endpoint URL structures.
- Do NOT add API endpoint constants to `app-constants.ts` or any other file. `app-constants.ts`
  is for non-endpoint constants only (console/message/UI constants, mappings, etc.).
- When adding or moving an endpoint, place it in `api-endpoint.const.ts` and import it from there.

## Angular
- Do not restructure or reorganize component logic unless explicitly asked.
- Do NOT add new shared helpers unless the same logic is needed in at least 2 places.
- Only modify HTML templates when the task explicitly requires it. Do not refactor templates unnecessarily.
- Keep service API mappings close to existing service style.
- ALWAYS follow existing naming conventions exactly. Do NOT invent new naming patterns for variables, methods, functions, constants, or enums.
- OnDestroy support variable should always be ngUnsubscribe. Don't take it as destroy$ or any other.
- Always declare interfaces with export keyword and import where ever is needed.

### Injected service naming
- The component's own feature service is named: svc.
- Other injected services use a short name + Svc suffix: spinnerSvc, storageSvc, modalSvc,
  notificationSvc, ticketSvc, termSvc, crudSvc, appSvc.
- Non-*Service injections keep conventional names: router, route, cdr.

### Class member ordering
Declare fields (variables) in THIS exact top-to-bottom order:
1. @Input() - if any (component's public API / initial-render surface).
2. @Output() - if any.
3. private readonly ngUnsubscribe = new Subject<void>(); - the OnDestroy support variable
   (always named ngUnsubscribe, never destroy$).
4. Route / param-related variables - if any (e.g. ids read from paramMap).
5. Filter / search-state variables - if any (e.g. currentCriteria, and any applied-filter
   snapshot like appliedFilterCriteria).
6. (ONE blank line)
7. Component-functionality state fields - ordered to FOLLOW the sequence of actions the user
   performs on the page (top-to-bottom mirrors first-used -> last-used). Group by concern with
   blank lines between groups.

- @ViewChild stays SEPARATE at the BOTTOM of the field block (resolves after AfterViewInit;
  used for post-load actions such as opening modals - not part of the input/output API).
- Overall class layout: fields -> constructor (DI only) -> ngOnInit -> ngOnDestroy ->
  public methods -> private helpers at the bottom.

### Lifecycle hooks (MANDATORY for every component)
Every component MUST implement BOTH `OnInit` and `OnDestroy`. Import them from
'@angular/core' and declare them on the class:
`export class XComponent implements OnInit, OnDestroy`. Add any other hook actually used
(OnChanges, AfterViewInit, etc.) - but OnInit + OnDestroy are the baseline for all.
- The CONSTRUCTOR is dependency injection ONLY. No API calls, no subscriptions, no
  paramMap reads, no spinner starts - none of that in the constructor.

ngOnInit - all initialization lives here:
- Read route params (paramMap), decide Add vs Edit, build forms, start the first data
  load / polling, start the 'main' (or per-widget) spinner.
- Every subscription created here (or anywhere) MUST be piped through
  `takeUntil(this.ngUnsubscribe)`.

ngOnDestroy - full teardown, in this order:
1. HIDE EVERY OPEN MODAL. Any BsModalRef the component assigns from
   `this.modalService.show(...)` MUST be hidden here with safe navigation, e.g.
   `this.confirmModalRef?.hide();` (repeat for every modal-ref field). BsModalService
   attaches the modal to document.body, so a modal left open survives route changes
   (browser Back) and floats over later pages. This was the DCIM-881 bug.
2. Stop any spinner this component started, e.g. `this.spinner.stop('main');`.
3. Complete the unsubscribe subject:
   `this.ngUnsubscribe.next(); this.ngUnsubscribe.complete();`
- The unsubscribe subject is ALWAYS named `ngUnsubscribe` (never destroy$). Declare it as
  `private readonly ngUnsubscribe = new Subject<void>();`.

Canonical shape:
```ts
export class XComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  modalRef: BsModalRef;               // any modal ref(s) this component opens

  constructor(private svc: XService, private modalService: BsModalService) {}  // DI only

  ngOnInit(): void {
    // paramMap / form build / first load / spinner start
  }

  ngOnDestroy(): void {
    this.modalRef?.hide();            // hide EVERY modal ref opened by this component
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
```

## Page Archetypes
Most pages are one of: Dashboard, Listing, or Form. Match the reference for that type.

### Listing pages
Reference implementations (copy these patterns):
- Simple listing: src/app/unity-setup/unity-setup-user-mgmt/usum-users/
  (usum-users.component.ts + .html + .service.ts)
- Complex listing (bulk actions, polling, async per-row enrichment):
  src/app/united-cloud/shared/firewalls/ (firewalls.component.ts + .html + .service.ts)

Listing standard:
- ChangeDetectionStrategy.OnPush; inject ChangeDetectorRef; call markForCheck() after every
  async state change (including async per-row updates).
- private readonly ngUnsubscribe = new Subject<void>(); next()/complete() in ngOnDestroy;
  pipe every subscription through takeUntil(this.ngUnsubscribe).
- Init logic (paramMap, polling, first load) goes in ngOnInit, never the constructor.
  Constructor is dependency injection only.
- Use finalize(() => this.stopSpinnerAndMarkForCheck()) for spinner teardown so it runs on
  success AND error. The list-load call owns the 'main' spinner; secondary calls (e.g. a
  lookup that only feeds a button's enabled state) must NOT control it.
- subscribe(next, error) only - no empty completion callback. Surface failures via
  AppNotificationService.
- Every *ngFor has a trackBy returning a stable id.
- Reuse CONFIRM_MODAL_CONFIG from src/app/shared/shared.const.ts for confirm/action modals;
  spread to extend, e.g. { ...CONFIRM_MODAL_CONFIG, class: 'modal-lg' }.
- @ViewChild on an <ng-template> modal is typed TemplateRef<void>, not ElementRef.
- Every listing table <tr> MUST use a column-sizing directive from
  app-directives/truncate-text.directive.ts. Both add text-truncate and toggle
  custom-tooltip-hide so a [tooltip] only appears when the cell text actually overflows:
  - DEFAULT: truncateText -> proportional widths; give each <td> a tdw-NN (or tdsw-NN)
    percentage class. (reference: usum-users)
  - Use setTableColumnWidth (equal-width columns, no per-column width classes) ONLY when
    truncateText cannot serve the purpose; state the reason, and when in doubt ask before
    choosing it. Valid example: a table with a conditional column (*ngIf) where the column
    count varies, so equal-split adapts automatically. (reference: firewalls - Cloud column
    is conditional)
  Tag fixed columns so the directive excludes them from width distribution:
  checkbox-column, action-icons-column (and status-toggle-column for truncateText).

### Form (CRUD) pages
Reference implementations (copy these patterns):
- Single form: src/app/unity-setup/unity-setup-user-mgmt/usum-users/usum-users-crud/
- Modal form + delete, nested groups, cascading dropdowns, custom-attributes sub-form:
  src/app/united-cloud/shared/firewalls/firewalls-crud/

Form standard:
- Forms use Angular DEFAULT change detection - NOT OnPush. (Reactive-form wizards add/
  remove controls and mutate error objects in many places; OnPush is not worth the risk.)
  This is the deliberate difference from the Listing standard.
- Reactive forms only. The SERVICE builds the form (buildXForm) and owns resetXFormErrors()
  and the xFormValidationMessages object; the component holds xForm + xFormErrors +
  xFormValidationMessages + nonFieldErr.
- The error object mirrors the form's shape: a flat form -> Record<string, string>; a form
  with nested groups -> nested object (keep as the service's type / any). Do not force a
  flat type onto a nested error object.
- Add vs Edit is driven by a route param read in ngOnInit (constructor is DI only).
- Show validation via the shared AppUtilityService.validateForm(form, messages, errors).
- Submit:
  - if (form.invalid): run validateForm once, then call a guarded bindRevalidationOnChanges()
    that subscribes to form.valueChanges EXACTLY ONCE (flag-guarded) to re-validate on every
    change. NEVER subscribe to valueChanges inside the submit handler - repeated invalid
    submits would stack duplicate subscriptions.
  - else: spinnerSvc.start('main'); call the save with
    .pipe(takeUntil(ngUnsubscribe), finalize(() => spinnerSvc.stop('main'))); on success
    notify + goBack(); on error handleError(err.error).
- handleError(err) must be null-safe: if (!err) show a generic notification and return;
  else map non_field_errors -> nonFieldErr and field errors -> formErrors[field].
- private readonly ngUnsubscribe = new Subject<void>(); takeUntil on every subscription.
- @ViewChild on an <ng-template> modal is TemplateRef<void>; reuse CONFIRM_MODAL_CONFIG
  (spread to extend, e.g. { ...CONFIRM_MODAL_CONFIG, class: 'modal-lg' }).
- err payloads from HttpErrorResponse.error and the service-owned validation-message object
  are accepted `any` boundaries; type everything else.

### Dashboard pages
Reference implementations (copy these patterns):
- Single-component dashboard (per-widget date filters): src/app/unity-services/orchestration/orchestration-summary/
- Multi-widget dashboard (lightweight global date filter + one local trend filter):
  src/app/unity-cost-analysis/cost-intelligence/ (cost-intelligence + unified-cost-intelligence-hub)
- Full global + local filters + paginated tables:
  src/app/app-dashboard/app-default-dashboards/unified-aiops-command-centre/

Dashboard standard:
- ChangeDetectionStrategy.OnPush; inject ChangeDetectorRef.
- Each widget loads INDEPENDENTLY and owns its OWN spinner loader key (e.g.
  'totalCostWidgetLoader') - NOT one shared 'main' spinner. Widgets load and fail independently.
- private readonly ngUnsubscribe = new Subject<void>(); takeUntil on every subscription;
  next()/complete() in ngOnDestroy. Constructor is DI only; init in ngOnInit.
- Per widget: spinnerSvc.start(loader); reset that widget's view-data; then
  .pipe(takeUntil(ngUnsubscribe), finalize(() => this.stopLoader(loader))). A single private
  stopLoader(loader) helper does spinnerSvc.stop(loader) + cdr.markForCheck() - this is the
  OnPush repaint for that widget. On success set the view-data; on error surface via
  AppNotificationService.
- For a dashboard with MANY widgets, prefer one private loadWidget(loaderName, request$,
  onSuccess, onError, loadingKey?) helper (start loader + optional loading flag; takeUntil +
  finalize to stop/clear; subscribe) instead of repeating start/finalize/stop per method.
  (reference: unified-aiops-command-centre)
- The SERVICE converts raw API -> chart configs (convertToXChartData -> UnityChartDetails /
  echarts options). The component holds only view-model state.
- Chart-click drill-down: bind (chartInit)/(click) -> navigate with queryParams (goToX).
- echarts params / series-tuple any[] and form-event payloads are accepted `any` boundaries.

Filters are OPTIONAL. A dashboard may have no global filter, and a widget may have no local
filter. The two filter rules below apply ONLY when such a filter exists.
- IF a dashboard has a global (page-level) filter: ONE filterForm built by the service from
  options loaded first (forkJoin). Keep the live form value separate from appliedFilterCriteria
  (the applied snapshot). Only "Apply" copies form -> appliedFilterCriteria and reloads ALL
  widgets with that same criteria; never reload per keystroke. Guard loadData() until the
  form/options exist; reset paginated tables to page 1 on Apply. (A single shared date dropdown
  that reloads every widget is a lightweight global filter - same rule.)
- IF a widget has its own local filter (incl. chart widgets): it (a) combines with the global
  applied criteria when one exists (spread, or seed a local form from the global selection),
  (b) re-fetches ONLY that widget, never the whole dashboard, (c) re-syncs from global on Apply.

Tables in a dashboard follow ALL the Listing table rules: the column-sizing directive
(DEFAULT truncateText with tdw-NN/tdsw-NN classes; setTableColumnWidth only with a stated
reason - see the Listing "column-sizing directive" rule above) AND a trackBy on every *ngFor.
- Paginated tables keep per-table pageNo/pageSize/total, pass (criteria, pageNo, pageSize),
  re-fetch ONLY that table on pageChange/pageSizeChange using appliedFilterCriteria, and reset
  to page 1 on global Apply.
- Non-paginated fixed tables render the array whole (still with the directive + trackBy).

## SCSS
- NEVER write a custom CSS class if a Bootstrap utility class can achieve the same result.
- GRID IS STRICTLY BOOTSTRAP ONLY:
  - Multi-column layouts must use row + col-* (col-4, col-md-6, col-lg-3 etc.)
  - Side-by-side / flex layouts must use d-flex, justify-content-*, align-items-*, flex-wrap etc.
  - NEVER write custom CSS for display:flex, display:grid, float, or width percentages for layout.
- Before writing any custom SCSS, check if these Bootstrap utilities cover it:
  d-flex, p-*, m-*, text-*, fw-*, w-*, h-*, border-*, rounded,
  justify-content-*, align-items-*, flex-*, row, col-*
- Custom SCSS is ONLY allowed when Bootstrap utilities genuinely cannot achieve the result
  (e.g., specific pixel overrides, pseudo-elements, animations, hover effects).
- For paddings, margins, widths, colors - use existing Bootstrap utility patterns.
- Do not redesign UI unless requested.
- Use existing global classes as priority; if explicitly needed prefer scoped class changes.
- Avoid global style changes unless necessary.

## Mock Data
- Do not move mock APIs inside Angular apps.
- Keep mock file names aligned with endpoint names.
- Do NOT modify the API response shape. Preserve it exactly as-is.
- New mock endpoints go in tools/mock-api/customer/ matching the URL path structure.
- ALWAYS extend the mock server for missing data. Never add Angular-side workarounds to compensate for missing mock endpoints.
