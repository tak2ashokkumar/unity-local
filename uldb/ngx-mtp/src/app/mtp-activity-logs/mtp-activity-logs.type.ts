export interface mtpDashboardActivityLog {
    id: number;
    actor: Actor;
    hijacker: null;
    action: string;
    content_type: Content_type;
    object_pk: string;
    object_id: number;
    object_repr: string;
    changes: string;
    remote_addr: string;
    timestamp: string;
    additional_data: LogAdditionalData; 
    organizations: number[];
}
interface Actor {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: string[];
    user_roles: string[];
    last_login: string;
}
interface Content_type {
    app_label: string;
    model: string;
    readable_model_name: string;
    id: number;
}

export interface LogAdditionalData{
    action: string[];
}