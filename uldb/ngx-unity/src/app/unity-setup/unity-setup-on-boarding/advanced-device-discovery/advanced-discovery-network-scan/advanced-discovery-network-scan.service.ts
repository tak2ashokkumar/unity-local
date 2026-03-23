import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ADVANCED_DISCOVERY_HISTORY, CREATE_ADVANCED_DISCOVERY, DELETE_ADVANCED_DISCOVERY, EXECUTE_ADVANCED_DISCOVERY, GET_ADVANCED_DISCOVERY_CREDENTIALS, GET_ADVANCED_DISCOVERY_LIST, GET_AGENT_CONFIGURATIONS, GET_DEVICES_BY_DISCOVERY_ID, UPDATE_ADVANCED_DISCOVERY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';
import { AdvancedDeviceDiscoveryNetwork, AdvancedDiscoveryScheduleHistory, AdvancedNetworkDiscoveredDevices } from './advanced-discovery-network-scan.type';

@Injectable()
export class AdvancedDiscoveryNetworkScanService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,) { }

  getDiscoveries(criteria: SearchCriteria): Observable<PaginatedResult<AdvancedDeviceDiscoveryNetwork>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AdvancedDeviceDiscoveryNetwork>>(GET_ADVANCED_DISCOVERY_LIST(), { params: params });
  }

  convertToViewData(networks: AdvancedDeviceDiscoveryNetwork[]): AdvancedDiscoveryNetworkScanViewData[] {
    let viewData: AdvancedDiscoveryNetworkScanViewData[] = [];
    if (Array.isArray(networks)) {
      networks.map(nw => {
        let a: AdvancedDiscoveryNetworkScanViewData = new AdvancedDiscoveryNetworkScanViewData();
        a.uuid = nw.uuid;
        a.name = nw.name;
        a.targetType = nw.type;
        a.targetValue = nw.subnet ? nw.subnet : 'N/A';
        a.collector = nw.collector.name ? nw.collector.name : 'N/A';
        a.credentials = nw.credentials;
        a.runNow = nw.run_now;
        a.scheduleScan = nw.schedule_scan;
        a.schedule = nw.schedule ? nw.schedule : 'N/A';
        a.scheduleTime = nw.schedule_time;
        a.scheduleDay = nw.scheduled_day;
        a.scheduleDate = nw.scheduled_date;
        a.networkType = nw.network_type;

        a.discoveryIpsType = nw.discover_ips.length ? nw.discover_ips : [];
        a.discoverIps = nw.discover_ips.length ? nw.discover_ips.getFirst() : '';
        a.extraUsersListIp = nw.discover_ips.length ? nw.discover_ips.slice(1) : [];
        a.usersBadgeCountIp = nw.discover_ips.length ? nw.discover_ips.length - 1 : 0;

        a.discoveryType = nw.discovery_methods.length ? nw.discovery_methods : [];
        a.discover = nw.discovery_methods.length ? nw.discovery_methods.getFirst() : '';
        a.extraUsersList = nw.discovery_methods.length ? nw.discovery_methods.slice(1) : [];
        a.usersBadgeCount = nw.discovery_methods.length ? nw.discovery_methods.length - 1 : 0;

        a.lastRun = nw.last_run ? this.utilSvc.toUnityOneDateFormat(nw.last_run) : 'N/A';
        a.duration = nw.duration ? nw.duration : 'N/A';
        a.lastRunBy = nw.last_run_by;
        a.deviceCount = nw.device_count;

        a.isInProgress = nw.last_execution_status == 'STARTED' ? true : false;
        a.status = a.isInProgress ? 'PENDING' : nw.last_execution_status;
        switch (nw.last_execution_status) {
          case 'SUCCESS': a.statusClass = 'text-success'; a.statusIcon = 'fas fa-check-circle text-success'; a.statusTooltip = 'Success'; break;
          case 'STARTED': a.statusClass = 'text-warning'; a.statusIcon = 'fas fa-sync-alt ml-1 text-warning'; a.statusTooltip = 'Started'; break;
          case 'REVOKED': a.statusClass = 'text-warning'; a.statusIcon = 'fa-exclamation-circle text-warning'; a.statusTooltip = 'Revoked'; break;
          case 'FAILURE': a.statusClass = 'text-danger'; a.statusIcon = 'fa-exclamation-circle text-danger';; a.statusTooltip = 'Failed'; break;
          default: a.statusClass = '';
        }

        a.createdBy = nw.created_by ? nw.created_by : 'N/A';
        a.updatedBy = nw.updated_by ? nw.updated_by : 'N/A';

        if (nw.scheduled_status === true) {
          a.toggleIcon = 'fa-toggle-on';
          a.toggleTootipMsg = 'Disable';
        } else if (nw.scheduled_status === false) {
          a.toggleIcon = 'fa-toggle-off';
          a.toggleTootipMsg = 'Enable';
        } else {
          a.toggleIcon = 'fa-toggle-off';
          a.toggleTootipMsg = 'Discovery is not scheduled. Please schedule to enable';
        }
        a.toggleBtnEnabled = nw.schedule_meta?.schedule_type && nw.schedule_meta.schedule_type != 'none';
        if (!a.toggleBtnEnabled) {
          a.toggleTootipMsg = 'Discovery is not scheduled. Please schedule to enable';
        }
        viewData.push(a);
      })
    }
    return viewData;
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let params = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: params });
  }

  getConfigurations() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
    // return of([{ "id": 42, "name": "asdasdas", "ip_address": "111.111.111.112", "poller_id": null, "status": "Failed", "uuid": "8888cd69-2b43-46d9-9bc2-312daab6437e", "poller_name": "Aerys-1", "ssh_username": "customer@unitedlayer.com", "ssh_password": "password", "ssh_port": 11, "snmp_community": null, "web_username": null, "web_password": null, "deployment_status": 2, "pyro_port": 9090, "rdp_access_name": "https://rdp-8888cd69-312daab6437e.uproxy-alpha.unitedlayer.com", "created_at": "2020-12-07T01:38:58.493547-08:00", "updated_at": "2020-12-07T01:38:58.493567-08:00", "customer": 22 }])
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'type': '',
      'subnet': '',
      'credentials': '',
      'collector': '',
      'schedule': '',
      'schedule_time': ''
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
    'subnet': {
      'required': 'Subnet value is required'
    },
    'credentials': {
      'required': 'Credential is required'
    },
    'collector': {
      'required': 'Collector is required'
    },
    'schedule': {
      'required': 'Schedule is required'
    },
    'schedule_time': {
      'required': 'Schedule time is required'
    }
  };

  buildForm(data?: AdvancedDiscoveryNetworkScanViewData): FormGroup {
    this.resetFormErrors();
    if (data) {
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'type': [{ value: data.targetType, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'subnet': [{ value: data.targetValue, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'credentials': [data.credentials, [Validators.required]],
        'collector': [{ value: data.collector, disabled: true }, , [Validators.required, NoWhitespaceValidator]],
        'run_now': [data.runNow],
        'schedule_scan': [data.scheduleScan ? { value: data.scheduleScan, disabled: true } : data.scheduleScan],
        'schedule': [data.schedule, [Validators.required, NoWhitespaceValidator]],
        'schedule_time': [data.scheduleTime, [Validators.required]]
      });
      if (data.schedule == 'weekly') {
        form.addControl('scheduled_day', new FormControl(data.scheduleDay ? data.scheduleDay : 'Sunday'));
      } else if (data.schedule == 'monthly') {
        form.addControl('scheduled_date', new FormControl(data.scheduleDate ? data.scheduleDate : 1));
      }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'type': ['subnet', [Validators.required, NoWhitespaceValidator]],
        'subnet': ['', [Validators.required, NoWhitespaceValidator]],
        'credentials': [[], [Validators.required]],
        'collector': ['', [Validators.required, NoWhitespaceValidator]],
        'run_now': [true],
        'schedule_scan': [false],
        'schedule': ['', [Validators.required, NoWhitespaceValidator]],
        'schedule_time': [null, [Validators.required]]
      });
    }
  }

  addDiscovery(data: any) {
    return this.http.post<any>(CREATE_ADVANCED_DISCOVERY(), data);
  }

  updateDiscovery(uuid: string, data: any) {
    return this.http.put<any>(UPDATE_ADVANCED_DISCOVERY(uuid), data);
  }

  deleteDiscovery(uuid: string) {
    return this.http.delete(DELETE_ADVANCED_DISCOVERY(uuid));
  }

  executeDiscovery(uuid: string) {
    return this.http.get(EXECUTE_ADVANCED_DISCOVERY(uuid), {});
  }

  getDiscoveredDevices(uuid: string): Observable<AdvancedNetworkDiscoveredDevices[]> {
    return this.http.get<AdvancedNetworkDiscoveredDevices[]>(GET_DEVICES_BY_DISCOVERY_ID(uuid));
  }

  convertToDevicesViewData(devices: AdvancedNetworkDiscoveredDevices[]): AdvancedNetworkDiscoveredDevicesViewData[] {
    let viewData: AdvancedNetworkDiscoveredDevicesViewData[] = [];
    if (Array.isArray(devices)) {
      devices.map(d => {
        let a: AdvancedNetworkDiscoveredDevicesViewData = new AdvancedNetworkDiscoveredDevicesViewData();
        a.id = d.attributes["system.id"];
        a.systemName = d.attributes["system.name"];
        a.systemType = d.attributes["system.type"];
        a.systemDomain = d.attributes["system.domain"];
        a.systemIp = d.attributes["system.ip"];
        a.systemDescription = d.attributes["system.description"];
        a.systemManufacturer = d.attributes["system.manufacturer"];
        a.systemStatus = d.attributes["system.status"];
        viewData.push(a);
      })
    }
    return viewData;
  }

  cancelDiscovery(uuid: string) {
    return this.http.get(`/customer/unity_discovery/discovery/${uuid}/cancel`);
  }

  getScheduleHistory(criteria: SearchCriteria, uuid: string): Observable<PaginatedResult<AdvancedDiscoveryScheduleHistory>> {
    return this.tableService.getData(ADVANCED_DISCOVERY_HISTORY(uuid), criteria).pipe(
      map((res: PaginatedResult<AdvancedDiscoveryScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToHistoryViewData(history: AdvancedDiscoveryScheduleHistory[]): AdvancedDiscoveryScheduleHistoryViewData[] {
    let viewData: AdvancedDiscoveryScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: AdvancedDiscoveryScheduleHistoryViewData = new AdvancedDiscoveryScheduleHistoryViewData()
      a.duration = h.duration ? h.duration : 'N/A';
      a.updatedBy = h.executed_by ? h.executed_by : 'N/A';
      a.startedAt = h.started_at ? this.utilSvc.toUnityOneDateFormat(h.started_at) : 'N/A';
      a.lastRun = h.completed_at ? this.utilSvc.toUnityOneDateFormat(h.completed_at) : 'N/A';
      a.isInProgress = h.status == 'Initiated' || h.status == 'IN' ? true : false;
      a.status = a.isInProgress ? 'In Progress' : h.status;
      switch (h.status) {
        case 'Completed': a.statusClass = 'text-success'; break;
        case 'IN':
        case 'Initiated': a.statusClass = 'text-warning'; break;
        case 'Cancelled':
        case 'Failed': a.statusClass = 'text-danger'; break;
        default: a.statusClass = '';
      }
      viewData.push(a);
    })
    return viewData;
  }

  toggle(uuid: string, enable: string) {
    if (enable === "Enable") {
      return this.http.get(`customer/unity_discovery/discovery/${uuid}/enable_schedule/`);
    } else {
      return this.http.get(`customer/unity_discovery/discovery/${uuid}/disable_schedule/`);
    }
  }


  buildCloneForm(): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetCloneFormErrors(): any {
    let formErrors = {
      'name': '',
    }
    return formErrors;
  }

  cloneValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
  }

  update(id: string, sn: any) {
    return this.http.post(`customer/unity_discovery/discovery/${id}/clone/`, sn);
  }
}

export class AdvancedDiscoveryNetworkScanViewData {
  constructor() { }
  uuid: string;
  name: string;
  targetType: string;
  targetValue: string;
  // collector: DeviceDiscoveryAgentConfigurationType;
  collector: string;
  credentials: DeviceDiscoveryCredentials[];

  runNow: boolean;
  schedule: string;
  scheduleScan: boolean;
  scheduleTime: string;
  scheduleDay: string;
  scheduleDate: number;
  lastRun: string;
  duration: string;
  lastRunBy: string;
  deviceCount: number;

  status: string;
  statusClass: string;
  statusIcon: string;
  statusTooltip: string;
  isInProgress: boolean;
  createdBy: string;
  updatedBy: string;

  selected: boolean = false;

  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable' | 'Discovery is not scheduled. Please schedule to enable';
  toggleBtnEnabled: boolean;

  networkType: string;
  discoveryType: string[];
  discover: string;
  extraUsersList: string[];
  usersBadgeCount: number;
  toggleStatus: string;

  discoverIps: string;
  discoveryIpsType: string[];
  extraUsersListIp: string[];
  usersBadgeCountIp: number;
}

export class AdvancedNetworkDiscoveredDevicesViewData {
  constructor() { }
  id: number;
  systemName: string;
  systemType: string;
  systemDomain: string;
  systemIp: string;
  systemDescription: string;
  systemManufacturer: string;
  systemStatus: string;
}

export class AdvancedDiscoveryScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}

export const DiscoveryType = [
  {
    label: 'ICMP',
    value: 'ICMP'
  },
  {
    label: 'SSH',
    value: 'SSH'
  },
  {
    label: 'SNMP',
    value: 'SNMP'
  },
  {
    label: 'WMI',
    value: 'WMI'
  },
  {
    label: 'Active Directory',
    value: 'AD'
  },
  {
    label: 'OSPF',
    value: 'OSPF'
  },
  {
    label: 'CDP',
    value: 'CDP'
  },
  {
    label: 'LLDP',
    value: 'LLDP'
  },
  {
    label: 'REDFISH',
    value: 'REDFISH'
  },
  {
    label: 'Database',
    value: 'DATABASE'
  }
]