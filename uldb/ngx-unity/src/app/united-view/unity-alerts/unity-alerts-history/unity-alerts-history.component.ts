import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DateRange, deviceTypesInAlerts, Duration, UnityAlertsHistoryService, UnityViewAlertHistoryData, UnityViewAlertHistoryViewData } from './unity-alerts-history.service';

/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'unity-alerts-history',
  templateUrl: './unity-alerts-history.component.html',
  styleUrls: ['./unity-alerts-history.component.scss'],
  providers: [UnityAlertsHistoryService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },]
})
export class UnityAlertsHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  deviceTypeList: Array<{ name: string, displayName: string, mapping: DeviceMapping }> = deviceTypesInAlerts;
  alerts: UnityViewAlertHistoryViewData = new UnityViewAlertHistoryViewData();
  viewData: UnityViewAlertHistoryData[] = [];

  duration = Duration;
  dateRange: DateRange;
  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'displayName',
    keyToSelect: 'name',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: false
  };

  myTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Device Types',
    checked: 'Device Type Selected',
    checkedPlural: 'Device Types Selected'
  }

  constructor(private historyService: UnityAlertsHistoryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService, ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.onSubmit();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.buildForm();
  }

  buildForm() {
    this.dateRange = this.historyService.getDateRangeByPeriod(this.duration.LAST_24_HOURS);
    this.filterForm = this.historyService.buildFilterForm(this.dateRange);
    this.filterFormErrors = this.historyService.resetFilterFormErrors();
    this.filterFormValidationMessages = this.historyService.filterFormValidationMessages;

    const deviceTypes: string[] = [];
    this.deviceTypeList.map(d => deviceTypes.push(d.name));
    this.filterForm.get('device_type').setValue(deviceTypes);
    this.filterForm.get('duration').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: Duration) => {
      this.dateRange = this.historyService.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('start_date').patchValue(new Date(this.dateRange.from))
        this.filterForm.get('end_date').patchValue(new Date(this.dateRange.to))
      }
      if (val == this.duration.CUSTOM) {
        this.filterForm.get('start_date').enable();
        this.filterForm.get('end_date').enable();
      } else {
        this.filterForm.get('start_date').disable();
        this.filterForm.get('end_date').disable();
      }
      this.filterForm.get('start_date').updateValueAndValidity();
      this.filterForm.get('end_date').updateValueAndValidity();
    });
    this.onSubmit();
  }

  onSubmit() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.historyService.getAlertsByFilters(this.filterForm.getRawValue(), this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: Array<any>) => {
        this.alerts = this.historyService.convertToViewData(data);
        this.viewData = this.alerts.totalAlerts;
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  filterData(key: string) {
    this.viewData = this.alerts[key];
  }

}
