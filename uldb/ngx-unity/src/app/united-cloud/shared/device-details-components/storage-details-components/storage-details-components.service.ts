import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { StorageDeviceDetailsInterfaceType, StorageDeviceDetailsIpAddressType, StorageDeviceDetailsMacAddressType, StorageDeviceDetailsOperationSystemType } from './storage-details-components.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class StorageDetailsComponentsService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private builder: FormBuilder) { }

  getIpAddressData(deviceId: string): Observable<StorageDeviceDetailsIpAddressType> {
    return this.http.get<StorageDeviceDetailsIpAddressType>(`/customer/storagedevices/${deviceId}/storage/ip-address/`);
  }

  getMacAddressData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<StorageDeviceDetailsMacAddressType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<StorageDeviceDetailsMacAddressType>>(`/customer/storagedevices/${deviceId}/storage/mac-data/`, { params: params });
  }

  getInterfaceData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<StorageDeviceDetailsInterfaceType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<StorageDeviceDetailsInterfaceType>>(`/customer/storagedevices/${deviceId}/storage/interface-data/`, { params: params });
  }

  getOperationSystemData(deviceId: string): Observable<StorageDeviceDetailsOperationSystemType> {
    return this.http.get<StorageDeviceDetailsOperationSystemType>(`/customer/storagedevices/${deviceId}/storage/os-data/`);
  }

  buildIpAddressForm(data: StorageDeviceDetailsIpAddressType): FormGroup {
    return this.builder.group({
      'Name': [{ value: data?.Name ?? '', disabled: true }],
      'NameFormat': [{ value: data?.NameFormat ?? '', disabled: true }],
      'Address': [{ value: data?.Address ?? '', disabled: true }],
      'AddressType': [{ value: data?.AddressType ?? '', disabled: true }],
      'ProtocolType': [{ value: data?.ProtocolType ?? '', disabled: true }],
      'SubnetMask': [{ value: data?.SubnetMask ?? '', disabled: true }],
      'Category': [{ value: data?.Category ?? '', disabled: true }],
      'Type': [{ value: data?.Type ?? '', disabled: true }],
      'Item': [{ value: data?.Item ?? '', disabled: true }],
      'DNSHostName': [{ value: data?.DNSHostName ?? '', disabled: true }],
      'ManagementAddress': [{ value: data?.ManagementAddress ?? '', disabled: true }],
      'Company': [{ value: data?.Company ?? '', disabled: true }],
      'ShortDescription': [{ value: data?.ShortDescription ?? '', disabled: true }],
      'Description': [{ value: data?.Description ?? '', disabled: true }],
    })
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

  buildOperationSystemForm(data: StorageDeviceDetailsOperationSystemType): FormGroup {
    return this.builder.group({
      'Name': [{ value: data?.Name ?? '', disabled: true }],
      'NameFormat': [{ value: data?.NameFormat ?? '', disabled: true }],
      'VersionNumber': [{ value: data?.VersionNumber ?? '', disabled: true }],
      'BuildNumber': [{ value: data?.BuildNumber ?? '', disabled: true }],
      'Category': [{ value: data?.Category ?? '', disabled: true }],
      'Type': [{ value: data?.Type ?? '', disabled: true }],
      'Item': [{ value: data?.Item ?? '', disabled: true }],
      'ManufacturerName': [{ value: data?.ManufacturerName ?? '', disabled: true }],
      'Model': [{ value: data?.Model ?? '', disabled: true }],
      'MarketVersion': [{ value: data?.MarketVersion ?? '', disabled: true }],
      'ServicePack': [{ value: data?.ServicePack ?? '', disabled: true }],
      'LicenseType': [{ value: data?.LicenseType ?? '', disabled: true }],
      'EndOfLife': [{ value: data?.EndOfLife ?? '', disabled: true }],
      'EndOfSupport': [{ value: data?.EndOfSupport ?? '', disabled: true }],
      'EndOfSecuritySupport': [{ value: data?.EndOfSecuritySupport ?? '', disabled: true }],
      'EndOfExtendedSupport': [{ value: data?.EndOfExtendedSupport ?? '', disabled: true }],
      'ShortDescription': [{ value: data?.ShortDescription ?? '', disabled: true }],
      'Description': [{ value: data?.Description ?? '', disabled: true }],
    })
  }
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