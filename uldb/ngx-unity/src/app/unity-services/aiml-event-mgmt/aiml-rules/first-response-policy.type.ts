import { RuleSet } from "src/app/shared/query-builder/query-builder.interfaces";

export interface FirstResponsePolicy {
    name: string;
    uuid: string;
    description: string;
    active: boolean;
    user: string;
    updated_at: string;
    created_at: string;
    filter_rule_meta: RuleSet[];
    alert_count: number;

    filters_enabled: boolean;
    suppress_time_type: string;
    suppress_hours: string;
    start_datetime: string;
    end_date_status: boolean;
    end_datetime: string;
    conditions: RuleSet;
}