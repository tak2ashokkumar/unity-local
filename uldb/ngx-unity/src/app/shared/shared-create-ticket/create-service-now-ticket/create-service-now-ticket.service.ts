import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceMapping, NoWhitespaceValidator, SERVICE_NOW_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { UnityTicketInput } from '../shared-create-ticket.service';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_SERVICE_CATEGORY, GET_TERMS_BY_SERVICE_CATALOGUE, SERVICE_CATALOG_BY_DEVICE_TYPE } from '../../api-endpoint.const';
import { DeviceServiceCatalog, DeviceServiceCatalogTerms } from '../../create-ticket/device-service-catalog.type';

@Injectable({
  providedIn: 'root'
})
export class CreateServiceNowTicketService {
  private serviceNowticketAnnouncedSource = new Subject<{ input: UnityTicketInput, instanceId: string, deviceMapping: DeviceMapping }>();
  serviceNowTicketAnnounced$ = this.serviceNowticketAnnouncedSource.asObservable();

  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  formData: FormData;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  createTicket(input: UnityTicketInput, instanceId: string, deviceMapping?: DeviceMapping) {
    this.serviceNowticketAnnouncedSource.next({ input: input, instanceId: instanceId, deviceMapping: deviceMapping });
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(data: UnityTicketInput): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'subject': [data.subject, [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'metadata': [data.metadata, NoWhitespaceValidator],
      'type': [data.type ? data.type : 'task']
    });
    if (data.webaccess) {
      form.addControl('weburl', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)]));
    } else {
      form.addControl('description', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
    return form;
  }

  resetFormErrors(): any {
    let formErrors: any = {
      'subject': '',
      'collaborators': '',
      'type': '',
      'priority': '',
      'description': '',
      'weburl': '',
    };
    return formErrors;
  }

  validationMessages = {
    'subject': {
      'required': 'Subject is required'
    },
    'type': {
      'required': 'Ticket type is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'weburl': {
      'required': 'Web URL is required',
      'pattern': 'Please enter valid Web URL'
    },
  };

  getServiceCategory(): Observable<Array<string>> {
    return this.http.get<Array<string>>(GET_SERVICE_CATEGORY());
  }

  getServiceCatalog(deviceMapping: DeviceMapping) {
    return this.http.get<DeviceServiceCatalog[]>(SERVICE_CATALOG_BY_DEVICE_TYPE(deviceMapping));
  }

  getTermsByServiceCatalogue(catalogueId: number) {
    return this.http.get<DeviceServiceCatalogTerms[]>(GET_TERMS_BY_SERVICE_CATALOGUE(catalogueId));
  }

  toFormData<T>(formValue: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    return formData;
  }

  updateFormValue(form: FormGroup, data?: FormData) {
    this.form = form;
    if (data) {
      this.formData = data;
    }
  }

  isInvalid() {
    return this.form.invalid;
  }

  getFormValue() {
    return this.form.getRawValue();
  }

  getFormDataObj() {
    return this.formData;
  }
}

export const SERVICE_NOW_TICKET_TYPES = [
  SERVICE_NOW_TICKET_TYPE.INCIDENT, SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST, SERVICE_NOW_TICKET_TYPE.PROBLEM,
];
