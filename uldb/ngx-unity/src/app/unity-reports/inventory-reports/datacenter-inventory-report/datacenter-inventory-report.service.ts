import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { DATA_CENTERS, DOWNLOAD_DATACENTER_INVENTORY_REPORT, EMAIL_DATACENTER_INVENTORY_REPORT, GENERATE_DATACENTER_INVENTORY_REPORT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DCInventoryReport, DCInventoryReportDevices, InventoryDataCenter } from './datacenter-inventory-report.type';

@Injectable()
export class DatacenterInventoryReportService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private router: Router,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getDataCenters(): Observable<InventoryDataCenter[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<InventoryDataCenter[]>(DATA_CENTERS(), { params: params })
  }

  convertToDataCenterInventoryView(datacenters: InventoryDataCenter[]) {
    let viewData: DatacenterInventoryView[] = [];
    datacenters.map(dc => {
      let a: DatacenterInventoryView = new DatacenterInventoryView();
      a.uuid = dc.uuid;
      a.name = dc.name;

      let aCabinets: DatacenterInventoryCabinetView[] = [];
      dc.cabinets.map(dcc => {
        let ac: DatacenterInventoryCabinetView = new DatacenterInventoryCabinetView();
        ac.uuid = dcc.uuid;
        ac.name = dcc.name;
        aCabinets.push(ac);
      })
      a.cabinets = aCabinets;

      viewData.push(a);
    })
    return viewData;
  }

  createFilterForm() {
    return this.builder.group({
      'datacenters': [[], [Validators.required]],
      'cabinets': [[]],
      'reportType': ['cabinet', [Validators.required]],
      'report_url': [this.router.url]
    });
  }

  resetFilterFormErrors() {
    return {
      'datacenters': '',
      'reportType': ''
    };
  }

  filterFormValidationMessages = {
    'datacenters': {
      'required': 'Datacenter selection is mandatory'
    },
    'reportType': {
      'required': 'Report Type is mandatory'
    }
  }

  private setParams(reportDropdownData: DCReportFilterData) {
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

  generateDCCabinetViewReport(dcReportFilterData: DCReportFilterData): Observable<TaskStatus> {
    let data = this.setParams(dcReportFilterData);
    data['device_list'] = 'false';
    return this.http.post<CeleryTask>(GENERATE_DATACENTER_INVENTORY_REPORT(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 100).pipe(take(1))), take(1));
  }

  generateDCDevicesViewReport(dcReportFilterData: DCReportFilterData): Observable<TaskStatus> {
    let data = this.setParams(dcReportFilterData);
    data['device_list'] = 'true';
    return this.http.post<CeleryTask>(GENERATE_DATACENTER_INVENTORY_REPORT(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 100).pipe(take(1))), take(1));
  }

  convertToDCInfoViewData(reportData: DCInventoryReport[]) {
    let viewData: DCInventoryReportViewData = new DCInventoryReportViewData();
    let datacenters: DCInventoryReportDCInfoViewData[] = [];
    reportData.map(dc => {
      let a: DCInventoryReportDCInfoViewData = new DCInventoryReportDCInfoViewData();
      a.id = dc.uuid;
      a.name = dc.name;
      a.location = dc.location;
      a.lat = dc.lat || 'N/A';
      a.long = dc.long || 'N/A';
      a.status = dc.status;

      let aCabinets: DCInventoryReportCabinetViewData[] = [];
      let aPDUs: DCInventoryReportPDUsViewData[] = [];
      dc.cabinets.map(cab => {
        let cb: DCInventoryReportCabinetViewData = new DCInventoryReportCabinetViewData();
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
        cab.pdus.map(pdu => aPDUs.push(<DCInventoryReportPDUsViewData>pdu));
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

  convertToDevicesInfoViewData(devicesData: DCInventoryReportDevices) {
    let viewData: DCInventoryReportViewData = new DCInventoryReportViewData();
    let a: DCInventoryReportDevicesInfoViewData = new DCInventoryReportDevicesInfoViewData();
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

    let devices: DCInventoryReportDevicesViewData[] = [];
    devicesData.devices.map(device => {
      let d: DCInventoryReportDevicesViewData = new DCInventoryReportDevicesViewData();
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
      devices.push(d)
    })
    a.devices = devices;
    viewData.devicesData = a;
    viewData.isReportReady = devicesData.devices.length ? true : false;
    return viewData;
  }

  downloadReport(reportDropdownData: DCReportFilterData) {
    return this.http.post<{ data: string }>(DOWNLOAD_DATACENTER_INVENTORY_REPORT(), reportDropdownData);
  }

  sendEmail(reportDropdownData: DCReportFilterData) {
    return this.http.post(EMAIL_DATACENTER_INVENTORY_REPORT(), reportDropdownData);
  }

}

/**
 * Dropdown data related classes
 */
export class DatacenterInventoryView {
  uuid: string;
  name: string;
  cabinets: DatacenterInventoryCabinetView[];
  constructor() { }
}
export class DatacenterInventoryCabinetView {
  uuid: string;
  name: string;
  constructor() { }
}

/**
 * Dropdown selection related class
 */
export class DCReportFilterData {
  name: string = 'datacenter_inventory_report';
  dcUUID: string[] = [];
  cabUUID: string[] = [];
  device_list: boolean = false;
  constructor() { }
}

/**
 * Report related classes
 */
export class DCInventoryReportViewData {
  datacentersData: DCInventoryReportDCInfoViewData[] = [];
  devicesData: DCInventoryReportDevicesInfoViewData = new DCInventoryReportDevicesInfoViewData();
  isReportReady: boolean = false;
  constructor() { }
}

export class DCInventoryReportDCInfoViewData {
  id: string;
  name: string;
  location: string;
  lat: string;
  long: string;
  status: DatacenterInventoryStatusView[];
  cabinets: DCInventoryReportCabinetViewData[] = [];
  pdus: DCInventoryReportPDUsViewData[] = [];
  constructor() { }
}
export class DatacenterInventoryStatusView {
  status: string;
  category: string;
  constructor() { }
}
export class DCInventoryReportCabinetViewData {
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
export class DCInventoryReportPDUsViewData {
  uuid: string;
  name: string;
  sockets: number;
  status: number;
  constructor() { }
}

export class DCInventoryReportDevicesInfoViewData {
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
  devices: DCInventoryReportDevicesViewData[] = [];
  constructor() { }
}
export class DCInventoryReportDevicesViewData {
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
  constructor() { }
}

