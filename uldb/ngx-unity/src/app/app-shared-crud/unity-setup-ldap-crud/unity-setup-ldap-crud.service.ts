import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ADD_LDAP_CONFIG, EDIT_LDAP_CONFIG, GET_LDAP_CONFIG_DETAILS_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { LDAPConfigFormDataType, LDAPConfigType } from 'src/app/unity-setup/unity-setup-ldap-config/unity-setup-ldap-config.type';

@Injectable({
  providedIn: 'root'
})
export class UnitySetupLdapCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getLDAPConfigDetails(ldapConfigId: string): Observable<LDAPConfigType> {
    return this.http.get<LDAPConfigType>(GET_LDAP_CONFIG_DETAILS_BY_ID(ldapConfigId));
  }

  buildCredentialForm(ldapConfigData: LDAPConfigType): FormGroup {
    if (ldapConfigData) {
      return this.builder.group({
        'ldap_url': [ldapConfigData.ldap_url, [Validators.required, NoWhitespaceValidator]],
        'username': [ldapConfigData.username, [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'dc': [ldapConfigData.dc, [Validators.required, NoWhitespaceValidator]],
        'ldap_port': [ldapConfigData.ldap_port, [Validators.required, NoWhitespaceValidator]]
      });
    } else {
      return this.builder.group({
        'ldap_url': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'dc': ['', [Validators.required, NoWhitespaceValidator]],
        'ldap_port': ['', [Validators.required, NoWhitespaceValidator]]
      });
    }
  }

  resetCredentialFormErrors() {
    let credentialFormErrors = {
      'ldap_url': '',
      'username': '',
      'password': '',
      'dc': '',
      'ldap_port': ''
    };
    return credentialFormErrors;
  }

  credentialFormValidationMessages = {
    'ldap_url': {
      'required': 'LDAP URL is required',
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'dc': {
      'required': 'Domain Name is required'
    },
    'ldap_port': {
      'required': 'LDAP Port is required'
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'ldap_url': '',
      'username': '',
      'password': '',
      'dc': ''
    };
    return formErrors;
  }

  validationMessages = {
    'ldap_url': {
      'required': 'LDAP URL is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Username is required'
    },
    'dc': {
      'required': 'Domain Name is required'
    }
  };

  createLDAPConfig(ldap: LDAPConfigFormDataType): Observable<LDAPConfigType> {
    return this.http.post<LDAPConfigType>(ADD_LDAP_CONFIG(), ldap);
  }

  editLDAPConfig(ldapConfigId: string, ldap: LDAPConfigFormDataType): Observable<LDAPConfigType> {
    return this.http.put<LDAPConfigType>(EDIT_LDAP_CONFIG(ldapConfigId), ldap);
  }

}