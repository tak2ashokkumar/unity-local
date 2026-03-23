import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class StorageOntapTriggersService {

  constructor(private http: HttpClient) { }

  getTriggers(clusterId: string, itemName: string): Observable<OntapItemTriggers[]> {
    return this.http.get<OntapItemTriggers[]>(`customer/storagedevices/${clusterId}/monitoring/triggers/?item_name=${itemName}`);
  }

  convertToViewdata(triggers: OntapItemTriggers[]) {
    let viewData: OntapItemTriggersViewdata[] = [];
    triggers.map(t => {
      let a = new OntapItemTriggersViewdata();
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
      a.statusSwitchIconTooltip = t.disabled ? 'Enable' : 'Disable';
      a.statusIconClass = t.disabled ? 'fas fa-toggle-off' : 'fas fa-toggle-on'
      viewData.push(a);
    })
    return viewData;
  }
}

export interface OntapItemTriggers {
  trigger_id: number;
  name: string;
  expression: string;
  state: string;
  severity: string;
  disabled: boolean;
  mode: number;
  can_update: boolean;
  can_delete: boolean;
}

export class OntapItemTriggersViewdata {
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
  constructor() { }
}
