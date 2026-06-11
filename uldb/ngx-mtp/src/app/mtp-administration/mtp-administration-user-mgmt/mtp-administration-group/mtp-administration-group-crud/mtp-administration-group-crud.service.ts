import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GroupType } from '../mtp-administration-group.type';
import { Observable, forkJoin, of } from 'rxjs';
import { RoleType } from '../../mtp-administration-roles/mtp-administration-roles.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CREATE_GROUP, GET_ROLES, GET_USERS, GET_GROUP_DATA, UPDATE_GROUP, GET_TENANTS } from 'src/app/shared/api-endpoint.const';
import { TenantType, UserType } from '../../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MtpAdministrationGroupCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getUsers(): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0) });
  }

  getRoles(): Observable<RoleType[]> {
    return this.http.get<RoleType[]>(GET_ROLES(), { params: new HttpParams().set('page_size', 0) });
  }

  getTenants(userType?: string): Observable<TenantType[]> {
    if (userType == 'MSP') {
      return this.http.get<TenantType[]>(GET_TENANTS(), { params: new HttpParams().set('is_msp', true) });
    } else {
      return this.http.get<TenantType[]>(GET_TENANTS());
    }
  }

  getDropdownData(): Observable<{ users: UserType[], roles: RoleType[], tenants: TenantType[] }> {
    return forkJoin({
      users: this.getUsers().pipe(catchError(error => of(undefined))),
      roles: this.getRoles().pipe(catchError(error => of(undefined))),
      tenants: this.getTenants().pipe(catchError(error => of(undefined))),
    });
  }

  getGroupData(uuid: string): Observable<GroupType> {
    return this.http.get<GroupType>(GET_GROUP_DATA(uuid));
  }

  buildForm(data: GroupType): FormGroup {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [NoWhitespaceValidator]],
        'group_type': [{ value: data.group_type, disabled: true }, [Validators.required]],
        'users': [data.users.map(user => user.email)],
        'roles': [data.roles.map(role => role.name), [Validators.required]],
        'tenants': [data.tenants ? data.tenants.map(tenant => tenant.name) : []]
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [NoWhitespaceValidator]],
        'group_type': ['', [Validators.required]],
        'users': [[]],
        'roles': [[], [Validators.required]],
        'tenants': [[]]
      });
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'group_type': '',
      'users': '',
      'roles': '',
      'tenants': ''
    }
  }

  validationMessages = {
    'name': {
      'required': 'Group name is required'
    },
    'group_type': {
      'required': 'Group type is required'
    },
    // 'users': {
    //   'required': 'User is required'
    // },
    'roles': {
      'required': 'Role is required'
    },
    'tenants': {
      'required': 'Tenant is required'
    }
  }
  
  createGroup(data: any) {
    return this.http.post(CREATE_GROUP(), data);
  }
  
  updateGroup(data: any, groupId: string) {
    return this.http.put(UPDATE_GROUP(groupId), data);
  }
}
