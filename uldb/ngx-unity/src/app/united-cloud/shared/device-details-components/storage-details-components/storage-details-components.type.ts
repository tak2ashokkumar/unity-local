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

export interface StorageDeviceDetailsOSType {
    Category: string;
    MarkAsDeleted: string;
    SystemName: string;
    OSType: string;
    Type: string;
    EndOfExtendedSupport: string;
    ServicePack: string;
    LicenseType: string;
    Description: string;
    Company: string;
    EndOfLife: string;
    NameFormat: string;
    SystemClassId: string;
    LastScanDate: string;
    ShortDescription: string;
    Name: string;
    TokenId: string;
    Item: string;
    Model: string;
    MarketVersion: string;
    EndOfSecuritySupport: string;
    BuildNumber: string;
    VersionNumber: string;
    ManufacturerName: string;
    EndOfSupport: string;
}