import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DateRange, Duration } from '../unity-alerts-history/unity-alerts-history.service';
import { UnityAlertGraphsUtilService } from './unity-alerts-graph-util.service';
import { ChartData, UnityAlertGraphsService } from './unity-alerts-graph.service';

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
  selector: 'unity-alert-graphs',
  templateUrl: './unity-alerts-graph.component.html',
  styleUrls: ['./unity-alerts-graph.component.scss'],
  providers: [UnityAlertGraphsService, UnityAlertGraphsUtilService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },]
})
export class UnityAlertGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  duration = Duration;
  dateRange: DateRange;
  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;

  severityChartData: ChartData;
  severityTrendChartData: ChartData;
  topDevicesByAlertsChartData: ChartData;
  topDevicesByAlertsTrendChartData: ChartData;
  alertsByDCChartData: ChartData;
  alertsByDCTrendChartData: ChartData;


  constructor(private graphService: UnityAlertGraphsService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService) { }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.buildForm();
  }

  buildForm() {
    this.dateRange = this.graphService.getDateRangeByPeriod(this.duration.LAST_WEEK);
    this.filterForm = this.graphService.buildFilterForm(this.dateRange);
    this.filterFormErrors = this.graphService.resetFilterFormErrors();
    this.filterFormValidationMessages = this.graphService.filterFormValidationMessages;

    this.filterForm.get('duration').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: Duration) => {
      this.dateRange = this.graphService.getDateRangeByPeriod(val);
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
      this.severityChartData = null;
      this.severityTrendChartData = null;
      this.topDevicesByAlertsChartData = null;
      this.topDevicesByAlertsTrendChartData = null;
      this.alertsByDCChartData = null;
      this.alertsByDCTrendChartData = null;

      this.getAlertCountBySeverity();
      this.getAlertTrendBySeverity();
      this.getTop10DevicesAlertCount();
      this.getTop10DevicesAlertTrend();
      this.getAlertCountByDC();
      this.getAlertCountByDCTrend();
    }
  }

  getAlertCountBySeverity() {
    this.graphService.getAlertCountBySeverity(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.severityChartData = this.graphService.convertToAlertCountBySeverityChartData(res);
    })
  }

  getAlertTrendBySeverity() {
    this.graphService.getAlertTrendBySeverity(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.severityTrendChartData = this.graphService.convertToAlertTrendBySeverityChartData(res, this.filterForm.getRawValue());
    })
  }

  getTop10DevicesAlertCount() {
    this.graphService.getTop10DevicesAlertCount(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.topDevicesByAlertsChartData = this.graphService.convertToTop10DevivesByAlertsChartData(res);
    })
  }

  getTop10DevicesAlertTrend() {
    this.graphService.get10DevivesByAlertsTrend(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.topDevicesByAlertsTrendChartData = this.graphService.convertToTop10DevicesAlertTrendChartData(res, this.filterForm.getRawValue());
    })
  }

  getAlertCountByDC() {
    this.graphService.getAlertCountByDC(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsByDCChartData = this.graphService.convertToAlertCountByDCChartData(res);
    })
  }

  getAlertCountByDCTrend() {
    this.graphService.getAlertCountByDCTrend(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsByDCTrendChartData = this.graphService.convertToAlertTrendByDCChartData(res, this.filterForm.getRawValue());
    })
  }
}
