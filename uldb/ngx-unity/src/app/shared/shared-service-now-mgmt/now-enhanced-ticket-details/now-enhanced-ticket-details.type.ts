export interface ServiceNowTicketDetailsType {
    priority: string;
    sys_id: string;
    user_verified_by: string;
    status: string;
    similar_tickets: similarTicketType[];
    source: string;
    ticket_type: string;
    title: string;
    ticket_number: string;
    assignment_group: string;
    reason: string;
    sop: SopType;
    user_verified: boolean;
    description: string;
}

export interface similarTicketType {
    description: string;
    ticket_number: string;
    title: string;
    sys_id: string;
    ticket_type: string;
}

export interface SopType {
    ticket_number: string;
    reason: string;
    steps: string[];
    name: string;
    description: string;
    kb_url: string;
    kb_number: string;
}

export interface AttachmentType {
    file_name: string;
    download_link: string;
    sys_id: string;
}

export interface ServiceNowCommentType {
    value: ServiceNowDisplayValueType;
    sys_created_on: ServiceNowDisplayValueType;
    sys_created_by: ServiceNowDisplayValueType;
}

export interface ServiceNowDisplayValueType {
    display_value: string;
    value: string;
}

export interface ServicenowSopFormDataType {
    sop_steps: string;
    user_verified: boolean;
}

export interface ServicenowSopUpdateType {
    message: string;
}