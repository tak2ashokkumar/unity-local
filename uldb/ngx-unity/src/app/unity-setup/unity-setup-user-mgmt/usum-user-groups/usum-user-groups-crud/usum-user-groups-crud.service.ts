import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ADD_USER_GROUP, EDIT_USER_GROUP, GET_ROLES_LIST, GET_USER_GROUP_DETAIL, LIST_ACTIVE_USER } from 'src/app/shared/api-endpoint.const';
import { UserGroupFormDataType } from '../usum-user-groups.type';
import { RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Injectable()
export class UsumUserGroupsCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getUserGroupDetails(userGroupId: string): Observable<UserGroupType> {
    return this.http.get<UserGroupType>(GET_USER_GROUP_DETAIL(userGroupId));
  }

  getRoles(): Observable<RoleType[]> {
    // let params: HttpParams = new HttpParams().set('status', true).set('is_default', false).set('page_size', 0);
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<RoleType[]>(GET_ROLES_LIST(), { params: params });
  }

  getUserList(): Observable<string[]> {
    return this.http.get<string[]>(LIST_ACTIVE_USER());
  }

  getDropdownData(): Observable<{ rolesList: RoleType[], userList: string[] }> {
    return forkJoin({
      rolesList: this.getRoles().pipe(catchError(error => of(undefined))),
      userList: this.getUserList().pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(userGroupDetails: UserGroupType): FormGroup {
    if (userGroupDetails) {
      let form = this.builder.group({
        'name': [userGroupDetails.name, [Validators.required, NoWhitespaceValidator]],
        'description': [userGroupDetails.description, [Validators.required, NoWhitespaceValidator]],
        'rbac_users': [userGroupDetails.rbac_users],
        'rbac_roles': [userGroupDetails.rbac_roles, [Validators.required]],
        'is_active': [userGroupDetails.is_active],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'rbac_users': [[]],
        'rbac_roles': [[], [Validators.required]],
        'is_active': [true],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'rbac_roles': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'rbac_roles': {
      'required': 'Roles is required'
    },
  }

  add(formData: UserGroupFormDataType): Observable<UserGroupType> {
    return this.http.post<UserGroupType>(ADD_USER_GROUP(), formData);
  }

  update(formData: UserGroupFormDataType, userGroupId: string): Observable<UserGroupType> {
    return this.http.patch<UserGroupType>(EDIT_USER_GROUP(userGroupId), formData);
  }

}