interface Ticket {
    follower_ids: number[];
    via: Via;
    updated_at: string;
    submitter_id: number;
    assignee_id: number;
    brand_id: number;
    id: number;
    custom_fields: CustomFieldsItem[];
    subject: string;
    sharing_agreement_ids: any[];
    allow_attachments: boolean;
    collaborator_ids: number[];
    priority: string;
    satisfaction_rating: Satisfaction_rating;
    type: string;
    status: string;
    description: string;
    tags: string[];
    forum_topic_id: null;
    organization_id: number;
    due_at: null;
    is_public: boolean;
    requester_id: number;
    followup_ids: any[];
    recipient: null;
    problem_id: null;
    url: string;
    fields: FieldsItem[];
    created_at: string;
    raw_subject: string;
    email_cc_ids: any[];
    allow_channelback: boolean;
    has_incidents: boolean;
    group_id: number;
    external_id: null;
    result_type: string;
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
interface CustomFieldsItem {
    id: number;
    value: string | null | boolean;
}
interface Satisfaction_rating {
    score: string;
}
interface FieldsItem {
    id: number;
    value: string | null | boolean;
}
