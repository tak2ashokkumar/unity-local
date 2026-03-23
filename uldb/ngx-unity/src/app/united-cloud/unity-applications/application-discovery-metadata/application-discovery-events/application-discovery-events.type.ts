
export interface ApplicationDiscoveryEventsType {
    count: number;
    next: null;
    previous: null;
    results: ApplicationDiscoveryEventsType[];
}


export interface AppDiscoveryMonitoringAlerts {
    alert_id: number;
    description: string;
    severity: string;
    date_time: string;
    device_name: string;
}

export interface AppDiscoveryDisableTriggerType {
    message: string;
    success: boolean;
}

export interface AppDiscoveryEventResolveType extends AppDiscoveryDisableTriggerType { }

export interface AppDiscoveryMonitoringEvents {
    id: number;
    description: string;
    severity: string;
    // date_time: string;
    device_type: string;
    ip_address: string;
    event_datetime: string;
    status: string;
    source: string;
    device_name: string;
    is_acknowledged: boolean;
    acknowledged_comment: string;
    acknowledged_by: string;
    event_metric: string;
    recovered_time: string;
    duration: string;
    acknowledged_time: string;
    uuid: string;
    source_account: string;
    affected_component: null;
    affected_component_type: null;
    affected_component_name: null;
    environment: null;
    application_name: string;
    custom_data: null;
}