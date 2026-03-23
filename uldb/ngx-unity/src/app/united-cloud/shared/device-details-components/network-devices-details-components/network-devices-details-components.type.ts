export interface NetworkDevicesDetailsComponents {
    device_uuid: string;
    device_name: string;
    ip_address: NetworkDevicesDetailsIPAddress;
    os_data: NetworkDevicesDetailsOSData;
    interface_data: NetworkDevicesDetailsInterfaceData[];
    mac_data: NetworkDevicesDetailsMacData[];
    hardware_data: NetworkDevicesDetailsHardwareData[];
}
export interface NetworkDevicesDetailsIPAddress {
    Name: string;
    ShortDescription: string;
    Category: string;
    Type: string;
    Item: string;
    DNSHostName: string;
    TokenId: string;
    LastScanDate: string;
    Description: string;
    NameFormat: string;
    Address: string;
    AddressType: string;
    ProtocolType: string;
    SubnetMask: string;
    ManagementAddress: string;
    Company: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}
export interface NetworkDevicesDetailsOSData {
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
    NameFormat: string;
    MarketVersion: string;
    LicenseType: string;
    EndOfLife: string;
    EndOfSupport: string;
    EndOfSecuritySupport: string;
    EndOfExtendedSupport: string;
    LastScanDate: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}
export interface NetworkDevicesDetailsInterfaceData {
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
    Company: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}
export interface NetworkDevicesDetailsMacData {
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
export interface NetworkDevicesDetailsHardwareData {
    Name: string;
    ManufacturerName: string;
    VersionNumber: string;
    SerialNumber: string;
    ShortDescription: string;
    Category: string;
    Type: string;
    Item: string;
    Model: string;
    MarketVersion: string;
    Description: string;
    Company: string;
    EndOfLife: string;
    EndOfSupport: string;
    EndOfSecuritySupport: string;
    EndOfExtendedSupport: string;
    TokenId: string;
    SystemClassId: string;
    MarkAsDeleted: string;
    SystemName: string;
}
