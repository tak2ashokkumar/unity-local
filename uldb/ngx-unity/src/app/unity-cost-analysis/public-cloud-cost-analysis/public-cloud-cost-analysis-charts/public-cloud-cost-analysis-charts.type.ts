export interface CloudCostByTarget {
    is_current: boolean;
    data: CloudCostByTargetData[];
    month: string;
}

export interface CloudCostByTargetData {
    amount: number;
    unit: string;
    service?: string;
    region?: string;
}