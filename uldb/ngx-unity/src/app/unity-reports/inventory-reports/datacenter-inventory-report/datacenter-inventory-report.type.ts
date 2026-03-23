export interface InventoryDataCenter {
    id: number;
    cabinets: InventoryDataCenterCabinet[];
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: InventoryDataCenterStatus[];
    customer: number;
}
export interface InventoryDataCenterCabinet {
    url: string;
    id: number;
    name: string;
    uuid: string;
}
export interface InventoryDataCenterStatus {
    status: string;
    category: string;
}


export interface DCInventoryReport {
    uuid: string;
    name: string;
    location: string;
    status: DCInventoryReportStatus[];
    lat: string;
    long: string;
    cabinets: DCInventoryReportCabinet[];
}
export interface DCInventoryReportStatus {
    status: string;
    category: string;
}
export interface DCInventoryReportCabinet {
    uuid: string;
    name: string;
    model: string;
    capacity: number;
    occupied: number;
    alerts: number;
    pdus: DCInventoryReportCabinetPdus[];
    max_temperature: number;
    total_power: number;
    power_capacity: number;
    co2_emission_value: number;
}
export interface DCInventoryReportCabinetPdus {
    uuid: string;
    status: number;
    name: string;
    sockets: number;
}


export interface DCInventoryReportDevices {
    cd_count: number;
    pd_count: number;
    devices: DCInventoryReportDeviceData[];
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
export interface DCInventoryReportDeviceData {
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
}