import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleType } from './mtp-administration-roles.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ASSIGN_ROLES, GET_ROLES, GET_USERS } from 'src/app/shared/api-endpoint.const';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserType } from '../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { map } from 'rxjs/operators';


@Injectable()
export class MtpAdministrationRolesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getRoles(criteria: SearchCriteria): Observable<PaginatedResult<RoleType>> {
    return this.tableService.getData<PaginatedResult<RoleType>>(GET_ROLES(), criteria);
  }

  addUserName(users: UserType[]): UserType[] {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getUsers(): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0) }).pipe(map((res) => this.addUserName(res)));;
  }

  convertToViewData(data: RoleType[]): RoleViewData[] {
    let viewData: RoleViewData[] = [];
    data.map(a => {
      let rd: RoleViewData = new RoleViewData();
      rd.uuid = a.uuid;
      rd.id = a.id;
      rd.name = a.name;
      rd.userType = a.role_type;
      rd.permission = a.permission;
      rd.roleType = 'Default';
      viewData.push(rd);
    });
    return viewData;
  }

  buildForm(): FormGroup {
    return this.builder.group({
      // 'role_type': ['', [Validators.required]],
      'users': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  resetFormErrors() {
    return {
      // 'role_type': '',
      'users': ''
    };
  }

  validationMessages = {
    // 'role_type': {
    //   'required': 'Alert type is required'
    // },
    'users': {
      'required': 'Users is required'
    }
  }

  assignRole(data: any, roleId: number) {
    return this.http.put(ASSIGN_ROLES(roleId), data);
  }

}

export class RoleViewData {
  id: number;
  uuid: string;
  name: string;
  userType: string;
  permission: string;
  roleType: string;
}