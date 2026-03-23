import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { CustomDeviceGraphRange, DateRange, DeviceInterfaceDetailsViewData, DeviceInterfaceRecentAlertsViewData, InfrastructureInterfaceDetailsService, NetworkInterfaceDetailsGraphViewdata, } from './infrastructure-interface-details.service';
import { InfrastructureInterfaceDetails } from './infrastructure-interface-details.type';

@Component({
  selector: 'infrastructure-interface-details',
  templateUrl: './infrastructure-interface-details.component.html',
  styleUrls: ['./infrastructure-interface-details.component.scss'],
  providers: [InfrastructureInterfaceDetailsService]
})
export class InfrastructureInterfaceDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceType: string;
  deviceId: string;
  deviceMapping: DeviceMapping;
  interfaceId: string;
  interfaceViewData: DeviceInterfaceDetailsViewData;
  alertsChartData: UnityChartData;
  recentAlertsViewData: DeviceInterfaceRecentAlertsViewData[] = [];

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  dateRange: DateRange;
  graphRange = CustomDeviceGraphRange;
  graphViewData: NetworkInterfaceDetailsGraphViewdata[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: InfrastructureInterfaceDetailsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceType = params.get('deviceType');
      this.deviceId = params.get('deviceid');
      this.interfaceId = params.get('interfaceId');
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.deviceMapping = this.utilService.getDeviceMappingByDeviceType(this.deviceType);
    this.getNetworkInterfaceDetails();
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
    this.getNetworkInterfaceDetails();
  }

  getNetworkInterfaceDetails() {
    this.svc.getNetworkInterfaceDetails(this.interfaceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceViewData = this.svc.convertToInterfaceSummaryData(data.interface_summary);
      this.loadData(data);
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Interface Details.'));
      this.spinner.stop('main');
    });
  }

  loadData(data: InfrastructureInterfaceDetails) {
    if (data && data.interface_summary) {
      Object.keys(data.interface_summary).forEach(key => {
        let value = data.interface_summary[key];
        if (value && value.graph_id) {
          let graphDetails: NetworkInterfaceDetailsGraphViewdata = new NetworkInterfaceDetailsGraphViewdata();
          graphDetails.name = value.name;
          graphDetails.graphid = value.graph_id;
          this.graphViewData.push(graphDetails);
        }
      });
    }
    if (data.alert_details && data.alert_details.total) {
      this.alertsChartData = this.svc.convertToInterfaceAlertsChartData(data.alert_details);
    }
    if (data.recent_alerts && data.recent_alerts.length) {
      this.recentAlertsViewData = this.svc.convertToInterfaceAlertsViewData(data.recent_alerts);
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
    from(this.graphViewData).pipe(tap(e => setTimeout(() => { this.spinner.start(e.graphid) }, 0)),
      mergeMap(e => this.svc.getGraph(this.deviceId, this.deviceMapping, e.graphid, this.filterForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(
          res => {
            const key = Object.keys(res).getFirst();
            let index = this.graphViewData.map(view => view.graphid).indexOf(key);
            this.graphViewData[index].image = res[key];
            this.spinner.stop(key);
          }
        )
  }

  goBack() {
    this.router.navigate(['../../../../'], { relativeTo: this.route });
  }
}
