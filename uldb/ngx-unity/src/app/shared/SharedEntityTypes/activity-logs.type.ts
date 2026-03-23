export interface ActivityLogs {
    action: string;
    actor: Actor;
    changes: string;
    content_type: ContentType;
    hijacker: string;
    id: string;
    object_id: string;
    object_repr: string;
    remote_addr: string;
    timestamp: string;
    actor_email: string;
    user_value: string;
    changes_log: string;
    changes_log_keys: Array<string>;
    additional_data: LogAdditionalData; 
}

export interface ContentType {
    app_label: string;
    readable_model_name: string;
}

export interface Actor {
    email: string;
}

export interface LogAdditionalData{
    action: string[];
}