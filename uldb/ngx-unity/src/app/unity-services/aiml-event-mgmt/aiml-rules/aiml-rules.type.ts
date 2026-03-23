import { RuleSet } from "src/app/shared/query-builder/query-builder.interfaces";

export interface AIMLSuppressionRule {
    name: string;
    uuid: string;
    description: string;
    active: boolean;
    user: string;
    updated_at: string;
    created_at: string;
    filter_rule_meta: AIMLSuppressionRuleCondition[];
    conditions: AIMLSuppressionRuleCondition[];
    alert_count: number;
}

export interface AIMLSuppressionRuleCondition {
    attribute?: string;
    operator?: string;
    value?: string;
    exp?: string;
    expression?: string;
}


export interface AIMLCorrelationRule {
    uuid: string;
    name: string;
    condition_count: number;
    created_datetime: string;
    updated_datetime: string;
    filter_rule_meta: RuleSet;
    correlators: string[];
    description: string;
    user: string;
    is_active: boolean;
    time_window: string;
    specificity: number;
    priority: number;
    order: number;
    relevance: number;
    //user addded for development purpose
    conditions: RuleSet;
    // operatorOptions: any;
    // valueType: string;
    // valueOptions?: string[];
    filter_enabled: boolean;
}

export interface CorrelationRuleFields {
    display_name: string;
    type: string;
    name: string;
    choices: string[][];
}