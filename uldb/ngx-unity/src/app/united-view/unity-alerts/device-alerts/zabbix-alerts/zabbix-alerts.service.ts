import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { GET_ZABBIX_ALL_DEVICE_ALERTS_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ZabbixAlertsService {
  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getAlerts(device: string): Observable<ZabbixMonitoringAlerts[]> {
    return this.http.get<ZabbixMonitoringAlerts[]>(GET_ZABBIX_ALL_DEVICE_ALERTS_BY_DEVICE_TYPE(device));
  }

  convertToViewData(alerts: ZabbixMonitoringAlerts[], deviceType?: string): ZabbixMonitoringAlertsViewdata[] {
    let viewData: ZabbixMonitoringAlertsViewdata[] = [];
    alerts.map(a => {
      let av: ZabbixMonitoringAlertsViewdata = new ZabbixMonitoringAlertsViewdata();
      av.alertDesc = a.description;
      av.severity = a.severity;
      av.alertTime = a.date_time ? this.utilSvc.toUnityOneDateFormat(moment.unix(Number(a.date_time))) : 'N/A';
      av.deviceName = a.device_name;
      av.deviceType = deviceType;
      switch (a.severity) {
        case 'critical': av.colorClass = 'bg-danger'; break;
        case 'warning': av.colorClass = 'bg-warning'; break;
        default: av.colorClass = 'bg-primary';
      }
      viewData.push(av);
    })
    return viewData;
  }
}

export class ZabbixMonitoringAlertsViewdata {
  alertDesc: string;
  deviceName: string;
  deviceType: string;
  colorClass: string;
  severity: string;
  alertTime: string;
  constructor() { }
}

export interface ZabbixMonitoringAlerts {
  alert_id: number;
  description: string;
  severity: string;
  date_time: string;
  device_name: string;
}