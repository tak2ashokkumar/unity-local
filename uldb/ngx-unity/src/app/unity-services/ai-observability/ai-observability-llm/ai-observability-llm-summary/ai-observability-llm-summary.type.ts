export interface DurationDropdownType {
    period: string;
    from: string;
    to: string;
}

export interface LlmListType {
    service_type: string;
    uuid: string;
    name: string;
}

export interface LlmSummaryType {
    avg_cost: LlmSummaryAverageType;
    requests: LlmSummaryTotalType;
    avg_duration: LlmSummaryAverageType;
    cost: LlmSummaryTotalType;
    avg_client_tokens: LlmSummaryAverageType;
}

export interface LlmSummaryTotalType {
    change_percent: number;
    current_total: number;
    previous_total: number;
}

export interface LlmSummaryAverageType {
    change_percent: number;
    previous_avg: number;
    current_avg: number;
}

export interface RequestsByTimeType {
    timestamp: string;
    value: number;
}

export interface GenerationByCategoryType {
    name: string;
    total: number;
    percentage: number;
}

export interface GenerationByProviderType extends GenerationByCategoryType { }

export interface CostByEnvironmentType extends GenerationByCategoryType { }

export interface CostByApplicationType extends GenerationByCategoryType { }

export interface AvgTokensSummaryType {
    avg_prompt_tokens: number;
    avg_completion_tokens: number;
}

export interface TokensUsageType {
    timestamp: string;
    completion_tokens: number;
    client_tokens: number;
    prompt_tokens: number;
}

export interface TopAIModelsType {
    model: string;
    count: number;
    percentage: number;
}

export interface ModelsByTimeType {
    models: ModelsType[];
    timestamp: string;
    total_models_count: number;
}

export interface ModelsType {
    count: number;
    model: string;
}

export interface LlmSummaryWidgetAverageViewData {
    count: number;
    model: string
}