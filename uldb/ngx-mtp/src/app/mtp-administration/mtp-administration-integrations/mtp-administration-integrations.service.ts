import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class MtpAdministrationIntegrationsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getInstance() {
    return this.http.get<MTPTicketInstance[]>(`/customer/mtp_dynamics_crm/instances/?page_size=0`);
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

  buildForm(instance: MTPTicketInstance): FormGroup {
    if (instance) {
      return this.builder.group({
        'crm_account_uuid': [{ value: instance ? instance.crm_account_uuid : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'name': [{ value: instance ? instance.name : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'crm_url': [{ value: instance ? instance.crm_url : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'client_id': [{ value: instance ? instance.client_id : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'tenant_id': [{ value: instance ? instance.tenant_id : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'username': [{ value: instance ? instance.username : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        // 'password': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'is_default': [true],
        'access_type': [{ value: instance ? instance.access_type : '', disabled: true }]
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'crm_url': ['', [Validators.required, NoWhitespaceValidator]],
        'client_id': ['', [Validators.required, NoWhitespaceValidator]],
        'tenant_id': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'is_default': [true],
        'crm_account_uuid': ['', [Validators.required, NoWhitespaceValidator]],
        'access_type': ['', [Validators.required]]
      });
    }
  }

  save(sn: MSDynamicsCRMType): Observable<MSDynamicsCRMType> {
    return this.http.post<MSDynamicsCRMType>(`/customer/mtp_dynamics_crm/instances/`, sn);
  }
}

export interface MSDynamicsCRMType {
  id: number;
  name: string;
  uuid: string;
  crm_url: string;
  client_id: string;
  tenant_id: string;
  username: string;
  is_default: boolean;
  user: number;
  access_type: string;
  crm_account_uuid: string;
}
