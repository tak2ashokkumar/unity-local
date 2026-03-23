import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UsiEventIngestionFields, UsiEventIntestionAccountType } from '../unity-setup-integration.service';

@Injectable()
export class UsiEventIngestionCommonService {
  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  delete(uuid: string) {
    this.deleteAnnouncedSource.next(uuid);
  }

  getEventIngestionParams(monitoringTool: string): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`, { params: new HttpParams().set('source', monitoringTool) });
  }

  getInstanceDetails(monitoringTool: string, instanceId: string): Observable<UsiEventIntestionAccountType> {
    return this.http.get<UsiEventIntestionAccountType>(`/customer/monitoring-tool/${monitoringTool?.toLowerCase()}/accounts/${instanceId}/`);
  }

  buildBasicDetailsForm(data) {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'ingest_event': [data.ingest_event],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': [, [Validators.required, NoWhitespaceValidator]],
        'ingest_event': [false],
      });
      return form;
    }
  }

  resetBasicDetailsFormErrors() {
    return {
      'name': '',
    }
  }

  basicDetailsFormValidationMessages = {
    'name': {
      'required': 'Name is required',
    },
  }

  saveDetails(monitoringTool: string, data: UsiEventIntestionAccountType) {
    return this.http.post(`/customer/monitoring-tool/${monitoringTool?.toLowerCase()}/accounts/`, data);
  }

  updateDetails(monitoringTool: string, data: UsiEventIntestionAccountType, instanceId: string) {
    return this.http.put(`/customer/monitoring-tool/${monitoringTool?.toLowerCase()}/accounts/${instanceId}/`, data);
  }

  deleteAccount(monitoringTool: string, instanceId: string) {
    return this.http.delete(`/customer/monitoring-tool/${monitoringTool?.toLowerCase()}/accounts/${instanceId}/`);
  }
}

// route path segment is mapped to event source
export const TOOL_NAME_MAP: Record<string, string> = {
  'appdynamics': 'AppDynamics',
  'logicmonitor': 'LogicMonitor',
  'nagios': 'Nagios',
  'new-relic': 'NewRelic',
  'opsramp': 'Opsramp',
  'dynatrace': 'Dynatrace',
  'zabbix': 'Zabbix'
};