import { Injectable } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  GET_LDAP_CONFIG, ADD_LDAP_CONFIG, EDIT_LDAP_CONFIG,
  DELETE_LDAP_CONFIG, IMPORT_LDAP_USER
} from 'src/app/shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class UnitySetupImportUserService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }
  getLDAP(): Observable<LDAPConfig[]> {
    return this.http.get<LDAPConfig[]>(GET_LDAP_CONFIG());
  }

  convert(ldap_config: LDAPConfig): LDAPConfigViewData {
    let viewData = new LDAPConfigViewData();
    viewData.ldapUrl = ldap_config.ldap_url;
    viewData.username = ldap_config.username;
    viewData.password = ldap_config.password;
    viewData.dc = ldap_config.dc;
    viewData.id = ldap_config.id;
    return viewData;
  }

  convertToViewData(backends: LDAPConfig[]): LDAPConfigViewData[] {
    let viewData: LDAPConfigViewData[] = [];
    backends.map(backend => {
      viewData.push(this.convert(backend));
    });
    return viewData;
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

  buildImportForm(ldap: LDAPConfigViewData): FormGroup {
    this.resetImportFormErrors();
    return this.builder.group({
      'cn': ['', [Validators.required]],
      'ou': ['',],
    });
  }

  importLDAPUser(userform: ImportUserForm) {
    return this.http.post(IMPORT_LDAP_USER(), userform);
  }
}

export class LDAPConfigViewData {
  ldapUrl: string;
  username: string;
  password: string;
  id: number;
  dc: string;
  constructor() { }
}

export class ImportUserForm {
  cn: string;
  ou?: string;
  constructor() { }
}
