export interface ConnectionConfigType {
    uuid: string;
    name: string;
    base_url: string;
    auth_type: string;
    oauth2_grant?: string;
    username?: string;
    password?: string;
    api_key?: string | null;
    api_key_field?: string | null;
    api_key_method?: string | null;
    token_url?: string;
    client_id?: string;
    client_secret?: string;
    scope?: string;
    status?: number;
}