import { Injectable } from '@angular/core';
import { UsiAccount, UsiEventIngestionFields, UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsiEventIngestionCustomCrudService {

  url: string = 'customer/monitoring-tool/custom/accounts/';

  constructor(
    private builder: FormBuilder,
    private http: HttpClient
  ) { }

  getDetails(instanceId: string): Observable<UsiAccount> {
    return this.http.get<UsiAccount>(`${this.url}${instanceId}/`);
  }

  saveDetails(data) {
    return this.http.post(this.url, data);
  }

  updateDetails(data, instanceId) {
    return this.http.put(`${this.url}${instanceId}/`, data);
  }

  getEventIngestionParams(): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`);
  }

  buildCredentialForm(data: UsiAccount): FormGroup {
    if (data) {
      let form = this.builder.group({
        'name': [data?.name, [Validators.required, NoWhitespaceValidator]],
        'ingest_event': [data?.ingest_event],
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'ingest_event': [false],
      });
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    }
  }
}
