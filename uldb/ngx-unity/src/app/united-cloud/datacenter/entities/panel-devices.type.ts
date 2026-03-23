export interface PanelDevicesType {
    name: string;
    position: string;
    size: number;
    cabinet: { uuid: string };
    panel_type: string;
}

export interface DataCenterPanelDevices {
    id: number;
    name: string;
    panel_type: number;
    panel_type_display: string;
    cabinet: DataCenterPanelDevicesCabinet;
    uuid: string;
    created_at: string;
    updated_at: string;
    position: number;
    size: number;
    customer: number;
}
export interface DataCenterPanelDevicesCabinet {
    url: string;
    id: number;
    name: string;
}