import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BaremetalDeviceDetailsCpuProcessorsType, BaremetalDeviceDetailsFileSystemType, BaremetalDeviceDetailsInterfaceType, BaremetalDeviceDetailsIpAddressType, BaremetalDeviceDetailsMacAddressType, BaremetalDeviceDetailsOperationSystemType, BaremetalDeviceDetailsProductType, BaremetalDeviceDetailsSoftwareServerType } from './baremetal-details-components.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class BaremetalDetailsComponentsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getIpAddressData(deviceId: string): Observable<BaremetalDeviceDetailsIpAddressType> {
    return this.http.get<BaremetalDeviceDetailsIpAddressType>(`/customer/bm_servers/${deviceId}/baremetal/ip-address/`);
  }

  getMacAddressData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsMacAddressType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsMacAddressType>>(`/customer/bm_servers/${deviceId}/baremetal/mac-addresses/`, { params: params });
  }

  getCpuProcessorsData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsCpuProcessorsType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsCpuProcessorsType>>(`/customer/bm_servers/${deviceId}/baremetal/hardware/`, { params: params });
  }

  getInterfaceData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsInterfaceType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsInterfaceType>>(`/customer/bm_servers/${deviceId}/baremetal/interfaces/`, { params: params });
  }

  getProductData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsProductType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsProductType>>(`/customer/bm_servers/${deviceId}/baremetal/software/`, { params: params });
  }

  getFileSystemData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsFileSystemType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsFileSystemType>>(`/customer/bm_servers/${deviceId}/baremetal/storage/`, { params: params });
  }

  getSoftwareServerData(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<BaremetalDeviceDetailsSoftwareServerType>> {
    const params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<BaremetalDeviceDetailsSoftwareServerType>>(`/customer/bm_servers/${deviceId}/baremetal/servers/`, { params: params });
  }

  getOperationSystemData(deviceId: string): Observable<BaremetalDeviceDetailsOperationSystemType> {
    return this.http.get<BaremetalDeviceDetailsOperationSystemType>(`/customer/bm_servers/${deviceId}/baremetal/os-data/`);
  }

  buildIpAddressForm(data: BaremetalDeviceDetailsIpAddressType): FormGroup {
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
      'TokenId': [{ value: data?.TokenId ?? '', disabled: true }],
      'LastScanDate': [{ value: data?.LastScanDate ?? '', disabled: true }],
      'ManagementAddress': [{ value: data?.ManagementAddress ?? '', disabled: true }],
      'Company': [{ value: data?.Company ?? '', disabled: true }],
      'ShortDescription': [{ value: data?.ShortDescription ?? '', disabled: true }],
      'Description': [{ value: data?.Description ?? '', disabled: true }],
    })
  }

  convertToMacAddressViewData(data: BaremetalDeviceDetailsMacAddressType[]): MacAddressViewData[] {
    let viewData: MacAddressViewData[] = [];
    data.forEach(d => {
      let view: MacAddressViewData = new MacAddressViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.macAddress = d.MACAddress;
      view.protocolType = d.ProtocolType;
      view.address = d.Address;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.lastScanDate = d.LastScanDate ? this.utilSvc.toUnityOneDateFormat(d.LastScanDate) : 'N/A';
      view.tokenId = d.TokenId;
      view.company = d.Company;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToCpuProcessorsViewData(data: BaremetalDeviceDetailsCpuProcessorsType[]): CpuProcessorsViewData[] {
    let viewData: CpuProcessorsViewData[] = [];
    data.forEach(d => {
      let view: CpuProcessorsViewData = new CpuProcessorsViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.serialNumber = d.SerialNumber;
      view.maxClockSpeed = d.MaxClockSpeed;
      view.numberOfCores = d.NumberOfCores;
      view.numberOfLogicalProcessors = d.NumberOfLogicalProcessors;
      view.processorArchitecture = d.ProcessorArchitecture;
      view.processorFamily = d.ProcessorFamily;
      view.processorType = d.ProcessorType;
      view.processorStatus = d.ProcessorStatus;
      view.company = d.Company;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToInterfaceViewData(data: BaremetalDeviceDetailsInterfaceType[]): InterfaceViewData[] {
    let viewData: InterfaceViewData[] = [];
    data.forEach(d => {
      let view: InterfaceViewData = new InterfaceViewData();
      view.name = d.Name;
      view.manufacturerName = d.ManufacturerName;
      view.networkAddresses = d.NetworkAddresses;
      view.permanentAddress = d.PermanentAddress;
      view.portType = d.PortType;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.lastScanDate = d.LastScanDate ? this.utilSvc.toUnityOneDateFormat(d.LastScanDate) : 'N/A';
      view.tokenId = d.TokenId;
      view.speed = d.Speed;
      view.company = d.Company;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToProductViewData(data: BaremetalDeviceDetailsProductType[]): ProductViewData[] {
    let viewData: ProductViewData[] = [];
    data.forEach(d => {
      let view: ProductViewData = new ProductViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.buildNumber = d.BuildNumber;
      view.versionNumber = d.VersionNumber;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.marketVersion = d.MarketVersion;
      view.licenseType = d.LicenseType;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToFileSystemViewData(data: BaremetalDeviceDetailsFileSystemType[]): FileSystemViewData[] {
    let viewData: FileSystemViewData[] = [];
    data.forEach(d => {
      let view: FileSystemViewData = new FileSystemViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.fileSystemSize = d.FileSystemSize;
      view.fileSystemType = d.FileSystemType;
      view.availableSpace = d.AvailableSpace;
      view.blockSize = d.BlockSize;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  convertToSoftwareServerViewData(data: BaremetalDeviceDetailsSoftwareServerType[]): SoftwareServerViewData[] {
    let viewData: SoftwareServerViewData[] = [];
    data.forEach(d => {
      let view: SoftwareServerViewData = new SoftwareServerViewData();
      view.name = d.Name;
      view.nameFormat = d.NameFormat;
      view.versionNumber = d.VersionNumber;
      view.softwareServerType = d.SoftwareServerType;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.marketVersion = d.MarketVersion;
      view.endOfLife = d.EndOfLife ? this.utilSvc.toUnityOneDateFormat(d.EndOfLife, 'MMM DD, y') : 'N/A';
      view.endOfSupport = d.EndOfSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSupport, 'MMM DD, y') : 'N/A';
      view.endOfExtendedSupport = d.EndOfExtendedSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfExtendedSupport, 'MMM DD, y') : 'N/A';
      view.endOfSecuritySupport = d.EndOfSecuritySupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSecuritySupport, 'MMM DD, y') : 'N/A';
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      viewData.push(view);
    })
    return viewData;
  }

  buildOperationSystemForm(data: BaremetalDeviceDetailsOperationSystemType): FormGroup {
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
      'TokenId': [{ value: data?.TokenId ?? '', disabled: true }],
      'OSType': [{ value: data?.OSType ?? '', disabled: true }],
      'ServicePack': [{ value: data?.ServicePack ?? '', disabled: true }],
      'LicenseType': [{ value: data?.LicenseType ?? '', disabled: true }],
      'Company': [{ value: data?.Company ?? '', disabled: true }],
      'LastScanDate': [{ value: data?.LastScanDate ?? '', disabled: true }],
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
  protocolType: string;
  address: string;
  category: string;
  type: string;
  item: string;
  lastScanDate: string;
  tokenId: string;
  company: string;
  shortDescription: string;
  description: string;
}

export class CpuProcessorsViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  category: string;
  type: string;
  item: string;
  tokenId: string;
  manufacturerName: string;
  model: string;
  serialNumber: string;
  maxClockSpeed: string;
  numberOfCores: string;
  numberOfLogicalProcessors: string;
  processorArchitecture: string;
  processorFamily: string;
  processorType: string;
  processorStatus: string;
  company: string;
  description: string;
  shortDescription: string;
}

export class InterfaceViewData {
  constructor() { }
  name: string;
  manufacturerName: string;
  networkAddresses: string[];
  permanentAddress: string;
  portType: string;
  category: string;
  type: string;
  item: string;
  lastScanDate: string;
  tokenId: string;
  speed: string;
  company: string;
  shortDescription: string;
  description: string;
}

export class ProductViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  buildNumber: string;
  versionNumber: string;
  category: string;
  type: string;
  item: string;
  manufacturerName: string;
  model: string;
  marketVersion: string;
  licenseType: string;
  shortDescription: string;
  description: string;
}

export class FileSystemViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  fileSystemSize: string;
  fileSystemType: string;
  availableSpace: string;
  blockSize: string;
  category: string;
  type: string;
  item: string;
  shortDescription: string;
  description: string;
}

export class SoftwareServerViewData {
  constructor() { }
  name: string;
  nameFormat: string;
  versionNumber: string;
  softwareServerType: string;
  category: string;
  type: string;
  item: string;
  tokenId: string;
  manufacturerName: string;
  model: string;
  marketVersion: string;
  endOfLife: string;
  endOfSupport: string;
  endOfSecuritySupport: string;
  endOfExtendedSupport: string;
  shortDescription: string;
  description: string;
}