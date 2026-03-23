import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DELETE_EXCEL_ON_BOARD_DATA, GET_EXCEL_ON_BOARD_DATA } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ExcelOnBoardingBmsType } from '../excel-on-boarding-bms/excel-on-boarding-bms.service';
import { ExcelOnBoardingCabinetType } from '../excel-on-boarding-cabinets/excel-on-boarding-cabinets.service';
import { ExcelOnBoardingDCType } from '../excel-on-boarding-data-centers/excel-on-boarding-data-centers.service';
import { ExcelOnBoardingFirewallType } from '../excel-on-boarding-firewalls/excel-on-boarding-firewalls.service';
import { ExcelOnBoardingHypervisorType } from '../excel-on-boarding-hypervisors/excel-on-boarding-hypervisors.service';
import { ExcelOnBoardingLoadbalancerType } from '../excel-on-boarding-loadbalancers/excel-on-boarding-loadbalancers.service';
import { ExcelOnBoardingMacType } from '../excel-on-boarding-mac/excel-on-boarding-mac.service';
import { ExcelOnBoardingMobileType } from '../excel-on-boarding-mobiles/excel-on-boarding-mobiles.service';
import { ExcelOnBoardingPDUType } from '../excel-on-boarding-pdu/excel-on-boarding-pdu.service';
import { ExcelOnBoardingStorageType } from '../excel-on-boarding-storage/excel-on-boarding-storage.service';
import { ExcelOnBoardingSwitchType } from '../excel-on-boarding-switches/excel-on-boarding-switches.service';
import { ExcelOnBoardingDatabaseType } from '../excel-on-boarding-database/excel-on-boarding-database.service';

@Injectable()
export class ExcelOnBoardingInventoryService {
  constructor(private http: HttpClient,
    private userInfo: UserInfoService) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getInventory(arr: string[]) {
    return this.http.get<PaginatedResult<ExcelOnboardingInventoryType>>(GET_EXCEL_ON_BOARD_DATA(), { params: this.setParams(arr) });
  }

  convertToViewdata(data: ExcelOnboardingInventoryType[]): ExcelOnboardingInventoryViewdata {
    let view = new ExcelOnboardingInventoryViewdata();
    data.forEach(d => {

      if (d.onb_data.PDUs) {
        d.onb_data.PDUs.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.pdus = view.pdus.concat(d.onb_data.PDUs);
      }

      if (d.onb_data.Firewalls) {
        d.onb_data.Firewalls.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.firewalls = view.firewalls.concat(d.onb_data.Firewalls);
      }

      if (d.onb_data.Switches) {
        d.onb_data.Switches.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.switches = view.switches.concat(d.onb_data.Switches);
      }

      if (d.onb_data.Load_Balancers) {
        d.onb_data.Load_Balancers.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.lbs = view.lbs.concat(d.onb_data.Load_Balancers);
      }

      if (d.onb_data.Bare_Metals) {
        d.onb_data.Bare_Metals.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.bms = view.bms.concat(d.onb_data.Bare_Metals);
      }

      if (d.onb_data.Hypervisors) {
        d.onb_data.Hypervisors.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.hypervisors = view.hypervisors.concat(d.onb_data.Hypervisors);
      }

      if (d.onb_data.Storage) {
        d.onb_data.Storage.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.storage = view.storage.concat(d.onb_data.Storage);
      }

      if (d.onb_data.MAC_Mini) {
        d.onb_data.MAC_Mini.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.mac = view.mac.concat(d.onb_data.MAC_Mini);
      }

      if (d.onb_data.Mobile_Devices) {
        d.onb_data.Mobile_Devices.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.mobiles = view.mobiles.concat(d.onb_data.Mobile_Devices);
      }

      if (d.onb_data.Datacenters) {
        d.onb_data.Datacenters.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.dcs = view.dcs.concat(d.onb_data.Datacenters);
      }

      if (d.onb_data.Cabinets) {
        d.onb_data.Cabinets.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.cabinets = view.cabinets.concat(d.onb_data.Cabinets);
      }

      if (d.onb_data.Databases) {
        d.onb_data.Databases.map(f => { f.file_name = d.file_name; f.uuid = d.uuid });
        view.database = view.database.concat(d.onb_data.Databases);
      }

      view.total = view.firewalls.length + view.bms.length + view.lbs.length +
        + view.switches.length + view.storage.length + view.mac.length
        + view.pdus.length + view.hypervisors.length + view.mobiles.length
        + view.dcs.length + view.cabinets.length + view.database.length;
    });
    return view;
  }

  deleteDevice(data: { unique_id: string, uuid: string, device_type: string }) {
    let params = new HttpParams().set('unique_id', data.unique_id).set('uuid', data.uuid).set('device_type', data.device_type);
    return this.http.delete<PaginatedResult<ExcelOnboardingInventoryType>>(DELETE_EXCEL_ON_BOARD_DATA(), { params: params });
  }
}

export class ExcelOnboardingInventoryViewdata {
  constructor() { }
  firewalls: ExcelOnBoardingFirewallType[] = [];
  bms: ExcelOnBoardingBmsType[] = [];
  lbs: ExcelOnBoardingLoadbalancerType[] = [];
  switches: ExcelOnBoardingSwitchType[] = [];
  storage: ExcelOnBoardingStorageType[] = [];
  mac: ExcelOnBoardingMacType[] = [];
  pdus: ExcelOnBoardingPDUType[] = [];
  hypervisors: ExcelOnBoardingHypervisorType[] = [];
  mobiles: ExcelOnBoardingMobileType[] = [];
  dcs: ExcelOnBoardingDCType[] = [];
  cabinets: ExcelOnBoardingCabinetType[] = [];
  database: ExcelOnBoardingDatabaseType[] = [];
  total: number;
}

export interface ExcelOnboardingInventoryType {
  user: string;
  updated_at: string;
  uuid: string;
  file_name: string;
  onb_data: {
    Load_Balancers: ExcelOnBoardingLoadbalancerType[];
    Bare_Metals: ExcelOnBoardingBmsType[];
    Mobile_Devices: ExcelOnBoardingMobileType[];
    MAC_Mini: ExcelOnBoardingMacType[];
    Cabinets: ExcelOnBoardingCabinetType[];
    PDUs: ExcelOnBoardingPDUType[];
    Storage: ExcelOnBoardingStorageType[];
    Switches: ExcelOnBoardingSwitchType[];
    Hypervisors: ExcelOnBoardingHypervisorType[];
    Datacenters: ExcelOnBoardingDCType[];
    Firewalls: ExcelOnBoardingFirewallType[];
    Databases: ExcelOnBoardingDatabaseType[];
  }
}