import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface InfrastructureSummary {
    alerts: InfrastructureAlerts;
    datacenter: InfrastructureDatacenter;
    cabinet: InfrastructureCabinet;
    total_resources: InfrastructureResources;
}

export interface InfrastructureAlerts {
    total: number;
    critical: number;
    warning: number;
    information: number;
}

export interface InfrastructureDatacenter {
    total: number;
    alerts: number;
}

export interface InfrastructureCabinet {
    total: number;
    available: number;
    emission: number;
}

export interface InfrastructureResources extends InfrastructureDevice { }

export interface InfrastructureDevicesSummary {
    total: number;
    up: number;
    down: number;
    unknown: number;
    network: InfrastructureDevice;
    compute: InfrastructureDevice;
    storage: InfrastructureDevice;
    database: InfrastructureDevice;
    other: InfrastructureDevice;
    iot: InfrastructureDevice;
}

export interface InfrastructureDevice {
    total: number;
    up: number;
    down: number;
    unknown: number;
}

export interface InfrastructurePublicCloudSummary {
    total: number;
    public_clouds: InfrastructurePublicCloud[];
}

export interface InfrastructurePublicCloud {
    name: string;
    subscriptions: number;
    resources: number;
    cost: number;
}

export interface InfrastructureWidgetDeviceManufacturerType {
    [manufacturerName: string]: InfrastructureWidgetDeviceModelsType;
}

export interface InfrastructureWidgetDeviceModelsType {
    models: {
        [modelName: string]: InfrastructureWidgetDevicesType[];
    };
    manufacturer_name: string;
}

export interface InfrastructureWidgetDevicesType {
    status: string;
    uuid: string;
    device_type: string;
    device_sub_type: string;
    name: string;
    monitoring: DeviceMonitoringType;
}

export interface InfrastructureAlertsDataType {
    id: number;
    uuid: string;
    device_name: string;
    description: string;
    severity: string;
    is_acknowledged: boolean;
    source: string;
    alert_duration: string;
}

export interface InfrastructurePrivateCloudDataType {
    total: number;
    private_clouds: PrivateCloudDataType[];
}

export interface PrivateCloudDataType {
    name: string;
    resources: number;
    subscriptions: number;
}

export interface InfrastructureCpuAndRamUtilizationDataType {
    top_10_cpu_usage: Top10UtilizationDataType[];
    top_10_memory_usage: Top10UtilizationDataType[];
}

export interface Top10UtilizationDataType {
    itemid: string;
    lastvalue: number;
    hostid: string;
    key_: string;
    name: string;
    host: UtilizationHostDataType;
}

export interface UtilizationHostDataType {
    host_name: string;
    host_type: string;
    host_uuid: string;
    host_sub_type: string;
    host_monitoring: UtilizationHostMonitoringDataType;
}

export interface UtilizationHostMonitoringDataType {
    configured: boolean;
    enabled: boolean;
    zabbix: boolean;
    observium: boolean;
}

export interface InfrastructureDcCloudCost {
    total: InfrastructureWidget;
    dc_cost: InfrastructureWidget;
    pc_cost: InfrastructureWidget;
}

export interface InfrastructureWidget {
    total: number;
    last_year_total: number;
    since_last_year: number;
}

export interface InfrastructureDcSummary {
    total: number;
    dc_data: InfrastructureDcChartType[];
}

export interface InfrastructureDcChartType {
    uuid: string;
    name: string;
    last_12_months: InfrastructureChartLast12MonthsType[];
}

export interface InfrastructureChartLast12MonthsType {
    month: string;
    amount: number;
}

export interface InfrastructurePcSummary {
    total: number;
    cloud_data: InfrastructurePcChartType[];
}

export interface InfrastructurePcChartType {
    name: string;
    last_12_months: InfrastructureChartLast12MonthsType[];
}

export interface InfrastructureAlertTrend {
    summary: InfrastructureAlertTrendSummary;
    raw_events: InfrastructureAlertTrendRawEvents;
    noise_deduction: InfrastructureAlertTrendNoiseDeduction;
    first_response: InfrastructureAlertTrendFirstResponse;
}

export interface InfrastructureAlertTrendSummary {
    raw_events: number,
    alerts: number,
    conditions: number
}

export interface InfrastructureAlertTrendRawEvents {
    total: number,
    critical: number,
    warning: number,
    information: number
}

export interface InfrastructureAlertTrendNoiseDeduction {
    dedupe: number,
    suppressed: number,
    correlated: number
}

export interface InfrastructureAlertTrendFirstResponse {
    auto_healed: number,
    ticket_created: number,
    auto_closed: number
    total: number;
}

export interface InfrastructureWidgetOptionsType {
    label: string,
    value: string
}

export interface InfrastructureWidgetDeviceStatusType {
    [key: string]: InfrastructureDeviceStatusType;
}

export interface InfrastructureDeviceStatusType {
    total: number;
    devices: InfrastructureWidgetDevicesType[];
}

export interface InfrastructureWidgetDeviceType extends InfrastructureWidgetDeviceStatusType {
}

export interface InfrastructureWidgetDeviceModelType {
    [key: string]: InfrastructureWidgetDevicesType[];
}