export interface IpAddressData {
  Name: string;
  ShortDescription: string;
  Category: string;
  Type: string;
  Item: string;
  DNSHostName: string;
  TokenId: string;
  Description: string;
  NameFormat: string;
  Address: string;
  AddressType: string;
  ProtocolType: string;
  SubnetMask: string;
  ManagementAddress: string;
  Company: string;
}

export interface InterfaceData {
  TokenId: string;
  Name: string;
  ShortDescription: string;
  Description: string;
  LastScanDate: string;
  Category: string;
  Type: string;
  Item: string;
  ManufacturerName: string;
  NetworkAddresses: string[];
  PermanentAddress: string;
  PortType: string;
  Speed: string;
  Company: string;
}

export interface MacData {
  TokenId: string;
  Name: string;
  ShortDescription: string;
  Description: string;
  MACAddress: string;
  LastScanDate: string;
  Category: string;
  Type: string;
  Item: string;
  NameFormat: string;
  ProtocolType: string;
  Address: string;
  Company: string;
}

export interface IoTData {
  TokenId: string;
  Name: string;
  ShowDescription: boolean;
  Description: string;
  Associated: boolean;
  LastScanDate: string; // ISO date
  Category: string;
  Type: string;
  Item: string;
  Manufacturer: string;
  ProtocolType: string;
  Address: string;
}

export interface OSData {
  Name: string;
  ShortDescription: string;
  Category: string;
  Type: string;
  Item: string;
  TokenId: string;
  Description: string;
  OSType: string;
  ManufacturerName: string;
  Model: string;
  VersionNumber: string;
  BuildNumber: string;
  ServicePack: string;
  NameFormat: string;
  MarketVersion: string;
  LicenseType: string;
  Company: string;
  EndOfLife: string;
  EndOfSupport: string;
  EndOfSecuritySupport: string;
  EndOfExtendedSupport: string;
}

export interface ProcessorData {
  Name: string;
  ShortDescription: string;
  Category: string;
  Type: string;
  Item: string;
  TokenId: string;
  Description: string;
  ManufacturerName: string;
  Model: string;
  SerialNumber: string;
  NameFormat: string;
  NumberOfCores: string;
  NumberOfLogicalProcessors: string;
  MaxClockSpeed: string;
  ProcessorFamily: string;
  ProcessorArchitecture: string;
  ProcessorStatus: string;
}

export interface ProductData {
  Name: string;
  ManufacturerName: string;
  Model: string;
  MarketVersion: string;
  VersionNumber: string;
  Category: string;
  Type: string;
  Item: string;
  NameFormat: string;
  ShortDescription: string;
  Description: string;
  BuildNumber: string;
  LicenseType: string;
}

export interface FileData {
  Name: string;
  FileSystemType: string;
  FileSystemSize: string;
  AvailableSpace: string;
  BlockSize: string;
  Category: string;
  Type: string;
  Item: string;
  ShortDescription: string;
  Description: string;
  NameFormat: string;
}

export interface ServerData {
  Name: string;
  SoftwareServerType: string;
  ShortDescription: string;
  Category: string;
  Type: string;
  Item: string;
  ManufacturerName: string;
  Model: string;
  VersionNumber: string;
  MarketVersion: string;
  TokenId: string;
  NameFormat: string;
  Description: string;
  EndOfLife: string;
  EndOfSupport: string;
  EndOfSecuritySupport: string;
  EndOfExtendedSupport: string;
}
