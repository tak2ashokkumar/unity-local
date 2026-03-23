export class CabinetWidgetDatacenter {
    datacenter_uuid: string = '';
    cabinets: CabinetWidgetData[];
    datacenter_name: string = '';
    co2_run_rate: number;
    constructor() { }
}
export class CabinetWidgetData {
    alerts: number = 0;
    capacity: number = 0;
    down_count: number = 0;
    total_power: number = 0;
    pdus: CabinetWidgetPDUData[] = [];
    occupied: number = 0;
    max_temperature: number = 0;
    cabinet_uuid: string = '';
    cabinet_url: string = '';
    cabinet_name: string = '';
    up_count: number = 0;
    constructor() { }
}
export class CabinetWidgetPDUData {
    status: number = 2; //2 represents N/A
    name: string = '';
    color?: string = 'text-muted';
    constructor() { }
}