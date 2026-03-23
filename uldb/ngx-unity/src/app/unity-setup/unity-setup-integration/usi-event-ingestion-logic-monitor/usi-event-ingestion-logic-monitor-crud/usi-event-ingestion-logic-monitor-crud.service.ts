import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { map } from 'rxjs/operators';
import { ADD_NAGIOS_INSTANCE, DELETE_NAGIOS_INSTANCE, EDIT_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { LogicMonitorInstanceType } from './usi-event-ingestion-logic-monitor-crud.type';

@Injectable()
export class UsiEventIngestionLogicMonitorCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(uuid: string) {
    this.addOrEditAnnouncedSource.next(uuid);
  }

  delete(uuid: string) {
    this.deleteAnnouncedSource.next(uuid);
  }

  buildForm(uuid: string): Observable<FormGroup> {
    if (uuid) {
      return this.http.get<LogicMonitorInstanceType>(`customer/aiops/event-ingestion-instance/${uuid}/`).pipe(
        map(data => {
          let form = this.builder.group({
            'name': [data.name, [Validators.required, NoWhitespaceValidator]],
            'ingestion_type': [data.ingestion_type, [Validators.required]],
            'host_identity': [data.host_identity, [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
            'event_source': ['LogicMonitor']
          });
          return form;
        }));
    }
    return of(this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'ingestion_type': ['', [Validators.required]],
      'host_identity': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
      'event_source': ['LogicMonitor']
    }));
  }

  resetFormErrors() {
    return {
      'name': '',
      'ingestion_type': '',
      'host_identity': ''
    }
  }

  validationMessages = {
    'name': {
      'required': 'Name is required',
    },
    'ingestion_type': {
      'required': 'Ingestion type is required',
    },
    'host_identity': {
      'required': 'Tenancy Id is required',
    },
  }

  addInstance(obj: LogicMonitorInstanceType) {
    return this.http.post(ADD_NAGIOS_INSTANCE(), obj);
  }

  updateInstance(obj: LogicMonitorInstanceType, uuid: string) {
    return this.http.put(EDIT_NAGIOS_INSTANCE(uuid), obj);
  }

  deleteInstance(uuid: string) {
    return this.http.delete(DELETE_NAGIOS_INSTANCE(uuid));
  }
}
