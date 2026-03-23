import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_EXCEL_ON_BOARD_SUMMARY_DATA } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { OnbSummaryInput } from '../../unity-setup-on-boarding-summary/unity-setup-on-boarding-summary.component';

@Injectable()
export class ExcelOnBoardingSummaryService {
  constructor(private http: HttpClient) { }

  getSummary() {
    return this.http.get<ExcelOnboardingSummaryType>(GET_EXCEL_ON_BOARD_SUMMARY_DATA());
  }

  convertToViewdata(data: ExcelOnboardingSummaryType): ExcelOnboardingSummaryViewdata {
    let viewData = new ExcelOnboardingSummaryViewdata();
    viewData.firewalls = {
      icon: FaIconMapping.FIREWALL,
      deviceType: DeviceMapping.FIREWALL,
      deviceClass: 'firewalls',
      deviceColorVar: 'firewalls',
      count: data.Firewalls.count,
      success: data.Firewalls.success
    };
    viewData.lbs = {
      icon: FaIconMapping.LOAD_BALANCER,
      deviceType: DeviceMapping.LOAD_BALANCER,
      deviceClass: 'lbs',
      deviceColorVar: 'lbs',
      count: data.Load_Balancers.count,
      success: data.Load_Balancers.success
    };
    viewData.switches = {
      icon: FaIconMapping.SWITCH,
      deviceType: DeviceMapping.SWITCHES,
      deviceClass: 'switches',
      deviceColorVar: 'switches',
      count: data.Switches.count,
      success: data.Switches.success
    };
    viewData.servers = {
      icon: FaIconMapping.BARE_METAL_SERVER,
      deviceType: DeviceMapping.BARE_METAL_SERVER,
      deviceClass: 'bms',
      deviceColorVar: 'bms',
      count: data.Bare_Metals.count,
      success: data.Bare_Metals.success
    };
    viewData.storage = {
      icon: FaIconMapping.STORAGE_DEVICE,
      deviceType: DeviceMapping.STORAGE_DEVICES,
      deviceClass: 'storage',
      deviceColorVar: 'storage',
      count: data.Storage.count,
      success: data.Storage.success
    };
    viewData.hypervisors = {
      icon: FaIconMapping.HYPERVISOR,
      deviceType: DeviceMapping.HYPERVISOR,
      deviceClass: 'hypervisor',
      deviceColorVar: 'hypervisor',
      count: data.Hypervisors.count,
      success: data.Hypervisors.success
    };
    viewData.pdus = {
      icon: FaIconMapping.PDU,
      deviceType: DeviceMapping.PDU,
      deviceClass: 'pdu',
      deviceColorVar: 'pdus',
      count: data.PDUs.count,
      success: data.PDUs.success
    };
    viewData.mac = {
      icon: FaIconMapping.MAC_MINI,
      deviceType: DeviceMapping.MAC_MINI,
      deviceClass: 'mac',
      deviceColorVar: 'otherdev',
      count: data.MAC_Mini.count,
      success: data.MAC_Mini.success
    };
    viewData.mobiles = {
      icon: FaIconMapping.MOBILE_DEVICE,
      deviceType: DeviceMapping.MOBILE_DEVICE,
      deviceClass: 'mobile',
      deviceColorVar: 'vms',
      count: data.Mobile_Devices.count,
      success: data.Mobile_Devices.success
    };
    viewData.database = {
      icon: FaIconMapping.DATABASE,
      deviceType: DeviceMapping.DB_SERVER,
      deviceClass: 'database',
      deviceColorVar: 'database',
      count: data.Databases.count,
      success: data.Databases.success
    };
    viewData.dcs = {
      icon: 'cfa-datacenter',
      deviceType: DeviceMapping.DC_VIZ,
      deviceClass: 'dcs',
      deviceColorVar: 'database',
      count: data.Datacenters.count,
      success: data.Datacenters.success
    };
    viewData.cabinets = {
      icon: FaIconMapping.CABINET,
      deviceType: DeviceMapping.CABINET_VIZ,
      deviceClass: 'cabinets',
      deviceColorVar: 'cabinets',
      count: data.Cabinets.count,
      success: data.Cabinets.success
    }
    return viewData;
  }
}


export class ExcelOnboardingSummaryViewdata {
  firewalls: OnbSummaryInput;
  servers: OnbSummaryInput;
  lbs: OnbSummaryInput;
  switches: OnbSummaryInput;
  storage: OnbSummaryInput;
  mac: OnbSummaryInput;
  pdus: OnbSummaryInput;
  hypervisors: OnbSummaryInput;
  mobiles: OnbSummaryInput;
  dcs: OnbSummaryInput;
  cabinets: OnbSummaryInput;
  database: OnbSummaryInput;
}

export interface ExcelOnboardingSummaryType {
  Cabinets: ExcelSummaryDetails;
  Load_Balancers: ExcelSummaryDetails;
  Switches: ExcelSummaryDetails;
  Hypervisors: ExcelSummaryDetails;
  Bare_Metals: ExcelSummaryDetails;
  Datacenters: ExcelSummaryDetails;
  Firewalls: ExcelSummaryDetails;
  PDUs: ExcelSummaryDetails;
  Mobile_Devices: ExcelSummaryDetails;
  Storage: ExcelSummaryDetails;
  MAC_Mini: ExcelSummaryDetails;
  Databases: ExcelSummaryDetails;
}
export interface ExcelSummaryDetails {
  count: number;
  failed: number;
  success: number;
}