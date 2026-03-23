import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_UL_S3_ACCOUNTS, ADD_UL_S3_ACCOUNT, EDIT_UL_S3_ACCOUNT, UPDATE_UL_S3_API_KEYS, DELETE_UL_S3_ACCOUNT, S3_UL_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { UlS3AccountType } from './ul-s3-type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnityS3AccountService {

  constructor(private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getS3Acccounts(criteria: SearchCriteria): Observable<PaginatedResult<UlS3AccountType>> {
    return this.tableService.getData<PaginatedResult<UlS3AccountType>>(GET_UL_S3_ACCOUNTS(), criteria);
  }

  getPrivateCloud() {
    return this.http.get<PrivateCLoudFast[]>(S3_UL_PRIVATE_CLOUD_FAST());
  }

  convertToViewData(accounts: UlS3AccountType[]): UlS3AccountViewData[] {
    let viewData: UlS3AccountViewData[] = [];
    accounts.map(account => {
      let data = new UlS3AccountViewData();
      data.uuid = account.uuid;
      data.id = account.id;
      data.endpointUrl = account.endpoint_url;
      data.accountName = account.account_name;
      data.cloudName = account.cloud.name;
      data.cloudId = account.cloud.uuid;
      data.accessKey = account.access_key;
      viewData.push(data);
    });
    return viewData;
  }



  resetAddAccountFormErrors() {
    return {
      'account_name': '',
      'access_key': '',
      'secret_key': '',
      'cloud': '',
      'endpoint_url': ''
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
    },
    'endpoint_url': {
      'required': 'Endpoint URL is required'
    },
    'cloud': {
      'required': 'Private cloud is required'
    }
  }

  createAddAccountForm(): FormGroup {
    return this.builder.group({
      'account_name': ['', [Validators.required, NoWhitespaceValidator]],
      'access_key': ['', [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required]],
      'endpoint_url': ['', [Validators.required]],
      'cloud': ['', [Validators.required]]
    });
  }

  addAccount(data: { account_name: number, access_key: string, secret_key: string }) {
    return this.http.post(ADD_UL_S3_ACCOUNT(), data);
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

  createEditAddAccountForm(view: UlS3AccountViewData): FormGroup {
    return this.builder.group({
      'id': [view.id],
      'account_name': [view.accountName, [Validators.required, NoWhitespaceValidator]]
    });
  }

  updateAccount(id: string, data: { account_name: number }) {
    return this.http.put(EDIT_UL_S3_ACCOUNT(id), data);
  }

  resetAccessKeyFormErrors() {
    return {
      'access_key': '',
      'secret_key': ''
    };
  }

  accessKeyValidationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    }
  }

  createAccessKeyForm(view: UlS3AccountViewData): FormGroup {
    return this.builder.group({
      'id': [view.id],
      'access_key': [view.accessKey, [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required]]
    });
  }

  updateAPIKeys(data: { id: number, access_key: string, secret_key: string }) {
    return this.http.post(UPDATE_UL_S3_API_KEYS(), data);
  }

  deleteAccount(accountId: number) {
    return this.http.delete(DELETE_UL_S3_ACCOUNT(accountId));
  }
}
export class UlS3AccountViewData {
  accessKey: string;
  cloudName: string;
  cloudId: string;
  endpointUrl: string;
  accountName: string;
  uuid: string;
  id: number;
}