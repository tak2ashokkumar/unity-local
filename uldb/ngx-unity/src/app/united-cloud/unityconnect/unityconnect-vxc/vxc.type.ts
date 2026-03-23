interface VXC {
    id: number;
    customer: number;
    requester_name: string;
    connection_type: string;
    ticket_id: string;
    requester: number;
}

interface ConnectionStatusData {
    state: string;
    result: Result;
}
interface Result {
    request: Request;
    users: UsersItem[];
}
interface Request {
    via: Via;
    updated_at: string;
    assignee_id: number;
    id: number;
    subject: string;
    collaborator_ids: any[];
    priority: string;
    type: string;
    status: string;
    description: string;
    can_be_solved_by_me: boolean;
    organization_id: number;
    followup_source_id: null;
    is_public: boolean;
    requester_id: number;
    recipient: null;
    created_at: string;
    due_at: null;
    email_cc_ids: any[];
}
