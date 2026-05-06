import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppDashboardCollectionsCrudService } from './app-dashboard-collections-crud.service';
import { CollectionDetailResponse, DashboardItem, GroupOption, RoleOption } from './app-dashboard-collections-crud.type';

@Component({
  selector: 'app-dashboard-collections-crud',
  templateUrl: './app-dashboard-collections-crud.component.html',
  styleUrls: ['./app-dashboard-collections-crud.component.scss'],
  providers: [AppDashboardCollectionsCrudService]
})
export class AppDashboardCollectionsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  collectionId: string;
  nonFieldErr: string = '';

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  groups: GroupOption[] = [];
  roles: RoleOption[] = [];
  defaultDashboards: DashboardItem[] = [];
  myDashboards: DashboardItem[] = [];
  selectedDashboards: DashboardItem[] = [];

  defaultSearch = '';
  mySearch = '';
  selectedSearch = '';

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
  };

  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'selected',
    checkedPlural: 'selected',
    searchPlaceholder: 'Search',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  get filteredDefault(): DashboardItem[] {
    const q = this.defaultSearch.trim().toLowerCase();
    const dashboards = this.availableDefaultDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredMy(): DashboardItem[] {
    const q = this.mySearch.trim().toLowerCase();
    const dashboards = this.availableMyDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredSelected(): DashboardItem[] {
    const q = this.selectedSearch.trim().toLowerCase();
    return q ? this.selectedDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.selectedDashboards;
  }

  get availableDefaultDashboards(): DashboardItem[] {
    return this.defaultDashboards.filter(dashboard => !this.isDashboardSelected(dashboard));
  }

  get availableMyDashboards(): DashboardItem[] {
    return this.myDashboards.filter(dashboard => !this.isDashboardSelected(dashboard));
  }

  get dashboardsToBeSelectedCount(): number {
    return [
      ...this.availableDefaultDashboards,
      ...this.availableMyDashboards
    ].filter(dashboard => dashboard.checked).length;
  }

  get dashboardsToBeRemovedCount(): number {
    return this.selectedDashboards.filter(dashboard => dashboard.checked).length;
  }

  constructor(
    private svc: AppDashboardCollectionsCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionId = params.get('collectionId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm(data?: CollectionDetailResponse) {
    this.nonFieldErr = '';
    this.form = this.svc.buildForm(data, this.groups, this.roles);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.formValidationMessages;
  }

  loadInitialData() {
    if (this.collectionId) {
      this.getCollectionData();
    } else {
      this.getDropdownData();
    }
  }

  getCollectionData() {
    this.svc.getCollection(this.collectionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(collection => {
      if (!collection) {
        this.spinner.stop('main');
        this.notification.error(new Notification('Collection details not found.'));
        return;
      }
      this.getDropdownData(collection);
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Collection. Try again later.'));
    });
  }

  getDropdownData(collection?: CollectionDetailResponse) {
    forkJoin({
      groups: this.svc.getGroups().pipe(catchError(() => of([]))),
      roles: this.svc.getRoles().pipe(catchError(() => of([]))),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ groups, roles, defaults, myDash }) => {
      this.groups = groups;
      this.roles = roles;
      this.defaultDashboards = defaults;
      this.myDashboards = myDash;

      this.buildForm(collection);
      if (collection) {
        this.selectedDashboards = this.svc.getSelectedDashboards(collection, [...defaults, ...myDash]);
      }
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load data. Try again later.'));
    });
  }

  setStatus(status: 'draft' | 'published') {
    this.form.get('status').setValue(status);
  }

  moveToSelected() {
    const checked = [
      ...this.availableDefaultDashboards.filter(d => d.checked),
      ...this.availableMyDashboards.filter(d => d.checked)
    ];
    checked.forEach(item => {
      if (!this.selectedDashboards.some(s => s.uuid === item.uuid)) {
        this.selectedDashboards = [...this.selectedDashboards, { ...item, checked: false }];
      }
      item.checked = false;
    });
    this.formErrors.dashboards = '';
  }

  moveFromSelected() {
    this.selectedDashboards = this.selectedDashboards.filter(dashboard => !dashboard.checked);
  }

  isDashboardSelected(item: DashboardItem): boolean {
    return this.selectedDashboards.some(dashboard => dashboard.uuid === item.uuid);
  }

  onSubmit() {
    if (this.form.invalid || !this.selectedDashboards.length) {
      this.validateForm();
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.validateForm();
      });
      return;
    }

    this.spinner.start('main');
    let obj = this.svc.convertToPayload(Object.assign({}, this.form.getRawValue()), this.selectedDashboards);

    const action$ = this.collectionId
      ? this.svc.updateCollection(this.collectionId, obj)
      : this.svc.createCollection(obj);

    action$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinner.stop('main');
      const msg = this.collectionId ? 'Collection updated successfully.' : 'Collection created successfully.';
      this.notification.success(new Notification(msg));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  validateForm() {
    this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
    this.formErrors.access_scope = '';
    this.formErrors.dashboards = '';

    if (this.form.hasError('accessScopeExclusive')) {
      this.formErrors.access_scope = 'Select either Groups or Roles, not both.';
    } else if (this.form.hasError('accessScopeRequired')) {
      this.formErrors.access_scope = 'Select at least one Group or Role.';
    }

    if (!this.selectedDashboards.length) {
      this.formErrors.dashboards = 'Select at least one dashboard.';
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err?.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err?.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        } else if (field === 'dashboards') {
          this.formErrors.dashboards = err[field][0];
        } else if (field === 'groups' || field === 'roles') {
          this.formErrors.access_scope = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    this.router.navigate(['collections'], { relativeTo: this.route.parent });
  }

}
