import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ADD_ROLE, EDIT_ROLE, GET_PERMISSION_SETS_LIST, GET_ROLE_DETAIL, GET_USER_GROUPS_LIST, LIST_ACTIVE_USER } from 'src/app/shared/api-endpoint.const';
import { RoleFormDataType } from '../usum-roles.type';
import { PermissionSetType, RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Injectable()
export class UsumRolesCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getRoleDetails(roleId: string): Observable<RoleType> {
    return this.http.get<RoleType>(GET_ROLE_DETAIL(roleId));
  }

  getPermissionSet(): Observable<PermissionSetType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('is_default', false).set('page_size', 0);
    return this.http.get<PermissionSetType[]>(GET_PERMISSION_SETS_LIST(), { params: params });
  }

  getUserGroup(): Observable<UserGroupType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<UserGroupType[]>(GET_USER_GROUPS_LIST(), { params: params });
  }

  getUserList(): Observable<string[]> {
    return this.http.get<string[]>(LIST_ACTIVE_USER());
  }

  getDropdownData(): Observable<{ permissionSet: PermissionSetType[], userGroups: UserGroupType[], userList: string[] }> {
    return forkJoin({
      permissionSet: this.getPermissionSet().pipe(catchError(error => of(undefined))),
      userGroups: this.getUserGroup().pipe(catchError(error => of(undefined))),
      userList: this.getUserList().pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(roleDetails: RoleType): FormGroup {
    if (roleDetails) {
      let form = this.builder.group({
        'name': [roleDetails.name, [Validators.required, NoWhitespaceValidator]],
        'description': [roleDetails.description, [Validators.required, NoWhitespaceValidator]],
        // 'is_active': [roleDetails.is_active],
        'user_groups': [roleDetails.user_groups],
        'users': [roleDetails.users],
        'permissions': [roleDetails.permissions, [Validators.required]]
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        // 'is_active': [true],
        'user_groups': [[]],
        'users': [[]],
        'permissions': [[], [Validators.required]]
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'permissions': ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'permissions': {
      'required': 'Permission Sets is required'
    }
  }

  add(formData: RoleFormDataType): Observable<RoleType> {
    return this.http.post<RoleType>(ADD_ROLE(), formData);
  }

  update(formData: RoleFormDataType, roleId: string): Observable<RoleType> {
    return this.http.patch<RoleType>(EDIT_ROLE(roleId), formData);
  }

}