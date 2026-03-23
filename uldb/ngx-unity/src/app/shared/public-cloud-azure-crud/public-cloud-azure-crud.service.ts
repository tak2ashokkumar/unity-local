import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AzureAccountsType, AzureAccountsViewData } from 'src/app/united-cloud/public-cloud/public-cloud-azure/entities/azure-accounts.type';
import { DELETE_AZURE_ACCOUNT, EDIT_AZURE_ACCOUNT, GET_AZURE_CLOUD_LIST } from '../api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class PublicCloudAzureCrudService {
  private addOrEditAnnouncedSource = new Subject<AzureAccountsViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<number>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(view: AzureAccountsViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  delete(id: number) {
    this.deleteAnnouncedSource.next(id);
  }

  createAzureAcount(data: AzureAccountFormData): Observable<AzureAccountsType[]> {
    let params = new HttpParams().set('account_name', data.account_name).set('user_name', data.user_name)
      .set('secret_key', data.secret_key).set('subscription_id', data.subscription_id);
    return this.http.post<AzureAccountsType[]>(GET_AZURE_CLOUD_LIST(), params);
  }

  editAzureAccount(azureAccountId: number, data: AzureAccountFormData) {
    let params = new HttpParams().set('account_name', data.account_name).set('user_name', data.user_name)
      .set('subscription_id', data.subscription_id);
    return this.http.put(EDIT_AZURE_ACCOUNT(azureAccountId), params);
  }


  deleteAzureAccount(azureAccountId: number): Observable<string> {
    return this.http.delete<string>(DELETE_AZURE_ACCOUNT(azureAccountId));
  }

  resetFormErrors() {
    return {
      'account_name': '',
      'user_name': '',
      'secret_key': '',
      'subscription_id': ''
    }
  }

  validationMessages = {
    'account_name': {
      'required': 'Account Name is required'
    },
    'user_name': {
      'required': 'User Name is required'
    },
    'secret_key': {
      'required': 'Password is required'
    },
    'subscription_id': {
      'required': 'Subscription ID is required'
    }
  }

  createAzureAccount(): FormGroup {
    return this.builder.group({
      'account_name': ['', [Validators.required, NoWhitespaceValidator]],
      'user_name': ['', [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required, NoWhitespaceValidator]],
      'subscription_id': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  resetEditErrors() {
    return {
      'account_name': '',
      'user_name': '',
      'subscription_id': '',
      'error': '',
    };
  }

  validationEditMessages = {
    'account_name': {
      'required': 'Account Name is required'
    },
    'user_name': {
      'required': 'User Name is required'
    },
    'subscription_id': {
      'required': 'Subscription ID is required'
    },
  }


  editAzureAccountForm(azureaccount: AzureAccountsViewData): FormGroup {
    return this.builder.group({
      'account_name': [azureaccount.accountName, [Validators.required, NoWhitespaceValidator]],
      'user_name': [azureaccount.userName, [Validators.required, NoWhitespaceValidator]],
      'subscription_id': [azureaccount.subscriptionId, [Validators.required, NoWhitespaceValidator]]
    });
  }

}


export class AzureAccountFormData {
  account_name: string;
  user_name: string;
  secret_key: string;
  subscription_id: string;
  secret_key_confirm: string;
  constructor() { }
}