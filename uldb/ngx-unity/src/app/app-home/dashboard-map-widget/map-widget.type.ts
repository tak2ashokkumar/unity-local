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