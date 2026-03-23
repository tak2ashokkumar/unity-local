import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface IOTDevicesSummary {
    total_devices: IOTDevicesCountByStatus;
    avg_temperature: IOTDevicesSummaryData;
    avg_humidity: IOTDevicesSummaryData;
    avg_airflow: IOTDevicesSummaryData;
    avg_power: IOTDevicesSummaryData;
}
export interface IOTDevicesCountByStatus {
    total: number;
    up: number;
    down: number;
    unknown: number;
}
export interface IOTDevicesSummaryData {
    current: number;
    last_1_hr: number;
}


export interface IOTDevicesSummaryStatusByGroup {
    [manufacturerName: string]: IOTDevicesSummaryModels;
}

export interface IOTDevicesSummaryModels {
    models: {
        [modelName: string]: IOTDevicesSummaryDevices[];
    };
    manufacturer_name: string;
}

export interface IOTDevicesSummaryDevices {
    status: string;
    uuid: string;
    device_type: string;
    name: string;
    monitoring: DeviceMonitoringType;
}


export interface SmartPDU {
    id: number;
    uuid: string;
    name: string;
    asset_tag: string;
    description: string;
    power: number;
    current: number;
    voltage: number;
    outlet_status: string;
    pdu_id: string;
    pdu_object_oid: string;
    uptime: string;
    serial_number: string;
    firmware: string;
    cabinet: string;
    collector: CollectorEntity;
    credentials: string;
    credentials_type: string;
    datacenter: DatacenterEntity;
    manufacturer: string;
    model: string;
    monitoring: DeviceMonitoringType;
    status: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    ip_address: string;
    snmp_community: string;
    snmp_version: string;
    snmp_authlevel: string;
    snmp_authname: string;
    snmp_authpass: string;
    snmp_authalgo: string;
    snmp_cryptopass: string;
    snmp_cryptoalgo: string;
}
export interface CollectorEntity {
    uuid: string;
    name: string;
    id: number;
}
export interface DatacenterEntity {
    url: string;
    id: number;
    uuid: string;
    display_name: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: SmartPDUStatusItem[];
    customer: string;
    cabinets: string[];
}
export interface SmartPDUStatusItem {
    status: string;
    category: string;
}


export interface IOTDevicesTemperatureWidgetSummaryData {
    total: number;
    active: number;
    inactive: number;
    average_temperature: number;
    maximum_temperature: number;
    minimum_temperature: number;
}

export interface Top5IOTDevicesByTemperature {
    device_type: string;
    uuid: string;
    temperature: number;
    name: string;
}

export interface IOTDevicesTemperatureWidgetTrendDataType {
    uuid: string;
    name: string;
    device_type: string;
    data: TrendDataType[];
}

export interface TrendDataType {
    unit: string;
    value: number;
    recorded_at: string;
}


export interface IOTDevicesHumidityWidgetSummaryData {
    total: number;
    active: number;
    inactive: number;
    average_humidity: number;
    maximum_humidity: number;
    minimum_humidity: number;
}

export interface IOTDevicesHumidityWidgetTrendDataType extends IOTDevicesTemperatureWidgetTrendDataType { }


export interface IOTDevicesAirflowWidgetSummaryData {
    total: number;
    active: number;
    inactive: number;
    average_airflow: number;
    maximum_airflow: number;
    minimum_airflow: number;
}

export interface IOTDevicesAirflowWidgetTrendDataType extends IOTDevicesTemperatureWidgetTrendDataType { }


export interface RecentModifiedRFIDTags {
    id: number;
    uuid: string;
    name: string;
    asset_tag: string;
    description: string;
    tag_id: string;
    location: string;
    last_seen: string;
    rfid_object_oid: string;
    cabinet: string;
    collector: CollectorEntity;
    credentials: string;
    credentials_type: string;
    datacenter: DatacenterEntity;
    manufacturer: string;
    model: string;
    monitoring: DeviceMonitoringType;
    status: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    ip_address: string;
    snmp_community: string;
    snmp_version: string;
    snmp_authlevel: string;
    snmp_authname: string;
    snmp_authpass: string;
    snmp_authalgo: string;
    snmp_cryptopass: string;
    snmp_cryptoalgo: string;
}

export interface IOTDevicesRecentEvents {
    id: number;
    uuid: string;
    device_name: string;
    device_type: string;
    ip_address: string;
    description: string;
    event_datetime: string;
    severity: string;
    status: string;
    source: string;
    source_account: string;
    recovered_time: string;
    cabinet: string;
    datacenter: string;
}

export interface DurationDropdownType {
    period: string;
    from: string;
    to: string;
}