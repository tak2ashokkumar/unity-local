interface TicketDetails {
    via: Via;
    updated_at: string;
    assignee_id: number;
    id: number;
    custom_fields: CustomFieldsItem[];
    subject: string;
    collaborator_ids: any[];
    priority: string;
    type: string;
    status: string;
    description: string;
    can_be_solved_by_me: boolean;
    organization_id: number;
    followup_source_id: string;
    is_public: boolean;
    requester_id: number;
    recipient: string;
    url: string;
    fields: FieldsItem[];
    created_at: string;
    due_at: string;
    email_cc_ids: any[];
}
interface Via {
    source: Source;
    channel: string;
}
interface Source {
    to: To;
    from: From;
    rel: null;
}
interface To {
}
interface From {
}
interface UsersItem {
    organization_id: number;
    photo: string;
    id: number;
    agent: boolean;
    name: string;
}
