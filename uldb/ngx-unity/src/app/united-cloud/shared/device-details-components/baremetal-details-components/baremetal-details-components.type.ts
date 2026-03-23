export interface BaremetalDeviceDetailsIpAddressType {
    Name: string;
    ShortDescription: string;
    Category: string;
    Type: string;
    Item: string;
    TokenId: string;
    LastScanDate: string;
    Description: string;
    NameFormat: string;
    Address: string;
    AddressType: string;
    DNSHostName: string;
    ProtocolType: string;
    SubnetMask: string;
    ManagementAddress: string;
    Company: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsMacAddressType {
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
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsCpuProcessorsType {
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
    ProcessorType: string;
    Company: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsInterfaceType {
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
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsOperationSystemType {
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
    LastScanDate: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsProductType {
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
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsFileSystemType {
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
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface BaremetalDeviceDetailsSoftwareServerType {
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
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}