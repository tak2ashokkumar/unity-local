import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { CyberarcItem } from '../usi-vaults-cyberarc.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';

@Injectable()
export class UsiVaultsCrudService {
  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  buildVaultConfigurationForm(data?: CyberarcItem) {
    let form: FormGroup = this.builder.group({
      'name': [data?.name || '', [Validators.required, NoWhitespaceValidator]],
      'base_url': [data?.base_url || '', [Validators.required, NoWhitespaceValidator]],
      'app_id': [data?.app_id || '', [Validators.required, NoWhitespaceValidator]],
      'collector': [data?.collector || '', [Validators.required, NoWhitespaceValidator]],
      'safe': [data?.safe || '',],
      'username': [data?.username || ''],
      'device_name': [data?.device_name || ''],
      'object_name': [data?.object_name || ''],
      'account_id': [data?.account_id || ''],
      'default': [data?.default || false]
    });

    return form;
  }

  resetVaultConfigurationFormErrors() {
    return {
      'name': '',
      'base_url': '',
      'app_id': '',
      'collector': '',
      'safe': '',
      'username': '',
      'device_name': '',
      'object_name': '',
      'account_id': '',
      'default': ''
    };
  }

  vaultConfigurationValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'base_url': {
      'required': 'Base URL is required'
    },
    'app_id': {
      'required': 'Application ID is required'
    },
    'collector': {
      'required': 'Collector is required'
    },

  };

  getVaultDetails(instanceId: string): Observable<CyberarcItem> {
    return this.http.get<any>(`/customer/cyberark/accounts/${instanceId}/`);
  }

  saveVaultConfig(obj: any, instanceId?: string): Observable<CyberarcItem> {
    if (instanceId) {
      return this.http.put<any>(`/customer/cyberark/accounts/${instanceId}/`, obj);
    } else {
      return this.http.post<any>(`/customer/cyberark/accounts/`, obj);
    }
  }

  saveRotatePassword(obj: any, instanceId?: string): Observable<UnityScheduleType> {
    return this.http.post<any>(`/customer/cyberark/accounts/${instanceId}/rotate_password/`, obj);
  }

  editRotatePassword(obj: any, instanceId?: string): Observable<UnityScheduleType> {
    return this.http.patch<any>(`/customer/cyberark/accounts/${instanceId}/rotate_password/`, obj);

  }
}
