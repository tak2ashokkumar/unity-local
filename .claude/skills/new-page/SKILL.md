---
name: new-page
description: Scaffold a new Listing, Form (CRUD), or Dashboard page following the ngx-unity archetype reference implementations. Usage - /new-page <listing|form|dashboard> <feature path under src/app/>
disable-model-invocation: true
---

# New Page Scaffold (ngx-unity)

Scaffold a new page for the ngx-unity app (Angular 12.2, TypeScript 4.3, RxJS 6.6) by
copying the project's reference implementation for the requested archetype and applying
every rule from CLAUDE.md. CLAUDE.md at the repo root is the authoritative source; if
anything below conflicts with it, CLAUDE.md wins.

## Arguments

`/new-page <archetype> <feature path>`

- archetype: one of `listing`, `form`, `dashboard`
- feature path: target folder under `uldb/ngx-unity/src/app/` (e.g. `unity-services/foo/foo-list`)

If either argument is missing or ambiguous, ask the user before writing anything.

## Step 1 - Pick and READ the reference implementation first

Always read the full reference (component .ts + .html + .service.ts) BEFORE generating
anything. Mirror its structure, naming style, and patterns exactly.

- listing:
  - Simple list: `uldb/ngx-unity/src/app/unity-setup/unity-setup-user-mgmt/usum-users/`
  - Complex list (bulk actions, polling, async per-row enrichment):
    `uldb/ngx-unity/src/app/united-cloud/shared/firewalls/`
  - Ask the user which variant fits if it is not obvious from their request.
- form:
  - Single form: `uldb/ngx-unity/src/app/unity-setup/unity-setup-user-mgmt/usum-users/usum-users-crud/`
  - Modal form + delete, nested groups, cascading dropdowns:
    `uldb/ngx-unity/src/app/united-cloud/shared/firewalls/firewalls-crud/`
- dashboard:
  - Single-component, per-widget date filters:
    `uldb/ngx-unity/src/app/unity-services/orchestration/orchestration-summary/`
  - Multi-widget, lightweight global date filter:
    `uldb/ngx-unity/src/app/unity-cost-analysis/cost-intelligence/`
  - Full global + local filters + paginated tables:
    `uldb/ngx-unity/src/app/app-dashboard/app-default-dashboards/unified-aiops-command-centre/`
  - Ask the user which variant fits if it is not obvious.

## Step 2 - Generate the files

Create component .ts + .html + .service.ts (+ .scss only if the reference has one),
mirroring the reference. Apply the archetype checklist:

All archetypes:
- `private readonly ngUnsubscribe = new Subject<void>();` declared FIRST; `next()` then
  `complete()` in ngOnDestroy; `takeUntil(this.ngUnsubscribe)` on EVERY subscription.
- Constructor is dependency injection ONLY; all init logic in ngOnInit.
- Injected service naming: own feature service is `svc`; others use short name + `Svc`
  (spinnerSvc, storageSvc, modalSvc, notificationSvc, ...); router/route/cdr keep
  conventional names.
- Class member ordering: ngUnsubscribe -> @Input/@Output -> state fields grouped by
  concern -> @ViewChild at the BOTTOM of the field block -> constructor -> ngOnInit /
  ngOnDestroy -> public methods -> private helpers.
- `subscribe(next, error)` only - no empty completion callback; surface failures via
  AppNotificationService.
- Every `*ngFor` has a trackBy returning a stable id.
- `@ViewChild` on an `<ng-template>` modal is `TemplateRef<void>`; reuse
  CONFIRM_MODAL_CONFIG from `src/app/shared/shared.const.ts` (spread to extend).
- Interfaces declared with `export`. Plain ASCII text only in comments and content.
- Layout is STRICTLY Bootstrap (row/col-*, d-flex, utilities); no custom CSS for layout.

listing:
- ChangeDetectionStrategy.OnPush; inject ChangeDetectorRef; markForCheck() after every
  async state change.
- `finalize(() => this.stopSpinnerAndMarkForCheck())` for spinner teardown; list-load
  owns the 'main' spinner; secondary calls do not touch it.
- Every table `<tr>` uses a column-sizing directive from
  `app-directives/truncate-text.directive.ts`: DEFAULT `truncateText` with `tdw-NN` /
  `tdsw-NN` percentage classes per `<td>`. Use `setTableColumnWidth` ONLY with a stated
  reason (e.g. conditional column count). Tag fixed columns: checkbox-column,
  action-icons-column, status-toggle-column.

form:
- Angular DEFAULT change detection (NOT OnPush) - deliberate difference from listings.
- Reactive forms only. The SERVICE builds the form (buildXForm) and owns
  resetXFormErrors() and xFormValidationMessages; the component holds xForm +
  xFormErrors + xFormValidationMessages + nonFieldErr. Error object mirrors the form's
  shape (nested groups -> nested error object).
- Add vs Edit driven by a route param read in ngOnInit.
- Validation via AppUtilityService.validateForm(form, messages, errors).
- Submit: if invalid -> validateForm once, then a flag-guarded
  bindRevalidationOnChanges() subscribing to valueChanges EXACTLY ONCE; else
  spinnerSvc.start('main') + takeUntil + finalize(stop 'main'); success -> notify +
  goBack(); error -> handleError(err.error). handleError must be null-safe.

dashboard:
- ChangeDetectionStrategy.OnPush; inject ChangeDetectorRef.
- Each widget loads INDEPENDENTLY with its OWN spinner loader key (never one shared
  'main'); a private stopLoader(loader) helper does spinnerSvc.stop(loader) +
  cdr.markForCheck(). For many widgets prefer one private
  loadWidget(loaderName, request$, onSuccess, onError, loadingKey?) helper.
- The SERVICE converts raw API responses into chart configs; the component holds only
  view-model state. Chart-click drill-down navigates with queryParams.
- Filters are optional. If a global filter exists: ONE filterForm built by the service
  from options loaded first (forkJoin); only "Apply" copies form ->
  appliedFilterCriteria and reloads all widgets; reset paginated tables to page 1 on
  Apply. Local widget filters re-fetch ONLY that widget and re-sync from global on Apply.
- Dashboard tables follow ALL the listing table rules (column-sizing directive, trackBy,
  per-table pageNo/pageSize/total).

## Step 3 - Wiring

- Register the component and route following the feature module's existing style (read
  the nearest *.module.ts / *-routing.module.ts and copy its pattern).
- If the page needs a new API, create matching mock JSON under
  `tools/mock-api/customer/` mirroring the URL path structure. NEVER add Angular-side
  workarounds for missing mock endpoints, and never change an existing response shape.

## Step 4 - Hand off to the user

Do NOT run any build, serve, or npm/ng/node commands. Tell the user which command to run
(typically their usual local serve/build) and list the files created.
