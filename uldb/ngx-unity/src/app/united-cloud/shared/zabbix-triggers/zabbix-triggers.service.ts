import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TRIGGERS_BY_DEVICE_TYPE, ENABLE_TRIGGER, DISABLE_TRIGGER } from 'src/app/shared/api-endpoint.const';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { ZabbixTriggerType } from './zabbix-triggers.type';

@Injectable()
export class ZabbixTriggersService {

  constructor(private http: HttpClient) { }

  getTriggers(device: DeviceTabData): Observable<ZabbixTriggerType[]> {
    return this.http.get<ZabbixTriggerType[]>(TRIGGERS_BY_DEVICE_TYPE(device.deviceType, device.uuid));
  }

  convertToViewdata(triggers: ZabbixTriggerType[]) {
    let viewData: ZabbixTriggerViewdata[] = [];
    triggers.map(t => {
      let a = new ZabbixTriggerViewdata();
      a.id = t.trigger_id.toString();
      a.name = t.name;
      a.mode = t.mode ? 'multiple' : 'single';
      a.canEdit = t.can_update;
      a.canDelete = t.can_delete;
      a.state = t.state;
      switch (t.state) {
        case 'OK': a.stateColorClass = 'text-success'; break;
        case 'PROBLEM': a.stateColorClass = 'text-danger'; break;
        default: a.stateColorClass = 'text-success';
      }
      a.severity = t.severity;
      switch (t.severity) {
        case 'critical': a.severityColorClass = 'text-danger'; break;
        case 'warning': a.severityColorClass = 'text-warning'; break;
        case 'information': a.severityColorClass = 'text-primary'; break;
        default: a.severityColorClass = 'text-primary';
      }
      a.isDisabled = t.disabled;
      a.status = t.disabled ? 'disabled' : 'enabled';
      a.statusSwitchIconTooltip = t.disabled ? 'Enable' : '';
      a.statusIconClass = t.disabled ? 'fas fa-toggle-off' : 'fas fa-toggle-on'
      viewData.push(a);
      a.script = t.script;
      a.credential = t.credential;
    })
    return viewData;
  }

  enableTrigger(device: DeviceTabData, triggerId: string) {
    return this.http.post<ZabbixTriggerType>(ENABLE_TRIGGER(device.deviceType, device.uuid, triggerId), {});
  }

  disableTrigger(device: DeviceTabData, triggerId: string) {
    return this.http.post<ZabbixTriggerType>(DISABLE_TRIGGER(device.deviceType, device.uuid, triggerId), {});
  }

  deleteTrigger(device: DeviceTabData, triggerId: string) {
    return this.http.delete<any>(TRIGGERS_BY_DEVICE_TYPE(device.deviceType, device.uuid, triggerId));
  }
}

export class ZabbixTriggerViewdata {
  id: string;
  name: string;
  severity: string;
  severityColorClass: string;
  state: string;
  stateColorClass: string;
  status: string;
  isDisabled: boolean;
  statusSwitchIconTooltip: string;
  statusIconClass: string;
  mode: string;
  canEdit: boolean;
  canDelete: boolean;
  script: string;
  credential: number;
  constructor() { }
}
