export interface interfaceDetailsType {
    interface_summary: interfaceSummaryType;
    alert_details: interfaceAlertDetailsType;
    recent_alerts: interfaceRecentAlertsType[];
}

export interface interfaceSummaryType {
    interface_name: string;
    interface_status: string;
    interface_itemid: string;
    host: interfaceSummaryHostType;
    receive: interfaceSummaryReceiveType;
    transmit: interfaceSummaryTransmitType;
    bandwidth: interfaceSummaryBandwidthType;
    speed: interfaceSummarySpeedType;
    inbound_discarded: interfaceSummaryInboundDiscardedType;
    inbound_with_error: interfaceSummaryInboundWithErrorType;
    outbound_discarded: interfaceSummaryOutboundDiscardedType;
    outbound_with_error: interfaceSummaryOutboundWithErrorType;
}

export interface interfaceSummaryHostType {
    name: string;
    host_id: number;
    device_uuid: string;
    device_type: string;
    device_status: string;
}

export interface interfaceSummaryReceiveType {
    value: string;
    converted_value: string;
    graph_id: string;
}

export interface interfaceSummaryTransmitType {
    name: string;
    value: string;
    item_id: string;
    converted_value: string;
    graph_id: string;
}

export interface interfaceSummaryBandwidthType extends interfaceSummaryTransmitType {
}

export interface interfaceSummarySpeedType extends interfaceSummaryTransmitType {
}

export interface interfaceSummaryInboundDiscardedType {
    name: string;
    value: string;
    item_id: string;
    graph_id: string;
}

export interface interfaceSummaryInboundWithErrorType extends interfaceSummaryInboundDiscardedType {
}

export interface interfaceSummaryOutboundDiscardedType extends interfaceSummaryInboundDiscardedType {
}

export interface interfaceSummaryOutboundWithErrorType extends interfaceSummaryInboundDiscardedType {
}

export interface interfaceAlertDetailsType {
    total: number;
    critical: number;
    warning: number;
    information: number;
}

export interface interfaceRecentAlertsType {
    id: number;
    description: string;
    source: string;
    event_count: number;
    is_acknowledged: boolean;
    alert_duration: string;
    severity: string;
}