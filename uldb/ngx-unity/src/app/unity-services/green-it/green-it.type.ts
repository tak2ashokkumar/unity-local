export interface GreenITDCWidget {
    datacenter_uuid: string;
    cabinets: GreenITDCWidgetCabinet[];
    datacenter_name: string;
}
export interface GreenITDCWidgetCabinet {
    total_power: number;
    capacity: number;
    down_count: number;
    alerts: number;
    pdus: GreenITDCWidgetCabinetPdu[];
    max_temperature: number;
    occupied: number;
    cabinet_uuid: string;
    cabinet_name: string;
    up_count: number;
}
export interface GreenITDCWidgetCabinetPdu {
    status: number;
    sockets: number;
    name: string;
    uuid: string;
}