import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin, of, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TenatGroupType } from 'src/app/shared/SharedEntityTypes/tenant-mgmt.type';
import { CREATE_TENANT, EDIT_TENANT_DETAILS, GET_TENANT_GROUP, GET_UNITY_MODULES } from 'src/app/shared/api-endpoint.const';
import { EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AddTenantDataType, UnityModulesDataType } from './mtp-tenants-mgmt-crud.type';

@Injectable()
export class MtpTenantsMgmtCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService,) { }

  getTenantGroups(): Observable<TenatGroupType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<TenatGroupType[]>(GET_TENANT_GROUP(), { params: params });
  }

  getUnityModules(): Observable<UnityModulesDataType[]> {
    return this.http.get<UnityModulesDataType[]>(GET_UNITY_MODULES());
  }

  getDropdownData(): Observable<{ groups: TenatGroupType[], unityModules: UnityModulesDataType[] }> {
    return forkJoin({
      groups: this.getTenantGroups().pipe(catchError(error => of(undefined))),
      unityModules: this.getUnityModules().pipe(catchError(error => of(undefined))),
    })
  }

  getTenantInfo(uuid: string): Observable<MtpTenantInfoDataType> {
    return this.http.get<MtpTenantInfoDataType>(EDIT_TENANT_DETAILS(uuid));
  }

  buildForm(data: MtpTenantInfoDataType): FormGroup {
    return this.builder.group({
      'name': [data ? data.name : '', [Validators.required, NoWhitespaceValidator]],
      'phone': [data ? data.phone : '', [Validators.pattern('^\\d{10}$'), NoWhitespaceValidator]],
      'mtp_group': [data ? data.mtp_group : '', [Validators.required, NoWhitespaceValidator]],
      'address1': [data ? data.address1 : '', [Validators.required, NoWhitespaceValidator]],
      // 'address2': [data ? data.address2 : '', [Validators.required]],
      // 'city': [data ? data.city : '', [Validators.required]],
      // 'state': [data ? data.state : '', [Validators.required]],
      // 'postal_code': [data ? data.postal_code : '', [Validators.required]],
      // 'country': [data ? data.country : '', [Validators.required]],
      'searchlocation': [data ? data.location : '', [Validators.required]],
      'location': [data ? data.location : '', [RxwebValidators.compare({ fieldName: 'searchlocation' })]],
      'lat': [data ? data.lat : '', RxwebValidators.required({
        conditionalExpression: (x: any) =>
          x.location && x.lat == '' && x.long == ''
      })],
      'long': [data ? data.long : ''],

      'domain': [data ? data.domain : ''],
      'email': [data ? data.email : null, [NoWhitespaceValidator, EmailValidator]],
      'unity_modules': [data ? data.unity_modules : [], [Validators.required]],
      'region': [{ value: data ? data.region : '' , disabled: data && data.region ? true : false}, [Validators.required, NoWhitespaceValidator]],
      '_logo': [data ? data._logo : ''],
    });
  }

  resetFormErrors() {
    return {
      'name': '',
      'phone': '',
      'mtp_group': '',
      'address1': '',
      'searchlocation': '',
      'location': '',
      'lat': '',
      'long': '',
      // 'address2': '',
      // 'city': '',
      // 'state': '',
      // 'postal_code': '',
      // 'country': '',
      // 'domain': '',
      'email': '',
      'unity_modules': '',
      'region': '',
      '_logo': ''
    };
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is Mandatory'
    },
    'mtp_group': {
      'required': 'Mtp group is Mandatory'
    },
    'address1': {
      'required': 'Address 1 is Mandatory'
    },
    // 'address2': {
    //   'required': 'Address 2 is Mandatory'
    // },
    // 'city': {
    //   'required': 'city is Mandatory'
    // },
    // 'state': {
    //   'required': 'State is Mandatory'
    // },
    // 'postal_code': {
    //   'required': 'Postal Code is Mandatory'
    // },
    // 'country': {
    //   'required': 'Country is Mandatory'
    // },
    'searchlocation': {
      'required': 'Location is required',
    },
    'location': {
      'compare': 'Please select a valid location'
    },
    'lat': {
      'required': 'Please select a valid location'
    },
    'long': {
    },
    'unity_modules': {
      'required': 'Unity Modules is Mandatory'
    },
    'region': {
      'required': 'Region is Mandatory'
    },
    'phone': {
      'pattern': 'Phone number should be 10 digits'
    },
    '_logo': {
      'maxSizeExceeded': 'Maximum Image size exceded',
      'invalidDimension': 'Image Aspect ratio must be 1:4'
    }
  }

  addTenant(obj: AddTenantDataType) {
    return this.http.post<AddTenantDataType>(CREATE_TENANT(), obj);
  }

  editTenant(obj: AddTenantDataType, uuid: string) {
    return this.http.put<AddTenantDataType>(EDIT_TENANT_DETAILS(uuid), obj);
  }

}

export class UnityModulesViewData {
  constructor() { }
  moduleName: string;
  moduleId: string;
}

export interface MtpTenantInfoDataType {
  name: string;
  phone: string;
  address1: string;
  // address2: null;
  // city: string;
  // state: string;
  // postal_code: string;
  // country: string;
  location: string;
  lat: string;
  long: string;
  domain: null;
  email: string;
  unity_modules: number[];
  uuid: string;
  region: number;
  _logo: string;
  mtp_group: null;
  id: number;
  get_grp_by_id: MtpTenantInfoByGroup[];
}

export interface MtpTenantInfoByGroup {
  name: string;
  id: number;
}

export function ImageSizeRationValidator(appService: AppLevelService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const image = new Image();
    image.src = control.value;
    return timer(50).pipe(
      map(() => {
        if (!(image.width * 4 >= image.height - 50 && image.width * 4 <= image.height + 50)) {
          return { 'invalidDimension': true };
        } else {
          let file = appService.convertToBinary(control.value);
          if (file.size > 700 * 1024) {
            return { 'maxSizeExceeded': true };
          }
          return null;
        }
      }),
      catchError(() => of(null))
    );
  }
}