export interface SensorDetail {
    sensor_unit: string;
    graph: string;
    sensor_value: string;
    row_class: string;
}
export interface SensorDataList {
    [key: string]: SensorDetail;
}
export interface APIDeviceSensor {
    [key: string]: SensorDataList[];
}

export interface DeviceSensors {
    sensorType: string;
    sensors: SensorData[]
}
export interface SensorData {
    sensorName: string;
    sensorDetail: SensorDetail;
}