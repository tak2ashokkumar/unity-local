export interface DynamicCrmTicketType {
    attribute_uuid: string;
    display_name: string;
    value: number;
}

export interface DynamicCrmTicketPriorityType extends DynamicCrmTicketType {
}

export interface DynamicCrmTicketStateType extends DynamicCrmTicketType {
}

export interface DynamicCrmTicketResolutionType extends DynamicCrmTicketType {
    state_value: number;
}

export interface DynamicCrmTicketStatusType extends DynamicCrmTicketType {
    state_value: number;
}

export interface DynamicCrmFeedbackTicketType extends DynamicCrmTicketType {
}

export interface DynamicCrmFeedbackTicketPriorityType extends DynamicCrmTicketType {
}

export interface DynamicCrmFeedbackTicketStateType extends DynamicCrmTicketType {
}

export interface DynamicCrmFeedbackTicketResolutionType extends DynamicCrmTicketResolutionType {
}

export interface DynamicCrmFeedbackTicketStatusType extends DynamicCrmTicketStatusType {
}