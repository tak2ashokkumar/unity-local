export interface EmailType {
    uuid: string;
    name: string;
    account_type: string;
    client_id: string;
    tenant_id: string;
    client_secret: string;
    topic_name: string;
    email: string;
    collector: string;
    is_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    event_inbound_webhook: EventInboundWebhookType;
    event_inbound_api: null;
}

export interface EventInboundWebhookType {
    uuid: string;
    token: string;
    token_expiry_date: string;
    webhook_url: string;
    attribute_map: AttributeMapType[];
}

export interface AttributeMapType {
    unity_attribute: string;
    custom_field: null;
    mapped_attribute_expression: string;
    expression_type: string;
    regular_expression: string;
    choice_map: ChoiceMapType[];
}

export interface ChoiceMapType {
    unity_value: string;
    mapped_value: string;
}

export interface GmailAuthType {
    auth_url: string;
}