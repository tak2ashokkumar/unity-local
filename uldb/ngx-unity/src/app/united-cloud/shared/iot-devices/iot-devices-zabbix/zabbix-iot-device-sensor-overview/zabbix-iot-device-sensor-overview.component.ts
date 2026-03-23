import { Component, OnDestroy, OnInit } from '@angular/core';
import { AirflowViewData, DurationDropdownType, HumidityViewData, RecentEventViewData, TemperatureViewData, thresholdBreachSummary, ZabbixIotDeviceSensorOverviewService } from './zabbix-iot-device-sensor-overview.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'zabbix-iot-device-sensor-overview',
  templateUrl: './zabbix-iot-device-sensor-overview.component.html',
  styleUrls: ['./zabbix-iot-device-sensor-overview.component.scss'],
  providers: [ZabbixIotDeviceSensorOverviewService]
})
export class ZabbixIotDeviceSensorOverviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceId: string;
  dropdownData: DurationDropdownType;
  temperatureViewData: TemperatureViewData = new TemperatureViewData();
  humidityViewData: HumidityViewData = new HumidityViewData();
  airflowViewData: AirflowViewData = new AirflowViewData();
  recentEventsViewData: RecentEventViewData[] = [];
  thresholdBreachSummaryWidgetData: thresholdBreachSummary = new thresholdBreachSummary();

  constructor(private route: ActivatedRoute,
    private svc: ZabbixIotDeviceSensorOverviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        setTimeout(() => {
          this.getRecentEvents();
        }, 0);
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getTemperatureData();
    this.getHumidityData();
    this.getAirflowData();
    this.getThresholdBreachSummaryData();
    this.getRecentEvents();
  }

  onSelectTemperatureWidgetDateRange(event: any) {
    this.temperatureViewData.dateRangeformData = event;
    this.getTemperatureData();
  }

  getTemperatureData() {
    this.spinner.start(this.temperatureViewData.loader);
    this.svc.getTemperatureData(this.temperatureViewData?.dateRangeformData?.from, this.temperatureViewData?.dateRangeformData?.to, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.temperatureViewData.summary = this.svc.convertToTemperatureWidgetSummaryViewData(res.summary);
      this.temperatureViewData.chart = this.svc.convertToTemperatureWidgetChartViewData(this.temperatureViewData?.dateRangeformData, res.trend_data);
      this.spinner.stop(this.temperatureViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Temperature Details'));
      this.spinner.stop(this.temperatureViewData.loader);
    })
  }

  onSelectHumidityWidgetDateRange(event: any) {
    this.humidityViewData.dateRangeformData = event;
    this.getHumidityData();
  }

  getHumidityData() {
    this.spinner.start(this.humidityViewData.loader);
    this.svc.getHumidityData(this.humidityViewData?.dateRangeformData?.from, this.humidityViewData?.dateRangeformData?.to, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.humidityViewData.summary = this.svc.convertToHumiditySummaryViewData(res.summary);
      this.humidityViewData.chart = this.svc.convertToHumidityWidgetViewData(this.humidityViewData?.dateRangeformData, res.trend_data);
      this.spinner.stop(this.humidityViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Humidity Details'));
      this.spinner.stop(this.humidityViewData.loader);
    })
  }

  onSelectAirflowWidgetDateRange(event: any) {
    this.airflowViewData.dateRangeformData = event;
    this.getAirflowData();
  }

  getAirflowData() {
    this.spinner.start(this.airflowViewData.loader);
    this.svc.getAirflowData(this.airflowViewData?.dateRangeformData?.from, this.airflowViewData?.dateRangeformData?.to, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.airflowViewData.summary = this.svc.convertToAirflowSummaryViewData(res.summary);
      this.airflowViewData.chart = this.svc.convertToAirflowWidgetViewData(this.airflowViewData.dateRangeformData, res.trend_data);
      this.spinner.stop(this.airflowViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Airflow Details'));
      this.spinner.stop(this.airflowViewData.loader);
    })
  }

  onSelectThresholdBreachSummaryWidgetDateRange(event: any) {
    this.thresholdBreachSummaryWidgetData.dateRangeformData = event;
    this.getThresholdBreachSummaryData();
  }

  getThresholdBreachSummaryData() {
    this.spinner.start('thresholdBreachSummaryWidgetLoader');
    this.svc.getThresholdBreachSummaryData(this.thresholdBreachSummaryWidgetData.dateRangeformData?.from, this.thresholdBreachSummaryWidgetData.dateRangeformData?.to, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.thresholdBreachSummaryWidgetData.charts = this.svc.convertoThresholdBreachSummary(res);
      this.spinner.stop('thresholdBreachSummaryWidgetLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Threshold breach summary Details'));
      this.spinner.stop('thresholdBreachSummaryWidgetLoader');
    })
  }

  getRecentEvents() {
    this.spinner.start('recentEventsWidgetLoader');
    this.svc.getRecentEvents(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.recentEventsViewData = this.svc.convertToRecentEventsViewData(res);
      this.spinner.stop('recentEventsWidgetLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Recent events Details'));
    })
  }

}
