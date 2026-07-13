import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { StorageDeviceDetailsInterfaceType, StorageDeviceDetailsIpAddressType, StorageDeviceDetailsMacAddressType, StorageDeviceDetailsOSType } from './storage-details-components.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class StorageDetailsComponentsService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private builder: FormBuilder) { }

  getIpAddressData(deviceId: string): Observable<StorageDeviceDetailsIpAddressType[]> {
    return this.http.get<StorageDeviceDetailsIpAddressType[]>(`/customer/storagedevices/${deviceId}/storage/ip-address/`);
  }

  getMacAddressData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<StorageDeviceDetailsMacAddressType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<StorageDeviceDetailsMacAddressType>>(`/customer/storagedevices/${deviceId}/storage/mac-data/`, { params: params });
  }

  getInterfaceData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<StorageDeviceDetailsInterfaceType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<StorageDeviceDetailsInterfaceType>>(`/customer/storagedevices/${deviceId}/storage/interface-data/`, { params: params });
  }

  getOSData(deviceId: string): Observable<StorageDeviceDetailsOSType[]> {
    return this.http.get<StorageDeviceDetailsOSType[]>(`/customer/storagedevices/${deviceId}/storage/os-data/`);
  }

  convertToIPAddressViewData(data: StorageDeviceDetailsIpAddressType[]): IPAddressViewData[] {
    if (!data || !data.length) return [];
    let viewData: IPAddressViewData[] = [];
    data.forEach(d => {
      let view = new IPAddressViewData();
      view.name = d.Name;
      view.category = d.Category;
      view.managementAddress = d.ManagementAddress;
      view.addressType = d.AddressType;
      view.tokenId = d.TokenId;
      view.protocolType = d.ProtocolType;
      view.type = d.Type;
      view.markAsDeleted = d.MarkAsDeleted;
      view.dnsHostName = d.DNSHostName;
      view.item = d.Item;
      view.address = d.Address;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToMacAddressViewData(data: StorageDeviceDetailsMacAddressType[]): MacAddressViewData[] {
    let viewData: MacAddressViewData[] = [];
    data.forEach(d => {
      let view: MacAddressViewData = new MacAddressViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.macAddress = d.MACAddress;
      view.address = d.Address;
      view.protocolType = d.ProtocolType;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.company = d.Company;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToInterfaceViewData(data: StorageDeviceDetailsInterfaceType[]): InterfaceViewData[] {
    let viewData: InterfaceViewData[] = [];
    data.forEach(d => {
      let view: InterfaceViewData = new InterfaceViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.manufacturerName = d.ManufacturerName;
      view.networkAddresses = d.NetworkAddresses;
      view.permanentAddress = d.PermanentAddress;
      view.portType = d.PortType;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.speed = d.Speed;
      view.company = d.Company;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToOSViewData(data: StorageDeviceDetailsOSType[]): OSViewData[] {
    if (!data || !data.length) return [];
    let viewData: OSViewData[] = [];
    data.forEach(d => {
      let a = new OSViewData();
      a.name = d.Name;
      a.systemName = d.SystemName;
      a.category = d.Category;
      a.osType = d.OSType;
      a.type = d.Type;
      a.item = d.Item;
      a.tokenId = d.TokenId;
      a.markAsDeleted = d.MarkAsDeleted;
      a.manufacturerName = d.ManufacturerName;
      a.model = d.Model;
      a.marketVersion = d.MarketVersion;
      a.licenseType = d.LicenseType;
      a.description = d.Description;
      a.shortDescription = d.ShortDescription;
      viewData.push(a);
    })
    return viewData;
  }

}

export class IPAddressViewData {
  constructor() { }
  name: string;
  category: string;
  managementAddress: string;
  addressType: string;
  tokenId: string;
  protocolType: string;
  type: string;
  markAsDeleted: string;
  dnsHostName: string;
  item: string;
  address: string;
  shortDescription: string;
  description: string;
}

export class MacAddressViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  macAddress: string;
  address: string;
  protocolType: string;
  category: string;
  type: string;
  item: string;
  tokenId: string;
  company: string;
  shortDescription: string;
  description: string;
}

export class InterfaceViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  manufacturerName: string;
  networkAddresses: string[];
  permanentAddress: string;
  portType: string;
  category: string;
  type: string;
  item: string;
  tokenId: string;
  speed: string;
  company: string;
  shortDescription: string;
  description: string;
}

export class OSViewData {
  constructor() { }
  name: string;
  systemName: string;
  category: string;
  osType: string;
  type: string;
  item: string;
  tokenId: string;
  markAsDeleted: string;
  manufacturerName: string;
  model: string;
  marketVersion: string;
  licenseType: string;
  description: string;
  shortDescription: string;
}