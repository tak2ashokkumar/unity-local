export interface DashboardDevice {
    name?: string;
    uuid?: string;
    server?: BaremetalDevices
    isSelected?: boolean;
}

export interface BaremetalDevices {
    name: string;
    uuid: string;
}