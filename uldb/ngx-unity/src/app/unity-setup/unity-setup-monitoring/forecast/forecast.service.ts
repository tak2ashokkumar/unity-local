import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ForecastDevice } from './forecast.type';
import { StepIconUrlProvider } from 'sequential-workflow-designer';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class ForecastService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService,
    private appService: AppLevelService) { }

  getForecast(criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`/customer/alert_prediction/devices/`, criteria);
  }

  deleteForecast(deviceId: number, itemId: number) {
    return this.http.delete(`/customer/alert_prediction/devices/${deviceId}/items/${itemId}/`);
  }

  deleteDeviceForecast(deviceId: number){
    return this.http.delete(`/customer/alert_prediction/devices/${deviceId}/`);
  }

  toggleMetrics(state: boolean, deviceId: number, metricId: number) {
    if (state) {
      return this.http.get(`customer/alert_prediction/devices/${deviceId}/items/${metricId}/disable/`);
    } else {
      return this.http.get(`customer/alert_prediction/devices/${deviceId}/items/${metricId}/enable/`);
    }
  }

  bulkDeleteForecast(payload: { host_id: number; item_ids: number[] }[]) {
    return this.http.post(`/customer/alert_prediction/devices/delete_items/`, payload);
  }

  convertToViewData(data: ForecastDevice[]): ForecastViewData[] {
    let viewData: ForecastViewData[] = [];
    data.forEach(a => {
      let td: ForecastViewData = new ForecastViewData();
      td.id = a.id;
      td.alertCount = a.alerts_count;
      td.name = a.name ? a.name : 'N/A';
      td.status = a.status ? a.status : 'N/A';
      td.uuid = a.device_uuid ? a.device_uuid : 'N/A';
      td.name = a.name ? a.name : 'N/A';
      td.totalMetrics = a.metrics_count ? a.metrics_count : 'N/A';
      td.deviceType = a.device_type ? a.device_type : 'N/A'
      td.allMetricsSelected = false;
      td.selected = false;
      td.deviceStatus = this.util.getDeviceStatus(a.status);
      // td.metrics.name = a.metrics.name;
      td.items = [];
      // if (a.status == 'Critical') {
      //   td.severityClass = 'text-danger';
      //   td.severityIcon = 'fa-exclamation-circle text-danger';
      // } else if (a.status == 'Warning') {
      //   td.severityClass = 'text-warning';
      //   td.severityIcon = 'fa-exclamation-circle text-warning';
      // } else {
      //   td.severityClass = 'text-primary';
      //   td.severityIcon = 'fa-info-circle text-primary';
      // }

      a.items.forEach(itemData => {
        let metric = new ForecastMetricViewData();
        metric.itemId = itemData.item_id;
        metric.name = itemData.name ? itemData.name : 'N/A';
        metric.alerting = itemData.alerting ? 'Enabled' : 'Disabled';
        metric.threshold = itemData.threshold ? itemData.threshold : 'N/A';
        metric.severity = itemData.severity ? itemData.severity : 'N/A';
        metric.createdAt = itemData.created_at ? this.util.toUnityOneDateFormat(itemData.created_at) : 'N/A';
        metric.selected = false;
        metric.projectionPeriod = itemData.projection_period ? itemData.projection_period : 'N/A';
        if (metric.projectionPeriod) {
          const value = parseInt(metric.projectionPeriod, 10);
          const unit = metric.projectionPeriod.slice(-1);

          const unitLabel = UNIT_MAP[unit] || '';
          const plural = value > 1 ? 's' : '';

          metric.projectionPeriod = `${value} ${unitLabel}${plural}`;
        } else {
          metric.projectionPeriod = 'N/A';
        }
        metric.enabled = itemData.enabled;
        if (itemData.severity == 'Critical') {
          metric.severityClass = 'text-danger';
          metric.severityIcon = 'fa-exclamation-circle text-danger';
        } else if (itemData.severity == 'Warning') {
          metric.severityClass = 'text-warning';
          metric.severityIcon = 'fa-exclamation-circle text-warning';
        } else {
          metric.severityClass = 'text-primary';
          metric.severityIcon = 'fa-info-circle text-primary';
        }
        td.items.push(metric);
      })
      td.selected = false;
      td.allMetricsSelected = false;
      td.items.forEach(metric => {
        metric.selected = false;
      })
      viewData.push(td);
    });
    return viewData;
  }

  pollingResult(celeryTaskId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`/task/${celeryTaskId}/`).pipe(switchMap(res => this.appService.pollForTask(celeryTaskId, 3, 1000).pipe(take(1))), take(1));
  }

  syncForecastList() {
    return this.http.get<any>(`customer/alert_prediction/devices/update_items/`);
  }

}

export class ForecastViewData {
  constructor() { };
  id: number;
  uuid: string;
  name: string;
  status: string;
  alertCount: number;
  totalMetrics: string;
  selected: boolean;
  allMetricsSelected: boolean;
  deviceType: string;
  severityClass: string;
  severityIcon: string;
  deviceStatus: string;
  items: ForecastMetricViewData[] = [];
}

export class ForecastMetricViewData {
  constructor() { };
  itemId: number;
  name: string;
  period: string;
  alerting: string;
  threshold: string;
  severity: string;
  createdAt: string;
  projectionPeriod: string;
  enabled: boolean;
  selected: boolean;
  severityClass: string;
  severityIcon: string;
}

export const UNIT_MAP: { [key: string]: string } = {
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week'
};