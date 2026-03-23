export interface CostSummary {
    overall_total: Overall_total;
    cloud_data: CloudDataItem[];
}

export interface Overall_total {
    total_ttm_cost: number;
    total_current_cost: number;
    estimated_change_status: string;
    total_estimated_cost: number;
    total_average_cost: number;
    total_previous_month_cost: number;
    estimated_change_percentage: number;
    monthly_change_percentage: number;
    monthly_change_status: string;
}
export interface CloudDataItem {
    platform_type: string;
    cost: Cost;
    cloud_type: string;
    total_accounts: number;
}

export interface Cost {
    total_ttm_cost: number;
    total_current_cost: number;
    cloud_cost_percentage: number;
    estimated_change_status: string;
    total_estimated_cost: number;
    total_average_cost: number;
    total_previous_month_cost: number;
    estimated_change_percentage: number;
    monthly_change_percentage: number;
    monthly_change_status: string;
}

export interface CostByCloudTypeItem {
    regions: (null | string)[];
    month_to_date_cost: number;
    cloud_type: string;
    cloud: string;
    total_resources: number;
    estimate_cost: number;
    year: number;
    account_name: string;
    account_uuid: string;
}

export interface CloudFilter {
    public_cloud: string[];
    managed_clouds: string[];
    cloud_accounts: string[];
    private_cloud: string[];
    cloud: string[];
}

// for graph widgets
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

export interface TrailingTwelveMonthsDataType {
    top_usage_data: TopUsageDataType;
    months_order: string[];
    trailing_month_data: TrailingMonthDataType[];
    cost_cloud_type_data: CostCloudTypeDataType[];
}
export interface TopUsageDataType {
    top_usage_by_cloud_type: TopUsageByCloudType;
    top_usage_by_cloud: TopUsageByCloud;
    top_usage_by_service: TopUageByService;
}

interface TopUsageByCloudType {
    cloud_type: string;
    total_cost: number;
    currency: string;
    usage_percentage: string;
    currency_unit: string;
    account_name: string;
}

interface TopUsageByCloud {
    cloud_type: string;
    total_cost: number;
    currency: string;
    usage_percentage: string;
    currency_unit: string;
    account_name: string;
}
interface TopUageByService {
    cloud_type: string;
    total_cost: number;
    currency: string;
    usage_percentage: string;
    currency_unit: string;
    account_name: string;
    service: string;
}
export interface TrailingMonthDataType {
    total_cost: number;
    currency_unit: string;
    cloud_type: string;
    cost_list: CostList;
}
interface CostList {
    [key: string]: number;
}
interface CostCloudTypeDataType {
    currency: string;
    total_cost: number;
    cloud_type: string;
    usage_percentage: string;
}

export interface ResourceLevelCostSummary {
    cloud_summary: CloudSummaryItem[];
    results: ResultsItem[];
    summary: Summary;
}
interface CloudSummaryItem {
    total_cost: number;
    name: string;
    cloud_image: string;
}
interface ResultsItem {
    account: string;
    previous_month_cost: number;
    service_count: number;
    change_percentage: number;
    resource_count: number;
    change_type: string;
    estimate_cost: number;
    month_to_date_cost: number;
    cloud: string;
}
interface Summary {
    total_month_cost: number;
    total_estimate_cost: number;
    total_accounts: number;
    total_previous_month_cost: number;
    total_resources: number;
    total_percentage_change: number;
    overall_change_type: string;
    total_services: number;
}

export interface ResourceCostItem {
    cloud_type: string;
    total_cost: number;
    account_uuid: string;
    cost_data: CostDataItem[];
    account_name: string;
    unit: string;
}

export interface CostDataItem {
    amount: number;
    resource_name: string;
    resource_type: string;
    service: string;
}
export interface AccountFilterItem {
    id: number;
    vms: number;
    cloud_type: string;
    uuid: string;
    account_name: string | null;
    name?: string;
    platform_type?: string;
    device_count?: number;
    storage?: string;
    memory?: number;
    colocation_cloud?: string;
    display_platform?: string;
    vm_url?: string;
    status: null | string;
}


// amount: number;
// resourceName: string;
// resourceType: string;
// accountName: string;
// service: string;