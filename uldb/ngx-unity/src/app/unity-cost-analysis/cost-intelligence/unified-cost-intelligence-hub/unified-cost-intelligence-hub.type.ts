export interface CostByCloudType {
    cloud_type: string;
    total_cost: number;
    currency: string;
    usage_percentage: string;
}

export interface CostBySubscription {
    cloud_type: string;
    cost: number;
    currency: string;
    account_name: string;
}

export interface CostByServicesItem {
    total_cost: string;
    currency: string;
    cloud: string;
    cloud_image: string;
    account_list: AccountListItem[];
    service: string;
}

interface AccountListItem {
    currency: string;
    currency_unit: string;
    cost: number;
    // uuid: string;
    account_name: string;
}