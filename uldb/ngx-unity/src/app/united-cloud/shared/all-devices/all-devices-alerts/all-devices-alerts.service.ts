import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID, ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ZabbixMonitoringAlerts, ZabbixMonitoringAlertsViewdata } from 'src/app/united-view/unity-alerts/device-alerts/zabbix-alerts/zabbix-alerts.service';
import { AllDevicesAlertsResponseType, AllDevicesAlertsType } from './all-devices-alerts.type';

@Injectable({
  providedIn: 'root'
})
export class AllDevicesAlertsService {
  private alertAnnouncedSource = new Subject<{ deviceType: DeviceMapping, uuid: string }>();
  alertAnnounced$ = this.alertAnnouncedSource.asObservable();

  private zabbixAlertAnnouncedSource = new Subject<{ deviceType: DeviceMapping, uuid: string }>();
  zabbixAlertAnnounced$ = this.zabbixAlertAnnouncedSource.asObservable();
  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  showAlerts(deviceType: DeviceMapping, uuid: string) {
    this.alertAnnouncedSource.next({ deviceType: deviceType, uuid: uuid });
  }

  showZabbixAlerts(deviceType: DeviceMapping, uuid: string) {
    this.zabbixAlertAnnouncedSource.next({ deviceType: deviceType, uuid: uuid });
  }

  getAlerts(deviceType: DeviceMapping, uuid: string) {
    const params: HttpParams = new HttpParams().set('alert_type', 'failed');
    // return of({ "status": "ok", "count": "4", "alerts": { "365624": { "entity_id": "111945", "changed": "6d 20h 30m", "ignore_until": null, "last_message": "Checks failed", "alert_test_id": "17", "alerted": "20h 9m 33s", "last_ok": null, "alert_status": "0", "humanized": true, "ignore_until_text": "<i>Disabled</i>", "alert_table_id": "365624", "checked": "7s", "entity_type": "port", "last_recovered": null, "ignore_until_ok_text": "<i>Disabled</i>", "html_row_class": "error", "delay": "0", "state": "{\"metrics\":{\"ifAdminStatus\":\"up\",\"ifOperStatus\":\"down\"},\"failed\":[{\"metric\":\"ifAdminStatus\",\"condition\":\"equals\",\"value\":\"up\"},{\"metric\":\"ifOperStatus\",\"condition\":\"notequals\",\"value\":\"up\"}]}", "alert_assocs": "", "recovered": "<i>Never</i>", "last_failed": "1574232752", "status": "FAILED", "last_changed": "1573640521", "last_checked": "1574232752", "ignore_until_ok": "0", "class": "red", "device_id": "382", "count": "1972", "last_alerted": "1574160186", "has_alerted": "1", "alert_name": "Port is enabled, but operationally down", "alert_message": "" }, "365622": { "entity_id": "56311", "changed": "6d 20h 30m", "ignore_until": null, "last_message": "Checks failed", "alert_test_id": "17", "alerted": "20h 9m 33s", "last_ok": null, "alert_status": "0", "humanized": true, "ignore_until_text": "<i>Disabled</i>", "alert_table_id": "365622", "checked": "7s", "entity_type": "port", "last_recovered": null, "ignore_until_ok_text": "<i>Disabled</i>", "html_row_class": "error", "delay": "0", "state": "{\"metrics\":{\"ifAdminStatus\":\"up\",\"ifOperStatus\":\"down\"},\"failed\":[{\"metric\":\"ifAdminStatus\",\"condition\":\"equals\",\"value\":\"up\"},{\"metric\":\"ifOperStatus\",\"condition\":\"notequals\",\"value\":\"up\"}]}", "alert_assocs": "", "recovered": "<i>Never</i>", "last_failed": "1574232752", "status": "FAILED", "last_changed": "1573640521", "last_checked": "1574232752", "ignore_until_ok": "0", "class": "red", "device_id": "382", "count": "1972", "last_alerted": "1574160186", "has_alerted": "1", "alert_name": "Port is enabled, but operationally down", "alert_message": "" }, "365619": { "entity_id": "56309", "changed": "6d 20h 30m", "ignore_until": null, "last_message": "Checks failed", "alert_test_id": "17", "alerted": "20h 9m 33s", "last_ok": null, "alert_status": "0", "humanized": true, "ignore_until_text": "<i>Disabled</i>", "alert_table_id": "365619", "checked": "7s", "entity_type": "port", "last_recovered": null, "ignore_until_ok_text": "<i>Disabled</i>", "html_row_class": "error", "delay": "0", "state": "{\"metrics\":{\"ifAdminStatus\":\"up\",\"ifOperStatus\":\"down\"},\"failed\":[{\"metric\":\"ifAdminStatus\",\"condition\":\"equals\",\"value\":\"up\"},{\"metric\":\"ifOperStatus\",\"condition\":\"notequals\",\"value\":\"up\"}]}", "alert_assocs": "", "recovered": "<i>Never</i>", "last_failed": "1574232752", "status": "FAILED", "last_changed": "1573640521", "last_checked": "1574232752", "ignore_until_ok": "0", "class": "red", "device_id": "382", "count": "1972", "last_alerted": "1574160186", "has_alerted": "1", "alert_name": "Port is enabled, but operationally down", "alert_message": "" }, "365618": { "entity_id": "58815", "changed": "6d 20h 30m", "ignore_until": null, "last_message": "Checks failed", "alert_test_id": "17", "alerted": "20h 9m 33s", "last_ok": null, "alert_status": "0", "humanized": true, "ignore_until_text": "<i>Disabled</i>", "alert_table_id": "365618", "checked": "7s", "entity_type": "port", "last_recovered": null, "ignore_until_ok_text": "<i>Disabled</i>", "html_row_class": "error", "delay": "0", "state": "{\"metrics\":{\"ifAdminStatus\":\"up\",\"ifOperStatus\":\"down\"},\"failed\":[{\"metric\":\"ifAdminStatus\",\"condition\":\"equals\",\"value\":\"up\"},{\"metric\":\"ifOperStatus\",\"condition\":\"notequals\",\"value\":\"up\"}]}", "alert_assocs": "", "recovered": "<i>Never</i>", "last_failed": "1574232752", "status": "FAILED", "last_changed": "1573640521", "last_checked": "1574232752", "ignore_until_ok": "0", "class": "red", "device_id": "382", "count": "1972", "last_alerted": "1574160186", "has_alerted": "1", "alert_name": "Port is enabled, but operationally down", "alert_message": "" } } });
    return this.http.get<AllDevicesAlertsResponseType>(GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID(deviceType, uuid), { params: params });
  }

  convertToViewdata(data: { [key: number]: AllDevicesAlertsType }): AllDevicesAlertsViewData[] {
    let viewData: AllDevicesAlertsViewData[] = [];
    const arr = Object.values(data);
    arr.map(a => {
      let vd = new AllDevicesAlertsViewData();
      vd.alert_name = a.alert_name;
      vd.status = a.status;
      vd.changed = a.changed;
      vd.checked = a.checked;
      vd.alerted = a.alerted;
      vd.entity_id = a.entity_id;
      vd.entity_type = a.entity_type;
      viewData.push(vd);
    });
    return viewData;
  }

  getZabbixAlerts(deviceType: DeviceMapping, uuid: string): Observable<ZabbixMonitoringAlerts[]> {
    return this.http.get<ZabbixMonitoringAlerts[]>(ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, uuid));
  }

  convertToZabbixViewData(alerts: ZabbixMonitoringAlerts[]): ZabbixMonitoringAlertsViewdata[] {
    let viewData: ZabbixMonitoringAlertsViewdata[] = [];
    alerts.map(a => {
      let av: ZabbixMonitoringAlertsViewdata = new ZabbixMonitoringAlertsViewdata();
      av.alertDesc = a.description;
      av.severity = a.severity;
      av.alertTime = a.date_time ? this.utilSvc.toUnityOneDateFormat(a.date_time) : 'N/A';
      av.deviceName = a.device_name;
      viewData.push(av);
    })
    return viewData;
  }
}
export class AllDevicesAlertsViewData {
  alert_name: string;
  status: string;
  checked: string;
  changed: string;
  alerted: string;
  entity_id: string;
  entity_type: string;
  constructor() { }
}

export class AllDeviceZabbixMonitoringAlertsViewdata {
  alertId: number;
  alertDesc: string;
  deviceName: string;
  severity: string;
  colorClass: string;
  alertTime: string;
  constructor() { }
}
