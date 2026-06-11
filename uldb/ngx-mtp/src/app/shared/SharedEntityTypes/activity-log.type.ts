export interface ActivityLog {
    id: number;
    actor: ActivityLogActor;
    hijacker: null;
    action: string;
    content_type: ActivityLogContent_type;
    object_pk: string;
    object_id: number;
    object_repr: string;
    changes: string;
    remote_addr: string;
    timestamp: string;
    additional_data: null;
    organizations: number[];
}
interface ActivityLogActor {
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
interface ActivityLogContent_type {
    app_label: string;
    model: string;
    readable_model_name: string;
    id: number;
}