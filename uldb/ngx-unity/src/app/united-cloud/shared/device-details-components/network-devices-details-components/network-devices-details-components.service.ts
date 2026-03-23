import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DynamicFormField } from '../device-details-components.service';
import { NetworkDevicesDetailsHardwareData, NetworkDevicesDetailsInterfaceData, NetworkDevicesDetailsIPAddress, NetworkDevicesDetailsMacData } from './network-devices-details-components.type';

@Injectable()
export class NetworkDevicesDetailsComponentsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getIpAddressData(deviceType: DeviceMapping, deviceId: string): Observable<NetworkDevicesDetailsIPAddress> {
    const deviceApiType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(deviceType);
    return this.http.get<NetworkDevicesDetailsIPAddress>(`/customer/${deviceApiType}/${deviceId}/network/ip-address/`);
  }

  getMacAddressData(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<NetworkDevicesDetailsMacData>> {
    const deviceApiType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(deviceType);
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<NetworkDevicesDetailsMacData>>(`/customer/${deviceApiType}/${deviceId}/network/mac-addresses/`, { params: params });
  }

  convertToMacAddressViewData(data: NetworkDevicesDetailsMacData[]): NetworkDeviceMacAddressViewData[] {
    let viewData: NetworkDeviceMacAddressViewData[] = [];
    data.forEach(d => {
      let a = new NetworkDeviceMacAddressViewData();
      a.tokenId = d.TokenId;
      a.name = d.Name;
      a.shortDescription = d.ShortDescription;
      a.description = d.Description;
      a.macAddress = d.MACAddress;
      a.lastScanDate = d.LastScanDate ? this.utilSvc.toUnityOneDateFormat(d.LastScanDate) : 'N/A';
      a.category = d.Category;
      a.type = d.Type;
      a.item = d.Item;
      a.nameFormat = d.NameFormat;
      a.protocalType = d.ProtocolType;
      a.address = d.Address;
      a.company = d.Company;
      viewData.push(a);
    })
    return viewData;
  }

  getInterfaceData(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<NetworkDevicesDetailsInterfaceData>> {
    const deviceApiType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(deviceType);
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<NetworkDevicesDetailsInterfaceData>>(`/customer/${deviceApiType}/${deviceId}/network/interfaces/`, { params: params });
  }

  convertToInterfaceViewData(data: NetworkDevicesDetailsInterfaceData[]): NetworkDeviceInterfacesViewData[] {
    let viewData: NetworkDeviceInterfacesViewData[] = [];
    data.forEach(d => {
      let a = new NetworkDeviceInterfacesViewData();
      a.tokenId = d.TokenId;
      a.name = d.Name;
      a.shortDescription = d.ShortDescription;
      a.description = d.Description;
      a.lastScanDate = d.LastScanDate ? this.utilSvc.toUnityOneDateFormat(d.LastScanDate) : 'N/A';
      a.category = d.Category;
      a.type = d.Type;
      a.item = d.Item;
      a.manufacturer = d.ManufacturerName;
      a.networkAddresses = d.NetworkAddresses;
      a.permanentAddress = d.PermanentAddress;
      a.portType = d.PortType;
      a.company = d.Company;
      viewData.push(a);
    })
    return viewData;
  }

  getOSData(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    const deviceApiType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(deviceType);
    return this.http.get<any>(`/customer/${deviceApiType}/${deviceId}/network/os-data/`);
  }

  getHardwareComponentsData(deviceType: DeviceMapping, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<NetworkDevicesDetailsHardwareData>> {
    const deviceApiType = this.utilSvc.getDeviceAPIPluralMappingByDeviceMapping(deviceType);
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<NetworkDevicesDetailsHardwareData>>(`/customer/${deviceApiType}/${deviceId}/network/hardware/`, { params: params });
  }

  convertToHWComponentsViewData(data: NetworkDevicesDetailsHardwareData[]): NetworkDeviceHWComponentsViewData[] {
    let viewData: NetworkDeviceHWComponentsViewData[] = [];
    data.forEach(d => {
      let a = new NetworkDeviceHWComponentsViewData();
      a.tokenId = d.TokenId;
      a.name = d.Name;
      a.manufacturer = d.ManufacturerName;
      a.shortDescription = d.ShortDescription;
      a.version = d.VersionNumber;
      a.description = d.Description;
      a.serialNumber = d.SerialNumber;
      a.category = d.Category;
      a.type = d.Type;
      a.item = d.Item;
      a.model = d.Model;
      a.marketVersion = d.MarketVersion;
      a.company = d.Company;
      a.endOfLife = d.EndOfLife ? this.utilSvc.toUnityOneDateFormat(d.EndOfLife) : 'N/A';
      a.endOfSupport = d.EndOfSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSupport) : 'N/A';
      a.endOfSecuritySupport = d.EndOfSecuritySupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSecuritySupport) : 'N/A';
      a.endOfExtendedSupport = d.EndOfExtendedSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfExtendedSupport) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }

  buildForm(fields: DynamicFormField[], data: any): FormGroup {
    if (!fields || !fields.length) {
      return null;
    }
    const group: any = {};
    fields.forEach(field => {
      group[field.key] = [
        data[field.key] ?? '',
        field.required ? Validators.required : []
      ];
    });
    return this.builder.group(group);
  }

  generateSchemaFromJson(data: any): DynamicFormField[] {
    if (!data) {
      return [];
    }
    return Object.keys(data).map(key => {
      const value = data[key];
      let type: DynamicFormField['type'] = 'text';
      if (typeof value === 'number') type = 'number';
      if (typeof value === 'boolean') type = 'checkbox';
      if (key.toLowerCase().includes('date')) type = 'date';
      if (key.toLowerCase().includes('description')) type = 'textarea';
      return {
        key,
        label: this.toLabel(key),
        type,
        readonly: true
      };
    });
  }

  toLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }
}

export class NetworkDeviceMacAddressViewData {
  constructor() { }
  tokenId: string;
  name: string;
  shortDescription: string;
  description: string;
  macAddress: string;
  lastScanDate: string;
  category: string;
  type: string;
  item: string;
  nameFormat: string;
  protocalType: string;
  address: string;
  company: string;
}

export class NetworkDeviceInterfacesViewData {
  constructor() { }
  tokenId: string;
  name: string;
  shortDescription: string;
  description: string;
  lastScanDate: string;
  category: string;
  type: string;
  item: string;
  manufacturer: string;
  networkAddresses: string[];
  permanentAddress: string;
  portType: string;
  company: string;
}

export class NetworkDeviceHWComponentsViewData {
  constructor() { }
  tokenId: string;
  name: string;
  manufacturer: string;
  version: string;
  serialNumber: string;
  shortDescription: string;
  category: string;
  type: string;
  item: string;
  model: string;
  marketVersion: string;
  description: string;
  company: string;
  endOfLife: string;
  endOfSupport: string;
  endOfSecuritySupport: string;
  endOfExtendedSupport: string;
}
