export interface UnityViewAlertDevice {
    alert_count: number | string;
    type: string;
    name: string;
    uuid: string;
    cloud_name?: string;
    alert_data?: UnityViewDeviceAlertData;
}

export interface UnityViewDeviceAlertData {
    status: string;
    count: string;
    alerts: UnityViewDeviceAlerts;
}

export interface UnityViewDeviceAlerts {
    [key: string]: UnityViewDeviceAlertDataObj;
}

export interface UnityViewDeviceAlertDataObj {
    entity_id: string;
    changed: string;
    ignore_until: null;
    last_message: string;
    alert_test_id: string;
    alerted: string;
    last_ok: string;
    alert_status: string;
    humanized: boolean;
    ignore_until_text: string;
    alert_table_id: string;
    checked: string;
    severity: string;
    entity_type: string;
    last_recovered: string;
    ignore_until_ok_text: string;
    html_row_class: string;
    delay: string;
    state: string;
    alert_assocs: string;
    recovered: string;
    last_failed: string;
    status: string;
    last_changed: string;
    last_checked: string;
    ignore_until_ok: string;
    'class': string;
    device_id: string;
    count: string;
    last_alerted: string;
    has_alerted: string;
    alert_name: string;
    alert_message: string;
}

export interface UnityViewAlert {
    id: number;
    device_uuid: string;
    device_name: string;
    device_type: string;
    device_cloud: string[];
    management_ip: string;
    is_shared: boolean;

    alert: string;
    alert_time: string;
    recovery_time: string;
    duration: string;
    acknowledged: string;
    trigger_id: number;

    host: number;
    host_ip: string;

    severity: string;
    status: string;

    event_id: number;
}

export interface UnityViewGroupByAlert {
    [key: string]: UnityViewAlert[];
}
