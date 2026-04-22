import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GCPAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-gcp/gcp-dashboard/gcp-dashboard.service';
import { EmailValidator, NoWhitespaceValidator } from '../../shared/app-utility/app-utility.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ADD_GCP_ACCOUNT, DELETE_GCP_ACCOUNT, EDIT_GCP_ACCOUNT } from '../../shared/api-endpoint.const';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicCloudGcpCrudService {

  private addOrEditAnnouncedSource = new Subject<GCPAccountViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(view: GCPAccountViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  delete(id: string) {
    this.deleteAnnouncedSource.next(id);
  }

  private resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'email': '',
    };
    return formErrors;
  }

  private validationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'email': {
      'required': 'Email is required',
      'invalidEmail': 'Enter a valid email address'
    },
    'service_account_info': {
      'required': 'Service Account Info is required',
      'json': 'Invalid json'
    }
  };

  resetAddFormErrors(): any {
    let formErrors = Object.assign({}, this.resetFormErrors());
    formErrors.service_account_info = '';
    return formErrors;
  }

  addFormValidationMessages(): any {
    return Object.assign({}, this.validationMessages);
  }

  resetEditFormErrors(): any {
    return Object.assign({}, this.resetFormErrors());
  }

  editFormValidationMessages(): any {
    return Object.assign({}, this.validationMessages);
  }

  buildForm(input?: GCPAccountViewData): FormGroup {
    if (input) {
      return this.builder.group({
        'uuid': [input.uuid],
        'name': [input.name, [Validators.required, NoWhitespaceValidator]],
        'service_account_info': ['', [NoWhitespaceValidator, RxwebValidators.json()]],
        'email': [input.email, [Validators.required, NoWhitespaceValidator, EmailValidator]]
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'email': ['', [Validators.required, NoWhitespaceValidator, EmailValidator]],
        'service_account_info': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.json()]]
      });
    }
  }

  addAccount(data: { name: string, email: string, service_account_info: string }) {
    return this.http.post(ADD_GCP_ACCOUNT(), data);
  }

  updateAccount(data: { uuid: string, name: string, email: string, service_account_info: string }) {
    return this.http.put(EDIT_GCP_ACCOUNT(data.uuid), data);
  }

  deleteAccount(uuid: string) {
    return this.http.delete(DELETE_GCP_ACCOUNT(uuid));
  }
}
