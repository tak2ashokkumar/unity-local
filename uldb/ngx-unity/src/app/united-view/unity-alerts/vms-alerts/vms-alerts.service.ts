import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_DEVICE_ALERTS } from 'src/app/shared/api-endpoint.const';
import { UnityViewAlertDevice } from '../unity-alerts.type';

@Injectable()
export class VMAlertsService {

  constructor(private http: HttpClient) { }

  getVMAlerts(deviceType: string): Observable<UnityViewAlertDevice[]> {
    return this.http.get<UnityViewAlertDevice[]>(GET_DEVICE_ALERTS(deviceType));
  }

  convertToViewData(data: UnityViewAlertDevice[]): VMAlertsViewData[] {
    let viewData: VMAlertsViewData[] = [];
    data.map(s => {
      let a: VMAlertsViewData = new VMAlertsViewData();
      a.uuid = s.uuid;
      a.deviceName = s.name;
      a.deviceType = s.type;
      a.cloudName = s.cloud_name;
      a.alertCount = Number(s.alert_count);
      let VMAlerts: VMAlertData[] = [];
      if (s.alert_data) {
        let al = Object.values(s.alert_data.alerts);
        al.map(alert => {
          let ad: VMAlertData = new VMAlertData();
          ad.entityId = alert.entity_id;
          ad.entityType = alert.entity_type;
          ad.alertName = alert.alert_name;
          ad.status = alert.status;
          ad.alerted = alert.alerted;
          ad.checked = alert.checked;
          ad.changed = alert.changed;
          VMAlerts.push(ad);
        })
      }
      a.alerts = VMAlerts;
      viewData.push(a);
    });
    return viewData;
  }
}

export class VMAlertsViewData {
  uuid: string;
  deviceName: string;
  deviceType: string;
  cloudName: string;
  alertCount: number;
  alerts: VMAlertData[] = [];
  constructor() { }
}

export class VMAlertData {
  entityId: string;
  entityType: string;
  alertName: string;
  status: string;
  alerted: string;
  checked: string;
  changed: string;
  constructor() { }
}



