import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DELETE_AZURE_ACCOUNT, EDIT_AZURE_ACCOUNT, GET_AZURE_CLOUD_LIST } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AzureAccountsViewData } from '../azure-details/azure-details.service';
import { AzureAccountsType } from '../azure-details/azure-details.type';

@Injectable()
export class AzureCrudService {
  private addOrEditAnnouncedSource = new Subject<AzureAccountsViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(view: AzureAccountsViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  delete(uuid: string) {
    this.deleteAnnouncedSource.next(uuid);
  }

  createAzureAcount(data: AzureAccountFormData): Observable<AzureAccountsType[]> {
    return this.http.post<AzureAccountsType[]>(GET_AZURE_CLOUD_LIST(), data);
  }

  buildForm(azureaccount: AzureAccountsViewData): FormGroup {
    if (azureaccount) {
      let form = this.builder.group({
        'client_id': [azureaccount.clientId, [Validators.required, NoWhitespaceValidator]],
        'client_secret': [azureaccount.clientSecret, [Validators.required, NoWhitespaceValidator]],
        'tenant_id': [azureaccount.tenantId, [Validators.required, NoWhitespaceValidator]]
      });
      return form;
    } else {
      return this.builder.group({
        'client_id': ['', [Validators.required, NoWhitespaceValidator]],
        'client_secret': ['', [Validators.required, NoWhitespaceValidator]],
        'tenant_id': ['', [Validators.required, NoWhitespaceValidator]]
      });
    }
  }

  resetFormErrors() {
    return {
      'client_id': '',
      'client_secret': '',
      'tenant_id': ''
    }
  }

  validationMessages = {
    'client_id': {
      'required': 'Client ID is required'
    },
    'client_secret': {
      'required': 'Password is required'
    },
    'tenant_id': {
      'required': 'Tenant ID is required'
    }
  }

  editAzureAccount(uuid: string, data: AzureAccountFormData) {
    return this.http.put(EDIT_AZURE_ACCOUNT(uuid), data);
  }

  deleteAzureAccount(uuid: string): Observable<string> {
    return this.http.delete<string>(DELETE_AZURE_ACCOUNT(uuid));
  }
}

export class AzureAccountFormData {
  constructor() { }
  client_id: string;
  client_secret: string;
  tenant_id: string;
}
