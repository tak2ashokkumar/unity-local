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
    // Advanced suppression-decision controls (default values below reproduce legacy behavior)
    critical_bypass_policy?: string;
    recovery_event_policy?: string;
    repeat_compression_policy?: string;
    flap_policy?: AIMLSuppressionFlapPolicy;
    storm_policy?: AIMLSuppressionStormPolicy;
    decision_reason?: string;
    dry_run?: boolean;
    // UI-only helper fields flattened from flap_policy/storm_policy for the form controls
    flap_threshold?: number;
    storm_threshold?: number;
}

export interface AIMLSuppressionRuleCondition {
    attribute?: string;
    operator?: string;
    value?: string;
    exp?: string;
    expression?: string;
}

export interface AIMLSuppressionFlapPolicy {
    flap_threshold?: number;
}

export interface AIMLSuppressionStormPolicy {
    event_count_threshold?: number;
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
    metric_match_mode: string;
    component_match_mode: string;
    temporal_policy: string;
    topology_hops: number | null;
    min_group_size: number;
    reopen_window: number;
    auto_resolve_grace_period: number;
    conflict_strategy: string;
    storm_policy: CorrelationRuleStormPolicy | null;
    explain_decisions: boolean;
}

export interface CorrelationRuleStormPolicy {
    event_count_threshold?: number;
    burst_window_minutes?: number;
}

export interface CorrelationRuleFields {
    display_name: string;
    type: string;
    name: string;
    choices: string[][];
}