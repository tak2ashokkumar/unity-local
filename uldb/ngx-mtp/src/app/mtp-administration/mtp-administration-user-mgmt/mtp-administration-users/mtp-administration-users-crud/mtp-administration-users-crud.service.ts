import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CREATE_USER, GET_CARRIER_LIST, GET_GROUPS, GET_ROLES, GET_TENANTS, GET_USER_DATA, UPDATE_USER } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RoleType } from '../../mtp-administration-roles/mtp-administration-roles.type';
import { CarrierType, TenantType, UserType } from './mtp-administration-users-crud.type';
import { GroupType } from '../../mtp-administration-group/mtp-administration-group.type';

@Injectable()
export class MtpAdministrationUsersCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getTenants(userType?: string): Observable<TenantType[]> {
    if (userType == 'MSP') {
      return this.http.get<TenantType[]>(GET_TENANTS(), { params: new HttpParams().set('is_msp', true) });
    } else {
      return this.http.get<TenantType[]>(GET_TENANTS());
    }
  }

  getRoles(): Observable<RoleType[]> {
    return this.http.get<RoleType[]>(GET_ROLES(), { params: new HttpParams().set('page_size', 0) });
  }

  getGroups(): Observable<GroupType[]> {
    return this.http.get<GroupType[]>(GET_GROUPS(), { params: new HttpParams().set('page_size', 0) });
  }

  getCarriers(): Observable<CarrierType[]> {
    return this.http.get<CarrierType[]>(GET_CARRIER_LIST(), { params: new HttpParams().set('page_size', 0) });
  }

  getDropdownData(): Observable<{ groups: GroupType[], roles: RoleType[], tenants: TenantType[], carriers: CarrierType[] }> {
    return forkJoin({
      groups: this.getGroups().pipe(catchError(error => of(undefined))),
      roles: this.getRoles().pipe(catchError(error => of(undefined))),
      tenants: this.getTenants().pipe(catchError(error => of(undefined))),
      carriers: this.getCarriers().pipe(catchError(error => of(undefined)))
    });
  }

  getUserData(uuid: string): Observable<UserType> {
    return this.http.get<UserType>(GET_USER_DATA(uuid));
  }

  buildForm(data: UserType): FormGroup {
    if (data) {
      let form = this.builder.group({
        'user_type': [{ value: data.user_type, disabled: true }, [Validators.required]],
        'first_name': [data.first_name, [Validators.required, NoWhitespaceValidator]],
        'last_name': [data.last_name, [Validators.required, NoWhitespaceValidator]],
        'email': [data.email, [Validators.required, NoWhitespaceValidator]],
        'phone_number': [data.phone_number, [NoWhitespaceValidator]],
        'user_groups': [data.user_groups.length ? data.user_groups.getFirst().name : ''],
        'user_roles': [data.user_roles ? data.user_roles.map(role => role.name) : []],
        'org': [data.org ? data.org : '', [Validators.required]],
        'tenants': [data.tenants ? data.tenants.map(tenant => tenant.name) : []],
        'send_invite': [data.send_invite],
        'carrier': [data.carrier ? data.carrier : '']
      });
      // if (data.user_type == 'Tenant') {
      //   form.addControl('org', new FormControl(data.org));
      // } else if (data.user_type == 'MSP') {
      //   form.addControl('tenants', new FormControl(data.tenants.map(tenant => tenant.name)));
      // }
      return form;
    } else {
      return this.builder.group({
        'user_type': ['', [Validators.required]],
        'first_name': ['', [Validators.required, NoWhitespaceValidator]],
        'last_name': ['', [Validators.required, NoWhitespaceValidator]],
        'email': ['', [Validators.required, NoWhitespaceValidator]],
        'phone_number': [null, [NoWhitespaceValidator]],
        'user_groups': [''],
        'user_roles': [[]],
        'org': ['', [Validators.required]],
        'tenants': [[]],
        'send_invite': [false],
        'carrier': ['']
      });
    }
  }

  resetFormErrors() {
    return {
      'user_type': '',
      'org': '',
      'tenants': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'phone_number': '',
      'user_groups': '',
      'user_roles': '',
      'send_invite': '',
      'carrier': ''
    }
  }

  validationMessages = {
    'user_type': {
      'required': 'Type is required'
    },
    'org': {
      'required': 'Tenant is required'
    },
    // 'tenants': {
    //   'required': 'Tenant is required'
    // },
    'first_name': {
      'required': 'First name is required'
    },
    'last_name': {
      'required': 'Last name is required'
    },
    'email': {
      'required': 'Email ID is required'
    }
    // 'carrier': {
    //   'required': 'Carrier is required'
    // }
    // 'user_roles': {
    //   'required': 'Role is required'
    // }
  }

  createUser(data: any) {
    return this.http.post(CREATE_USER(), data);
  }

  updateUser(data: any, userId: string) {
    return this.http.put(UPDATE_USER(userId), data);
  }
}
