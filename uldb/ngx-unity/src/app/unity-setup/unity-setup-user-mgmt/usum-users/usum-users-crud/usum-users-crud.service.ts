import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { CREATE_USER, GET_ROLES_LIST, GET_USER_GROUPS_LIST, UPDATE_USER, USER_CARRIER_LIST } from 'src/app/shared/api-endpoint.const';
import { AtLeastOneInputHasValue, EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsumUsersCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getUserDetails(userId: string): Observable<UnitySetupUser> {
    return this.http.get<UnitySetupUser>(UPDATE_USER(userId));
  }

  getCarriers(): Observable<UserPhoneCarrier[]> {
    return this.http.get<UserPhoneCarrier[]>(USER_CARRIER_LIST());
  }

  getUserGroups(): Observable<UserGroupType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<UserGroupType[]>(GET_USER_GROUPS_LIST(), { params: params });
  }

  getRoles(): Observable<RoleType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<RoleType[]>(GET_ROLES_LIST(), { params: params });
  }

  getDropdownData(): Observable<{ carriers: UserPhoneCarrier[], userGroups: UserGroupType[], userRoles: RoleType[] }> {
    return forkJoin({
      carriers: this.getCarriers().pipe(catchError(error => of(undefined))),
      userGroups: this.getUserGroups().pipe(catchError(error => of(undefined))),
      userRoles: this.getRoles().pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(data: UnitySetupUser): FormGroup {
    if (data) {
      // const groupInclusionFlag: boolean = data.group_inclusion == 'none' || data.group_inclusion == 'all' ? true : false;
      let form = this.builder.group({
        'email': [data ? data.email : '', [Validators.required, NoWhitespaceValidator, EmailValidator]],
        'first_name': [data ? data.first_name : '', [Validators.required, NoWhitespaceValidator]],
        'last_name': [data ? data.last_name : '', [Validators.required, NoWhitespaceValidator]],
        'phone_number': [data && data.phone_number ? data.phone_number : '', [Validators.pattern(new RegExp("[0-9 ]{10}"))]],
        'carrier': [data && data.carrier ? data.carrier : '', data && data.carrier ? [Validators.required] : []],
        // 'group_inclusion': [data ? data.group_inclusion : 'none'],
        'user_groups': [data ? data.user_groups : []],
        'rbac_roles': [data ? data.rbac_roles : []],
      });
      return form;
    } else {
      let form = this.builder.group({
        'email': ['', [Validators.required, NoWhitespaceValidator, EmailValidator]],
        'first_name': ['', [Validators.required, NoWhitespaceValidator]],
        'last_name': ['', [Validators.required, NoWhitespaceValidator]],
        'phone_number': ['', [Validators.pattern(new RegExp("[0-9 ]{10}"))]],
        'carrier': [''],
        // 'group_inclusion': ['none'],
        'user_groups': [[]],
        'rbac_roles': [[]],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'email': '',
      'first_name': '',
      'last_name': '',
      'phone_number': '',
      'carrier': '',
      'user_groups': '',
      'rbac_roles': '',
    };
  }

  formValidationMessages = {
    'email': {
      'required': 'Email is required',
      'invalidEmail': 'Enter valid email address'
    },
    'first_name': {
      'required': 'First Name is required'
    },
    'last_name': {
      'required': 'Last Name is required'
    },
    'phone_number': {
      'pattern': 'Phone number is not valid'
    },
    'carrier': {
      'required': 'This field is required if phone number is entered'
    },
    'user_groups': {
      'required': 'User Groups is required'
    }
  }

  createUser(data: any): Observable<UnitySetupUser> {
    return this.http.post<UnitySetupUser>(CREATE_USER(), data);
  }

  editUser(uuid: string, data: any): Observable<UnitySetupUser> {
    return this.http.put<UnitySetupUser>(UPDATE_USER(uuid), data);
  }

}

export interface SelectedUserGroup extends UserGroupType {
  isForceIncluded?: boolean;
}

export interface UserPhoneCarrier {
  id: string;
  carrier_name: string;
  sms_list: string[];
}