export interface DashboardDevice {
    name?: string;
    uuid?: string;
    server?: BaremetalDevices;
    status?: string;
}

export interface BaremetalDevices {
    name: string;
    uuid: string;
}
