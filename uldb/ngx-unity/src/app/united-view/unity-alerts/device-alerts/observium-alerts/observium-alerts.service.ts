import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { GET_OBSERVIUM_ALL_DEVICE_ALERTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ObserviumAlertsService {
  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getAllDeviceAlerts(device: string): Observable<UnityViewDeviceObserviumAlert[]> {
    return this.http.get<UnityViewDeviceObserviumAlert[]>(GET_OBSERVIUM_ALL_DEVICE_ALERTS(device));
  }

  convertToViewData(alerts: UnityViewDeviceObserviumAlert[], deviceType?: string): ObserviumDeviceAlertData[] {
    let viewData: ObserviumDeviceAlertData[] = [];
    alerts.map(a => {
      let av: ObserviumDeviceAlertData = new ObserviumDeviceAlertData();
      av.alertDesc = a.alert_name;
      av.severity = a.severity;
      av.alertTime = a.last_changed ? this.utilSvc.toUnityOneDateFormat(moment.unix(Number(a.last_changed))) : 'N/A';
      av.deviceName = a.device_name ? a.device_name : 'N/A';
      av.deviceType = deviceType ? deviceType : 'N/A';
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

export class ObserviumDeviceAlertData {
  alertDesc: string;
  deviceName: string;
  colorClass: string;
  deviceType: string;
  severity: string;
  alertTime: string;
  constructor() { }
}

export interface UnityViewDeviceObserviumAlert {
  entity_id: string;
  changed: string;
  ignore_until: null;
  last_message: string;
  alert_test_id: string;
  alerted: string;
  last_ok: string;
  alert_status: string;
  humanized: boolean;
  ignore_until_text: string;
  alert_table_id: string;
  checked: string;
  severity: string;
  entity_type: string;
  last_recovered: string;
  ignore_until_ok_text: string;
  html_row_class: string;
  delay: string;
  state: string;
  alert_assocs: string;
  recovered: string;
  last_failed: string;
  status: string;
  last_changed: string;
  last_checked: string;
  ignore_until_ok: string;
  device_id: string;
  count: string;
  last_alerted: string;
  has_alerted: string;
  alert_name: string;
  alert_message: string;
  device_name: string;
}