export interface MSDynamicsTicketType {
    ticket_uuid: string;
    ticket_type: string;
    ticket_number: string;
    ticket_owner: string;
    title: string;
    status: string;
    status_reason: string;
    priority: string;
    created_on: string;
    modified_on: string;
    description: string;
    resolved_on: string;
}

export interface MSDynamicsTicketTimelineType {
    uuid: string;
    entity: string;
    subject?: string;
    description?: string;
    state?: string;
    status?: string;
    activity_type?: string;
    sender_mail?: string;
    created_on: string;
    modified_on: string;
    created_by: string;
    modified_by: string;
    text?: string;
    post_source?: string;
    is_document: string;
    file_name: string;
    file_type: string;
}

export interface MSDynamicsTicketNotesAttachmentType {
    file_name: string;
    file_type: string;
    document_body: string;
}

export interface MSDynamicsTicketAttachmentsType {
    file_name: string;
    download_link: string;
    sys_id: string;
}

export interface MSDynamicsTicketGraphType {
    by_state: MSDynamicsTicketGraphByStateType;
    by_priority: MSDynamicsTicketGraphByPriorityType;
    closed_tickets_count_by_response_time: MSDynamicsTicketGraphByClosedResponseTimeType;
}
export interface MSDynamicsTicketGraphByPriorityType {
    Critical: number;
    High: number;
    Normal: number;
    Low: number;
}
export interface MSDynamicsTicketGraphByStateType {
    Active: number;
    Resolved: number;
    Cancelled: number;
}
export interface MSDynamicsTicketGraphByClosedResponseTimeType {
    greaterthan_month: number;
    one_month: number;
    one_week: number;
    one_day: number;
}
