export interface DeviceStatus {
    [key: string]: StatusDetail
}
export interface StatusDetail {
    row_class: string;
    graph: string;
    status_name: string;
}