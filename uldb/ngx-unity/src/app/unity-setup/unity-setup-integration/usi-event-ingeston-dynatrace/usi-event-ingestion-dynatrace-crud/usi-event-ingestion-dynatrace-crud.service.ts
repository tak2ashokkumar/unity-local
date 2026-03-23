import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { DynatraceInstanceType } from './usi-event-ingestion-dynatrace.type';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ADD_NAGIOS_INSTANCE, DELETE_NAGIOS_INSTANCE, EDIT_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UsiEventIngestionDynatraceCrudService {
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
      return this.http.get<DynatraceInstanceType>(`customer/aiops/event-ingestion-instance/${uuid}/`).pipe(
        map(data => {
          let form = this.builder.group({
            'name': [data.name, [Validators.required, NoWhitespaceValidator]],
            'ingestion_type': [data.ingestion_type, [Validators.required]],
            'host_identity': [data.host_identity, [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
            'event_source': ['Dynatrace']
          });
          return form;
        }));
    }
    return of(this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'ingestion_type': ['', [Validators.required]],
      'host_identity': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
      'event_source': ['Dynatrace']
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
      'required': 'Instance URL is required',
      'url': 'URL is invalid',
    },
  }

  addInstance(obj: DynatraceInstanceType) {
    return this.http.post(ADD_NAGIOS_INSTANCE(), obj);
  }

  updateInstance(obj: DynatraceInstanceType, uuid: string) {
    return this.http.put(EDIT_NAGIOS_INSTANCE(uuid), obj);
  }

  deleteInstance(uuid: string) {
    return this.http.delete(DELETE_NAGIOS_INSTANCE(uuid));
  }
}
