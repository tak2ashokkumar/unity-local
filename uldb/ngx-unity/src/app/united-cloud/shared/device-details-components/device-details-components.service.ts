import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceBGPPeersSummaryType, DeviceBGPPeersType } from 'src/app/shared/SharedEntityTypes/device-bgp-peers.type';
import { DeviceInterfaceSummaryType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { DeviceServices, DeviceServicesSummaryType } from 'src/app/shared/SharedEntityTypes/device-services.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { EventsType } from 'src/app/shared/SharedEntityTypes/vcenter-events.type';
import { TasksType } from 'src/app/shared/SharedEntityTypes/vcenter-tasks.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BatteriesWidgetType, ChassisWidgetType, EnclosuresWidgetType, FansWidgetType, ManagersWidgetType, PhysicalDiskWidgetType, PowerStatsWidgetType, ProcessorsWidgetType, StorageControllerWidgetType, TemperatureWidgetType, VirtualDiskType, VoltageWidgetType } from '../device-overview/device-overview.type';
import { DEVICE_OVERVIEW_BY_BATTERIES_DATA, DEVICE_OVERVIEW_BY_CHASSIS_DATA, DEVICE_OVERVIEW_BY_ENCLOSURES_DATA, DEVICE_OVERVIEW_BY_FAN_DATA, DEVICE_OVERVIEW_BY_MANAGERS_DATA, DEVICE_OVERVIEW_BY_PHYSICAL_DISKS_DATA, DEVICE_OVERVIEW_BY_POWER_STATS, DEVICE_OVERVIEW_BY_PROCESSORS_DATA, DEVICE_OVERVIEW_BY_STORAGE_CONTROLLERS_DATA, DEVICE_OVERVIEW_BY_SYNC_BATTERIES_DATA, DEVICE_OVERVIEW_BY_SYNC_ENCLOSURES_DATA, DEVICE_OVERVIEW_BY_SYNC_MANAGERS_DATA, DEVICE_OVERVIEW_BY_SYNC_STORAGE_CONTROLLERS_DATA, DEVICE_OVERVIEW_BY_SYNC_VOLTAGE_DATA, DEVICE_OVERVIEW_BY_TEMPERATURE_DATA, DEVICE_OVERVIEW_BY_VIRTUAL_DISKS_DATA, DEVICE_OVERVIEW_BY_VOLTAGE_DATA } from 'src/app/shared/api-endpoint.const';
import { DatabaseType } from '../entities/database-servers.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class DeviceDetailsComponentsService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService,
    private buiilder: FormBuilder) { }

  getInterfaceSummary(criteria: SearchCriteria): Observable<DeviceInterfaceSummaryType> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<DeviceInterfaceSummaryType>(`/customer/interfaces/summary/`, { params: params });
  }

  convertToInterfaceSummaryViewData(s: DeviceInterfaceSummaryType): InterfaceSummaryViewData {
    let a = new InterfaceSummaryViewData();
    a.total = s.total_interfaces ? s.total_interfaces : 0;
    a.up = s.up ? s.up : 0;
    a.down = s.down ? s.down : 0;
    a.unknown = s.unknown ? s.unknown : 0;
    a.lowerLayerDown = s.lowerLayerDown ? s.lowerLayerDown : 0;
    a.dormant = s.dormant ? s.dormant : 0;
    a.notPresent = s.notPresent ? s.notPresent : 0;
    a.testing = s.testing ? s.testing : 0;
    return a;
  }

  getInterfaceList(criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<any>(`/customer/interfaces/`, { params: params });
  }

  syncInterfaceData(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    let deviceType = params.get('device_type_plural');
    let url: string;
    if (deviceType == 'vmware/migrate') {
      url = `/rest/${deviceType}/${params.get('uuid')}/interfaces/`;
    } else if (deviceType == 'viptela_devices' || deviceType == 'meraki_devices') {
      let dtForUrl = deviceType.split('_')[0] == 'viptela' ? 'viptela' : 'meraki';
      url = `/customer/${dtForUrl}/devices/${params.get('uuid')}/interfaces/`;
    } else {
      url = `/customer/${deviceType}/${params.get('uuid')}/interfaces/`;
    }
    return this.http.get<CeleryTask>(url)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
  }


  getBGPPeersSummary(criteria: SearchCriteria): Observable<DeviceBGPPeersSummaryType> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<DeviceBGPPeersSummaryType>(`/customer/bgp_peer_data/summary/`, { params: params });
  }

  convertToBGPPeersSummaryViewData(s: DeviceBGPPeersSummaryType): BGPPeersSummaryViewData {
    let a = new BGPPeersSummaryViewData();
    a.total = s.total_bgp_peers ? s.total_bgp_peers : 0;
    a.Active = s.Active ? s.Active : 0;
    a.Idle = s.Idle ? s.Idle : 0;
    a.Connect = s.Connect ? s.Connect : 0;
    a.OpenSent = s.OpenSent ? s.OpenSent : 0;
    a.OpenConfirm = s.OpenConfirm ? s.OpenConfirm : 0;
    a.Established = s.Established ? s.Established : 0;
    return a;
  }

  getBGPPeersList(criteria: SearchCriteria): Observable<PaginatedResult<DeviceBGPPeersType>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<DeviceBGPPeersType>>(`/customer/bgp_peer_data/`, { params: params });
  }

  syncBGPPeersData(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    // return this.http.get<any>(`/customer/${params.get('device_type_plural')}/${params.get('uuid')}/bgp_peer_data/`);
    return this.http.get<CeleryTask>(`/customer/${params.get('device_type_plural')}/${params.get('uuid')}/bgp_peer_data/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
  }

  getServices(criteria: SearchCriteria): Observable<PaginatedResult<DeviceServices>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<DeviceServices>>(`/customer/device_services/`, { params: params });
  }

  getControlConnections(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<any>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<any>>(`/customer/viptela/devices/${deviceId}/control_connections/`);
  }

  getTunnels(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<any>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<any>>(`/customer/viptela/devices/${deviceId}/tunnels/`);
  }

  getTLOC(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<any>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<any>>(`/customer/viptela/devices/${deviceId}/tloc/`);
  }

  getLicenseData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<License>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<License>>(`/customer/meraki/organizations/${deviceId}/licenses/`);
  }

  getMerakiNetworkData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<any>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<any>>(` /customer/meraki/organizations/${deviceId}/networks/`);
  }

  // getMerakiEventsData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<any>> {
  //   let params = this.tableService.getWithParam(criteria);
  //   return this.http.get<PaginatedResult<any>>(`/customer/meraki/devices/${deviceId}/events/`);
  // }
  
  convertToServicesViewData(data: DeviceServices[]): ServiceViewData[] {
    let viewData: ServiceViewData[] = [];
    data.forEach(s => {
      let view: ServiceViewData = new ServiceViewData();
      view.name = s.name;
      view.description = s.description;
      view.status = s.status;
      if (view.status != 'Running' && view.status != 'Stopped') {
        view.status = s.status ? 'Unknown' : '';
      }
      view.type = s.service_type;
      view.createdAt = s.created_at ? this.utilSvc.toUnityOneDateFormat(s.created_at) : 'N/A';
      view.updatedAt = s.updated_at ? this.utilSvc.toUnityOneDateFormat(s.updated_at) : 'N/A';
      view.statusIcon = this.getStatusIcon(s.status);
      viewData.push(view);
    });
    return viewData;
  }

  convertToVSwitcheslViewData(data: any[]) {
    let viewData: VSwitchesViewData[] = [];
    data.map(s => {
      let view: VSwitchesViewData = new VSwitchesViewData();
      view.name = s.name;
      view.physicalAdapter = s.physical_adapter[0] ? s.physical_adapter[0] : 'N/A';
      view.portGroup = s.portgroup ? s.portgroup : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  convertToVMKernelViewData(data: any[]) {
    let viewData: VMKernelViewData[] = [];
    data.map(s => {
      let view: VMKernelViewData = new VMKernelViewData();
      view.device = s.device;
      view.networkLabel = s.network_label ? s.network_label : 'N/A';
      view.switch = s.switch ? s.switch : 'N/A';
      view.ipAddress = s.ip_address ? s.ip_address : 'N/A';
      view.macAddress = s.mac_address ? s.mac_address : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  convertToPhysicalAdaptersViewData(data: any[]) {
    let viewData: PhysicalAdapterViewData[] = [];
    data.map(s => {
      let view: PhysicalAdapterViewData = new PhysicalAdapterViewData();
      view.device = s.device;
      view.actualSpeed = s.actual_speed ? s.actual_speed : 'N/A';
      view.configuredSpeed = s.configured_speed ? s.configured_speed : 'N/A';
      view.switch = s.switch ? s.switch : 'N/A';
      view.macAddress = s.mac_address ? s.mac_address : 'N/A';
      view.ipAddress = s.ip_address ? s.ip_address : 'N/A';
      view.wakeOnLanSupported = s.wake_on_LAN_supported ? s.wake_on_LAN_supported : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  getSystemFirewall(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<SystemFirewall>> {
    return this.tableService.getData<PaginatedResult<SystemFirewall>>(`/customer/servers/${hypervisorID}/get_firewalls/`, criteria);
  }

  getNetworkSwitches(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`/customer/servers/${hypervisorID}/get_virtual_switches/`, criteria);
  }

  getVmKernelAdapters(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`/customer/servers/${hypervisorID}/get_vmkernel_adapters/`, criteria);
  }

  getPhysicalAdapters(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`/customer/servers/${hypervisorID}/get_physical_adapters/`, criteria);
  }

  convertToSystemFirewallViewData(data: SystemFirewall[]): SystemFirewallViewData[] {
    let viewData: SystemFirewallViewData[] = [];
    data.map(s => {
      let view: SystemFirewallViewData = new SystemFirewallViewData();
      view.id = s.id;
      view.uuid = s.uuid;
      view.key = s.key;
      view.serviceName = s.service_name;
      view.enabled = s.enabled;
      view.allowedIpAddresses = s.allowed_ip_addresses;
      let tcpPorts: Set<number> = new Set();
      let udpPorts: Set<number> = new Set();

      s.rule.forEach(r => {
        if (r.protocol === "tcp") {
          r.port.forEach(p => tcpPorts.add(p));
        } else if (r.protocol === "udp") {
          r.port.forEach(p => udpPorts.add(p));
        }
      });
      view.tcpPorts = Array.from(tcpPorts).sort((a, b) => a - b).join(", ");
      view.udpPorts = Array.from(udpPorts).sort((a, b) => a - b).join(", ");
      view.hypervisor = s.hypervisor;
      viewData.push(view);
    });
    return viewData;
  }

  getStorageAdapter(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<StorageAdapter>> {
    return this.tableService.getData<PaginatedResult<StorageAdapter>>(`/customer/servers/${hypervisorID}/get_storage_adapters/`, criteria);
  }

  convertToStorageAdaptersViewData(data: StorageAdapter[]): StorageAdapterViewData[] {
    let viewData: StorageAdapterViewData[] = [];
    data.map(s => {
      let view: StorageAdapterViewData = new StorageAdapterViewData();
      view.id = s.id;
      view.uuid = s.uuid;
      view.key = s.key;
      view.name = s.model;
      view.type = s.type;
      view.status = s.status;
      view.targets = s.targets;
      view.devices = s.devices;
      view.paths = s.paths;
      view.hypervisor = s.hypervisor;
      viewData.push(view);
    });
    return viewData;
  }

  getStorageDevices(criteria: SearchCriteria, hypervisorID: string): Observable<PaginatedResult<StorageDevices>> {
    return this.tableService.getData<PaginatedResult<StorageDevices>>(`/customer/servers/${hypervisorID}/get_storage_devices`, criteria);
  }

  convertToStorageDevicesViewData(data: StorageDevices[]): StorageDevicesViewData[] {
    let viewData: StorageDevicesViewData[] = [];
    data.map(s => {
      let view: StorageDevicesViewData = new StorageDevicesViewData();
      view.id = s.id;
      view.uuid = s.uuid;
      view.key = s.key;
      view.name = s.name;
      view.path = s.path;
      view.capacity = s.capacity;
      view.operationalState = s.operational_state;
      view.type = s.type;
      view.hypervisor = s.hypervisor;
      viewData.push(view);
    });
    return viewData;
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'Running': return 'fa-circle text-success';
      case 'Stopped': return 'fa-circle text-danger';
      case 'Unknown': return 'fa-exclamation-circle text-warning';
      default: return 'fa-exclamation-circle text-warning';
    }
  }

  syncGServicesData(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    const deviceType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(DeviceMapping.VMWARE_VIRTUAL_MACHINE)
    if (params.get('device_type_plural') == 'vmware/migrate' || params.get('device_type_plural') == 'esxi') {
      return this.http.get<CeleryTask>(`/rest/${deviceType}/${params.get('uuid')}/discover_services/`)
        .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
    }
    if (params.get('device_type_plural') == 'virtual_machines') {
      return this.http.get<CeleryTask>(`/rest/customer/${params.get('device_type_plural')}/${params.get('uuid')}/discover_services/`)
        .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
    }
    return this.http.get<CeleryTask>(`/customer/${params.get('device_type_plural')}/${params.get('uuid')}/discover_services/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
  }

  getServicesSummary(criteria: SearchCriteria): Observable<DeviceServicesSummaryType> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<DeviceServicesSummaryType>(`/customer/device_services/summary/`, { params: params });
  }

  convertToServicesSummaryViewData(data: DeviceServicesSummaryType): ServiceSummaryViewData {
    let viewData: ServiceSummaryViewData = new ServiceSummaryViewData();
    viewData.running = data.running;
    viewData.stopped = data.stopped;
    viewData.unknown = data.unknown;
    viewData.total = data.total_services;
    return viewData;
  }

  convertToPerformanceViewData(data: any): PerformanceViewData {
    let viewData: PerformanceViewData = new PerformanceViewData();
    viewData.memory = data.guest_memory;
    viewData.vCpus = data.vcpus;
    data.hard_disks.map(hd => {
      let hardDisk: PerformanceHardDisksViewData = new PerformanceHardDisksViewData();
      hardDisk.diskLabel = hd.disk_label;
      hardDisk.diskSize = hd.disk_size;
      hardDisk.diskSizeUnit = hd.disk_size_unit;
      viewData.hardDisks.push(hardDisk);
    })
    data.network_adapter.map(na => {
      let networkAdapter: PerformaceNetworkAdaptersViewData = new PerformaceNetworkAdaptersViewData();
      networkAdapter.adapterLabel = na.adapter_label;
      networkAdapter.adapterName = na.adapter_name;
      viewData.networkAdapters.push(networkAdapter);
    })
    return viewData;
  }

  buildFilterForm(dateRange: DateRange): FormGroup {
    this.resetFilterFormErrors();
    return this.buiilder.group({
      'period': [TimeRange.LAST_24_HOURS, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.utilSvc.sameOrAfterDateRangeValidator('from', 'to') });
  }

  resetFilterFormErrors(): any {
    let formErrors = {
      'graph_list': '',
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  filterFormValidationMessages = {
    'graph_list': {
      'required': 'Graph selection is required'
    },
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required',
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getEvents(criteria: SearchCriteria, formData: any): Observable<PaginatedResult<EventsType>> {
    let params = this.tableService.getWithParam(criteria);
    let url: string;
    if (params.get('device_type') == 'vmware') {
      url = `/rest/${params.get('device_type')}/vm_events/`;
    }
    const format = new DateRange().format;
    params = params.set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<PaginatedResult<EventsType>>(url, { params: params });
  }

  syncEvents(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    let url: string;
    if (params.get('device_type') == 'vmware') {
      url = `/rest/${params.get('device_type')}/migrate/${params.get('uuid')}/sync_events/`;
    }
    return this.http.get<CeleryTask>(url).pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  convertToEventsViewData(data: EventsType[]): EventsViewData[] {
    let viewData: EventsViewData[] = [];
    data.map(d => {
      let view: EventsViewData = new EventsViewData();
      view.username = d.username;
      view.description = d.description ? d.description : 'NA';
      view.eventType = d.event_type ? d.event_type : 'NA';
      view.nativeEventType = d.native_event_type ? d.native_event_type : 'NA';
      view.createdOn = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'NA';
      viewData.push(view);
    })
    return viewData;
  }

  getTasks(criteria: SearchCriteria, formData: any): Observable<PaginatedResult<TasksType>> {
    let params = this.tableService.getWithParam(criteria);
    let url: string;
    if (params.get('device_type') == 'vmware') {
      url = `/rest/${params.get('device_type')}/vm_tasks/`;
    }
    const format = new DateRange().format;
    params = params.set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<PaginatedResult<TasksType>>(url, { params: params });
  }

  syncTasks(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    let url: string;
    if (params.get('device_type') == 'vmware') {
      url = `/rest/${params.get('device_type')}/migrate/${params.get('uuid')}/sync_tasks/`;
    }
    return this.http.get<CeleryTask>(url).pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  getMerakiDeviceEvents(criteria: SearchCriteria): Observable<PaginatedResult<MerakiDeviceEventType>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<MerakiDeviceEventType>>(`/customer/meraki/devices/${params.get('uuid')}/events/`, { params: params });
  }

  convertToTasksViewData(data: TasksType[]): TasksViewData[] {
    let viewData: TasksViewData[] = [];
    data.map(d => {
      let view: TasksViewData = new TasksViewData();
      view.description = d.description ? d.description : 'NA';
      view.username = d.username;
      view.status = d.status ? d.status : 'NA';
      view.startTime = d.start_time ? this.utilSvc.toUnityOneDateFormat(d.start_time) : 'NA';
      view.completionTime = d.completion_time ? this.utilSvc.toUnityOneDateFormat(d.completion_time) : 'NA';
      view.queuedTime = d.queued_for ? d.queued_for : 'NA';
      viewData.push(view);
    })
    return viewData;
  }

  convertToControlConnectionsViewData(data: ControlConnectionsType[]): ControlConnectionsViewData[] {
    let viewData: ControlConnectionsViewData[] = [];
    data.map(d => {
      let view: ControlConnectionsViewData = new ControlConnectionsViewData();
      view.uuid = d.uuid;
      view.protocol = d.protocol ? d.protocol : 'N/A';
      view.deviceDataKey = d.device_data_key ? d.device_data_key : 'N/A';
      view.privateIp = d.private_ip ? d.private_ip : 'N/A';
      view.privatePort = d.private_port;
      view.publicIp = d.public_ip ? d.public_ip : 'N/A';
      view.publicPort = d.public_port;
      view.state = d.state ? d.state : 'N/A';
      view.uptime = d.uptime ? this.utilSvc.toUnityOneDateFormat(d.uptime) : 'N/A';
      view.lastUpdated = d.last_updated ? this.utilSvc.toUnityOneDateFormat(d.last_updated) : 'N/A';

      view.device.systemIp = d.device.system_ip ? d.device.system_ip : 'N/A';
      view.device.chassisNumber = d.device.chassis_number ? d.device.system_ip : 'N/A';
      view.device.softwareVersion = d.device.software_version ? d.device.system_ip : 'N/A';
      view.device.uuid = d.device.uuid ? d.device.system_ip : 'N/A';
      view.device.deviceType = d.device.device_type ? d.device.system_ip : 'N/A';
      view.device.deviceModel = d.device.device_model ? d.device.system_ip : 'N/A';;
      view.device.localSystemIp = d.device.local_system_ip ? d.device.system_ip : 'N/A';;
      view.device.deviceId = d.device.device_id ? d.device.system_ip : 'N/A';;
      view.device.name = d.device.name ? d.device.system_ip : 'N/A';;

      view.connectedDevice.systemIp = d.connected_device.system_ip ? d.connected_device.system_ip : 'N/A';
      view.connectedDevice.chassisNumber = d.connected_device.chassis_number ? d.connected_device.chassis_number : 'N/A';
      view.connectedDevice.softwareVersion = d.connected_device.software_version ? d.connected_device.software_version : 'N/A';
      view.connectedDevice.uuid = d.connected_device.uuid ? d.connected_device.uuid : 'N/A';
      view.connectedDevice.deviceType = d.connected_device.device_type ? d.connected_device.device_type : 'N/A';
      view.connectedDevice.deviceModel = d.connected_device.device_model ? d.connected_device.device_model : 'N/A';
      view.connectedDevice.localSystemIp = d.connected_device.local_system_ip ? d.connected_device.local_system_ip : 'N/A';
      view.connectedDevice.deviceId = d.connected_device.device_id ? d.connected_device.device_id : 'N/A';
      view.connectedDevice.name = d.connected_device.name ? d.connected_device.name : 'N/A';

      viewData.push(view);
    })
    return viewData;
  }

  convertToSdwanInterfaceViewData(data: SdwanInterfaceStats[]): SdwanInterfaceStatsViewData[] {
    let viewData: SdwanInterfaceStatsViewData[] = [];
    data.map(d => {
      let view: SdwanInterfaceStatsViewData = new SdwanInterfaceStatsViewData();
      view.uuid = d.uuid;
      view.vpnId = d.vpn_id ? d.vpn_id : 'N/A';
      view.name = d.name ? d.name : 'N/A';
      view.description = d.description ? d.description : 'N/A';
      view.macAddress = d.mac_address ? d.mac_address : 'N/A';
      view.ipAddress = d.ip_address ? d.ip_address : 'N/A';
      view.operationalStatus = d.operational_status ? d.operational_status : 'N/A';
      view.interfaceType = d.interface_type ? d.interface_type : 'N/A';
      view.speed = d.speed ? d.speed : 'N/A';
      view.rxDiscards = d.rx_discards;
      view.rxErrors = d.rx_errors;
      view.txDiscards = d.tx_discards;
      view.txErrors = d.tx_errors;
      view.lastUpdated = d.last_updated ? this.utilSvc.toUnityOneDateFormat(d.last_updated) : 'N/A';

      view.device.systemIp = d.device.system_ip ? d.device.system_ip : 'N/A';
      view.device.chassisNumber = d.device.chassis_number ? d.device.chassis_number : 'N/A';
      view.device.softwareVersion = d.device.software_version ? d.device.software_version : 'N/A';
      view.device.uuid = d.device.uuid ? d.device.uuid : 'N/A';
      view.device.deviceType = d.device.device_type ? d.device.device_type : 'N/A';
      view.device.deviceModel = d.device.device_model ? d.device.device_model : 'N/A';
      view.device.localSystemIp = d.device.local_system_ip ? d.device.local_system_ip : 'N/A';
      view.device.deviceId = d.device.device_id ? d.device.device_id : 'N/A';
      view.device.name = d.device.name ? d.device.name : 'N/A';

      viewData.push(view);
    })
    return viewData;
  }

  convertToTunnelViewData(data: TunnelStats[]): TunnelStatsViewData[] {
    let viewData: TunnelStatsViewData[] = [];
    data.map(d => {
      let view: TunnelStatsViewData = new TunnelStatsViewData();
      view.uuid = d.uuid;
      view.deviceDataKey = d.device_data_key ? d.device_data_key : 'N/A';
      view.tunnelType = d.tunnel_type ? d.tunnel_type : 'N/A';
      view.localRemoteInterfaceName = d.local_remote_interface_name ? d.local_remote_interface_name : 'N/A';
      view.localInterfaceDescription = d.local_interface_description ? d.local_interface_description : 'N/A';
      view.remoteInterfaceDescription = d.remote_interface_description ? d.remote_interface_description : 'N/A';
      view.protocol = d.protocol ? d.protocol : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.jitter = d.jitter ? d.jitter : 'N/A';
      view.lossPercentage = d.loss_percentage ? d.loss_percentage : 'N/A';
      view.latency = d.latency ? d.latency : 'N/A';
      view.vqoeScore = d.vqoe_score ? d.vqoe_score : 'N/A';
      view.txOctets = d.tx_octets;
      view.rxOctets = d.rx_octets;
      view.lastUpdated = d.last_updated ? this.utilSvc.toUnityOneDateFormat(d.last_updated) : 'N/A';
      view.fecLossRecovery = d.fecLossRecovery ? d.fecLossRecovery : 'N/A';
      view.tunnelEndpoints = d.tunnel_endpoints ? d.tunnel_endpoints : 'N/A';

      view.device.systemIp = d.device.system_ip ? d.device.system_ip : 'N/A';
      view.device.chassisNumber = d.device.chassis_number ? d.device.chassis_number : 'N/A';
      view.device.softwareVersion = d.device.software_version ? d.device.software_version : 'N/A';
      view.device.uuid = d.device.uuid ? d.device.uuid : 'N/A';
      view.device.deviceType = d.device.device_type ? d.device.device_type : 'N/A';
      view.device.deviceModel = d.device.device_model ? d.device.device_model : 'N/A';
      view.device.localSystemIp = d.device.local_system_ip ? d.device.local_system_ip : 'N/A';
      view.device.deviceId = d.device.device_id ? d.device.device_id : 'N/A';
      view.device.name = d.device.name ? d.device.name : 'N/A';;

      viewData.push(view);
    })
    return viewData;
  }

  convertToTLOCViewData(data: TlocStats[]): TlocStatsViewData[] {
    let viewData: TlocStatsViewData[] = [];
    data.map(d => {
      let view: TlocStatsViewData = new TlocStatsViewData();
      view.uuid = d.uuid;
      view.tlocType = d.tloc_type ? d.tloc_type : 'N/A';
      view.jitter = d.jitter ? d.jitter : 'N/A';
      view.lossPercentage = d.loss_percentage ? d.loss_percentage : 'N/A';
      view.latency = d.latency ? d.latency : 'N/A';
      view.status = d.status ? d.status : 'N/A';

      view.device.systemIp = d.device.system_ip;
      view.device.chassisNumber = d.device.chassis_number;
      view.device.softwareVersion = d.device.software_version;
      view.device.uuid = d.device.uuid;
      view.device.deviceType = d.device.device_type;
      view.device.deviceModel = d.device.device_model;
      view.device.localSystemIp = d.device.local_system_ip;
      view.device.deviceId = d.device.device_id;
      view.device.name = d.device.name;

      viewData.push(view);
    })
    return viewData;
  }

  convertToLicenseViewData(data: License[]): LicenseViewData[] {
    let viewData: LicenseViewData[] = [];
    data.map(d => {
      let view: LicenseViewData = new LicenseViewData();

      view.uuid = d.uuid;
      view.licenseId = d.license_id ? d.license_id : 'N/A';
      view.licenseType = d.license_type ? d.license_type : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.seatCount = (d.seat_count != null) ? d.seat_count : 0;
      view.claimDate = d.claim_date ? d.claim_date : 'N/A';
      view.activationDate = d.activation_date ? d.activation_date : 'N/A';
      view.expirationDate = d.expiration_date ? d.expiration_date : 'N/A';
      view.account = d.account ? d.account : 'N/A';
      view.deviceSerial = d.device_serial ? d.device_serial : 'N/A';
      view.networkId = d.network_id ? d.network_id : 'N/A';
      view.merakiDevice = d.meraki_device ? d.meraki_device : 'N/A';
      view.merakiNetwork = d.meraki_network ? d.meraki_network : 'N/A';
      view.merakiOrganization = d.meraki_organization ? d.meraki_organization : 'N/A';
      view.merakiOrganizationName = d.meraki_organization_name ? d.meraki_organization_name : 'N/A';


      viewData.push(view);
    })
    return viewData;
  }

  convertToMerakiNetworkViewData(data: MerakiNetworks[]): MerakiNetworksViewData[] {
    let viewData: MerakiNetworksViewData[] = [];
    data.map(d => {
      let view: MerakiNetworksViewData = new MerakiNetworksViewData();

      view.uuid = d.uuid;
      view.networkId = d.network_id ? d.network_id : 'N/A';
      view.name = d.name ? d.name : 'N/A';
      view.productTypes = Array.isArray(d.product_types) ? d.product_types : [];
      view.tags = Array.isArray(d.tags) ? d.tags : [];
      view.isVirtual = typeof d.is_virtual === 'boolean' ? d.is_virtual : false;
      view.clientUrl = d.client_url ? d.client_url : 'N/A';
      view.timezone = d.timezone ? d.timezone : 'N/A';
      view.account = d.account ? d.account : 'N/A';
      view.merakiOrganization = d.meraki_organization ? d.meraki_organization : 'N/A';
      view.merakiOrganizationId = d.meraki_organization_id ? d.meraki_organization_id : 'N/A';
      view.merakiOrganizationName = d.meraki_organization_name ? d.meraki_organization_name : 'N/A';

      viewData.push(view);
    })
    return viewData;
  }

  convertToMerakiDeviceEventViewData(data: MerakiDeviceEventType[]): MerakiDeviceEventViewData[] {
    let viewData: MerakiDeviceEventViewData[] = [];
    data.forEach(d => {
      let view: MerakiDeviceEventViewData = new MerakiDeviceEventViewData();
      view.eventType = d.event_type;
      view.description = d.description;
      view.category = d.category ? d.category : 'N/A';
      view.occuredAt = d.occurred_at ? this.utilSvc.toUnityOneDateFormat(d.occurred_at) : 'N/A';
      let eventDetails = '';
      let eventDetailskeys = Object.keys(d.event_details);
      eventDetailskeys.forEach((ed, index) => {
        if (index != (eventDetailskeys.length - 1)) {
          eventDetails = `${eventDetails}${ed} - ${d.event_details[ed]}, `;
        } else if (index == (eventDetailskeys.length - 1)) {
          eventDetails = `${eventDetails}${ed} - ${d.event_details[ed]}`;
        }
      })
      view.eventDetails = eventDetails;
      let eventData = '';
      let eventDatakeys = Object.keys(d.event_data);
      eventDatakeys.forEach((ed, index) => {
        if (index != (eventDatakeys.length - 1)) {
          eventData = `${eventData}${ed} - ${d.event_data[ed]}, `;
        } else if (index == (eventDatakeys.length - 1)) {
          eventData = `${eventData}${ed} - ${d.event_data[ed]}`;
        }
      })
      view.eventData = eventData;
      viewData.push(view);
    })
    return viewData;
  }

  getDateRangeByPeriod(timeRange: TimeRange): DateRange {
    const format = new DateRange().format;
    switch (timeRange) {
      case TimeRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case TimeRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case TimeRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case TimeRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case TimeRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getFans(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<FansWidgetType>> {
    return this.tableService.getData<PaginatedResult<FansWidgetType>>(DEVICE_OVERVIEW_BY_FAN_DATA(deviceType, deviceId), criteria);
  }

  convertToFansViewData(data: FansWidgetType[]): FansViewData[] {
    let viewData: FansViewData[] = [];
    data.forEach(d => {
      let view: FansViewData = new FansViewData();
      view.name = d.name;
      view.reading = d.reading ? d.reading + ' RPM' : 'N/A';
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.lowerThresholdWarning = d.lower_threshold_warning ? d.lower_threshold_warning + ' RPM' : 'N/A';
      view.lowerThresholdCritical = d.lower_threshold_critical ? d.lower_threshold_critical + ' RPM' : 'N/A';
      view.upperThresholdWarning = d.upper_threshold_warning ? d.upper_threshold_warning + ' RPM' : 'N/A';
      view.upperThresholdCritical = d.upper_threshold_critical ? d.upper_threshold_critical + ' RPM' : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getPowerSupplyData(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<PowerStatsWidgetType>> {
    return this.tableService.getData<PaginatedResult<PowerStatsWidgetType>>(DEVICE_OVERVIEW_BY_POWER_STATS(deviceType, deviceId), criteria);
  }

  convertToPowerSupplyViewData(data: PowerStatsWidgetType[]): PowerSupplyViewData[] {
    let viewData: PowerSupplyViewData[] = [];
    data.forEach(d => {
      let view: PowerSupplyViewData = new PowerSupplyViewData();
      view.name = d.name;
      view.firmwareVersion = d.firmware_version ? d.firmware_version : 'N/A';
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.partNumber = d.part_number ? d.part_number : 'N/A';
      view.powerSupplyType = d.power_supply_type ? d.power_supply_type : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      view.outputWattage = d.output_wattage ? d.output_wattage : 'N/A';
      view.inputWattage = d.input_wattage ? d.input_wattage : 'N/A';
      view.inputVoltage = d.line_input_voltage;
      view.inputVoltageType = d.line_input_voltage_type ? d.line_input_voltage_type : 'N/A';
      view.powerOutput = d.last_power_output_watts;
      viewData.push(view);
    })
    return viewData;
  }

  getChassis(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ChassisWidgetType>> {
    return this.tableService.getData<PaginatedResult<ChassisWidgetType>>(DEVICE_OVERVIEW_BY_CHASSIS_DATA(deviceType, deviceId), criteria);
  }

  convertToChassisViewData(data: ChassisWidgetType[]): ChassisViewData[] {
    let viewData: ChassisViewData[] = [];
    data.forEach(d => {
      let view: ChassisViewData = new ChassisViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.chassisType = d.chassis_type ? d.chassis_type : 'N/A';
      view.partNumber = d.part_number ? d.part_number : 'N/A';
      view.sku = d.sku ? d.sku : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getTemperature(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<TemperatureWidgetType>> {
    return this.tableService.getData<PaginatedResult<TemperatureWidgetType>>(DEVICE_OVERVIEW_BY_TEMPERATURE_DATA(deviceType, deviceId), criteria);
  }

  convertToTemperatureViewData(data: TemperatureWidgetType[]): TemperatureViewData[] {
    let viewData: TemperatureViewData[] = [];
    data.forEach(d => {
      let view: TemperatureViewData = new TemperatureViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.upperThresholdCritical = d.upper_threshold_critical ? d.upper_threshold_critical : 'N/A';
      view.readingCelsius = d.reading_celsius ? d.reading_celsius : 'N/A';
      view.lowerThresholdWarning = d.lower_threshold_warning ? d.lower_threshold_warning : 'N/A';
      view.lowerThresholdCritical = d.lower_threshold_critical ? d.lower_threshold_critical : 'N/A';
      view.upperThresholdWarning = d.upper_threshold_warning ? d.upper_threshold_warning : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getVoltage(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<VoltageWidgetType>> {
    return this.tableService.getData<PaginatedResult<VoltageWidgetType>>(DEVICE_OVERVIEW_BY_VOLTAGE_DATA(deviceType, deviceId), criteria);
  }

  getSyncVoltages(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_VOLTAGE_DATA(deviceType, deviceId));
  }

  convertToVoltageViewData(data: VoltageWidgetType[]): VoltageViewData[] {
    let viewData: VoltageViewData[] = [];
    data.forEach(d => {
      let view: VoltageViewData = new VoltageViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.upperThresholdCritical = d.upper_threshold_critical ? d.upper_threshold_critical : 'N/A';
      view.readingVolts = d.reading_volts ? d.reading_volts : 'N/A';
      view.lowerThresholdWarning = d.lower_threshold_warning ? d.lower_threshold_warning : 'N/A';
      view.lowerThresholdCritical = d.lower_threshold_critical ? d.lower_threshold_critical : 'N/A';
      view.upperThresholdWarning = d.upper_threshold_warning ? d.upper_threshold_warning : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getProcessors(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ProcessorsWidgetType>> {
    return this.tableService.getData<PaginatedResult<ProcessorsWidgetType>>(DEVICE_OVERVIEW_BY_PROCESSORS_DATA(deviceType, deviceId), criteria);
  }

  convertToProcessorsViewData(data: ProcessorsWidgetType[]): ProcessorsViewData[] {
    let viewData: ProcessorsViewData[] = [];
    data.forEach(d => {
      let view: ProcessorsViewData = new ProcessorsViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.totalCore = d.total_core ? d.total_core : 'N/A';
      view.totalThreads = d.total_threads ? d.total_threads : 'N/A';
      view.processorType = d.processor_type ? d.processor_type : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.maxSpeed = d.max_speed ? d.max_speed : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getVirtualDisk(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<VirtualDiskType>> {
    return this.tableService.getData<PaginatedResult<VirtualDiskType>>(DEVICE_OVERVIEW_BY_VIRTUAL_DISKS_DATA(deviceType, deviceId), criteria);
  }

  convertToVirtualDiskViewData(data: VirtualDiskType[]): VirtualDiskViewData[] {
    let viewData: VirtualDiskViewData[] = [];
    data.forEach(d => {
      let view: VirtualDiskViewData = new VirtualDiskViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.diskType = d.disk_type ? d.disk_type : 'N/A';
      view.mediaType = d.media_type ? d.media_type : 'N/A';
      view.size = d.size ? d.size : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getPhysicalDisk(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<PhysicalDiskWidgetType>> {
    return this.tableService.getData<PaginatedResult<PhysicalDiskWidgetType>>(DEVICE_OVERVIEW_BY_PHYSICAL_DISKS_DATA(deviceType, deviceId), criteria);
  }

  convertToPhysicalDiskViewData(data: PhysicalDiskWidgetType[]): PhysicalDiskViewData[] {
    let viewData: PhysicalDiskViewData[] = [];
    data.forEach(d => {
      let view: PhysicalDiskViewData = new PhysicalDiskViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.diskType = d.disk_type ? d.disk_type : 'N/A';
      view.mediaType = d.media_type ? d.media_type : 'N/A';
      view.size = d.size ? d.size : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getSyncManagers(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_MANAGERS_DATA(deviceType, deviceId));
  }

  getmanagers(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ManagersWidgetType>> {
    return this.tableService.getData<PaginatedResult<ManagersWidgetType>>(DEVICE_OVERVIEW_BY_MANAGERS_DATA(deviceType, deviceId), criteria);
  }

  convertToManagersViewData(data: ManagersWidgetType[]): ManagersViewData[] {
    let viewData: ManagersViewData[] = [];
    data.forEach(d => {
      let view: ManagersViewData = new ManagersViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.firmwareVersion = d.firmware_version ? d.firmware_version : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.managerType = d.manager_type ? d.manager_type : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getSyncEnclosures(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_ENCLOSURES_DATA(deviceType, deviceId));
  }

  getEnclosures(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<EnclosuresWidgetType>> {
    return this.tableService.getData<PaginatedResult<EnclosuresWidgetType>>(DEVICE_OVERVIEW_BY_ENCLOSURES_DATA(deviceType, deviceId), criteria);
  }

  convertToEnclosuresViewData(data: EnclosuresWidgetType[]): EnclosuresViewData[] {
    let viewData: EnclosuresViewData[] = [];
    data.forEach(d => {
      let view: EnclosuresViewData = new EnclosuresViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.assetTag = d.asset_tag ? d.asset_tag : 'N/A';
      view.chassisType = d.chassis_type ? d.chassis_type : 'N/A';
      view.partNumber = d.part_number ? d.part_number : 'N/A';
      view.sku = d.sku ? d.sku : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getSyncStorageControllers(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_STORAGE_CONTROLLERS_DATA(deviceType, deviceId));
  }

  getStorageControllers(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageControllerWidgetType>> {
    return this.tableService.getData<PaginatedResult<StorageControllerWidgetType>>(DEVICE_OVERVIEW_BY_STORAGE_CONTROLLERS_DATA(deviceType, deviceId), criteria);
  }

  convertToStorageControllersViewData(data: StorageControllerWidgetType[]): StorageControllerViewData[] {
    let viewData: StorageControllerViewData[] = [];
    data.forEach(d => {
      let view: StorageControllerViewData = new StorageControllerViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      view.manufacturer = d.manufacturer ? d.manufacturer : 'N/A';
      view.model = d.model ? d.model : 'N/A';
      view.firmwareVersion = d.firmware_version ? d.firmware_version : 'N/A';
      view.speed = d.speed ? d.speed : 'N/A';
      view.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getSyncBatteries(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_OVERVIEW_BY_SYNC_BATTERIES_DATA(deviceType, deviceId));
  }

  getBatteries(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<BatteriesWidgetType>> {
    return this.tableService.getData<PaginatedResult<BatteriesWidgetType>>(DEVICE_OVERVIEW_BY_BATTERIES_DATA(deviceType, deviceId), criteria);
  }

  convertToBatteriesViewData(data: BatteriesWidgetType[]): BatteriesViewData[] {
    let viewData: BatteriesViewData[] = [];
    data.forEach(d => {
      let view: BatteriesViewData = new BatteriesViewData();
      view.name = d.name;
      view.status = d.status ? d.status : 'N/A';
      view.state = d.state ? d.state : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }
    
  getDatabasesList(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<DatabaseType>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<DatabaseType>>(`/customer/database_servers/${deviceId}/databases/`, { params: params });
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=database_entity`)
  }

  convertToDatabasesViewData(data: DatabaseType[]): DatabaseViewData[] {
    let viewData: DatabaseViewData[] = [];
    data?.map(s => {
      let a: DatabaseViewData = new DatabaseViewData();
      a.id = s.id;
      a.uuid = s.uuid;
      a.name = s.name;
      a.createdAt = s.created_at ? this.utilSvc.toUnityOneDateFormat(s.created_at) : 'N/A';
      a.updatedAt = s.updated_at ? this.utilSvc.toUnityOneDateFormat(s.updated_at) : 'N/A';
      // a.customAttributeData = s.custom_attribute_data;
      a.shortDescription = s.short_description ? s.short_description : 'NA';
      a.description = s.description ? s.description : 'NA';
      a.manufacturer = s.manufacturer ? s.manufacturer : 'NA';
      a.model = s.model ? s.model : 'NA';
      // a.discoveryMethod = s.discovery_method ? s.discovery_method : 'NA';
      a.version = s.version ? s.version : 'NA';
      // a.databaseServer = s.database_server ? s.database_server.toString() : 'NA';
      viewData.push(a);
    });
    return viewData;
  }

  deleteMultipleDBEntities(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/database_entity/bulk_delete/`, { params: params });
  }

  updateMultipleDBEntities(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/database_entity/bulk_update/`, obj, { params });
  }

}

export class InterfaceSummaryViewData {
  total: number = 0;
  up: number = 0;
  down: number = 0;
  unknown: number = 0;
  dormant: number = 0;
  lowerLayerDown: number = 0;
  notPresent: number = 0;
  testing: number = 0;
}

export class BGPPeersSummaryViewData {
  total: number = 0;
  Active: number = 0;
  Idle: number = 0;
  Connect: number = 0;
  OpenSent: number = 0;
  OpenConfirm: number = 0;
  Established: number = 0;
}

export class ServiceViewData {
  name: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  statusIcon: string;
}

export class ServiceSummaryViewData {
  running: number = 0;
  stopped: number = 0;
  unknown: number = 0;
  total: number = 0;
}

export class PerformanceViewData {
  constructor() { }
  memory: number = 0;
  vCpus: number = 0;
  hardDisks: PerformanceHardDisksViewData[] = [];
  networkAdapters: PerformaceNetworkAdaptersViewData[] = [];
}

export class PerformanceHardDisksViewData {
  constructor() { }
  diskLabel: string;
  diskSize: number = 0;
  diskSizeUnit: string;
}

export class PerformaceNetworkAdaptersViewData {
  constructor() { }
  adapterLabel: string;
  adapterName: string;
}

export enum TimeRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export class EventsViewData {
  constructor() { }
  username: string;
  description: string;
  eventType: string;
  nativeEventType: string;
  createdOn: string;
}

export class TasksViewData {
  constructor() { }
  username: string;
  description: string;
  startTime: string;
  completionTime: string;
  queuedTime: string;
  status: string;
}

export class SystemFirewallViewData {
  id: number;
  uuid: string;
  key: string;
  serviceName: string;
  enabled: boolean;
  allowedIpAddresses: string;
  rule: RuleItem[];
  hypervisor: number;
  tcpPorts: string;
  udpPorts: string;
}

export class RuleItem {
  direction: string;
  protocol: string;
  port: number[];
}

export interface SystemFirewall {
  id: number;
  uuid: string;
  key: string;
  service_name: string;
  enabled: boolean;
  allowed_ip_addresses: string;
  rule: RuleItem[];
  hypervisor: number;
}

export interface RuleItem {
  direction: string;
  protocol: string;
  port: number[];
}

export class VSwitchesViewData {
  constructor() { }
  name: string;
  physicalAdapter: string;
  portGroup: string[];
}

export class VMKernelViewData {
  constructor() { }
  device: string;
  networkLabel: string;
  switch: string;
  ipAddress: string;
  macAddress: string;
}

export class PhysicalAdapterViewData {
  constructor() { }
  device: string;
  actualSpeed: string;
  configuredSpeed: string;
  switch: string;
  macAddress: string;
  ipAddress: string;
  wakeOnLanSupported: boolean;
}

export class StorageAdapterViewData {
  id: number;
  uuid: string;
  key: string;
  name: string;
  model: string;
  type: string;
  status: string;
  targets: number;
  devices: number;
  paths: number;
  hypervisor: number;
}

export interface StorageAdapter {
  id: number;
  uuid: string;
  key: string;
  name: string;
  model: string;
  type: string;
  status: string;
  targets: number;
  devices: number;
  paths: number;
  hypervisor: number;
}

export class StorageDevicesViewData {
  id: number;
  uuid: string;
  key: string;
  name: string;
  path: string;
  capacity: number;
  operationalState: string;
  type: string;
  hypervisor: number;
}

export interface StorageDevices {
  id: number;
  uuid: string;
  key: string;
  name: string;
  path: string;
  capacity: number;
  operational_state: string;
  type: string;
  hypervisor: number;
}

export interface ControlConnectionsType {
  uuid: string;
  protocol: string;
  device_data_key: string;
  private_ip: string;
  private_port: number;
  public_ip: string;
  public_port: number;
  state: string;
  uptime: string;
  last_updated: string;
  device: DeviceType;
  connected_device: DeviceType;
}

export interface DeviceType {
  system_ip: string;
  chassis_number: string;
  software_version: string;
  uuid: string;
  device_type: string;
  device_model: string;
  local_system_ip: string;
  device_id: string;
  name: string;
}

export class DeviceViewData {
  systemIp: string;
  chassisNumber: string;
  softwareVersion: string;
  uuid: string;
  deviceType: string;
  deviceModel: string;
  localSystemIp: string;
  deviceId: string;
  name: string;

  constructor() { }
}

export class ControlConnectionsViewData {
  uuid: string;
  protocol: string;
  deviceDataKey: string;
  privateIp: string;
  privatePort: number;
  publicIp: string;
  publicPort: number;
  state: string;
  uptime: string;
  lastUpdated: string;
  connectedDevice: DeviceViewData = new DeviceViewData();
  device: DeviceViewData = new DeviceViewData();

  constructor() { }
}

export interface SdwanInterfaceDevice {
  system_ip: string;
  chassis_number: string;
  software_version: string;
  uuid: string;
  device_type: string;
  device_model: string;
  local_system_ip: string;
  device_id: string;
  name: string;
};

export interface SdwanInterfaceStats {
  uuid: string;
  vpn_id: string;
  name: string;
  description: string;
  mac_address: string;
  ip_address: string;
  operational_status: string;
  interface_type: string;
  speed: string;
  rx_discards: number;
  rx_errors: number;
  tx_discards: number;
  tx_errors: number | null;
  last_updated: string;
  device: SdwanInterfaceDevice;
};

export class SdwanInterfaceDeviceViewData {
  systemIp: string;
  chassisNumber: string;
  softwareVersion: string;
  uuid: string;
  deviceType: string;
  deviceModel: string;
  localSystemIp: string;
  deviceId: string;
  name: string;

  constructor() { }
}

export class SdwanInterfaceStatsViewData {
  uuid: string;
  vpnId: string;
  name: string;
  description: string;
  macAddress: string;
  ipAddress: string;
  operationalStatus: string;
  interfaceType: string;
  speed: string;
  rxDiscards: number;
  rxErrors: number;
  txDiscards: number;
  txErrors: number | null;
  lastUpdated: string;
  device: SdwanInterfaceDeviceViewData = new SdwanInterfaceDeviceViewData();

  constructor() { }
}

export interface TlocDevice {
  system_ip: string;
  chassis_number: string;
  software_version: string;
  uuid: string;
  device_type: string;
  device_model: string;
  local_system_ip: string;
  device_id: string;
  name: string;
}

export interface TlocStats {
  uuid: string;
  tloc_type: string;
  jitter: string;
  loss_percentage: string;
  latency: string;
  device: TlocDevice;
  status: string;
}

export class TlocDeviceViewData {
  systemIp: string;
  chassisNumber: string;
  softwareVersion: string;
  uuid: string;
  deviceType: string;
  deviceModel: string;
  localSystemIp: string;
  deviceId: string;
  name: string;

  constructor() { }
}

export class TlocStatsViewData {
  uuid: string;
  tlocType: string;
  jitter: string;
  lossPercentage: string;
  latency: string;
  status: string;
  device: TlocDeviceViewData = new TlocDeviceViewData();

  constructor() { }
}

export interface TunnelDevice {
  system_ip: string;
  chassis_number: string;
  software_version: string;
  uuid: string;
  device_type: string;
  device_model: string;
  local_system_ip: string;
  device_id: string;
  name: string;
};

export interface TunnelStats {
  uuid: string;
  device_data_key: string;
  tunnel_type: string;
  local_remote_interface_name: string;
  local_interface_description: string;
  remote_interface_description: string;
  protocol: string | null;
  state: string;
  jitter: string;
  loss_percentage: string;
  latency: string;
  vqoe_score: string;
  tx_octets: number;
  rx_octets: number;
  last_updated: string;
  fecLossRecovery: string;
  tunnel_endpoints: string;
  device: TunnelDevice;
};

export class TunnelDeviceViewData {
  systemIp: string;
  chassisNumber: string;
  softwareVersion: string;
  uuid: string;
  deviceType: string;
  deviceModel: string;
  localSystemIp: string;
  deviceId: string;
  name: string;

  constructor() { }
}

export class TunnelStatsViewData {
  uuid: string;
  deviceDataKey: string;
  tunnelType: string;
  localRemoteInterfaceName: string;
  localInterfaceDescription: string;
  remoteInterfaceDescription: string;
  protocol: string | null;
  state: string;
  jitter: string;
  lossPercentage: string;
  latency: string;
  vqoeScore: string;
  txOctets: number;
  rxOctets: number;
  lastUpdated: string;
  fecLossRecovery: string;
  tunnelEndpoints: string;
  device: TunnelDeviceViewData = new TunnelDeviceViewData();

  constructor() { }
}

export interface License {
  uuid: string;
  license_id: string;
  license_type: string;
  state: string;
  seat_count: number;
  claim_date: string;
  activation_date: string;
  expiration_date: string;
  account: string;
  device_serial: string;
  network_id: string;
  meraki_device: string;
  meraki_network: string;
  meraki_organization: string;
  meraki_organization_name: string;
}

export class LicenseViewData {
  uuid: string;
  licenseId: string;
  licenseType: string;
  state: string;
  seatCount: number;
  claimDate: string;
  activationDate: string;
  expirationDate: string;
  account: string;
  deviceSerial: string;
  networkId: string;
  merakiDevice: string;
  merakiNetwork: string;
  merakiOrganization: string;
  merakiOrganizationName: string;

  constructor() { }
}

export interface LicenseStates {
  expiring: number;
  unused: number;
  recently_queued: number;
  active: number;
  expired: number;
  unused_active: number;
}

export interface SystemManagerData {
  active_seats: number;
  unassigned_seats: number;
  total_seats: number;
  orgwide_enrolled_devices: number;
}

export interface MerakiNetworks {
  uuid: string;
  network_id: string;
  name: string;
  product_types: string[];
  tags: string[];
  is_virtual: boolean;
  client_url: string;
  timezone: string;
  account: string;
  meraki_organization: string;
  meraki_organization_id: string;
  meraki_organization_name: string;
}

export class LicenseStatesViewData {
  constructor() { };
  expiring: number;
  unused: number;
  recentlyQueued: number;
  active: number;
  expired: number;
  unusedActive: number;

}

export class systemManagerViewData {
  constructor() { };
  activeSeats: number;
  unassignedSeats: number;
  totalSeats: number;
  orgwideEnrolledDevices: number;
}

export class MerakiNetworksViewData {
  uuid: string;
  networkId: string;
  name: string;
  productTypes: string[];
  tags: string[];
  isVirtual: boolean;
  clientUrl: string;
  timezone: string;
  account: string;
  merakiOrganization: string;
  merakiOrganizationId: string;
  merakiOrganizationName: string;

  constructor() { }
}

export class MerakiDeviceEventViewData {
  constructor() { }
  eventType: string;
  description: string;
  category: string;
  occuredAt: string;
  eventDetails: string;
  eventData: string;
}

export interface MerakiDeviceEventType {
  uuid: string;
  description: string;
  event_type: string;
  category: string;
  event_details: MerakiDeviceEventDetailsType;
  event_data: MerakiDeviceEventDataType;
  occurred_at: string;
  account: string;
  device_name: string;
  device_serial: string;
  meraki_device: string;
  meraki_network: string;
  meraki_organization: string;
  meraki_organization_name: string;
  network_id: string;
}

export interface MerakiDeviceEventDetailsType {
  client_mac: string;
  client_description: string;
  client_id: string;
}

export interface MerakiDeviceEventDataType {
  rssi: string;
  client_ip: string;
  radio: string;
  client_channel: string;
}

export class FansViewData {
  constructor() { }
  name: string;
  reading: number | String;
  status: string;
  state: string;
  lowerThresholdWarning: number | String;
  lowerThresholdCritical: number | String;
  upperThresholdWarning: number | String;
  upperThresholdCritical: number | String;
}

export class PowerSupplyViewData {
  constructor() { }
  name: string;
  firmwareVersion: string;
  status: string;
  state: string;
  partNumber: string;
  powerSupplyType: string;
  serialNumber: string;
  outputWattage: number | String;
  inputWattage: number | String;
  inputVoltage: number;
  inputVoltageType: string;
  powerOutput: number;
}

export class ChassisViewData {
  constructor() { }
  name: string;
  status: string;
  state: string;
  manufacturer: string;
  model: string;
  chassisType: string;
  partNumber: number | String;
  sku: string;
  serialNumber: string;
}
export class TemperatureViewData {
  name: string;
  readingCelsius: number | String;
  upperThresholdCritical: number | String;
  lowerThresholdWarning: number | String;
  lowerThresholdCritical: number | String;
  upperThresholdWarning: number | String;
  state: string;
  status: string;
}
export class VoltageViewData {
  name: string;
  readingVolts: number | String;
  upperThresholdCritical: number | String;
  lowerThresholdWarning: number | String;
  lowerThresholdCritical: number | String;
  upperThresholdWarning: number | String;
  state: string;
  status: string;
}
export class ProcessorsViewData {
  name: string;
  status: string;
  state: string;
  totalCore: number | String;
  totalThreads: number | String;
  processorType: string;
  manufacturer: string;
  model: string;
  maxSpeed: number | String;
}

export class VirtualDiskViewData {
  name: string;
  status: string;
  state: string;
  diskType: string;
  mediaType: string;
  model: string;
  manufacturer: string;
  size: string;
  serialNumber: string;
}

export class PhysicalDiskViewData {
  name: string;
  status: string;
  state: string;
  diskType: string;
  mediaType: string;
  model: string;
  manufacturer: string;
  size: string;
  serialNumber: string;
}

export class ManagersViewData {
  name: string;
  firmwareVersion: string;
  status: string;
  state: string;
  manufacturer: string;
  model: string;
  managerType: string;
}
export class EnclosuresViewData {
  name: string;
  status: string;
  state: string;
  manufacturer: string;
  model: string;
  assetTag: string
  chassisType: string;
  partNumber: string;
  sku: string;
  serialNumber: string;
}
export class StorageControllerViewData {
  name: string;
  status: string;
  state: string;
  manufacturer: string;
  model: string;
  speed: string
  firmwareVersion: string;
  serialNumber: string;
}
export class BatteriesViewData {
  name: string;
  status: string;
  state: string;
}


export class DatabaseViewData {
  id: number;
  createdAt: string;
  updatedAt: string;
  customAttributeData: null;
  uuid: string;
  name: string;
  shortDescription: string;
  description: string;
  manufacturer: string;
  model: string;
  discoveryMethod: string;
  version: string;
  databaseServer: string;

  isSelected: boolean;
  applicableModulePermissions: any[];
  
  constructor() { }
}



export interface DynamicFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  readonly?: boolean;
  options?: { label: string; value: any }[];
}

