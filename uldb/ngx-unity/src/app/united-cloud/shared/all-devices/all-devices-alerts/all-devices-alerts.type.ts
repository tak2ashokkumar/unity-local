export interface AllDevicesAlertsResponseType {
    status: string;
    count: string;
    alerts: { [key: number]: AllDevicesAlertsType };
}

export interface AllDevicesAlertsType {
    entity_id: string;
    changed: string;
    ignore_until: null;
    last_message: string;
    alert_test_id: string;
    alerted: string;
    last_ok: null;
    alert_status: string;
    humanized: boolean;
    ignore_until_text: string;
    alert_table_id: string;
    checked: string;
    entity_type: string;
    last_recovered: null;
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
    class: string;
    device_id: string;
    count: string;
    last_alerted: string;
    has_alerted: string;
    alert_name: string;
    alert_message: string;
}