export interface StorageDeviceDetailsIpAddressType {
    Name: string;
    NameFormat: string;
    ShortDescription: string;
    Address: string;
    DNSHostName: string;
    Category: string;
    Type: string;
    Item: string;
    TokenId: string;
    Description: string;
    Company: string;
    AddressType: string;
    ProtocolType: string;
    SubnetMask: string;
    ManagementAddress: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface StorageDeviceDetailsMacAddressType {
    TokenId: string;
    Name: string;
    ShortDescription: string;
    Description: string;
    MACAddress: string;
    Category: string;
    Type: string;
    Item: string;
    Company: string;
    NameFormat: string;
    ProtocolType: string;
    Address: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface StorageDeviceDetailsInterfaceType {
    TokenId: string;
    Name: string;
    ShortDescription: string;
    Description: string;
    PermanentAddress: string;
    Category: string;
    Type: string;
    Item: string;
    Company: string;
    NameFormat: string;
    ManufacturerName: string;
    NetworkAddresses: string[];
    PortType: string;
    Speed: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}

export interface StorageDeviceDetailsOperationSystemType {
   Name: string;
    ShortDescription: string;
    Category: string;
    Type: string;
    Item: string;
    NameFormat: string;
    ManufacturerName: string;
    VersionNumber: string;
    Model: string;
    TokenId: string;
    Description: string;
    Company: string;
    BuildNumber: string;
    ServicePack: string;
    MarketVersion: string;
    LicenseType: string;
    EndOfLife: string;
    EndOfSupport: string;
    EndOfSecuritySupport: string;
    EndOfExtendedSupport: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}