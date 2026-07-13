
# Project Coding Guidelines

# High Priority
- Never run any powershell / or any other scripts to capture screen shots.
- This is my company laptop and as per the company rules, Codex / ChatGpt / Claude / Gemini Or any other AI Agent as external agents and the screen captures you do as potencially hacking type. So please don't take screen shots in any circumstances.
- Also please don't run any scripts to change anything apart from the content inside unity-local folder.
- Donot add corrupted/non-ASCII section-divider symbols in comments or in any places. Always Keep the comments readable using simple ASCII text. Do not change any component logic, imports, API calls, template, service, or mock files while handling ASCII Text...

# Command Execution Rules
- NEVER use Bash, PowerShell, or any shell tool to run npm, ng, node, or any terminal commands.
- The user runs ALL commands themselves ( except for updating mocks with .har files). Only tell the user what command to run — do not execute it.
- Never run builds. The user will run the build and report back if something goes wrong.

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

## General
- Use existing project patterns. Do NOT introduce new abstractions unless explicitly requested.
- Keep changes small and scoped.
- Do not rename variables/functions unless required.
- Avoid clever code when straightforward code is enough.

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
- private readonly ngUnsubscribe first.
- @Input / @Output at the top (component's public API / initial-render surface).
- @ViewChild kept separate at the BOTTOM of the field block (resolves after AfterViewInit;
  used for post-load actions such as opening modals - not part of the input/output API).
- Group remaining state fields by concern, separated by blank lines.
- Overall: fields -> constructor (DI only) -> ngOnInit/ngOnDestroy -> public methods ->
  private helpers at the bottom.

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
