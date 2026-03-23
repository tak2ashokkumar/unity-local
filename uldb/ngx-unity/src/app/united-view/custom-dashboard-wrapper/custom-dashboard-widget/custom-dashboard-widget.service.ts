import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { CUSTOM_DASHBOARD_ALERTS_COUNT, CUSTOM_DASHBOARD_DEVICE_STATUS, CUSTOM_DASHBOARD_USAGE_DETAILS } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class CustomDashboardWidgetService {

  constructor(private http: HttpClient) { }

  getAlertsCount(id: number) {
    return this.http.get<{
      Critical: number;
      Information: number;
      Warning: number;
    }>(CUSTOM_DASHBOARD_ALERTS_COUNT(id));
  }

  getDeviceStatus(id: number) {
    return this.http.get<{
      down: number;
      unknown: number;
      non_configured: number;
      up: number;
    }>(CUSTOM_DASHBOARD_DEVICE_STATUS(id));
  }

  getWidgetDetails(id: number) {
    // return <any>of({
    //   "memory_used": 0,
    //   "storage_unused_val": "28.77 GB",
    //   "cpu_count": 0,
    //   "storage_unused": 72.9000300000123,
    //   "cpu_used": 0,
    //   "storage_used_val": "10.68 GB",
    //   "memory_unused": 0,
    //   "cpu_unused": 100,
    //   "memory_total": 0,
    //   "storage_total": "39.45 GB",
    //   "storage_used": 27.07
    // })
    return this.http.get<WidgetUsageDetails>(CUSTOM_DASHBOARD_USAGE_DETAILS(id));
  }

  getColor(value: number): string {
    if (value < 65) {
      return getComputedStyle(document.documentElement).getPropertyValue('--success');
    } else if (value >= 65 && value < 85) {
      return getComputedStyle(document.documentElement).getPropertyValue('--warning')
    } else {
      return getComputedStyle(document.documentElement).getPropertyValue('--danger');
    }
  }

  convertToViewdata(data: WidgetUsageDetails) {
    let viewData: WidgetUsageDetailsViewdata = new WidgetUsageDetailsViewdata();
    viewData.unusedColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');

    viewData.memoryTotal = data.memory_total;
    viewData.memoryUnused = data.memory_unused > 0 ? Number(data.memory_unused.toFixed(2)) : 0;
    viewData.memoryUsed = data.memory_used > 0 ? Number(data.memory_used.toFixed(2)) : 0;
    viewData.memoryUsedColor = this.getColor(viewData.memoryUsed);

    viewData.cpuCount = data.cpu_count;
    viewData.cpuUnused = data.cpu_unused > 0 ? Number(data.cpu_unused.toFixed(2)) : 0;
    viewData.cpuUsed = data.cpu_used > 0 ? Number(data.cpu_used.toFixed(2)) : 0;
    viewData.cpuUsedColor = this.getColor(viewData.cpuUsed);

    viewData.storageTotal = data.storage_total;
    viewData.storageUnused = data.storage_unused > 0 ? Number(data.storage_unused.toFixed(2)) : 0;;
    viewData.storageUsed = data.storage_used > 0 ? Number(data.storage_used.toFixed(2)) : 0;;

    viewData.storageUnusedVal = data.storage_unused_val;
    viewData.storageUsedVal = data.storage_used_val;

    viewData.storageUsedColor = this.getColor(viewData.storageUsed);
    viewData.storageProgressBarColor = viewData.storageUsed < 65 ? 'bg-success' : viewData.storageUsed >= 65 && viewData.storageUsed < 85 ? 'bg-warning' : 'bg-danger';

    return viewData;
  }

}

export class WidgetUsageDetailsViewdata {
  constructor() { }
  unusedColor: string;

  storageTotal: string;
  storageUsed: number;
  storageUnused: number;
  storageUsedColor: string;
  storageProgressBarColor: string;
  storageUsedVal: string;
  storageUnusedVal: string;

  memoryUsed: number;
  memoryUnused: number;
  memoryTotal: string;
  memoryUsedColor: string;

  cpuUsed: number;
  cpuCount: number;
  cpuUnused: number;
  cpuUsedColor: string;

}

export interface WidgetUsageDetails {
  storage_total: string;
  storage_used: number;
  storage_unused: number;
  storage_used_val: string;
  storage_unused_val: string;

  memory_used: number;
  memory_unused: number;
  memory_total: string;

  cpu_used: number;
  cpu_count: number;
  cpu_unused: number;
}