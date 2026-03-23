import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of, forkJoin } from 'rxjs';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { GlobalSearchDeviceMonitoringDetails, GlobalSearchResult } from './app-search-type';
import { DEVICE_OS, GET_ALL_DEVICES_TAGS } from '../api-endpoint.const';
import { UnityOS } from 'src/app/united-cloud/shared/entities/common-entities.type';
import { map } from 'rxjs/operators';
import { deviceTypes } from 'src/app/global-search/global-search.service';

@Injectable({
  providedIn: 'root'
})
export class AppSearchService {
  private searchSource = new Subject<string>();
  searchToggled$: Observable<string> = this.searchSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService,) { }

  searchByKeyword() {
    this.searchSource.next();
  }

  buildSearchForm(): FormGroup {
    return this.builder.group({
      'keyword': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetSearchFormErrors() {
    return {
      'keyword': ''
    }
  }

  searchFormValidationMessages = {
    'keyword': {
      'required': 'Search Keyword is required'
    }
  }

  getSearchResults(keyword: string): Observable<GlobalSearchResult[]> {
    return this.http.get<GlobalSearchResult[]>(`customer/global_search/?page_size=0&&search=${keyword}`);
  }

  getMonitoringPath(device: GlobalSearchResultViewData) {
    if (device.monitoring) {
      if (!device.monitoring.configured && !device.monitoring.enabled && !device.monitoring.observium && !device.monitoring.zabbix) {
        return;
      }
      if (device.type == 'database') {
        return `/${device.id}/${device.monitoring.configured && device.monitoring.enabled ? 'monitoring-graphs' : 'configure'}`;
      } else {
        if (device.monitoring.observium) {
          return `/${device.id}/obs/${device.monitoring.configured && device.monitoring.enabled ? 'overview' : 'configure'}`;
        } else {
          switch (device.type) {
            case 'switch':
            case 'firewall':
            case 'load_balancer':
            // case 'sdwan_device':
            case 'hypervisor':
            case 'baremetal':
            case 'mac_device':
            case 'storage':
            case 'pdu':
            case 'vmware':
            case 'esxi':
            case 'hyperv':
            case 'virtual_machine': return `/${device.id}/zbx/details`;
            default: return `/${device.id}/zbx/${device.monitoring.configured && device.monitoring.enabled ? 'monitoring-graphs' : 'configure'}`;
          }
        }
      }
    } else {
      return;
    }
  }

  getURL(device: GlobalSearchResult) {
    switch (device.device_type) {
      case 'colocloud': return `unitycloud/datacenter/${device.uuid}/cabinets/`;
      case 'cabinet': return `unitycloud/datacenter/${device.dc_uuid}/cabinets/${device.uuid}/view`;
      case 'switch': return `/unitycloud/devices/switches`;
      case 'firewall': return `/unitycloud/devices/firewalls`;
      // case 'sdwan': return `/unitycloud/devices/sdwans`;
      // case 'sdwan_device': return `/unitycloud/devices/sdwans/${device.account_uuid}/details`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors`;
      case 'baremetal': return `/unitycloud/devices/bmservers`;
      case 'mac_device': return `/unitycloud/devices/macdevices`;
      case 'storage': return `/unitycloud/devices/storagedevices`;
      case 'pdu': return `unitycloud/datacenter/${device.dc_uuid}/pdus`;
      case 'database': return `/unitycloud/devices/databases`;
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

  convertToViewdata(results: GlobalSearchResult[]): GlobalSearchResultViewData[] {
    let viewData: GlobalSearchResultViewData[] = [];
    results.map(res => {
      let a: GlobalSearchResultViewData = new GlobalSearchResultViewData();
      a.id = res.uuid;
      a.name = res.name;
      a.type = res.device_type;
      a.tags = res.tags;
      a.dcId = res.dc_uuid;
      a.monitoring = res.monitoring;
      // a.accountId = res.account_uuid;

      a.deviceMapping = this.utilService.getDeviceMappingByDeviceType(res.device_type);
      a.url = this.getURL(res);
      viewData.push(a);
    })
    return viewData;
  }

  getDropdownData() {
    const os = this.http.get<UnityOS[]>(DEVICE_OS());
    const tags = this.http.get<{ tag_name: string }[]>(GET_ALL_DEVICES_TAGS())
      .pipe(map(tags => tags.filter(tag => tag.tag_name).map(tag => tag.tag_name)));
    return forkJoin([of(deviceTypes), os, tags]);
  }

  buildFilterForm() {
    return this.builder.group({
      'device_type': [],
      'name': [],
      'os': [],
      'ip_address': [],
      'tag': [],
    });
  }

  resetAdvancedSearchFormErrors() {
    return {
      'device_type': '',
      'name': '',
      'os': '',
      'ip_address': '',
      'tag_name': '',
    }
  }

  advancedSearchFormValidationMessages = {
    'device_type': {
      'required': ' is required'
    }
  }
}

export class GlobalSearchResultViewData {
  constructor() { }
  id: string;
  name: string;
  type: string;
  tags: string[];
  dcId: string;
  monitoring: GlobalSearchDeviceMonitoringDetails;
  // accountId: string;

  deviceMapping: DeviceMapping;
  url: string;
}
