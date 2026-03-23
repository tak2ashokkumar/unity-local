export interface CloudTotalCost {
    current: CloudTotalCostData;
    average: CloudTotalCostData;
    history: CloudTotalCostData[];
}

export interface CloudTotalCostData {
    amount: number;
    unit: string;
    month?: string;
    estimate?: number;
}