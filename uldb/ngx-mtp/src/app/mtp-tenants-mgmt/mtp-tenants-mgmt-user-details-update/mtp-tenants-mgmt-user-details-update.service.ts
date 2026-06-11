import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EDIT_USER_DETAILS, MTP_EDIT_USER_DETAILS, MTP_TENANT_CARRIER, MTP_TENANT_USER_ROLE } from 'src/app/shared/api-endpoint.const';
import { EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class MtpTenantsMgmtUserDetailsUpdateService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  editUserDetails(userUuid: string, tenantUuid: string): Observable<MTPUserDetailsDataType> {
    return this.http.get<MTPUserDetailsDataType>(MTP_EDIT_USER_DETAILS(userUuid, tenantUuid));
  }

  getUserRoles(): Observable<MtpUserRolesDataType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<MtpUserRolesDataType[]>(MTP_TENANT_USER_ROLE(), { params: params });
  }

  getCarriers(): Observable<UserPhoneCarrier[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<UserPhoneCarrier[]>(MTP_TENANT_CARRIER(), { params: params });
  }

  buildForm(data?: MTPUserDetailsDataType) {
    let roles = data ? data.user_roles.map(r => r.name) : [];
    return this.builder.group({
      'email': [data ? data.email : '', [Validators.required, NoWhitespaceValidator, EmailValidator]],
      'first_name': [data ? data.first_name : '', [Validators.required, NoWhitespaceValidator]],
      'last_name': [data ? data.last_name : '', [Validators.required, NoWhitespaceValidator]],
      'user_roles': [roles],
      'phone_number': [data && data.phone_number ? data.phone_number : null, [Validators.pattern('^\\d{10}$')]],
      'carrier': [data ? data.carrier : ''],
    });
  }

  resetFormErrors() {
    return {
      'email': '',
      'first_name': '',
      'last_name': '',
      'user_roles': '',
      'carrier': '',
      'phone_number': '',
    };
  }

  formValidationMessages = {
    'email': {
      'required': 'Name is Mandatory'
    },
    'first_name': {
      'required': ' First Name is Mandatory'
    },
    'last_name': {
      'required': 'Last Name is Mandatory'
    },
    'user_roles': {
      'required': 'User role is Mandatory'
    },
    'carrier': {
      'required': 'Carrier is Mandatory'
    },
    'phone_number': {
      'pattern': 'Phone number should be 10 digits'
    },
  }

  editUser(obj: MTPUserDetailsDataType, userUuid: string, tenantUuid: string) {
    return this.http.put(MTP_EDIT_USER_DETAILS(userUuid, tenantUuid), obj);
  }
}

export interface MTPUserDetailsDataType {
  url: string;
  id: number;
  uuid: string;
  org: number;
  first_name: string;
  last_name: string;
  email: string;
  has_two_factor: boolean;
  user_roles: MtpUserRolesDataType[];
  groups: any[];
  last_login: string;
  is_staff: boolean;
  is_active: boolean;
  is_customer_admin: boolean;
  salesforce_id: null;
  phone_number: string;
  carrier: UserPhoneCarrier[];
  password_reset_link_pending: boolean;
  user_type: string;
}

export interface MtpUserRolesDataType {
  url: string;
  id: number;
  name: string;
  role_type: string;
}

export interface UserPhoneCarrier {
  id: string;
  carrier_name: string;
  sms_list: string[];
}