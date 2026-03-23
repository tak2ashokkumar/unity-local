import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEVICE_OS, GET_ALL_DEVICES_TAGS } from '../shared/api-endpoint.const';
import { DeviceMapping, AppUtilityService } from '../shared/app-utility/app-utility.service';
import { UnityOS } from '../united-cloud/shared/entities/common-entities.type';
import { GlobalAdvancedSearchResult, GlobalAdvancedSearchResultMonitoring } from './global-search.type';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService,) { }

  getOperatingSystem() {
    return this.http.get<UnityOS[]>(DEVICE_OS());
  }

  getDropdownData() {
    const os = this.http.get<UnityOS[]>(DEVICE_OS());
    const tags = this.http.get<{ tag_name: string }[]>(GET_ALL_DEVICES_TAGS())
      .pipe(map(tags => tags.filter(tag => tag.tag_name).map(tag => tag.tag_name)));
    return forkJoin([of(deviceTypes), os, tags]);
  }

  buildFilterForm(formData?: GlobalAdvancedSearchFormData) {
    let dtps: string[] = [];
    deviceTypes.map(dt => dtps.push(dt.name));
    return this.builder.group({
      'device_type': [formData ? formData.device_type : null],
      'name': [formData ? formData.name : null],
      'os': [formData ? formData.os : null],
      'ip_address': [formData ? formData.ip_address : null],
      'tag': [formData ? formData.tag : null],
    });
  }

  getSearchResults(formData: GlobalAdvancedSearchFormData) {
    let params: HttpParams = new HttpParams();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        params = params.append(key, formData[key])
      }
    })
    if (params.keys().length) {
      params = params.append('page_size', 0)
      return this.http.get<GlobalAdvancedSearchResult[]>(`/customer/advanced_search/`, { params: params });
    } else {
      return of([]);
    }
  }

  getMonitoringPath(device: GlobalAdvancedSearchViewData) {
    if (device.monitoring) {
      if (!device.monitoring.configured && !device.monitoring.enabled && !device.monitoring.observium && !device.monitoring.zabbix) {
        return;
      }
      if (device.deviceType == 'database') {
        return `/${device.deviceId}/${device.monitoring.configured && device.monitoring.enabled ? 'monitoring-graphs' : 'configure'}`;
      } else {
        if (device.monitoring.observium) {
          return `/${device.deviceId}/obs/${device.monitoring.configured && device.monitoring.enabled ? 'overview' : 'configure'}`;
        } else {
          switch (device.deviceType) {
            case 'switch':
            case 'firewall':
            // case 'sdwan_device':
            case 'load_balancer':
            case 'hypervisor':
            case 'baremetal':
            case 'mac_device':
            case 'storage':
            case 'pdu':
            case 'vmware':
            case 'esxi':
            case 'hyperv':
            case 'virtual_machine': return `/${device.deviceId}/zbx/details`;
            default: return `/${device.deviceId}/zbx/${device.monitoring.configured && device.monitoring.enabled ? 'monitoring-graphs' : 'configure'}`;
          }
        }
      }
    } else {
      return;
    }
  }

  getURL(device: GlobalAdvancedSearchResult) {
    switch (device.device_type) {
      case 'colocloud': return `unitycloud/datacenter/${device.uuid}/cabinets/`;
      case 'cabinet': return `unitycloud/datacenter/${device.dc_uuid}/cabinets/${device.uuid}/view`;
      case 'switch': return `/unitycloud/devices/switches`
      case 'firewall': return `/unitycloud/devices/firewalls`;
      // case 'sdwan': return `/unitycloud/devices/sdwans`;
      // case 'sdwan_device': return `/unitycloud/devices/sdwans/${device.account_uuid}/details`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors`;
      case 'baremetal': return `/unitycloud/devices/bmservers`;
      case 'mac_device': return `/unitycloud/devices/macdevices`;
      case 'storage': return `/unitycloud/devices/storagedevices`;
      case 'pdu': return `unitycloud/datacenter/${device.dc_uuid}/pdus`;
      case 'database':
        if (device.monitoring) {
          return `/unitycloud/devices/databases/${device.uuid}/${device.monitoring.configured && device.monitoring.enabled ? 'monitoring-graphs' : 'configure'}`;
        }
        return `/unitycloud/devices/databases/`;
      case 'mobile': return `/unitycloud/devices/mobiledevices`;
      case 'vmware': return `/unitycloud/devices/vms/vmware`;
      case 'vcloud': return `/unitycloud/devices/vms/vcloud`;
      case 'open_stack': return `/unitycloud/devices/vms/openstack`;
      case 'esxi': return `/unitycloud/devices/vms/esxi`;
      case 'hyperv': return `/unitycloud/devices/vms/hyperv`;
      case 'proxmox': return `/unitycloud/devices/vms/proxmox/`;
      case 'g3_kvm': return `/unitycloud/devices/vms/g3kvm/`;
      case 'virtual_machine': return `/unitycloud/devices/vms/custom`;
      case 'aws_vm': return `/unitycloud/devices/vms/aws`;
      case 'azure_vm': return `/unitycloud/devices/vms/azure`;
      case 'gcpvirtualmachines': return `/unitycloud/devices/vms/gcp/`;
      case 'ocivirtualmachines': return `/unitycloud/devices/vms/oracle/`;
      default: return;
    }
  }

  convertToViewData(inventory: GlobalAdvancedSearchResult[]): GlobalAdvancedSearchViewData[] {
    let viewData: GlobalAdvancedSearchViewData[] = [];
    inventory.map(iv => {
      let a: GlobalAdvancedSearchViewData = new GlobalAdvancedSearchViewData();
      a.deviceId = iv.uuid;
      a.deviceName = iv.name;
      a.deviceType = iv.device_type;
      a.managementIp = iv.ip_address ? iv.ip_address : 'N/A';
      a.os = iv.os ? iv.os : 'N/A';
      a.tags = iv.tags.filter(tg => tg);
      a.monitoring = iv.monitoring;
      a.dcId = iv.dc_uuid;
      // a.accountId = iv.account_uuid;

      a.deviceMapping = this.utilService.getDeviceMappingByDeviceType(iv.device_type);
      a.url = this.getURL(iv);
      viewData.push(a);
    })
    return viewData;
  }
}

export class GlobalAdvancedSearchFormData {
  constructor() { }
  device_type: string;
  name: string;
  os: string;
  ip_address: string;
  tag: string;
}

export class GlobalAdvancedSearchViewData {
  constructor() { }
  deviceId: string;
  deviceName: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  os: string;
  managementIp: string;
  tags: string[];
  monitoring: GlobalAdvancedSearchResultMonitoring;
  dcId: string;
  // accountId: string;

  deviceMapping: DeviceMapping;
  url: string;
}

export class SharedDOMObjectType {
  name: string;
  displayName: string;
  mapping?: DeviceMapping;
  constructor() { }
}

export const deviceTypes: SharedDOMObjectType[] = [
  {
    name: "colocloud",
    displayName: "Datacenter",
    mapping: DeviceMapping.DC_VIZ
  },
  {
    name: "cabinet",
    displayName: "Cabinet",
    mapping: DeviceMapping.CABINET_VIZ
  },
  {
    name: "switch",
    displayName: "Switch",
    mapping: DeviceMapping.SWITCHES
  },
  {
    name: "firewall",
    displayName: "Firewall",
    mapping: DeviceMapping.FIREWALL
  },
  // {
  //   name: 'sdwan',
  //   displayName: 'Sdwan',
  //   mapping: DeviceMapping.SDWAN_ACCOUNTS
  // },
  // {
  //   name: 'sdwan_device',
  //   displayName: 'Sdwan Device',
  //   mapping: DeviceMapping.SDWAN_DEVICES
  // },
  {
    name: "load_balancer",
    displayName: "Load Balancer",
    mapping: DeviceMapping.LOAD_BALANCER
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor",
    mapping: DeviceMapping.HYPERVISOR
  },
  {
    name: "baremetal",
    displayName: "Bare Metal",
    mapping: DeviceMapping.BARE_METAL_SERVER
  },
  {
    name: "storage",
    displayName: "Storage",
    mapping: DeviceMapping.STORAGE_DEVICES
  },
  {
    name: "mac_device",
    displayName: "Mac Device",
    mapping: DeviceMapping.MAC_MINI
  },
  {
    name: "pdu",
    displayName: "PDU",
    mapping: DeviceMapping.PDU
  },
  {
    name: "mobile",
    displayName: "Mobile Device",
    mapping: DeviceMapping.MOBILE_DEVICE
  },
  {
    name: "vmware",
    displayName: "Vmware Virtual Machine",
    mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE
  },
  {
    name: "vcloud",
    displayName: "Vcloud Virtual Machine",
    mapping: DeviceMapping.VCLOUD
  },
  {
    name: "open_stack",
    displayName: "OpenStack Virtual Machine",
    mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE
  },
  {
    name: "esxi",
    displayName: "Esxi Virtual Machine",
    mapping: DeviceMapping.ESXI
  },
  {
    name: "hyperv",
    displayName: "Hyperv Virtual Machine",
    mapping: DeviceMapping.HYPER_V
  },
  {
    name: "proxmox",
    displayName: "Proxmox Virtual Machine",
    mapping: DeviceMapping.PROXMOX
  },
  {
    name: "g3_kvm",
    displayName: "G3 Virtual Machine",
    mapping: DeviceMapping.G3_KVM
  },
  {
    name: "awsvirtualmachine",
    displayName: "AWS Virtual Machine",
    mapping: DeviceMapping.AWS_VIRTUAL_MACHINE
  },
  {
    name: "azurevm",
    displayName: "Azure Virtual Machine",
    mapping: DeviceMapping.AZURE_VIRTUAL_MACHINE
  },
  {
    name: "gcpvirtualmachines",
    displayName: "GCP Virtual Machine",
    mapping: DeviceMapping.GCP_VIRTUAL_MACHINE
  },
  {
    name: "ocivirtualmachines",
    displayName: "Oracle Virtual Machine",
    mapping: DeviceMapping.ORACLE_VIRTUAL_MACHINE
  }
];
