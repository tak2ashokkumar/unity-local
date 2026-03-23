import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LDAPUserImportFormDataType, LDAPUserType } from '../unity-setup-ldap-config.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GET_LDAP_USERS_BY_LDAP_CONFIG_ID, IMPORT_LDAP_USERS_BY_LDAP_CONFIG_ID, IMPORT_LDAP_USER_BY_LDAP_CONFIG_ID } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnitySetupLdapUserImportService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,) { }

  getLDAPUsers(ldapConfigId: string, criteria: SearchCriteria): Observable<PaginatedResult<LDAPUserType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<LDAPUserType>>(GET_LDAP_USERS_BY_LDAP_CONFIG_ID(ldapConfigId), { params: params });
  }

  convertToViewData(data: LDAPUserType[]): LDAPUserViewData[] {
    data = data.filter(d => d.email);
    let viewData: LDAPUserViewData[] = [];
    data.map(d => {
      let a: LDAPUserViewData = new LDAPUserViewData();
      a.firstName = d.first_name;
      a.lastName = d.last_name;
      a.email = d.email;
      a.ldapUserId = d.ldap_user_id;
      a.isSelected = false;
      viewData.push(a);
    });
    return viewData;
  }

  buildImportForm(): FormGroup {
    this.resetImportFormErrors();
    return this.builder.group({
      'cn': ['', [Validators.required]],
      'ou': ['',],
    });
  }

  resetImportFormErrors(): any {
    let formErrors = {
      'cn': '',
      'ou': '',
    };
    return formErrors;
  }

  validationImportMessages = {
    'cn': {
      'required': 'Common Name is required'
    },
    'ou': {
      'required': 'Group Name is required'
    }
  };

  importLDAPUserByForm(ldapConfigId: string, data: LDAPUserImportFormDataType): Observable<string> {
    return this.http.post<string>(IMPORT_LDAP_USER_BY_LDAP_CONFIG_ID(ldapConfigId), data);
  }

  importLDAPUsers(ldapConfigId: string, selectedUsers: LDAPUserType[]): Observable<string> {
    return this.http.post<string>(IMPORT_LDAP_USERS_BY_LDAP_CONFIG_ID(ldapConfigId), { users: selectedUsers });
  }

}

export class LDAPUserViewData {
  constructor() { }
  firstName: string;
  lastName: string;
  email: string;
  isSelected: boolean = false;
  ldapUserId: string;
}