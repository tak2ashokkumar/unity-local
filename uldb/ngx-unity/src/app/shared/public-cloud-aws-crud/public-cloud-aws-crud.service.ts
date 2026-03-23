import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ADD_AWS_ACCOUNT, DELETE_AWS_ACCOUNT, EDIT_AWS_ACCOUNT } from 'src/app/shared/api-endpoint.const';
import { AWSAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-aws/public-cloud-aws-summary/public-cloud-aws-summary.service';

@Injectable({
  providedIn: 'root'
})
export class PublicCloudAwsCrudService {
  private addOrEditAnnouncedSource = new Subject<AWSAccountViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<number>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();
  
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(view: AWSAccountViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  delete(id: number) {
    this.deleteAnnouncedSource.next(id);
  }

  resetAddAccountFormErrors() {
    return {
      'account_name': '',
      'access_key': '',
      'secret_key': ''
    };
  }

  addAccountValidationMessages = {
    'account_name': {
      'required': 'Account Name is required'
    },
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    }
  }

  createAddAccountForm(): FormGroup {
    return this.builder.group({
      'account_name': ['', [Validators.required, NoWhitespaceValidator]],
      'access_key': ['', [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required]]
    });
  }

  addAccount(data: { account_name: number, access_key: string, secret_key: string }) {
    return this.http.post(ADD_AWS_ACCOUNT(), data);
  }

  resetEditAccountFormErrors() {
    return {
      'account_name': ''
    };
  }

  editAccountValidationMessages = {
    'account_name': {
      'required': 'Account Name is required'
    }
  }

  createEditAddAccountForm(view: AWSAccountViewData): FormGroup {
    return this.builder.group({
      'id': [view.id],
      'aws_user': [view.username],
      'account_name': [view.accountName, [Validators.required, NoWhitespaceValidator]]
    });
  }

  updateAccount(data: { id: number, aws_user: string; account_name: number, access_key: string, secret_key: string }) {
    return this.http.put(EDIT_AWS_ACCOUNT(data.id), data);
  }

  deleteAccount(accountId: number) {
    return this.http.delete(DELETE_AWS_ACCOUNT(accountId));
  }

}
