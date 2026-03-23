export interface PDUSocketConnections {
    data: SocketData[];
}
export interface SocketData {
    socket_number: number;
    uuid: string;
    name: string;
    device_type: string;
    id: number;
}



export interface DeviceSensorData {
    [key: string]: DeviceSensorOutputItem[];
}
export interface DeviceSensorOutputItem {
    [key: string]: DeviceSensorOutput;
}
export interface DeviceSensorOutput {
    sensor_unit: string;
    graph: string;
    sensor_value: string;
    row_class: string;
}


export interface DeviceStatusData {
    device_data: DeviceStatusObj;
}
export interface DeviceStatusObj {
    status: string;
    sysName: string;
    uptime: string;
    hardware: string;
    location: string;
    last_rebooted: string;
    serial: string;
    os: string;
    sysContact: string;
}

export interface BMServerPowerStatus {
    power_status: boolean;
}