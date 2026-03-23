export interface budgetType {
    name: string;
    description: string;
    budget_amount: budgetAmount;
    scope: string;
    period: string;
    period_selection_start: string;
    period_selection_end: string;
    invoice: string;
    status: boolean;
    created_by: CreatedBy;
    updated_by: UpdatedBy;
    customer: number;
    cloud_id: number;
    cloud_account: cloudAccount;
    uuid: string;
    cloud_type: string;
    total_budget: string;
    same_for_all: boolean;
    same_for_all_amount: string;
    updated_at: string;
    created_at: string;
}

export interface budgetAmount {
    jab: string;
}

export interface cloudAccount {
    name: string;
    uuid: string;
}

export interface CreatedBy {
    first_name: string;
    last_name: string;
    last_login: string;
    updated_at: string;
}

export interface UpdatedBy {
    first_name: string;
    last_name: string;
    last_login: string;
}