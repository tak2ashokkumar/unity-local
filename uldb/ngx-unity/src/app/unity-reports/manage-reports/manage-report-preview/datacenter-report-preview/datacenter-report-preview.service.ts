import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { GENERATE_DATACENTER_INVENTORY_REPORT, GET_REPORT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { ManageReportDCInventoryReport, ManageReportDCInventoryReportDevices, ManageReportDataType } from './datacenter-report-preview.type';

@Injectable()
export class DatacenterReportPreviewService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService,) { }

  getReportById(uuid: string) {
    return this.http.get<ManageReportDataType>(GET_REPORT_BY_ID(uuid));
  }

  private setParams(reportDropdownData: ManageReportDCReportFilterData) {
    // let params: HttpParams = new HttpParams();
    // if (reportDropdownData.cabUUID.length) {
    //   reportDropdownData.cabUUID.forEach(cabId => {
    //     params = params.append('cab_uuid', cabId);
    //   });
    // } else {
    //   reportDropdownData.dcUUID.forEach(dcId => {
    //     params = params.append('dc_uuid', dcId);
    //   });
    // }
    // return params;
    let data: string[] = [];
    if (reportDropdownData.cabUUID.length) {
      reportDropdownData.cabUUID.forEach(cabId => data.push(cabId));
      return { 'cab_uuid': data };
    } else {
      reportDropdownData.dcUUID.forEach(dcId => data.push(dcId));
      return { 'dc_uuid': data };
    }
  }

  generateDCCabinetViewReport(dcReportFilterData: ManageReportDCReportFilterData): Observable<TaskStatus> {
    let data = this.setParams(dcReportFilterData);
    data['device_list'] = 'false';
    return this.http.post<CeleryTask>(GENERATE_DATACENTER_INVENTORY_REPORT(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 100).pipe(take(1))), take(1));
  }

  generateDCDevicesViewReport(dcReportFilterData: ManageReportDCReportFilterData): Observable<TaskStatus> {
    let data = this.setParams(dcReportFilterData);
    data['device_list'] = 'true';
    return this.http.post<CeleryTask>(GENERATE_DATACENTER_INVENTORY_REPORT(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 100).pipe(take(1))), take(1));
  }

  convertToDCInfoViewData(reportData: ManageReportDCInventoryReport[]) {
    let viewData: ManageReportDCInventoryReportViewData = new ManageReportDCInventoryReportViewData();
    let datacenters: ManageReportDCInventoryReportDCInfoViewData[] = [];
    reportData.map(dc => {
      let a: ManageReportDCInventoryReportDCInfoViewData = new ManageReportDCInventoryReportDCInfoViewData();
      a.id = dc.uuid;
      a.name = dc.name;
      a.location = dc.location;
      a.lat = dc.lat || 'N/A';
      a.long = dc.long || 'N/A';
      a.status = dc.status;

      let aCabinets: ManageReportDCInventoryReportCabinetViewData[] = [];
      let aPDUs: ManageReportDCInventoryReportPDUsViewData[] = [];
      dc.cabinets.map(cab => {
        let cb: ManageReportDCInventoryReportCabinetViewData = new ManageReportDCInventoryReportCabinetViewData();
        cb.id = cab.uuid;
        cb.name = cab.name;
        cb.model = cab.model ? cab.model : 'N/A';
        cb.capacity = cab.capacity;
        cb.occupied = cab.occupied;
        cb.alerts = cab.alerts;
        cb.powerCapacity = cab.power_capacity;
        cb.maxTemperature = cab.max_temperature;
        cb.totalPower = cab.total_power;
        cb.co2EmissionValue = `${cab.co2_emission_value.toFixed(2)} ton (per annum)`;
        cab.pdus.map(pdu => aPDUs.push(<ManageReportDCInventoryReportPDUsViewData>pdu));
        aCabinets.push(cb);
      })

      a.cabinets = aCabinets;
      a.pdus = aPDUs;
      datacenters.push(a);
    })
    viewData.datacentersData = datacenters;
    viewData.isReportReady = datacenters.length ? true : false;
    return viewData;
  }

  convertToDevicesInfoViewData(devicesData: ManageReportDCInventoryReportDevices) {
    let viewData: ManageReportDCInventoryReportViewData = new ManageReportDCInventoryReportViewData();
    let a: ManageReportDCInventoryReportDevicesInfoViewData = new ManageReportDCInventoryReportDevicesInfoViewData();
    a.switchs = devicesData.sw_count;
    a.firewalls = devicesData.fw_count;
    a.loadbalancers = devicesData.lb_count;
    a.hypervisors = devicesData.hv_count;
    a.bmservers = devicesData.bm_count;
    a.macDevices = devicesData.mc_count;
    a.storages = devicesData.sd_count;
    a.pdus = devicesData.pdu_count;
    a.customDevices = devicesData.cd_count;
    a.panelDevices = devicesData.pd_count;

    let devices: ManageReportDCInventoryReportDevicesViewData[] = [];
    devicesData.devices.map(device => {
      let d: ManageReportDCInventoryReportDevicesViewData = new ManageReportDCInventoryReportDevicesViewData();
      d.id = device.uuid;
      d.type = device.type;
      d.name = device.name;
      d.manufacturer = device.manufacturer ? device.manufacturer : 'NA';
      d.model = device.model ? device.model : 'NA';
      d.managementIp = device.ip_address ? device.ip_address : 'NA';
      d.size = device.size ? `${device.size} U` : 'NA';
      d.position = device.position ? device.position : 'NA';
      d.cabinet = device.cabinet ? device.cabinet : 'NA';
      d.datacenter = device.datacenter ? device.datacenter : 'NA';
      d.endOfLife = device.end_of_life ? this.utilSvc.toUnityOneDateFormat(device.end_of_life, 'MMM DD, y') : 'NA';
      d.endOfSupport = device.end_of_support ? this.utilSvc.toUnityOneDateFormat(device.end_of_support, 'MMM DD, y') : 'NA';
      d.endOfService = device.end_of_service ? this.utilSvc.toUnityOneDateFormat(device.end_of_service, 'MMM DD, y') : 'NA';
      devices.push(d)
    })
    a.devices = devices;
    viewData.devicesData = a;
    viewData.isReportReady = devicesData.devices.length ? true : false;
    return viewData;
  }
}

/**
 * Dropdown selection related class
 */
export class ManageReportDCReportFilterData {
  name: string = 'datacenter_inventory_report';
  dcUUID: string[] = [];
  cabUUID: string[] = [];
  device_list: boolean = false;
  constructor() { }
}

/**
 * Report related classes
 */
export class ManageReportDCInventoryReportViewData {
  datacentersData: ManageReportDCInventoryReportDCInfoViewData[] = [];
  devicesData: ManageReportDCInventoryReportDevicesInfoViewData = new ManageReportDCInventoryReportDevicesInfoViewData();
  isReportReady: boolean = false;
  constructor() { }
}

export class ManageReportDCInventoryReportDCInfoViewData {
  id: string;
  name: string;
  location: string;
  lat: string;
  long: string;
  status: ManageReportDatacenterInventoryStatusView[];
  cabinets: ManageReportDCInventoryReportCabinetViewData[] = [];
  pdus: ManageReportDCInventoryReportPDUsViewData[] = [];
  constructor() { }
}

export class ManageReportDatacenterInventoryStatusView {
  status: string;
  category: string;
  constructor() { }
}

export class ManageReportDCInventoryReportCabinetViewData {
  id: string;
  name: string;
  model: string;
  capacity: number;
  occupied: number;
  alerts: number;
  powerCapacity: number;
  totalPower: number;
  maxTemperature: number;
  co2EmissionValue: string;
  constructor() { }
}

export class ManageReportDCInventoryReportPDUsViewData {
  uuid: string;
  name: string;
  sockets: number;
  status: number;
  constructor() { }
}

export class ManageReportDCInventoryReportDevicesInfoViewData {
  switchs: number = 0;
  firewalls: number = 0;
  loadbalancers: number = 0;
  hypervisors: number = 0;
  bmservers: number = 0;
  macDevices: number = 0;
  storages: number = 0;
  pdus: number = 0;
  customDevices: number = 0;
  panelDevices: number = 0;
  devices: ManageReportDCInventoryReportDevicesViewData[] = [];
  constructor() { }
}

export class ManageReportDCInventoryReportDevicesViewData {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  managementIp: string;
  size: string;
  position: string;
  cabinet: string;
  datacenter: string;
  endOfLife: string;
  endOfSupport: string;
  endOfService: string;
  constructor() { }
}