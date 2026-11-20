import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { RoleType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { refreshIntervals } from '../../app-dashboard.service';
import { AppCustomDashboardGlobalFiltersComponent } from '../app-custom-dashboard-global-filters/app-custom-dashboard-global-filters.component';
import { AppCustomDashboardPanelsComponent } from '../app-custom-dashboard-panels/app-custom-dashboard-panels.component';
import { CustomDashboardCategoryOption, CUSTOM_DASHBOARD_CATEGORIES, CUSTOM_DASHBOARD_STEPS } from '../app-custom-dashboards.const';
import { CustomDashboard, CustomDashboardBasics, CustomDashboardPanel, CustomDashboardPublishError, CustomDashboardReview } from '../app-custom-dashboards.type';
import { AppCustomDashboardCrudService } from './app-custom-dashboard-crud.service';

const STEP_BASICS = 1;
const STEP_PANELS = 2;
const STEP_FILTERS = 3;
const STEP_REVIEW = 4;

@Component({
  selector: 'app-custom-dashboard-crud',
  templateUrl: './app-custom-dashboard-crud.component.html',
  styleUrls: ['./app-custom-dashboard-crud.component.scss'],
  providers: [AppCustomDashboardCrudService]
})
export class AppCustomDashboardCrudComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  private revalidateBound = false;
  dashboardId: string;
  action: 'Create' | 'Edit';

  steps: string[] = CUSTOM_DASHBOARD_STEPS;
  currentStep: number = STEP_BASICS;
  dashboard: CustomDashboard;

  basicsForm: FormGroup;
  basicsFormErrors: Record<string, string>;
  basicsFormValidationMessages: any;
  nonFieldErr = '';

  categories: CustomDashboardCategoryOption[] = CUSTOM_DASHBOARD_CATEGORIES;
  roles: RoleType[] = [];
  users: UnitySetupUser[] = [];
  refreshIntervals = refreshIntervals;

  // Menus render inside the form (not appended to body): an appended menu that runs past the
  // page footer makes the shared dropdown stretch the page, adding an extra scroll. Roles and
  // Specific users sit low on the form, so they open upward.
  categorySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: false,
    width: '100%',
    maxHeight: '260px'
  };
  roleSettings: IMultiSelectSettings = { ...this.categorySettings, lableToDisplay: 'name', keyToSelect: 'id', dynamicTitleMaxItems: 1, containerClasses: 'dropup' };
  userSettings: IMultiSelectSettings = { ...this.categorySettings, lableToDisplay: 'email', keyToSelect: 'id', dynamicTitleMaxItems: 1, containerClasses: 'dropup' };
  categoryTexts: IMultiSelectTexts = { defaultTitle: 'Select categories...' };
  roleTexts: IMultiSelectTexts = { defaultTitle: 'Select roles...' };
  userTexts: IMultiSelectTexts = { defaultTitle: 'Select users...' };

  review: CustomDashboardReview;
  reviewPanels: CustomDashboardPanel[] = [];
  panelFilters: { [panelId: string]: { [key: string]: string[] } } = {};
  publishErrors: CustomDashboardPublishError[] = [];

  @ViewChild(AppCustomDashboardPanelsComponent) panelsStep: AppCustomDashboardPanelsComponent;
  @ViewChild(AppCustomDashboardGlobalFiltersComponent) filtersStep: AppCustomDashboardGlobalFiltersComponent;

  constructor(private svc: AppCustomDashboardCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilSvc: AppUtilityService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.dashboardId = params.get('dashboardId');
      this.action = this.dashboardId ? 'Edit' : 'Create';
    });
    // Steps after Basics need a saved dashboard; ?step= lets the wizard reopen where it was.
    const step = Number(this.route.snapshot.queryParamMap.get('step'));
    this.currentStep = this.dashboardId && step >= STEP_BASICS && step <= STEP_REVIEW ? step : STEP_BASICS;
    this.spinnerSvc.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData(): void {
    this.roles = [];
    this.users = [];
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ roles, users }) => {
      if (roles) {
        this.roles = roles;
      } else {
        this.notificationSvc.error(new Notification('Error while fetching Roles'));
      }
      if (users) {
        this.users = users;
      } else {
        this.notificationSvc.error(new Notification('Error while fetching Users'));
      }
      if (this.dashboardId) {
        this.getDashboard();
      } else {
        this.buildBasicsForm();
        this.spinnerSvc.stop('main');
      }
    });
  }

  getDashboard(): void {
    this.svc.getDashboard(this.dashboardId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboard) => {
        this.dashboard = res;
        this.buildBasicsForm();
        if (this.currentStep === STEP_REVIEW) {
          this.getReview();
        }
      }, () => {
        this.notificationSvc.error(new Notification('Failed to fetch Dashboard details'));
      });
  }

  buildBasicsForm(): void {
    this.basicsForm = this.svc.buildBasicsForm(this.dashboard);
    this.basicsFormErrors = this.svc.resetBasicsFormErrors();
    this.basicsFormValidationMessages = this.svc.basicsFormValidationMessages;
    this.subscribeToFormChanges();
  }

  // ---------- wizard navigation ----------

  isStepDone(step: number): boolean {
    return step < this.currentStep;
  }

  goToStep(step: number): void {
    if (step === this.currentStep) {
      return;
    }
    this.moveTo(step);
  }

  onBack(): void {
    if (this.currentStep === STEP_BASICS) {
      this.goBack();
      return;
    }
    this.moveTo(this.currentStep - 1);
  }

  onSaveAsDraft(): void {
    this.moveTo('list');
  }

  onNext(): void {
    if (this.currentStep === STEP_REVIEW) {
      this.publishDashboard();
      return;
    }
    this.moveTo(this.currentStep + 1);
  }

  onDashboardChange(dashboard: CustomDashboard): void {
    this.dashboard = dashboard;
  }

  goBack(): void {
    if (this.dashboardId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  // ---------- Step 1 ----------

  handleError(err: any): void {
    this.basicsFormErrors = this.svc.resetBasicsFormErrors();
    if (!err) {
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else {
      for (const field in err) {
        if (field in this.basicsForm.controls) {
          this.basicsFormErrors[field] = Array.isArray(err[field]) ? err[field][0] : `${err[field]}`;
        }
      }
    }
  }

  // ---------- Step 4 ----------

  // Publish waits for a review that says the dashboard is ready and publishing is on. If the
  // review could not be loaded the server still validates the publish request.
  canPublish(): boolean {
    return !this.review || (this.review.ready && this.review.publishing && this.review.publishing.available);
  }

  getPanelColumnClass(panel: CustomDashboardPanel): string {
    return this.svc.getPanelColumnClass(panel.width);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByPanel(_index: number, panel: CustomDashboardPanel): string {
    return panel.id;
  }

  // ---------- private helpers ----------

  // Every move (Next, Back, stepper click, Save as Draft) first saves the step being left.
  private moveTo(target: number | 'list'): void {
    switch (this.currentStep) {
      case STEP_BASICS:
        this.saveBasics(target);
        break;
      case STEP_PANELS:
        if (this.panelsStep && this.panelsStep.hasUnsavedChanges()) {
          this.notificationSvc.error(new Notification('Save or discard the panel changes (Save Panel) before you continue.'));
          return;
        }
        // Going forward needs something to filter and review; Back / Save as Draft do not.
        if (target !== 'list' && target > STEP_PANELS && !this.getSavedPanelCount()) {
          this.notificationSvc.error(new Notification('Add and save at least one Smart Panel before you continue.'));
          return;
        }
        this.finishMove(target);
        break;
      case STEP_FILTERS:
        this.saveGlobalFilters(target);
        break;
      default:
        this.finishMove(target);
    }
  }

  private finishMove(target: number | 'list'): void {
    if (target === 'list') {
      this.goBack();
      return;
    }
    this.currentStep = target;
    this.publishErrors = [];
    this.router.navigate([], { relativeTo: this.route, queryParams: { step: target }, replaceUrl: true });
    if (target === STEP_REVIEW) {
      this.getReview();
    }
  }

  private saveBasics(target: number | 'list'): void {
    if (this.dashboardId && !this.basicsForm.dirty) {
      this.finishMove(target);
      return;
    }
    if (this.basicsForm.invalid) {
      this.basicsFormErrors = this.utilSvc.validateForm(this.basicsForm, this.basicsFormValidationMessages, this.basicsFormErrors);
      this.bindRevalidationOnChanges();
      return;
    }
    this.nonFieldErr = '';
    this.spinnerSvc.start('main');
    const fd: CustomDashboardBasics = this.basicsForm.value;
    if (this.dashboardId) {
      this.svc.updateDashboard(this.dashboardId, { ...fd, expected_version: this.dashboard.version })
        .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
        .subscribe((res: CustomDashboard) => {
          this.dashboard = res;
          this.basicsForm.markAsPristine();
          this.notificationSvc.success(new Notification('Dashboard updated successfully.'));
          this.finishMove(target);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      return;
    }
    this.svc.createDashboard(fd)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboard) => {
        this.notificationSvc.success(new Notification('Dashboard created successfully.'));
        if (target === 'list') {
          this.goBack();
          return;
        }
        // The remaining steps work on the saved dashboard, so continue on its edit URL.
        this.router.navigate(['../', res.uuid, 'edit'], { relativeTo: this.route, queryParams: { step: target }, replaceUrl: true });
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
  }

  private getSavedPanelCount(): number {
    return this.dashboard && this.dashboard.definition && this.dashboard.definition.panels ? this.dashboard.definition.panels.length : 0;
  }

  private saveGlobalFilters(target: number | 'list'): void {
    if (!this.filtersStep || !this.filtersStep.isDirty()) {
      this.finishMove(target);
      return;
    }
    if (!this.filtersStep.isValid()) {
      this.notificationSvc.error(new Notification('Please fix the highlighted filters before you continue.'));
      return;
    }
    const request$ = this.filtersStep.getSaveRequest();
    if (!request$) {
      this.finishMove(target);
      return;
    }
    this.spinnerSvc.start('main');
    request$.pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboard) => {
        this.dashboard = res;
        this.filtersStep.markSaved();
        this.notificationSvc.success(new Notification('Global filters saved successfully.'));
        this.finishMove(target);
      }, (err: HttpErrorResponse) => {
        const detail = err.error && err.error.detail;
        this.notificationSvc.error(new Notification(detail ? `Failed to save global filters: ${detail}` : 'Failed to save global filters. Please try again.'));
      });
  }

  private getReview(): void {
    this.review = null;
    this.reviewPanels = this.dashboard.definition && this.dashboard.definition.panels ? this.dashboard.definition.panels : [];
    this.panelFilters = {};
    this.reviewPanels.forEach(p => this.panelFilters[p.id] = this.svc.getPanelFilters(this.dashboard, p.id));
    this.spinnerSvc.start('main');
    this.svc.getReview(this.dashboard.uuid).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboardReview) => {
        this.review = res;
      }, () => {
        this.notificationSvc.error(new Notification('Failed to review the dashboard.'));
      });
  }

  private publishDashboard(): void {
    this.publishErrors = [];
    this.spinnerSvc.start('main');
    this.svc.publishDashboard(this.dashboard.uuid, this.dashboard.version)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Dashboard published successfully.'));
        this.goBack();
      }, (err: HttpErrorResponse) => {
        if (err.status === 503) {
          this.notificationSvc.error(new Notification('Publishing is unavailable right now. The dashboard is kept as draft.'));
          return;
        }
        this.publishErrors = this.svc.getPublishErrors(err);
        const detail = err.error && err.error.detail;
        this.notificationSvc.error(new Notification(this.publishErrors.length
          ? 'The dashboard is not ready to publish. See the issues listed above the previews.'
          : (detail || 'Failed to publish the dashboard. Please try again.')));
      });
  }

  // The interval only applies while auto refresh is on; disabling it also drops it from
  // validation and from the request body.
  private subscribeToFormChanges(): void {
    this.basicsForm.get('refresh').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((refresh: boolean) => {
      const intervalControl = this.basicsForm.get('refresh_interval_in_sec');
      if (refresh) {
        intervalControl.enable();
      } else {
        intervalControl.disable();
        this.basicsFormErrors.refresh_interval_in_sec = '';
      }
    });
  }

  // Re-validate on every change once the user has attempted submit. Bound once
  // so repeated invalid submits do not stack valueChanges subscriptions.
  private bindRevalidationOnChanges(): void {
    if (this.revalidateBound) {
      return;
    }
    this.revalidateBound = true;
    this.basicsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.basicsFormErrors = this.utilSvc.validateForm(this.basicsForm, this.basicsFormValidationMessages, this.basicsFormErrors);
    });
  }
}
