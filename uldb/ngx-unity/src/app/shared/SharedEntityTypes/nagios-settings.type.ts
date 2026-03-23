export interface NagiosEventType {
    id: string;
    uuid: string;
    name: string;
    keyword: string[];
    event_category_data: string[];
    is_enabled: boolean;
}

export interface NagiosEventCategory {
    id: string;
    uuid: string;
    name: string;
    keyword: string[];
    event_type_data: string[];
    is_enabled: boolean;
}