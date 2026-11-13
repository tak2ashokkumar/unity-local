import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ADD_TARGET_DEVICE_FOR_INTERFACE_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_INTERFACES_BY_DEVICE_ID } from '../../shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from '../../shared/app-utility/app-utility.service';
import { Observable, Subject } from 'rxjs';
import { DeviceDataType, DeviceTypesOptionsType, InterfaceDetailsType, RemoteDevicesType, TargetDeviceFormDataType } from '../../shared/SharedEntityTypes/device-interface.type';

export interface DeviceInterfaceCrudData {
  uuid: string;
  deviceType: DeviceMapping;
  interfaceUuid?: string;
  name: string;
  description: string;
  remote_devices?: RemoteDevicesType;
  validateRemoteMapping?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceInterfaceCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  private addTargetDeviceAnnouncedSource = new Subject<DeviceInterfaceCrudData>();
  addTagetDeviceAnnounced$ = this.addTargetDeviceAnnouncedSource.asObservable();

  addTargetDeviceForInterface(interfaceData: DeviceInterfaceCrudData) {
    this.addTargetDeviceAnnouncedSource.next(interfaceData);
  }

  getDevicesByDeviceType(deviceType: string): Observable<DeviceDataType[]> {
    let mappedDeviceType = this.utilSvc.getDeviceMappingByDeviceType(deviceType);
    return this.http.get<DeviceDataType[]>(DEVICES_FAST_BY_DEVICE_TYPE(mappedDeviceType));
  }

  getInterfaceDetails(deviceType: string, deviceId: string): Observable<InterfaceDetailsType[]> {
    let params: HttpParams = new HttpParams().set('device_type', deviceType).set('uuid', deviceId).set('page_size', 0);
    return this.http.get<InterfaceDetailsType[]>(`/customer/interfaces/`, { params: params });
  }

  buildTargetDeviceForm() {
    return this.builder.group({
      'source_interface': ['', [Validators.required]],
      'source_des': ['', [Validators.required]],
      'device_type': ['', [Validators.required]],
      'remote_device': ['', [Validators.required]],
      'remote_interface': ['', [Validators.required]]
    })
  }

  resetTargetDeviceFormErrors() {
    return {
      'device_type': '',
      'remote_device': '',
      'remote_interface': ''
    }
  }

  targetDeviceFormValidationMessages = {
    'device_type': {
      'required': 'Device Type is required'
    },
    'remote_device': {
      'required': 'Remote Device is required'
    },
    'remote_interface': {
      'required': 'Remote Interface is required'
    }
  }

  addTargetDevice(interfaceData: DeviceInterfaceCrudData, obj: TargetDeviceFormDataType) {
    return this.http.post(ADD_TARGET_DEVICE_FOR_INTERFACE_BY_DEVICE_TYPE(interfaceData.deviceType, interfaceData.uuid), {
      ...obj,
      source_interface_uuid: interfaceData.interfaceUuid
    });
  }
}

export const deviceTypesOptions: Array<DeviceTypesOptionsType> = [
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
  },
  {
    label: 'Hypervisor',
    value: 'hypervisor'
  },
  {
    label: 'BM Server',
    value: 'baremetal'
  },
  {
    label: 'Mac Device',
    value: 'mac_device'
  },
  {
    label: 'Storage',
    value: 'storage'
  },
  {
    label: 'Custom VM',
    value: 'virtual_machine'
  },
  {
    label: 'VMware VM',
    value: 'vmware'
  },
  {
    label: 'ESXI VM',
    value: 'esxi'
  },
  {
    label: 'Hyper-V VM',
    value: 'hyperv'
  },
  {
    label: 'Viptela Device',
    value: 'viptela_device'
  },
  {
    label: 'Meraki Device',
    value: 'meraki_device'
  }
]
