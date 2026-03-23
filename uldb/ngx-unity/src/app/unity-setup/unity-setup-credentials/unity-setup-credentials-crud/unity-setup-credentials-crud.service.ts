import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UNITY_CREDENTIALS, UNITY_CREDENTIALS_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnitySetupCredentials } from '../unity-setup-credentials.type';

@Injectable()
export class UnitySetupCredentialsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private iconSvc: DeviceIconService) { }

  getCredentialDetailsById(credentialId: string) {
    return this.http.get<UnitySetupCredentials>(UNITY_CREDENTIALS_BY_ID(credentialId));
  }

  buildForm(data?: UnitySetupCredentials) {
    if (data) {
      let form = this.builder.group({
        'id': [data.id],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description],
        'type': [data.type, [Validators.required, NoWhitespaceValidator]],
      });
      if (data.type == 'SNMPv1' || data.type == 'SNMPv2') {
        form.addControl('community', new FormControl(data.community, [Validators.required]));
      } else if (data.type == 'SSH' || data.type == 'Windows' || data.type == 'Default' || data.type == 'REDFISH') {
        form.addControl('username', new FormControl(data.username, [Validators.required]));
        form.addControl('password', new FormControl(Array(data.password?.length).fill('*').join(''), [Validators.required]));
      } else if (data.type == 'SSH Key') {
        form.addControl('username', new FormControl(data.username, [Validators.required]));
        form.addControl('key', new FormControl(data.key, [Validators.required]));
        form.addControl('password', new FormControl(Array(data.password?.length).fill('*').join(''), [Validators.required]));
        form.addControl('sudo_password', new FormControl(Array(data.sudo_password?.length).fill('*').join('')));
      } else if (data.type == 'SNMPv3') {
        form.addControl('security_name', new FormControl(data.security_name, [Validators.required]));
        form.addControl('security_level', new FormControl(data.security_level, [Validators.required]));
        if (data.security_level == 'authNoPriv') {
          form.addControl('authentication_protocol', new FormControl(data.authentication_protocol, [Validators.required]));
          form.addControl('authentication_passphrase', new FormControl(data.authentication_passphrase, [Validators.required]));
        } else if (data.security_level == 'authPriv') {
          form.addControl('authentication_protocol', new FormControl(data.authentication_protocol, [Validators.required]));
          form.addControl('authentication_passphrase', new FormControl(data.authentication_passphrase, [Validators.required]));
          form.addControl('privacy_protocol', new FormControl(data.privacy_protocol, [Validators.required]));
          form.addControl('privacy_passphrase', new FormControl(data.privacy_passphrase, [Validators.required]));
        }
      } else if (data.type == 'Active Directory') {
        form.addControl('host', new FormControl(data.host, [Validators.required]));
        form.addControl('ip_address', new FormControl(data.ip_address, [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        form.addControl('username', new FormControl(data.username, [Validators.required]));
        form.addControl('password', new FormControl(Array(data.password?.length).fill('*').join(''), [Validators.required]));
      } else if (data.type == 'DATABASE') {
        form.addControl('database_type', new FormControl(data.database_type, [Validators.required]));
        form.addControl('port', new FormControl(data.port, [Validators.min(0)]));
        form.addControl('username', new FormControl(data.username, [Validators.required]));
        form.addControl('password', new FormControl(Array(data.password?.length).fill('*').join(''), [Validators.required]));
      } else if (data.type == 'API User') {
        form.addControl('username', new FormControl(data.username, [Validators.required]));
        form.addControl('password', new FormControl(Array(data.password?.length).fill('*').join(''), [Validators.required]));
        form.addControl('port', new FormControl(data.port, [Validators.min(0)]));
      } else if (data.type == 'API Token') {
        form.addControl('api_token', new FormControl('', [Validators.required]));
        form.addControl('port', new FormControl(data.port, [Validators.min(0)]));
      } else if (data.type == 'CyberArk') {
        form.addControl('username', new FormControl(data.username || ''));
        form.addControl('password', new FormControl(data.password || ''));
      }

      if (data.type != 'REDFISH') {
        form.addControl('device_mapping', new FormControl(false));
        if (data.devices.length > 0) {
          form.get('device_mapping').patchValue(true);
          const device_types = [...new Set(data.devices.map(device => device.device_type))];
          form.addControl('device_types', new FormControl(device_types, [Validators.required]));
          form.addControl('devices', new FormControl(data.devices, [Validators.required]));
        }
      }
      return form;
    } else {
      return this.builder.group({
        name: ['', [Validators.required]],
        description: [''],
        type: ['', [Validators.required]],
      });
    }
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
      'api_token': '',
      'key': '',
      'security_name': '',
      'security_level': '',
      'authentication_protocol': '',
      'authentication_passphrase': '',
      'privacy_protocol': '',
      'privacy_passphrase': '',
      'device_types': '',
      'devices': '',
      'database_type': '',
      'port': ''
    };
    return formErrors;
  }

  formValidationMessages = {
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
    'api_token': {
      'required': 'API Token is required'
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
    'device_types': {
      'required': 'Device type is required'
    },
    'devices': {
      'required': 'Device selection is required'
    },
    'database_type': {
      'required': 'Database type selection is required'
    },
    'port': {
      'required': 'Port selection is required',
      'min': 'Invalid port'
    }
  };

  getDeviceTypes() {
    return deviceTypes;
  }

  getDevicesByDeviceTypes(criteria: SearchCriteria, type: string): Observable<PaginatedResult<DevicesFastByDeviceTypes>> {
    let params = this.tableSvc.getWithParam(criteria);
    if (type && type.trim() !== '') {
      params = params.set('type', type.trim());
    }
    return this.http.get<PaginatedResult<DevicesFastByDeviceTypes>>(`customer/fast/credential_devices/`, { params: params }).pipe(
      map((res: PaginatedResult<DevicesFastByDeviceTypes>) => {
        res.results.forEach(d => {
          d.deviceIcon = this.getIconByDeviceType(d.device_type);
        })
        return res;
      })
    );
  }

  getIconByDeviceType(device_type: string) {
    return `fa ${this.iconSvc.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(device_type))} fa-xs`;
  }

  save(data: any, credentialId?: string) {
    if (credentialId) {
      return this.http.put<any>(UNITY_CREDENTIALS_BY_ID(credentialId), data);
    } else {
      return this.http.post<any>(UNITY_CREDENTIALS(), data);
    }
  }
}

export interface DevicesFastByDeviceTypes {
  id: number;
  uuid: string;
  name: string;
  monitoring: DeviceMonitoringType;
  device_type: string;

  //for UI Purpose
  deviceIcon: string;
  selected: boolean;
  toBeRemoved: boolean;
}

export const deviceTypes: { label: string, value: string }[] = [
  { label: 'Switch', value: 'switch' },
  { label: 'Firewall', value: 'firewall' },
  { label: 'Load Balancer', value: 'load_balancer' },
  { label: 'Hypervisor', value: 'hypervisor' },
  { label: 'Baremetal Server', value: 'baremetal' },
  { label: 'Mac Device', value: 'mac_device' },
  { label: 'Storage', value: 'storage' },
  { label: 'Vmware Virtual Machine', value: 'vmware' },
  { label: 'vCloud Virtual Machine', value: 'vcloud' },
  { label: 'ESXI Virtual Machine', value: 'esxi' },
  { label: 'Hyper-V Virtual Machine', value: 'hyperv' },
  { label: 'OpenStack Virtual Machine', value: 'open_stack' },
  { label: 'Custom Virtual Machine', value: 'virtual_machine' },
];
