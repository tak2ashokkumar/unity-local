import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEVICE_MONITORING_ADD_DEVICE, DEVICE_MONITORING_ADD_GROUP, DEVICE_MONITORING_DELETE_DEVICE, DEVICE_MONITORING_DELETE_GROUP, DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY, DEVICE_MONITORING_UPDATE_GROUP } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringStatus } from '../entities/device-monitoring-status.type';

@Injectable({
  providedIn: 'root'
})
export class DevicesCrudService {
  private addOrEditGroupSource = new Subject<DeviceGroup>();
  addOrEditGroupToggled$: Observable<DeviceGroup> = this.addOrEditGroupSource.asObservable();

  private deleteGroupSource = new Subject<DeviceGroup>();
  deleteGroupToggled$: Observable<DeviceGroup> = this.deleteGroupSource.asObservable();

  private addDeviceSource = new Subject<{ grouId: string, currentDeviceIds: string[] }>();
  addDeviceToggled$: Observable<{ grouId: string, currentDeviceIds: string[] }> = this.addDeviceSource.asObservable();

  public deviceAddedSource = new Subject<DeviceMonitoringStatus[]>();
  deviceAddedToggled$: Observable<DeviceMonitoringStatus[]> = this.deviceAddedSource.asObservable();

  private deleteDeviceSource = new Subject<{ deviceId: string, groupId: string }>();
  deleteDeviceToggled$: Observable<{ deviceId: string, groupId: string }> = this.deleteDeviceSource.asObservable();

  deviceDeletedSource = new Subject<string>();
  deviceDeletedToggled$: Observable<string> = this.deviceDeletedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(group: DeviceGroup) {
    this.addOrEditGroupSource.next(group);
  }

  deleteGroup(group: DeviceGroup) {
    this.deleteGroupSource.next(group);
  }

  addDevice(grouId: string, currentDeviceIds: string[]) {
    this.addDeviceSource.next({ grouId, currentDeviceIds });
    return this.deviceAddedToggled$;
  }

  deleteDevice(deviceId: string, groupId: string) {
    this.deleteDeviceSource.next({ deviceId: deviceId, groupId: groupId });
    return this.deviceDeletedToggled$;
  }

  resetGroupFormErrors() {
    return {
      'name': '',
      'desc': ''
    };
  }

  groupValidationMessages = {
    'name': {
      'required': 'Group name is required'
    },
    'desc': {
    }
  }

  createGroupForm(group: DeviceGroup): FormGroup {
    return this.builder.group({
      'name': [group ? group.name : '', [Validators.required, NoWhitespaceValidator]],
      'desc': [group ? group.desc : '', [NoWhitespaceValidator]]
    });
  }

  addGroup(data: { name: string, desc: string }): Observable<DeviceGroup> {
    return this.http.post<DeviceGroup>(DEVICE_MONITORING_ADD_GROUP(), data);
  }

  updateGroup(group: DeviceGroup) {
    return this.http.put(DEVICE_MONITORING_UPDATE_GROUP(group.uuid), group);
  }

  removeGroup(groupId: string) {
    return this.http.delete(DEVICE_MONITORING_DELETE_GROUP(groupId));
  }

  resetDeviceFormErrors() {
    return {
      'group_uuid': '',
      'devices_selected': ''
    };
  }

  deviceValidationMessages = {
    'group_uuid': {
    },
    'devices_selected': {
      'required': 'Device is required'
    }
  }

  createDeviceForm(groupId: string): FormGroup {
    return this.builder.group({
      'group_uuid': [groupId, [Validators.required, NoWhitespaceValidator]],
      'devices_selected': [[], [Validators.required]]
    });
  }

  private getKeyByCategory(device_category: string) {
    switch (device_category) {
      case 'vmware': return 'instance';
      case 'vcloud': return 'instance';
      case 'openstack': return 'instance';
      case 'custom_vm': return 'instance';
      case 'macdevice': return 'mac_device';
      default: return device_category;
    }
  }

  private convertMonitoringDeviceToViewData(data: MonitoringDevice[], deviceCategory: string): MonitoringDeviceViewData[] {
    let viewData: MonitoringDeviceViewData[] = [];
    data.map(d => {
      let device = new MonitoringDeviceViewData();
      device.deviceId = d.id;
      device.deviceUUId = (<Device>d[this.getKeyByCategory(deviceCategory)]).uuid;
      device.deviceName = (<Device>d[this.getKeyByCategory(deviceCategory)]).name;
      viewData.push(device);
    });
    return viewData;
  }

  private convertDeviceToViewData(data: Device[]): MonitoringDeviceViewData[] {
    let viewData: MonitoringDeviceViewData[] = [];
    data.map(d => {
      let device = new MonitoringDeviceViewData();
      device.deviceId = d.id;
      device.deviceUUId = d.uuid;
      device.deviceName = d.name;
      viewData.push(device);
    });
    return viewData;
  }

  private convertBMSToViewData(data: BMSFastType[]): MonitoringDeviceViewData[] {
    let viewData: MonitoringDeviceViewData[] = [];
    data.map(d => {
      let device = new MonitoringDeviceViewData();
      device.deviceId = d.bms_id;
      device.deviceUUId = d.uuid;
      device.deviceName = d.name;
      viewData.push(device);
    });
    return viewData;
  }

  private filterSelectedDevices(devices: MonitoringDeviceViewData[], currentDeviceIds: string[]) {
    return devices.filter(device => !currentDeviceIds.includes(device.deviceUUId));
  }

  getDeviceByCategory(deviceCategory: string, currentDeviceIds: string[]): Observable<MonitoringDeviceViewData[]> {
    if (deviceCategory == 'customdevice') {
      return this.http.get<Device[]>(DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY(deviceCategory))
        .pipe(map(data => this.convertDeviceToViewData(data)),
          map(devices => this.filterSelectedDevices(devices, currentDeviceIds)));
    } else {
      /**
       * AFTER INTEGRATION COMPLETED WITH ZABBIX REMOVE THIS IF-ELSE AND KEEP ONLY ONE OF THEM
       * 
       * These values are referred from HTML `select` dropdown values
       */
      if (deviceCategory == 'switch' ||
        deviceCategory == 'load_balancer' ||
        deviceCategory == 'firewall' ||
        deviceCategory == 'hypervisor' ||
        deviceCategory == 'storagedevice' ||
        deviceCategory == 'macdevice' ||
        deviceCategory == 'vmware' ||
        deviceCategory == 'vcloud' ||
        deviceCategory == 'esxi' ||
        deviceCategory == 'hyper-v' ||
        deviceCategory == 'openstack' ||
        deviceCategory == 'custom_vm') {
        return this.http.get<Device[]>(DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY(deviceCategory))
          .pipe(map(data => this.convertDeviceToViewData(data)),
            map(devices => this.filterSelectedDevices(devices, currentDeviceIds)));
      } else if (deviceCategory == 'bms') {
        return this.http.get<BMSFastType[]>(DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY(deviceCategory))
          .pipe(map(data => this.convertBMSToViewData(data)),
            map(devices => this.filterSelectedDevices(devices, currentDeviceIds)));
      } else {
        return this.http.get<MonitoringDevice[]>(DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY(deviceCategory))
          .pipe(map(data => this.convertMonitoringDeviceToViewData(data, deviceCategory)),
            map(devices => this.filterSelectedDevices(devices, currentDeviceIds)));
      }
    }
  }

  private getDeviceCategory(category: string) {
    switch (category) {
      case 'firewall': return category;
      case 'load_balancer': return 'loadbalancer';
      case 'switch': return category;
      case 'hypervisor': return 'server';
      case 'bms': return 'bmserver';
      case 'storagedevice': return 'storagedevice';
      case 'macdevice': return 'macdevice';
      case 'customdevice': return 'customdevice';
      case 'servers': return 'server';
      case 'vmware': return 'vmwarevmmigration';
      case 'vcloud': return 'vcloudvirtualmachines';
      case 'esxi': return 'vmwarevmmigration';
      case 'hyper-v': return 'hypervvm';
      case 'openstack': return 'openstackvmmigration';
      case 'custom_vm': return 'virtualmachine';
      //TODO: DELETE THIS CASE bc. After zabbix integration hyp & bms were seperated with seperate values to each
    }
  }

  submitDevice(data: DeviceAPI, category: string) {
    data.device_category = this.getDeviceCategory(category);
    return this.http.post<DeviceMonitoringStatus[]>(DEVICE_MONITORING_ADD_DEVICE(), data);
  }

  confirmDeviceDelete(deviceId: string, groupId: string) {
    return this.http.delete(DEVICE_MONITORING_DELETE_DEVICE(deviceId, groupId));
  }
}

export class MonitoringDeviceViewData {
  deviceId: number;
  deviceUUId: string;
  deviceName: string;
  constructor() { }
}

export interface MonitoringDevice {
  id: number;
  server?: Device;
  instance?: Device;
  firewall?: Device;
  load_balancer?: Device;
  switch?: Device;
}

export interface Device {
  uuid: string;
  id: number;
  name: string;
}

export interface BMSFastType {
  id: number;
  uuid: string;
  name: string;
  bms_id: number;
  bms_uuid: string;
}

export interface DeviceAPI {
  group_uuid: string;
  device_category: string;
  devices_selected: number[];
}