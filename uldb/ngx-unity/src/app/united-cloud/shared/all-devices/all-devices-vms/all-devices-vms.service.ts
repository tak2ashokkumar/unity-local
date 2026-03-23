import { Injectable } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EMPTY, Observable, of } from 'rxjs';
import { PlatFormMapping, DeviceMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { GET_VM_LIST_BY_PLATFORM, DEVICE_DATA_BY_DEVICE_TYPE, PRIVATE_CLOUD_FAST_BY_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { VMwareVM } from '../../vms/vms-list-vmware/vms-list-vmware.service';
import { OpenStackVM } from '../../vms/vms-list-openstack/vms-list-openstack.service';
import { CustomVM } from '../../vms/vms-list-custom/vms-list-custom.service';
import { Logger } from 'src/app/shared/app-logger.service';
import { VCloudVM } from '../../vms/vms-list-vcloud/vms-list-vcloud.service';
import { ProxmoxVM } from '../../vms/vms-list-proxmox/vms-list-proxmox.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { HypervVMType } from '../../vms/vms-list-hyperv/vms-list-hyperv.service';
import { EsxiVM } from '../../vms/vms-list-esxi/vms-list-esxi.service';
import { NutanixVMType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Injectable()
export class AllDevicesVmsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private logger: Logger) { }

  getPrivateCloud(pcId: string): Observable<PrivateClouds> {
    return this.http.get<PrivateClouds>(PRIVATE_CLOUD_FAST_BY_ID(pcId));
  }

  getAllVms(platformType: PlatFormMapping, criteria: SearchCriteria) {
    switch (platformType) {
      case PlatFormMapping.VMWARE:
        return this.getVMWareVM(platformType, criteria);
      case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
        return this.getVMWareVM(platformType, criteria);
      case PlatFormMapping.OPENSTACK:
        return this.getOpenstackVM(platformType, criteria);
      case PlatFormMapping.CUSTOM:
        return this.getCustomVM(platformType, criteria);
      case PlatFormMapping.VCLOUD:
        return this.getVCloudVM(platformType, criteria);
      case PlatFormMapping.PROXMOX:
      case PlatFormMapping.G3_KVM:
        return this.getProxmoxVM(platformType, criteria);
      case PlatFormMapping.HYPER_V:
        return this.getHypervVM(platformType, criteria);
      case PlatFormMapping.ESXI:
        return this.getEsxiVM(platformType, criteria);
      case PlatFormMapping.NUTANIX:
        return this.getNutanixVM(platformType, criteria);
      default: throw new Error('Invalid platform type');
    }
  }

  private getVms<T>(platformType: PlatFormMapping, criteria: SearchCriteria): Observable<T[]> {
    return this.tableService.getData<T[]>(GET_VM_LIST_BY_PLATFORM(platformType), criteria);
  }

  private getVMWareVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<VMwareVM>(platformType, criteria).pipe(map(res => this.convertVMwareToViewData(res)));
  }

  private getOpenstackVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<OpenStackVM>(platformType, criteria).pipe(map(res => this.convertOpenstackToViewData(res)));
  }

  private getCustomVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    // criteria.params[0]['cloud_id'] = criteria.params[0]['uuid'];
    return this.getVms<CustomVM>(platformType, criteria).pipe(map(res => this.convertCustomVmToViewData(res)));
  }

  private getVCloudVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<VCloudVM>(platformType, criteria).pipe(map(res => this.convertVCloudVmToViewData(res)));
  }

  private getProxmoxVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<ProxmoxVM>(platformType, criteria).pipe(map(res => this.convertProxmoxVmToViewData(res)));
  }

  private getHypervVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<HypervVMType>(platformType, criteria).pipe(map(res => this.convertHypervToViewData(res)));
  }

  private getEsxiVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<EsxiVM>(platformType, criteria).pipe(map(res => this.convertEsxiVMToViewData(res)));
  }

  private getNutanixVM(platformType: PlatFormMapping, criteria: SearchCriteria) {
    return this.getVms<NutanixVMType>(platformType, criteria).pipe(map(res => this.convertNutanixVMToViewData(res)));
  }

  private convertVMwareToViewData(data: VMwareVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.VMWARE_VIRTUAL_MACHINE;
      a.statsTooltipMessage = 'VMware Virtual Machine Statistics';
      if (vm.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(vm.status);
      }
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  convertVCloudVmToViewData(data: VCloudVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.VCLOUD;
      a.deviceStatus = vm.power_state == 'POWERED_OFF' ? 'Down' : 'Up';
      a.statsTooltipMessage = 'vCloud Virtual Machine Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  convertProxmoxVmToViewData(data: ProxmoxVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.vm_name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.VCLOUD;
      a.deviceStatus = vm.status == 'stopped' ? 'Down' : 'Up';
      a.statsTooltipMessage = `${vm.cloud.platform_type} Virtual Machine Statistics`;
      a.monitoring = null;
      viewData.push(a);
    });
    return viewData;
  }

  private convertOpenstackToViewData(data: OpenStackVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
      a.deviceStatus = vm.last_known_state == 'SHUTOFF' ? 'Down' : 'Up';
      a.statsTooltipMessage = 'OpenStack VM Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  private convertHypervToViewData(data: HypervVMType[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.HYPER_V;
      a.deviceStatus = vm.status == 'Running' ? 'Up' : 'Down';
      a.statsTooltipMessage = 'Hyperv VM Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  private convertEsxiVMToViewData(data: EsxiVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.ESXI;
      a.deviceStatus = vm.state == 'poweredOn' ? 'Up' : 'Down';
      a.statsTooltipMessage = 'ESXi VM Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  private convertCustomVmToViewData(data: CustomVM[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceStatus = 'Not Configured';
      a.deviceType = DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      a.statsTooltipMessage = 'Virtual Machine Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  convertNutanixVMToViewData(data: NutanixVMType[]) {
    let viewData: AllVMViewData[] = [];
    data.map(vm => {
      let a: AllVMViewData = new AllVMViewData();
      a.name = vm.name;
      a.vmId = vm.uuid;
      a.deviceType = DeviceMapping.NUTANIX_VIRTUAL_MACHINE;
      a.deviceStatus = vm?.status == 'Running' ? 'Up' : 'Down';
      a.statsTooltipMessage = 'Nutanix VM Statistics';
      a.monitoring = vm.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: AllVMViewData) {
    if (device.monitoring && !device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      if (device.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE || device.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
        if (!device.deviceStatus) {
          device.deviceStatus = 'Not Configured';
        }
      }
      device.isStatsButtonEnabled = true;
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }

    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      if (device.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE || device.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
        if (!device.deviceStatus) {
          device.deviceStatus = this.utilService.getDeviceStatus('-2');
        }
      }
      device.isStatsButtonEnabled = true;
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = (device.monitoring && device.monitoring.observium) ? DEVICE_DATA_BY_DEVICE_TYPE(device.deviceType, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(device.deviceType, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            device.popOverDetails.status = value.status;
            if (device.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE || device.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
              if (!device.deviceStatus) {
                device.deviceStatus = this.utilService.getDeviceStatus(value.status);
              }
            }
            device.isStatsButtonEnabled = true;
            device.statsTooltipMessage = 'VM Statistics';
          }
          return device;
        })
      );
  }
}
export class AllVMViewData {
  vmId: string;
  name: string;
  deviceStatus: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
  failedAlertsCount?: string;
  deviceType: DeviceMapping;
  showAlerts?: boolean;
  monitoring: DeviceMonitoringType;
  showEvents?: boolean;
  eventsCount?: string;
  constructor() { }
}