import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConnectionConfigType } from './unity-setup-connections.type';

@Injectable()
export class UnitySetupConnectionsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,) { }

  createConnection(formData: any): Observable<any> {
    return this.http.post<any>(`/orchestration/connection/`, formData);
  }

  getConnectionDataById(uuid: string) {
    return this.http.get<any>(`/orchestration/connection/${uuid}/`);
  }

  updateConnection(uuid: string, formData: ConnectionConfigType) {
    return this.http.put<any>(`/orchestration/connection/${uuid}/`, formData);
  }

  buildForm(connection?: ConnectionConfigType): FormGroup {
    if (connection) {
      let form = this.builder.group({
        'name': [connection.name, [Validators.required, NoWhitespaceValidator]],
        'base_url': [connection.base_url, [Validators.required, RxwebValidators.url(), NoWhitespaceValidator]],
        'auth_type': [connection.auth_type, [Validators.required, NoWhitespaceValidator]],
      });
      if (connection.auth_type == 'BASIC') {
        form.addControl('username', new FormControl(connection.username, [Validators.required]));
        form.addControl('password', new FormControl('', [Validators.required]));
      } else if (connection.auth_type == 'API_KEY') {
        form.addControl('api_key', new FormControl(connection.api_key, [Validators.required]));
        form.addControl('api_key_field', new FormControl(connection.api_key_field, [Validators.required]));
        form.addControl('api_key_method', new FormControl(connection.api_key_method, [Validators.required]));
      } else if (connection.auth_type == 'OAUTH2') {
        form.addControl('oauth2_grant', new FormControl(connection.oauth2_grant, [Validators.required]));
      } else {
      }
      if (connection.oauth2_grant == 'CLIENT_CREDENTIALS') {
        form.addControl('token_url', new FormControl(connection.token_url, [Validators.required, RxwebValidators.url()]));
        form.addControl('client_id', new FormControl(connection.client_id, [Validators.required]));
        form.addControl('client_secret', new FormControl('', [Validators.required]));
        form.addControl('scope', new FormControl(connection.scope));
      }
      if (connection.oauth2_grant == 'PASSWORD') {
        form.addControl('token_url', new FormControl(connection.token_url, [Validators.required, RxwebValidators.url()]));
        form.addControl('client_id', new FormControl(connection.client_id, [Validators.required]));
        form.addControl('client_secret', new FormControl('', [Validators.required]));
        form.addControl('scope', new FormControl(connection.scope));
        form.addControl('username', new FormControl(connection.username, [Validators.required]));
        form.addControl('password', new FormControl('', [Validators.required]));
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'base_url': ['', [Validators.required, RxwebValidators.url(), NoWhitespaceValidator]],
        'auth_type': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'base_url': '',
      'auth_type': '',
      'username': '',
      'password': '',
      'api_key': '',
      'api_key_field': '',
      'api_key_method': '',
      'token_url': '',
      'client_id': '',
      'client_secret': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'base_url': {
      'required': 'Base URL is required',
      'url': 'Please enter correct Url'
    },
    'auth_type': {
      'required': 'Authentication Type is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'api_key': {
      'required': 'API Key is required'
    },
    'api_key_field': {
      'required': 'Prefix Name is required'
    },
    'api_key_method': {
      'required': 'Method is required'
    },
    'token_url': {
      'required': 'Token URL is required',
      'url': 'Please enter correct Url'
    },
    'client_id': {
      'required': 'Client Id is required'
    },
    'client_secret': {
      'required': 'Client Secret Key is required'
    }
  }

}

export const AUTH_TYPE_CHOICES = [
  { key: 'Basic Auth', value: 'BASIC' },
  { key: 'API Key', value: 'API_KEY' },
  { key: 'OAuth 2.0', value: 'OAUTH2' },
  { key: 'No Auth', value: 'NONE' },
];

export const OAUTH2_GRANT_CHOICES = [
  { key: 'Client Credentials', value: 'CLIENT_CREDENTIALS' },
  { key: 'Password Credentials', value: 'PASSWORD' },
  // { key: 'Refresh Token', value: 'REFRESH_TOKEN' },
];

export const API_KEY_METHOD_CHOICES = [
  { key: 'Authorization Header', value: 'AUTH_HEADER' },
  { key: 'Custom Header', value: 'CUSTOM_HEADER' },
  { key: 'Query Param', value: 'QUERY_PARAM' },
  { key: 'Request Body', value: 'REQUEST_BODY' },
];