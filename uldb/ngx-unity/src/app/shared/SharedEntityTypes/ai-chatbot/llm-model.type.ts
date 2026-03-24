export interface AILLMModel {
    id: number;
    organization: number;
    user: number;
    model_name: string;
    provider: string;
    active_for_applications: string[];
    description: string;
    endpoint_url: string;
    context_window: null;
    is_default: boolean;
    created_at: string;
    updated_at: string;

     // for ui use
    text?: string;
    type?: string;
    image?: string;
}

export interface SupportedLLMConfig {
    supported_llms: SupportedLLMConfigData[];
}
export interface SupportedLLMConfigData {
    active_for_applications: string[];
    description: string;
    provider: string;
    is_user_owned: boolean;
    endpoint_url: string;
    compatible_applications: LLMCompatibleModules;
    id: number;
    model_name: string;

    // for ui use
    text?: string;
    type?: string;
    image?: string;
}
export interface LLMCompatibleModules {
    assistant: string;
    network_agent: string;
    workflow_agent: string;
}