export interface OrgTicketInstance {
    'default': boolean;
    type: string;
    uuid: string;
    name: string;
}

export interface MTPTicketInstance {
    id: number;
    name: string;
    client_id: string;
    tenant_id: string;
    username: string;
    password: string;
    uuid: string;
    crm_url: string;
    is_default: boolean;
    crm_account_uuid: string;
    access_type: string;
}

export interface MTPTicket {
    ticket_uuid: string;
    ticket_number: string;
    title: string;
    status: string;
    status_reason: string;
    status_reason_name: string;
    status_code: number;
    priority: string;
    priority_name: string;
    ticket_type: string;
    ticket_type_name: string;
    created_on: string;
    modified_on: string;
    description: string;
    resolved_on: string;
    ticket_owner: string;
    contact: string;
    customer_id: string;
    customer_name: string;
    assignee_id: string;
    assignee_name: string;
    next_sla: string;
    response_time: string;
    resolution_time: string;
    first_response_by_kpi: string;
    resolve_by_kpi: string;
    succeeded_on: string;
}

export interface MTPTicketDetail {
    ticket_uuid: string;
    ticket_number: string;
    title: string;
    status: string;
    status_reason_name: string;
    status_reason: string;
    status_code: number;
    priority: string;
    priority_name: string;
    ticket_type: string;
    ticket_type_name: string;
    change_stage: string;
    change_stage_name: string;
    created_on: string;
    modified_on: string;
    description: string;
    resolved_on: string;
    ticket_owner: string;
    contact: string;
    customer_id: string;
    customer_name: string;
    assignee_name: string;
    assignee_id: number;
    next_sla: string;
    response_time: string;
    resolution_time: string;
    first_response_by_kpi: string;
    resolve_by_kpi: string;
    succeeded_on: string;
    response_failure_time: string;
    response_succeeded_on: string;
    resolution_failure_time: string;
    resolution_succeeded_on: string;
    status_change_time?: string;
    notes: MTPTicketDetailNotes[];

    // client side added for feasibility
    ticketTypeValue: number;
    priorityValue: number;
    statusReasonValue: number;
    stageValue: number;
}

export interface MTPTicketDetailNotes {
    uuid: string;
    entity: string;
    subject: string;
    description: string;
    is_document: string;
    file_name: string;
    file_type: string;
    created_on: string;
    modified_on: string;
    created_by: string;
    modified_by: string;
}

export interface MTPTicketDetailNoteAttachmentType {
    file_name: string;
    file_type: string;
    document_body: string;
}

export interface MTPTicketChartData {
    by_tenants: MTPTicketsByTenantData;
    by_state: MTPTicketsByStateData;
    by_status_reason: MTPTicketsByStatusReasonData;
    by_priority: MTPTicketsByPriorityData;
    open_tickets_count_by_response_time: MTPTicketsByResponseTimeData;
    closed_tickets_count_by_response_time: MTPTicketsByResponseTimeData;
}

export interface MTPTicketsByTenantData {
    [key: string]: number;
}

export interface MTPTicketsByStateData {
    Resolved: number;
    Active: number;
}

export interface MTPTicketsByStatusReasonData {
    [key: string]: number;
}

export interface MTPTicketsByPriorityData {
    // High: number;
    // Critical: number;
    // Low: number;
    // Normal: number;
    [key: string]: number;
}

export interface MTPTicketsByResponseTimeData {
    greaterthan_month: number;
    one_month: number;
    one_week: number;
    one_day: number;
}

export interface MTPTicketType {
    attribute_uuid: string;
    display_name: string;
    value: number;
}

export interface MTPTicketPriorityType extends MTPTicketType {
}

export interface MTPTicketStateType extends MTPTicketType {
}

export interface MTPTicketResolutionType extends MTPTicketType {
    state_value: number;
}

export interface MTPTicketStatusType extends MTPTicketType {
    state_value: number;
}

export interface MTPTicketStage extends MTPTicketType {
}