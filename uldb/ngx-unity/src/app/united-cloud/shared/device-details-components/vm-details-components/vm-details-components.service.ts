import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FileData, InterfaceData, IpAddressData, MacData, OSData, ProcessorData, ProductData, ServerData } from './vm-details-components.type';

@Injectable()
export class VmDetailsComponentsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,) { }

  getIpAddresses(deviceId: string): Observable<IpAddressData[]> {
    // let params = new HttpParams().set('device_id', deviceId).set('uuid', deviceId);
    return this.http.get<IpAddressData[]>(`/customer/vmware_vms/${deviceId}/vmware/ip-address/`);
  }

  getOsDetails(deviceId: string): Observable<OSData[]> {
    // let params = new HttpParams().set('device_id', deviceId).set('uuid', deviceId);
    return this.http.get<OSData[]>(`/customer/vmware_vms/${deviceId}/vmware/os-data/`);
  }

  getInterfaceDetails(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<InterfaceData>> {
    return this.tableService.getData<PaginatedResult<InterfaceData>>(`/customer/vmware_vms/${deviceId}/vmware/interface-data/`, criteria);
  }

  getMacAddress(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<MacData>> {
    return this.tableService.getData<PaginatedResult<MacData>>(`/customer/vmware_vms/${deviceId}/vmware/mac-data/`, criteria);
  }

  getCpuProcessor(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ProcessorData>> {
    return this.tableService.getData<PaginatedResult<ProcessorData>>(`/customer/vmware_vms/${deviceId}/vmware/processor-data/`, criteria);
  }

  getProductDetails(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ProductData>> {
    return this.tableService.getData<PaginatedResult<ProductData>>(`/customer/vmware_vms/${deviceId}/vmware/product-data/`, criteria);
  }

  getFileSystemDetails(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<FileData>> {
    return this.tableService.getData<PaginatedResult<FileData>>(`/customer/vmware_vms/${deviceId}/vmware/file-data/`, criteria);
  }

  getServerDetails(deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ServerData>> {
    return this.tableService.getData<PaginatedResult<ServerData>>(`/customer/vmware_vms/${deviceId}/vmware/server-data/`, criteria);
  }

  convertToIPAddressViewData(data: IpAddressData[]): IpAddressViewData[] {
    if (!data || !data.length) return [];
    let viewData: IpAddressViewData[] = [];
    data.forEach(d => {
      let view = new IpAddressViewData();
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

  convertToOSViewData(data: OSData[]): OSViewData[] {
    if (!data || !data.length) return [];
    let viewData: OSViewData[] = [];
    data.forEach(d => {
      let view = new OSViewData();
      view.name = d.Name;
      view.systemName = d.SystemName;
      view.category = d.Category;
      view.osType = d.OSType;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.markAsDeleted = d.MarkAsDeleted;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.marketVersion = d.MarketVersion;
      view.licenseType = d.LicenseType;
      view.description = d.Description;
      view.shortDescription = d.ShortDescription;
      viewData.push(view);
    })
    return viewData;
  }

  convertToInterfaceViewData(data: InterfaceData[]): InterfaceViewData[] {
    const viewData: InterfaceViewData[] = [];

    data.forEach(d => {
      const view = new InterfaceViewData();

      view.tokenId = d.TokenId;
      view.name = d.Name;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      view.lastScanDate = d.LastScanDate;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.manufacturerName = d.ManufacturerName;
      view.networkAddresses = d.NetworkAddresses;
      view.permanentAddress = d.PermanentAddress;
      view.portType = d.PortType;
      view.speed = d.Speed;
      view.company = d.Company;

      viewData.push(view);
    });

    return viewData;
  }

  convertToMacViewData(data: MacData[]): MacViewData[] {
    const viewData: MacViewData[] = [];

    data.forEach(d => {
      const view = new MacViewData();

      view.tokenId = d.TokenId;
      view.name = d.Name;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      view.macAddress = d.MACAddress;
      view.lastScanDate = d.LastScanDate;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.nameFormat = d.NameFormat;
      view.protocolType = d.ProtocolType;
      view.address = d.Address;
      view.company = d.Company;

      viewData.push(view);
    });

    return viewData;
  }


  convertToProcessorViewData(data: ProcessorData[]): ProcessorViewData[] {
    const viewData: ProcessorViewData[] = [];

    data.forEach(d => {
      const view = new ProcessorViewData();

      view.name = d.Name;
      view.shortDescription = d.ShortDescription;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.tokenId = d.TokenId;
      view.description = d.Description;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.serialNumber = d.SerialNumber;
      view.nameFormat = d.NameFormat;
      view.numberOfCores = d.NumberOfCores;
      view.numberOfLogicalProcessors = d.NumberOfLogicalProcessors;
      view.maxClockSpeed = d.MaxClockSpeed;
      view.processorFamily = d.ProcessorFamily;
      view.processorArchitecture = d.ProcessorArchitecture;
      view.processorStatus = d.ProcessorStatus;

      viewData.push(view);
    });

    return viewData;
  }


  convertToProductViewData(data: ProductData[]): ProductViewData[] {
    const viewData: ProductViewData[] = [];

    data.forEach(d => {
      const view = new ProductViewData();

      view.name = d.Name;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.marketVersion = d.MarketVersion;
      view.versionNumber = d.VersionNumber;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.nameFormat = d.NameFormat;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      view.buildNumber = d.BuildNumber;
      view.licenseType = d.LicenseType;

      viewData.push(view);
    });

    return viewData;
  }

  convertToFileViewData(data: FileData[]): FileViewData[] {
    const viewData: FileViewData[] = [];

    data.forEach(d => {
      const view = new FileViewData();

      view.name = d.Name;
      view.fileSystemType = d.FileSystemType;
      view.fileSystemSize = d.FileSystemSize;
      view.availableSpace = d.AvailableSpace;
      view.blockSize = d.BlockSize;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.shortDescription = d.ShortDescription;
      view.description = d.Description;
      view.nameFormat = d.NameFormat;

      viewData.push(view);
    });

    return viewData;
  }


  convertToServerViewData(data: ServerData[]): ServerViewData[] {
    const viewData: ServerViewData[] = [];

    data.forEach(d => {
      const view = new ServerViewData();

      view.name = d.Name;
      view.softwareServerType = d.SoftwareServerType;
      view.shortDescription = d.ShortDescription;
      view.category = d.Category;
      view.type = d.Type;
      view.item = d.Item;
      view.manufacturerName = d.ManufacturerName;
      view.model = d.Model;
      view.versionNumber = d.VersionNumber;
      view.marketVersion = d.MarketVersion;
      view.tokenId = d.TokenId;
      view.nameFormat = d.NameFormat;
      view.description = d.Description;
      view.endOfLife = d.EndOfLife ? this.utilSvc.toUnityOneDateFormat(d.EndOfLife, 'MMM DD, y') : 'N/A';
      view.endOfSupport = d.EndOfSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSupport, 'MMM DD, y') : 'N/A';
      view.endOfSecuritySupport = d.EndOfSecuritySupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfSecuritySupport, 'MMM DD, y') : 'N/A';
      view.endOfExtendedSupport = d.EndOfExtendedSupport ? this.utilSvc.toUnityOneDateFormat(d.EndOfExtendedSupport, 'MMM DD, y') : 'N/A';

      viewData.push(view);
    });

    return viewData;
  }




}

export class IpAddressViewData {
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
  subnetMask: string;
  company: string;
}




export class InterfaceViewData {
  constructor() { };
  tokenId: string;
  name: string;
  shortDescription: string;
  description: string;
  lastScanDate: string;
  category: string;
  type: string;
  item: string;
  manufacturerName: string;
  networkAddresses: string[];
  permanentAddress: string;
  portType: string;
  speed: string;
  company: string;
}



export class MacViewData {
  constructor() { };
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
  protocolType: string;
  address: string;
  company: string;
}




export class IoTViewData {
  constructor() { };
  tokenId: string;
  name: string;
  showDescription: boolean;
  description: string;
  associated: boolean;
  lastScanDate: string; // ISO date
  category: string;
  type: string;
  item: string;
  manufacturer: string;
  protocolType: string;
  address: string;
}




export class OSViewData {
  constructor() { };
  name: string;
  shortDescription: string;
  systemName: string;
  category: string;
  osType: string
  type: string;
  item: string;
  tokenId: string;
  markAsDeleted: string;
  description: string;
  manufacturerName: string;
  model: string;
  marketVersion: string;
  licenseType: string;
}





export class ProcessorViewData {
  constructor() { };
  name: string;
  shortDescription: string;
  category: string;
  type: string;
  item: string;
  tokenId: string;
  description: string;
  manufacturerName: string;
  model: string;
  serialNumber: string;
  nameFormat: string;
  numberOfCores: string;
  numberOfLogicalProcessors: string;
  maxClockSpeed: string;
  processorFamily: string;
  processorArchitecture: string;
  processorStatus: string;
}




export class ProductViewData {
  constructor() { };
  name: string;
  manufacturerName: string;
  model: string;
  marketVersion: string;
  versionNumber: string;
  category: string;
  type: string;
  item: string;
  nameFormat: string;
  shortDescription: string;
  description: string;
  buildNumber: string;
  licenseType: string;
}


export class FileViewData {
  constructor() { };
  name: string;
  fileSystemType: string;
  fileSystemSize: string;
  availableSpace: string;
  blockSize: string;
  category: string;
  type: string;
  item: string;
  shortDescription: string;
  description: string;
  nameFormat: string;
}




export class ServerViewData {
  constructor() { };
  name: string;
  softwareServerType: string;
  shortDescription: string;
  category: string;
  type: string;
  item: string;
  manufacturerName: string;
  model: string;
  versionNumber: string;
  marketVersion: string;
  tokenId: string;
  nameFormat: string;
  description: string;
  endOfLife: string;
  endOfSupport: string;
  endOfSecuritySupport: string;
  endOfExtendedSupport: string;
}
