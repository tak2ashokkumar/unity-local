export interface ServiceNowTicketType {
    sys_class_name?: ServiceNowDisplayValueType
    sys_updated_on: ServiceNowDisplayValueType;
    task_effective_number: ServiceNowDisplayValueType;
    number: ServiceNowDisplayValueType;
    state: ServiceNowDisplayValueType;
    priority: ServiceNowDisplayValueType;
    opened_at: ServiceNowDisplayValueType;
    resolved_at: ServiceNowDisplayValueType;
    short_description: ServiceNowDisplayValueType;
    description: ServiceNowDisplayValueType;
    urgency: ServiceNowDisplayValueType;
    severity: ServiceNowDisplayValueType;
    impact: ServiceNowDisplayValueType;
    sys_id: ServiceNowDisplayValueType;
    ticket_type: string;
}

export interface ServiceNowChoices {
    name: string;
    label: string;
    value: string;
    element: string;
}
export interface ServiceNowAttachmentsType {
    file_name: string;
    download_link: string;
    sys_id: string;
}

export interface ServiceNowComments {
    value: ServiceNowDisplayValueType;
    sys_created_on: ServiceNowDisplayValueType;
    sys_created_by: ServiceNowDisplayValueType;
}

export interface ServiceNowDisplayValueType {
    display_value: string;
    value: string;
}

export interface ServiceNowTicketsCountByStatus {
    [key: string]: number;
}

export interface ServiceNowClosedTicketsCountByResponseTime {
    greaterthan_month: number;
    one_month: number;
    one_week: number;
    one_day: number;
}

export interface ServiceNowTicketsCountByPriority {
    [key: string]: number;
}

export interface ServiceNowGraphData {
    by_state: ServiceNowTicketsCountByStatus;
    by_priority: ServiceNowTicketsCountByPriority;
    closed_tickets_count_by_response_time: ServiceNowClosedTicketsCountByResponseTime
}
