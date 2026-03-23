export interface InfrastructureInterfaceDetails {
    interface_summary: InfrastructureDeviceInterface;
    alert_details: InfrastructureInterfaceAlerts;
    recent_alerts: InfrastructureRecentAlerts[];
}

export interface InfrastructureDeviceInterface {
    host: Host;
    interface_name: string;
    interface_status: string;
    interface_itemid: string;
    receive: Receive;
    transmit: Transmit;
    bandwidth: Bandwidth;
    speed: Speed;
    inbound_discarded: Inbound_discarded;
    inbound_with_error: Inbound_with_error;
    outbound_discarded: Outbound_discarded;
    outbound_with_error: Outbound_with_error;
}
export interface Host {
    name: string;
    host_id: number;
    device_uuid: string;
    device_type: string;
}
export interface Receive {
    value: string;
    converted_value: string;
    graph_id: string;
}
export interface Transmit {
    name: string;
    value: string;
    item_id: string;
    converted_value: string;
    graph_id: string;
}
export interface Bandwidth {
    name: string;
    value: string;
    item_id: string;
    converted_value: string;
    graph_id: string;
}
export interface Speed {
    name: string;
    value: string;
    item_id: string;
    converted_value: string;
    graph_id: string;
}
export interface Inbound_discarded {
    name: string;
    value: string;
    item_id: string;
    graph_id: string;
}
export interface Inbound_with_error {
    name: string;
    value: string;
    item_id: string;
    graph_id: string;
}
export interface Outbound_discarded {
    name: string;
    value: string;
    item_id: string;
    graph_id: string;
}
export interface Outbound_with_error {
    name: string;
    value: string;
    item_id: string;
    graph_id: string;
}

export interface InfrastructureInterfaceAlerts {
    total: number;
    critical: number;
    warning: number;
    information: number;
}

export interface InfrastructureRecentAlerts {
    id: number;
    description: string;
    source: string;
    event_count: number;
    is_acknowledged: boolean;
    alert_duration: string;
    severity: string;
}
