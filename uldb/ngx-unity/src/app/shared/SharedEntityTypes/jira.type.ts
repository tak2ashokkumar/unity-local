export interface JiraInstance {
    id: number;
    name: string;
    email: string;
    jira_url: string;
    api_token: string;
    uuid: string;
    is_default: boolean;
    access_type: string;
    project_details: JiraInstanceProject[];
    customer: number;
}

export interface JiraInstanceProject {
    project_name: string;
    project_id: string;
    serviceDeskId: string;
    project_key: string;
}

export interface JiraInstanceProjects {
    project_list: JiraInstanceProject[];
    projects_selected: JiraInstanceProject[];
}

export interface JiraTicketType {
    status: string;
    ticket_type: string;
    created_on: string;
    queue_id: string;
    modified_on: string;
    status_reason: string;
    solved_on: null;
    title: string;
    priority: string;
    attachment: any[];
    ticket_number: string;
    project_id: string;
}

export interface JiraTicketQueueType {
    queue_name: string;
    queue_id: string;
}

export interface JiraTicketStatusType {
    name: string;
    self: string;
    id: number;
    key: string;
    colorName: string;
}

export interface JiraTicketIssueType {
    untranslatedName: string;
    name: string;
    self: string;
    hierarchyLevel: number;
    iconUrl: string;
    subtask: boolean;
    avatarId: number;
    id: string;
    description: string;
}

export interface JiraTicketPriorityType {
    description: string;
    self: string;
    statusColor: string;
    iconUrl: string;
    id: string;
    name: string;
}

export interface JiraTicketRequestType {
    id: string;
    name: string;
}

export interface JiraTicketRequestTypeField {
    validValues: JiraTicketRequestTypeFieldValues[];
    name: string;
    required: boolean;
    defaultValues: any[];
    visible: boolean;
    jiraSchema: JiraTicketRequestTypeFieldSchema;
    fieldId: string;
    description: string;

    //related to ui change
    fieldType: string;
}

export interface JiraTicketRequestTypeFieldValues {
    children?: any[];
    value?: string;
    label?: string;
    workspaceId?: string;
    name?: string;
    objectId?: string;
    id?: string;
}
export interface JiraTicketRequestTypeFieldSchema {
    type: string;
    system?: string;
    items?: string;
    customId?: number;
    custom?: string;
}

export interface JiraTicketsCountByStatus {
    [key: string]: number;
}

export interface JiraTicketsCountByPriority {
    [key: string]: number;
}

export interface JiraClosedTicketsCountByResponseTime {
    greaterthan_month: number;
    one_month: number;
    one_week: number;
    one_day: number;
}

export interface JiraTicketsGraphData {
    by_state: JiraTicketsCountByStatus;
    by_priority: JiraTicketsCountByPriority;
    closed_tickets_count_by_response_time: JiraClosedTicketsCountByResponseTime
}


export interface JiraTicketDetailsType {
    status: string;
    description: JiraTicketDetailsTypeDescriptionType;
    ticket_type: string;
    created_on: string;
    modified_on: string;
    status_reason: string;
    solved_on: null;
    title: string;
    comments: JiraTicketDetailsComments[];
    priority: string;
    attachment: JiraTicketDetailsAttachment[];
    ticket_number: string;
    assigned_to: JiraTicketDetailsAssignedToType;
    reporter: string;
    created_by: string;
}
export interface JiraTicketDetailsTypeDescriptionType {
    content: JiraTicketDetailsTypeDescriptionContentType[];
    version: number;
    type: string;
}
export interface JiraTicketDetailsTypeDescriptionContentType {
    content?: JiraTicketDetailsTypeDescriptionContentType[];
    type: string;
    text?: string;
}

export interface JiraTicketDetailsAssignedToType {
    displayName: string;
    self: string;
    avatarUrls: JiraTicketDetailsCommentAuthorAvatarUrls;
    emailAddress: string;
    accountType: string;
    active: boolean;
    timeZone: string;
    accountId: string;
}

export interface JiraTicketDetailsAttachment {
    mimeType: string;
    author: JiraTicketDetailsAuthor;
    self: string;
    created: string;
    filename: string;
    content: string;
    id: string;
    size: number;
}

export interface JiraTicketDetailsComments {
    body: JiraTicketDetailsCommentsBody;
    updateAuthor: JiraTicketDetailsAuthor;
    jsdPublic: boolean;
    created: string;
    self: string;
    author: JiraTicketDetailsCommentAuthor;
    updated: string;
    id: string;
}
export interface JiraTicketDetailsCommentsBody {
    content: JiraTicketDetailsCommentBodyContent[];
    version: number;
    type: string;
}
export interface JiraTicketDetailsCommentBodyContent {
    content?: JiraTicketDetailsCommentBodyContent[];
    type: string;
    text?: string;
}
export interface JiraTicketDetailsAuthor {
    displayName: string;
    self: string;
    avatarUrls: JiraTicketDetailsCommentAuthorAvatarUrls;
    emailAddress: string;
    accountType: string;
    active: boolean;
    timeZone: string;
    accountId: string;
}
export interface JiraTicketDetailsCommentAuthorAvatarUrls {
    '24x24': string;
    '32x32': string;
    '48x48': string;
    '16x16': string;
}
export interface JiraTicketDetailsCommentAuthor {
    displayName: string;
    self: string;
    avatarUrls: JiraTicketDetailsCommentAuthorAvatarUrls;
    emailAddress: string;
    accountType: string;
    active: boolean;
    timeZone: string;
    accountId: string;
}

export interface JiraTicketTransition {
    name: string;
    id: string;
}
