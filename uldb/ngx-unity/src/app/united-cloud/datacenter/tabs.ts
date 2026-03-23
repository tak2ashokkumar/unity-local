export interface DataCenter {
    id?: number
    name: string;
    uuid: string;
    location: string;
    lat: string;
    long: string;
}
export interface DataCenterTabs extends DataCenter {
    url?: string;
}