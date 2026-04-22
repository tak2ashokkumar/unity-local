import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { OCIAccountType } from 'src/app/united-cloud/public-cloud/entities/oci-account.type';
import { OCIAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-oci/public-cloud-oci-accounts/public-cloud-oci-accounts.service';
import { CREATE_OCI_ACCOUNT, DELETE_OCI_ACCOUNT, GET_OCI_ACCOUNT_BY_ID, GET_OCI_REGIONS, UPDATE_OCI_ACCOUNT } from '../../shared/api-endpoint.const';
import { NoWhitespaceValidator } from '../../shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class PublicCloudOciCrudService {
  private addOrEditAnnouncedSource = new Subject<OCIAccountViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  getRegions(): Observable<{ display: string; value: string }[]> {
    return this.http.get<{ display: string; value: string }[]>(GET_OCI_REGIONS());
  }

  addOrEdit(view: OCIAccountViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  delete(id: string) {
    this.deleteAnnouncedSource.next(id);
  }

  resetAccountFormErrors() {
    return {
      'name': '',
      'user_ocid': '',
      'tenancy_ocid': '',
      'region': '',
      'fingerprint': ''
    };
  }

  accountValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'user_ocid': {
      'required': 'User ID is required'
    },
    'tenancy_ocid': {
      'required': 'Tenancy ID is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'fingerprint': {
      'required': 'Finger print is required'
    }
  }

  resetPrivateFormErrors() {
    return {
      'key_content': ''
    };
  }

  privateKeyValidationMessages = {
    'key_content': {
      'required': 'Private Key is required'
    }
  }

  createEditAccountForm(uuid?: string): Observable<FormGroup> {
    if (uuid) {
      return this.http.get<OCIAccountType>(GET_OCI_ACCOUNT_BY_ID(uuid)).pipe(
        map(oci => {
          return this.builder.group({
            'name': [oci.name, [Validators.required, NoWhitespaceValidator]],
            'user_ocid': [oci.user_ocid, [Validators.required, NoWhitespaceValidator]],
            'tenancy_ocid': [oci.tenancy_ocid, [Validators.required, NoWhitespaceValidator]],
            'region': [[oci.region], [Validators.required]],
            'fingerprint': [oci.fingerprint, [Validators.required]]
          })
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'user_ocid': ['', [Validators.required, NoWhitespaceValidator]],
        'tenancy_ocid': ['', [Validators.required, NoWhitespaceValidator]],
        'region': [[], [Validators.required]],
        'fingerprint': ['', [Validators.required]]
      }));
    }
  }

  buildPrivateKeyForm() {
    return this.builder.group({
      'key_content': ['', [Validators.required]]
    });
  }

  toFormData<T>(formValue: T, formValue1?: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    if (formValue1) {
      for (const key of Object.keys(formValue1)) {
        const value = formValue1[key];
        console.log(value)
        formData.append(key, this.appService.convertToBinary(value));
      }
    }
    return formData;
  }

  createAccount(data: FormData): Observable<OCIAccountType> {
    return this.http.post<OCIAccountType>(CREATE_OCI_ACCOUNT(), data);
  }

  deleteAccount(uuid: string): Observable<OCIAccountType> {
    return this.http.delete<OCIAccountType>(DELETE_OCI_ACCOUNT(uuid));
  }

  updateAccount(data: FormData, uuid: string): Observable<OCIAccountType> {
    return this.http.put<OCIAccountType>(UPDATE_OCI_ACCOUNT(uuid), data);
  }
}
