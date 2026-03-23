export interface DatacenterFast {
    id: number;
    cabinets: DatacenterCabinetsFast[];
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: DatacenterStatusFast[];
    customer: number;
}
export interface DatacenterCabinetsFast {
    url: string;
    id: number;
    uuid: string;
    name: string;
}
export interface DatacenterStatusFast {
    status: string;
    category: string;
}



export interface DatacenterWidget {
    datacenter_uuid: string;
    datacenter_name: string;
    cabinets: DatacenterWidgetCabinet[];
    co2_run_rate: number;
}
export interface DatacenterWidgetCabinet {
    total_power: number;
    capacity: number;
    down_count: number;
    alerts: number;
    pdus: DatacenterWidgetCabinetPDU[];
    max_temperature: number;
    occupied: number;
    cabinet_uuid: string;
    cabinet_name: string;
    up_count: number;
}
export interface DatacenterWidgetCabinetPDU {
    status: number;
    sockets: number;
    name: string;
    uuid: string;
}


export interface DatacenterInDevice {
    url: string;
    id: number;
    uuid: string;
    name: string;
}



