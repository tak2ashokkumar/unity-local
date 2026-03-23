export interface ManageReportInventoryDataCenter {
    id: number;
    cabinets: ManageReportInventoryDataCenterCabinet[];
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: ManageReportInventoryDataCenterStatus[];
    customer: number;
}

export interface ManageReportInventoryDataCenterCabinet {
    url: string;
    id: number;
    name: string;
    uuid: string;
}

export interface ManageReportInventoryDataCenterStatus {
    status: string;
    category: string;
}

export interface ManageReportDCInventoryReport {
    uuid: string;
    name: string;
    location: string;
    status: ManageReportDCInventoryReportStatus[];
    lat: string;
    long: string;
    cabinets: ManageReportDCInventoryReportCabinet[];
}

export interface ManageReportDCInventoryReportStatus {
    status: string;
    category: string;
}

export interface ManageReportDCInventoryReportCabinet {
    uuid: string;
    name: string;
    model: string;
    capacity: number;
    occupied: number;
    alerts: number;
    pdus: ManageReportDCInventoryReportCabinetPdus[];
    max_temperature: number;
    total_power: number;
    power_capacity: number;
    co2_emission_value: number;
}

export interface ManageReportDCInventoryReportCabinetPdus {
    uuid: string;
    status: number;
    name: string;
    sockets: number;
}

export interface ManageReportDCInventoryReportDevices {
    cd_count: number;
    pd_count: number;
    devices: ManageReportDCInventoryReportDeviceData[];
    pdu_count: number;
    lb_count: number;
    sd_count: number;
    mc_count: number;
    sw_count: number;
    fw_count: number;
    sv_count: number;
    hv_count: number;
    bm_count: number;
}

export interface ManageReportDCInventoryReportDeviceData {
    uuid: string;
    name: string;
    type: string;
    manufacturer: string;
    model: string;
    ip_address: string;
    cabinet: string;
    position: string;
    size: number;
    datacenter: string;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
}

export interface ManageReportDatacenterData {
    datacenters: string[];
    cabinets: string[];
    reportType: string;
    report_url: string;
}

export interface ManageReportDataType {
    uuid: string;
    name: string;
    frequency: string;
    feature: string;
    scheduled_time: string;
    report_meta: ManageReportDatacenterDataType;
    attachment: boolean;
    enable: boolean;
    default: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    scheduled_day: string;
    recipient_emails: string[];
    additional_emails: string[];
    user: string;
}

export interface ManageReportDatacenterDataType {
    category: string;
    cabinets: string[];
    feature: string;
    report_url: string;
    reportType: string;
    datacenters: string[];
}