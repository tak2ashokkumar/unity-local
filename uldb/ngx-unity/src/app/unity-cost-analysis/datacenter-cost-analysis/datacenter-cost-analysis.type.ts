export interface CostAnalysisDCList {
    dc_uuid: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: CostAnalysisDCStatus[];
    bill: CostAnalysisDCBill;
}
export interface CostAnalysisDCStatus {
    status: string;
    category: string;
}

export interface CostAnalysisDCBill {
    amount: number;
    uuid: string;
}

