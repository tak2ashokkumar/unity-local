import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { NCMDeviceGroupFormDataType, NCMDeviceGroupType, NCMDevicesType } from '../nc-device-groups.type';

@Injectable()
export class NcDeviceGroupsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getNCMDevices(deviceTypes: string[]): Observable<NCMDevicesType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0).set('configured', true);
    deviceTypes.map((deviceType) => params = params.append('device_type', deviceType));
    return this.http.get<NCMDevicesType[]>(`customer/network_devices/`, { params: params });
  }

  getNCMDeviceGroupDetails(deviceGroupId: string): Observable<NCMDeviceGroupType> {
    return this.http.get<NCMDeviceGroupType>(`customer/network_devices_group/${deviceGroupId}/`);
  }

  buildDeviceGroupForm(data: NCMDeviceGroupType, ncmDevices: NCMDevicesType[]): FormGroup {
    if (data) {
      let devices = ncmDevices.filter(device => data.devices.some(d => d.uuid == device.uuid && d.device_type == device.device_type));
      return this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [Validators.required, NoWhitespaceValidator]],
        'device_types': [data.device_types, [Validators.required]],
        'devices': [devices, [Validators.required]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'device_types': [[], [Validators.required]],
        'devices': [[], [Validators.required]],
      });
    }
  }

  resetDeviceGroupFormErrors() {
    let deviceGroupFormErrors = {
      'name': '',
      'description': '',
      'device_types': '',
      'devices': ''
    };
    return deviceGroupFormErrors;
  }

  deviceGroupFormValidationMessages = {
    'name': {
      'required': 'Name is required',
    },
    'description': {
      'required': 'Description is required',
    },
    'device_types': {
      'required': 'Device Types is required'
    },
    'devices': {
      'required': 'Devices is required'
    }
  }

  saveDeviceGroup(data: NCMDeviceGroupFormDataType, deviceGroupId?: string) {
    if (deviceGroupId) {
      return this.http.put(`/customer/network_devices_group/${deviceGroupId}/`, data);
    } else {
      return this.http.post(`/customer/network_devices_group/`, data);
    }
  }
}

export const deviceTypesOptions: Array<LabelValueType> = [
  {
    label: 'Switch',
    value: 'switch'
  },
  {
    label: 'Firewall',
    value: 'firewall'
  },
  {
    label: 'Load Balancer',
    value: 'load_balancer'
  }
]