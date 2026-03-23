export interface OciResourceDetail {
    id: number;
    uuid: string;
    name: string;
    region: string;
    resource_type: string;
    account: string;
    status: string;
    icon_path: string;
    account_uuid: string;
    tags: Tags;
}

interface Tags{
    [key: string]: string;
}

export interface OCIAccountCurrentMonthCost {
    amount: number;
    unit: string;
    month: string;
}

export interface OciLocationType {
    value: string;
    key: string;
}


