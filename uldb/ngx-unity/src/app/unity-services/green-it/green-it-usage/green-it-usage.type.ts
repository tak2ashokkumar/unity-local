export interface GreenITDC {
    datacenter_uuid: string;
    datacenter_name: string;
}

export interface GreenItUsageByDevice {
    uptime: number;
    co2_emitted: number;
    name: string;
    power_consumed: number;
    data_center: string;
    cabinet: string;
    type: string;
    region: string;
    tags: string[];
    ip_address: string;
    model: string;
}