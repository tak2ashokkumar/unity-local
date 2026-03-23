import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_AWSCO2_ACCOUNT_LIST } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ImportSustainabilityFormData } from '../usi-import-sustainability-data.service';

@Injectable()
export class UsiImportAwsDataService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }


  getAccounts(): Observable<ImportSustainabilityAwsAccountType[]> {
    return this.http.get<ImportSustainabilityAwsAccountType[]>(GET_AWSCO2_ACCOUNT_LIST());
  }

  convertToAccountViewData(accounts: ImportSustainabilityAwsAccountType[]): ImportSustainabilityAwsAccountViewData[] {
    let awsAccounts: ImportSustainabilityAwsAccountViewData[] = [];
    accounts.map(ac => {
      let a: ImportSustainabilityAwsAccountViewData = new ImportSustainabilityAwsAccountViewData();
      a.accountId = ac.account_id
      a.accountName = ac.account_name;
      awsAccounts.push(a);
    })
    return awsAccounts;
  }

  buildForm(): FormGroup {
    return this.builder.group({
      'account_name': ['', [Validators.required, NoWhitespaceValidator]],
      'account_id': ['', [Validators.required, NoWhitespaceValidator]],
      'description': [],
      'aws_file': ['', [Validators.required, NoWhitespaceValidator]],

    })
  }

  resetFormErrors(): any {
    let formErrors = {
      account_name: '',
      new_account_name: '',
      account_id: '',
      new_account_id: '',
      aws_file: ''
    };
    return formErrors;
  }

  validationMessages = {
    account_name: {
      required: 'Account Name is required',
    },
    new_account_name: {
      required: 'New Account Name is required',
    },
    account_id: {
      required: 'Account ID is required',
    },
    new_account_id: {
      required: 'New Account ID is required',
    },
    aws_file: {
      required: 'Please attach the file.',
    }
  };
}

export interface ImportSustainabilityAwsAccountType {
  account_id: string[];
  account_name: string;
}

export class ImportSustainabilityAwsAccountViewData {
  accountId: string[];
  accountName: string;
  constructor() { }
}

export interface ImportSustainabilityAwsFormData extends ImportSustainabilityFormData {
  account_id: string;
  account_name: string;
  new_account_name?: string;
  new_account_id?: string;
  description: string;
  aws_file: string;
}