export interface WorldMapWidgetDatacenterLocation {
    lat: number;
    datacenters: WorldMapWidgetDatacenter[];
    location: string;
    long: number;
    loc_status: string;
}
export interface WorldMapWidgetDatacenter {
    status: WorldMapWidgetDCStatus[];
    name: string;
    uuid: string;
}
export interface WorldMapWidgetDCStatus {
    status: MapWidgetStatus;
    category: string;
}

export enum MapWidgetStatus {
    UP = 'up',
    DOWN = 'down',
    PARTIALLY_UP = 'partially-up',
    NA = 'NA'
}













export interface GlobalDashboardMaintenanceSchedule {
    url: string;
    id: number;
    uuid: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    colo_cloud: GlobalDashboardMaintenanceScheduleColoCloud;
}
export interface GlobalDashboardMaintenanceScheduleColoCloud {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: null;
    customer: string;
    cabinets: string[];
}