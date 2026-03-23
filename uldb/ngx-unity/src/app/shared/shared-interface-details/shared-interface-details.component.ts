import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomDeviceGraphRange, DeviceInterfaceDetailsGraphViewdata, DeviceInterfaceDetailsViewData, DeviceInterfaceRecentAlertsViewData, SharedInterfaceDetailsService } from './shared-interface-details.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppUtilityService, DateRange } from '../app-utility/app-utility.service';
import { Subject, from } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { UnityChartData } from '../chart-config.service';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { interfaceDetailsType } from '../SharedEntityTypes/interface-details.type';
import { Notification } from '../app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService, StorageType } from '../app-storage/storage.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';

@Component({
  selector: 'shared-interface-details',
  templateUrl: './shared-interface-details.component.html',
  styleUrls: ['./shared-interface-details.component.scss'],
})
export class SharedInterfaceDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  interfaceId: string;
  interfaceViewData: DeviceInterfaceDetailsViewData;
  alertDetailsChartData: UnityChartData;
  recentAlertsViewData: DeviceInterfaceRecentAlertsViewData[] = [];

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  dateRange: DateRange;
  graphRange = CustomDeviceGraphRange;
  graphViewData: DeviceInterfaceDetailsGraphViewdata[] = [];
  device: DeviceTabData = { name: '', deviceType: null };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: SharedInterfaceDetailsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.interfaceId = params.get('interfaceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.getInterfaceDetails();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.ngOnDestroy();
    this.spinner.start('main');
    this.graphViewData = [];
    this.getInterfaceDetails();
  }

  getInterfaceDetails() {
    this.svc.getInterfaceDetails(this.device.deviceType, this.deviceId, this.interfaceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceViewData = this.svc.convertToInterfaceSummaryData(data.interface_summary);
      this.loadData(data);
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Interface Details.'));
      this.spinner.stop('main');
    });
  }

  loadData(data: interfaceDetailsType) {
    if (data && data.interface_summary) {
      Object.keys(data.interface_summary).forEach(key => {
        let value = data.interface_summary[key];
        if (value && value.graph_id) {
          let graphDetails: DeviceInterfaceDetailsGraphViewdata = new DeviceInterfaceDetailsGraphViewdata();
          graphDetails.name = value.name;
          graphDetails.graphId = value.graph_id;
          this.graphViewData.push(graphDetails);
        }
      });
    }
    if (data.alert_details && data.alert_details.total) {
      this.alertDetailsChartData = this.svc.convertToInterfaceAlertDetailsChartData(data.alert_details);
    }
    if (data.recent_alerts && data.recent_alerts.length) {
      this.recentAlertsViewData = this.svc.convertToInterfaceRecentAlertsViewData(data.recent_alerts);
    }
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.svc.buildForm(this.dateRange);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: CustomDeviceGraphRange) => {
      this.dateRange = this.svc.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
        this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
      }
      if (val != 'custom') {
        this.filterForm.get('from').disable();
        this.filterForm.get('to').disable();
      } else {
        this.filterForm.get('from').enable();
        this.filterForm.get('to').enable();
      }
    });
    this.onSubmit();
  }

  onSubmit() {
    if (this.filterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.svc.resetFormErrors();
      this.getGraphs();
    }
  }

  getGraphs() {
    from(this.graphViewData).pipe(tap(e => setTimeout(() => { this.spinner.start(e.graphId) }, 0)),
      mergeMap(e => this.svc.getGraph(this.device.deviceType, this.deviceId, e.graphId, this.filterForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(
          res => {
            const key = Object.keys(res).getFirst();
            let index = this.graphViewData.map(view => view.graphId).indexOf(key);
            this.graphViewData[index].image = res[key];
            this.spinner.stop(key);
          }
        )
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}