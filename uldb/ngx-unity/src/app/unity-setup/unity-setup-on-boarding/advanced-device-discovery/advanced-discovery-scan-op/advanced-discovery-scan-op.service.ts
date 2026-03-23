import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, ONBOARD_ADVANCED_DISCOVERY_SCAN_RESULT, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE, UPDATE_ADVANCED_DISCOVERY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvancedDiscoveryNetworkScanViewData } from '../advanced-discovery-network-scan/advanced-discovery-network-scan.service';
import { AdvancedDeviceDiscoveryNetwork } from '../advanced-discovery-network-scan/advanced-discovery-network-scan.type';
import { AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface, AdvancedDiscoveryScanOpIpAddresses } from '../advanced-discovery-scan-op.type';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';

@Injectable()
export class AdvancedDiscoveryScanOpService {

  constructor(private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDeviceDiscoveryScanOp(criteria: SearchCriteria): Observable<AdvancedDiscoveryScanOp[]> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<AdvancedDiscoveryScanOp[]>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId()), { params: params });
    // return of([{"MacAddress":"00:25:90:77:09:48","snmpversion":"","ip_address":"10.128.7.11","hostname":"","Processor":"","SysDescription":"","version":"","DiskSize":"","snmp_cred_index":"","device_type":"","Memory":"","model":"","os":"","CPU":"","unique_id":"cc9fcbe1-41cf-4285-9523-58b1fafa674d","manufacturer":""},{"MacAddress":"00:50:56:a2:43:0a","snmpversion":"","ip_address":"10.128.7.76","hostname":"","Processor":"","SysDescription":"","version":"","DiskSize":"","snmp_cred_index":"","device_type":"","Memory":"","model":"","os":"","CPU":"","unique_id":"06ca0419-1d1d-48d6-b7a6-932f83017e57","manufacturer":""}])
  }

  convertToViewData(data: AdvancedDiscoveryScanOp[]): AdvancedDeviceDiscoveryScanOpViewdata[] {
    let viewData: AdvancedDeviceDiscoveryScanOpViewdata[] = [];
    if (Array.isArray(data)) {
      data.map(op => {
        let view = new AdvancedDeviceDiscoveryScanOpViewdata();
        view.discovery = op.discovery
        view.hostname = op.name;
        view.ip = op.ip_address;
        view.manufacturer = op.manufacturer ? op.manufacturer : 'NA';
        view.model = op.model;
        view.dbPK = op.db_pk;
        view.deviceType = op.resource_type ? op.resource_type : '';
        view.os = op.operating_system;
        view.uniqueId = op.uuid;
        view.version = op.os_version;
        view.CPU = op.cpu;
        view.Memory = op.memory;
        view.DiskSize = op.disk_size;
        view.Processor = op.processor;
        view.onboardedMsg = op.onboarded_msg;
        view.onboardedStatus = op.onboarded_status;
        view.isOnboard = 'pending onboarding';
        view.select = new FormControl({ value: op.resource_type, disabled: op.onboarded_status });
        if (op.onboarded_msg === 'Updated' || op.onboarded_msg === 'Created' || op.onboarded_msg === 'updated' || op.onboarded_msg === 'created') {
          view.statusClass = 'text-success'
        } else {
          view.statusClass = 'text-danger'
        }
        view.endOfLife = op.end_of_life ? this.utilSvc.toUnityOneDateFormat(op.end_of_life) : 'NA';;
        view.endOfSupport = op.end_of_support ? this.utilSvc.toUnityOneDateFormat(op.end_of_support) : 'NA';
        view.endOfService = op.end_of_service ? this.utilSvc.toUnityOneDateFormat(op.end_of_service) : 'NA';;
        if (op.Interfaces && Array.isArray(op.Interfaces)) {
          op.Interfaces.map(opinf => {
            let inf = new AdvancedDeviceDiscoveryScanOpInterfaceViewdata();
            inf.name = opinf.name;
            inf.description = opinf.description;
            inf.status = opinf.status;
            inf.type = opinf.type;
            inf.macAddress = opinf.mac_address;
            view.interfaces.push(inf);
          })
        }
        view.systemDescription = op.sys_description;
        view.uptime = op.uptime;
        view.systemObjectOid = op.system_object_oid;
        view.snmpCredential = op.snmp_credential;
        view.discoveryMethods = op.discovered_methods;
        view.isLoading = false;
        view.status = op.status.toLowerCase();
        viewData.push(view);
      })
    }
    return viewData;
  }

  // updateDeviceType(data: { unique_id: string, device_type: string }) {
  //   return this.http.put(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE(), data);
  // }

  updateDeviceType(discovery: string, uuid: string, data: { resource_type: string }) {
    return this.http.put(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE(discovery, uuid), data);
  }

  // deleteDevice(uniqueId: string) {
  //   let params = new HttpParams().set('unique_id', uniqueId);
  //   return this.http.delete(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE(), { params: params });
  // }

  deleteDevice(discovery: string, uuid: string) {
    // let params = new HttpParams().set('unique_id', uniqueId);
    return this.http.delete(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE(discovery, uuid));
  }

  interfaceNetworkScan(discovery: string, uuid: string): Observable<AdvancedDiscoveryScanOpInterface[]> {
    return this.http.get<AdvancedDiscoveryScanOpInterface[]>(`customer/unity_discovery/discovery/${discovery}/resources/${uuid}/interfaces/`);
  }

  ipAddressesNetworkScan(discovery: string, uuid: string): Observable<AdvancedDiscoveryScanOpIpAddresses[]> {
    return this.http.get<AdvancedDiscoveryScanOpIpAddresses[]>(`customer/unity_discovery/discovery/${discovery}/resources/${uuid}/ip_addresses/`);
  }

  onBoard(discovery: string, uuid: string) {
    return this.http.post(ONBOARD_ADVANCED_DISCOVERY_SCAN_RESULT(discovery, uuid), '');
  }

  convertToViewDataInterface(data: AdvancedDiscoveryScanOpInterface[]): AdvancedDeviceDiscoveryScanOpInterfaceViewdata[] {
    let viewData: AdvancedDeviceDiscoveryScanOpInterfaceViewdata[] = [];
    data.map(op => {
      let view: AdvancedDeviceDiscoveryScanOpInterfaceViewdata = new AdvancedDeviceDiscoveryScanOpInterfaceViewdata();
      view.name = op.name;
      view.description = op.description;
      view.status = op.status;
      view.type = op.type;
      view.macAddress = op.mac_address;
      view.ipAddress = op.ip_address;
      viewData.push(view);
    });
    return viewData;
  }

  getDiscoveryDetails(uuid: string) {
    return this.http.get<any>(UPDATE_ADVANCED_DISCOVERY(uuid));
  }

  convertToNetworkView(data: AdvancedDeviceDiscoveryNetwork): AdvancedDiscoveryNetworkScanViewData {
    let viewData: AdvancedDiscoveryNetworkScanViewData = new AdvancedDiscoveryNetworkScanViewData();
    viewData.networkType = data.network_type === 'ip_range' ? 'IP Range' : data.network_type === 'subnet' ? 'Subnet' : data.network_type === 'ip' ? 'IP' : '';
    viewData.collector = data.collector.name;
    viewData.discoverIps = data.discover_ips.join(',');
    viewData.lastRun = data.last_run ? this.utilSvc.toUnityOneDateFormat(data.last_run) : '';
    viewData.name = data.name;
    viewData.uuid = data.uuid;
    viewData.isInProgress = data.last_execution_status == 'STARTED' ? true : false;
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}

export class AdvancedDeviceDiscoveryScanOpViewdata {
  hostname: string;
  ip: string;
  manufacturer: string;
  version: string;
  _deviceType: string;
  model: string;
  os: string;
  uniqueId: string;
  _lastType: string;
  select: FormControl;
  dbPK: string;
  Processor: string;
  DiskSize: string;
  Memory: string;
  CPU: string;
  endOfLife: string;
  endOfSupport: string;
  endOfService: string;
  interfaces: AdvancedDeviceDiscoveryScanOpInterfaceViewdata[] = [];
  discovery: string;
  onboardedMsg: string;
  statusClass: string;
  onboardedStatus: boolean;
  isLoading: boolean;
  status: string;
  systemDescription: string;
  uptime: string;
  systemObjectOid: string;
  snmpCredential: string;
  discoveryMethods: string[];
  isOnboard: string;

  constructor() {
    this.select = new FormControl();
  }

  isSelected(type: string) {
    return this.deviceType === type;
  }

  set lastType(type: string) {
    this._lastType = type;
  }

  get lastType() {
    return this._lastType;
  }

  set deviceType(type: string) {
    this._deviceType = type;
    this.lastType = type;
    this.select.setValue(type);
    if (this.changeDisabled) {
      this.select.disable();
    }
  }

  get changeDisabled() {
    return this.dbPK ? true : false;
  }

  get deviceType() {
    return this._deviceType;
  }
}

export class AdvancedDeviceDiscoveryScanOpInterfaceViewdata {
  constructor() { }
  name: string;
  description: string;
  status: string;
  type: string;
  macAddress: string;
  ipAddress: string;
}

export const discoveryListColumnMapping: Array<TableColumnMapping> = [
  // {
  //   'name': 'IP',
  //   'key': 'ip',
  //   'default': true,
  //   'mandatory': true,
  // },
  {
    'name': 'Hostname',
    'key': 'hostname',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Make',
    'key': 'manufacturer',
    'default': true,
    'mandatory': false,
  },
  {
    'name': 'Model',
    'key': 'model',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Operating System',
    'key': 'os',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Version',
    'key': 'version',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'CPU',
    'key': 'CPU',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Memory',
    'key': 'Memory',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'DiskSize',
    'key': 'DiskSize',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Processor',
    'key': 'Processor',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'End Of Life',
    'key': 'endOfLife',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'End Of Service',
    'key': 'endOfService',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Onboarded Message',
    'key': 'onboardedMsg',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'System Description',
    'key': 'systemDescription',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Uptime',
    'key': 'uptime',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'System Object OID',
    'key': 'systemObjectOid',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'SNMP Credential',
    'key': 'snmpCredential',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Discovery Methods',
    'key': 'discoveryMethods',
    'default': false,
    'mandatory': false
  },
];