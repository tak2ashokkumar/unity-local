export interface UnityConnectNetworkConnection {
    uuid: string;
    mapped_name: string;
    device_name: string;
    device_type: string;
    device_uuid: string;
    port_name: string;
    monitored_data: UnityConnectNetworkConnectionMonitoredData;
}
export interface UnityConnectNetworkConnectionMonitoredData {
    bits_sent: null;
    bits_received: null;
    speed: null;
}