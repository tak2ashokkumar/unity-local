import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { MSDynamicsCRMType } from '../usi-ms-dynamics-crm.service';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiMsDynamicsCrmCrudService {

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  deleteAccount(id: string) {
    this.deleteAnnouncedSource.next(id);
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'crm_url': '',
      'client_id': '',
      'tenant_id': '',
      'username': '',
      'password': '',
      'access_type': '',
      'crm_account_uuid': ''
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'crm_url': {
      'required': 'Instance URL is required'
    },
    'client_id': {
      'required': 'Instance URL is required'
    },
    'tenant_id': {
      'required': 'Instance URL is required'
    },
    'username': {
      'required': 'Username is required',
    },
    'password': {
      'required': 'Password is required'
    },
    'access_type': {
      'required': 'Access type is required'
    },
    'crm_account_uuid': {
      'required': 'Account ID is required'
    }
  };

  buildForm(id: string): Observable<FormGroup> {
    if (id) {
      return this.http.get<MSDynamicsCRMType>(`customer/dynamics_crm/instances/${id}/`).pipe(
        map(instance => {
          return this.builder.group({
            'crm_account_uuid': [instance.crm_account_uuid, [Validators.required, NoWhitespaceValidator]],
            'name': [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator]],
            'crm_url': [instance ? instance.crm_url : '', [Validators.required, NoWhitespaceValidator]],
            'client_id': [instance ? instance.client_id : '', [Validators.required, NoWhitespaceValidator]],
            'tenant_id': [instance ? instance.tenant_id : '', [Validators.required, NoWhitespaceValidator]],
            'username': [instance ? instance.username : '', [Validators.required, NoWhitespaceValidator]],
            'password': ['', [Validators.required, NoWhitespaceValidator]],
            'is_default': [instance ? instance.is_default : false],
            'access_type': [instance ? instance.access_type : '']
          });
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'crm_url': ['', [Validators.required, NoWhitespaceValidator]],
        'client_id': ['', [Validators.required, NoWhitespaceValidator]],
        'tenant_id': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'is_default': [false],
        'crm_account_uuid': ['', [Validators.required, NoWhitespaceValidator]],
        'access_type': ['', [Validators.required]]
      }));
    }
  }

  save(id: string, sn: MSDynamicsCRMType): Observable<MSDynamicsCRMType> {
    if (id) {
      return this.http.put<MSDynamicsCRMType>(`customer/dynamics_crm/instances/${id}/`, sn);
    } else {
      return this.http.post<MSDynamicsCRMType>(`customer/dynamics_crm/instances/`, sn);
    }
  }

  delete(id: string) {
    return this.http.delete(`/customer/dynamics_crm/instances/${id}/`);
  }
}
