export interface BudgetDetailsType {
    name: string;
    description: string;
    budget_amount: BudgetAmount;
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
    cloud_account: CloudAccount;
    uuid: string;
    cloud_type: string;
    total_budget: number;
    same_for_all: boolean;
    same_for_all_amount: string;
    updated_at: string;
    created_at: string;
    budget_amount_detail: BudgetAmountDetailItem[];
}
interface BudgetAmount {
    [key: string]: number;
}
interface CreatedBy {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: string[];
    user_roles: string[];
    last_login: string;
}
interface UpdatedBy {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: string[];
    user_roles: string[];
    last_login: string;
}
export interface CloudAccount {
    name: string;
    uuid: string;
}

interface BudgetAmountDetailItem {
    amount: string;
    difference: string;
    name: string;
    spent: string;
}