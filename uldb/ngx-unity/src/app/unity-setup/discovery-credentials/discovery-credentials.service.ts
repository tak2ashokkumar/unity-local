import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { CREATE_ADVANCED_DISCOVERY_CREDENTIALS, DELETE_ADVANCED_DISCOVERY_CREDENTIALS, GET_ADVANCED_DISCOVERY_CREDENTIALS, UPDATE_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceDiscoveryCredentials } from './discovery-credentials.type';

@Injectable()
export class DiscoveryCredentialsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getCredentials(criteria: SearchCriteria): Observable<PaginatedResult<DeviceDiscoveryCredentials>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: params });
  }

  convertToViewData(credentails: DeviceDiscoveryCredentials[]): DiscoveryCredentialViewData[] {
    let viewData: DiscoveryCredentialViewData[] = [];
    if (Array.isArray(credentails)) {
      credentails.map(c => {
        let a: DiscoveryCredentialViewData = new DiscoveryCredentialViewData();
        a.uuid = c.uuid;
        a.id = c.id;
        a.name = c.name;
        a.description = c.description;
        a.host = c.host;
        a.ip_address = c.ip_address;
        a.type = c.type;
        a.createdBy = c.created_by;
        a.editedBy = c.updated_by;
        a.community = c.community;
        a.security_name = c.security_name;
        a.security_level = c.security_level;
        a.authentication_protocol = c.authentication_protocol;
        a.authentication_passphrase = c.authentication_passphrase;
        a.privacy_protocol = c.privacy_protocol;
        a.privacy_passphrase = c.privacy_passphrase;
        a.username = c.username;
        a.password = c.password;
        a.sudo_password = c.sudo_password;
        a.key = c.key;
        a.editedDate = c.updated_at ? this.utilSvc.toUnityOneDateFormat(c.updated_at) : 'N/A';
        viewData.push(a);
      })
    }
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'type': '',
      'community': '',
      'host': '',
      'ip_address': '',
      'username': '',
      'password': '',
      'key': '',
      'security_name': '',
      'security_level': '',
      'authentication_protocol': '',
      'authentication_passphrase': '',
      'privacy_protocol': '',
      'privacy_passphrase': '',
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'type': {
      'required': 'Type is required'
    },
    'community': {
      'required': 'SNMP Community is required'
    },
    'host': {
      'required': 'Host is required'
    },
    'ip_address': {
      'required': 'ip address is required',
      'ip': 'Invalid IP'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'key': {
      'required': 'Key is required'
    },
    'security_name': {
      'required': 'Security name is required'
    },
    'security_level': {
      'required': 'Security level is required'
    },
    'authentication_protocol': {
      'required': 'Authenticity protocol is required'
    },
    'authentication_passphrase': {
      'required': 'Authenticity passphrase is required'
    },
    'privacy_protocol': {
      'required': 'Privacy protocol is required'
    },
    'privacy_passphrase': {
      'required': 'Privacy passphrase is required'
    },
  };

  buildForm(data?: DiscoveryCredentialViewData): FormGroup {
    this.resetFormErrors();
    if (data) {
      let credentialForm = this.builder.group({
        'id': [data.id],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description],
        'type': [data.type, [Validators.required, NoWhitespaceValidator]],
      });
      if (data.type == 'SNMPv1' || data.type == 'SNMPv2') {
        credentialForm.addControl('community', new FormControl(data.community, [Validators.required]));
      } else if (data.type == 'SSH' || data.type == 'Windows' || data.type == 'Default' || data.type == 'REDFISH') {
        credentialForm.addControl('username', new FormControl(data.username, [Validators.required]));
        credentialForm.addControl('password', new FormControl(Array(data.password.length).fill('*').join(''), [Validators.required]));
      } else if (data.type == 'SSH Key') {
        credentialForm.addControl('username', new FormControl(data.username, [Validators.required]));
        credentialForm.addControl('key', new FormControl(data.key, [Validators.required]));
        credentialForm.addControl('password', new FormControl(Array(data.password.length).fill('*').join(''), [Validators.required]));
        credentialForm.addControl('sudo_password', new FormControl(Array(data.sudo_password.length).fill('*').join('')));
      } else if (data.type == 'SNMPv3') {
        credentialForm.addControl('security_name', new FormControl(data.security_name, [Validators.required]));
        credentialForm.addControl('security_level', new FormControl(data.security_level, [Validators.required]));
        credentialForm.addControl('authentication_protocol', new FormControl(data.authentication_protocol, [Validators.required]));
        credentialForm.addControl('authentication_passphrase', new FormControl(data.authentication_passphrase, [Validators.required]));
        credentialForm.addControl('privacy_protocol', new FormControl(data.privacy_protocol, [Validators.required]));
        credentialForm.addControl('privacy_passphrase', new FormControl(data.privacy_passphrase, [Validators.required]));
      } else if (data.type == 'Active Directory') {
        credentialForm.addControl('host', new FormControl(data.host, [Validators.required]));
        credentialForm.addControl('ip_address', new FormControl(data.ip_address, [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        credentialForm.addControl('username', new FormControl(data.username, [Validators.required]));
        credentialForm.addControl('password', new FormControl(Array(data.password.length).fill('*').join(''), [Validators.required]));
      }
      return credentialForm;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': [''],
        'type': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  addCredential(data: any) {
    return this.http.post<any>(CREATE_ADVANCED_DISCOVERY_CREDENTIALS(), data);
  }

  updateCredential(uuid: string, data: any) {
    return this.http.put<any>(UPDATE_ADVANCED_DISCOVERY_CREDENTIALS(uuid), data);
  }

  deleteCredential(uuid: string) {
    return this.http.delete(DELETE_ADVANCED_DISCOVERY_CREDENTIALS(uuid));
  }
}


export class DiscoveryCredentialViewData {
  constructor() { }
  uuid: string;
  id: number;
  name: string;
  description: string;
  type: string;
  createdBy: string;
  editedBy: string;
  editedDate: string;
  community: string;
  security_name: string;
  security_level: string;
  authentication_protocol: string;
  authentication_passphrase: string;
  privacy_protocol: string;
  privacy_passphrase: string;
  username: string;
  password: string;
  sudo_password: string;
  key: string;
  host: string;
  ip_address: string;
}
