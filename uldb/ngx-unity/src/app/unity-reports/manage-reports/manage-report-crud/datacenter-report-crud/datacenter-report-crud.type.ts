export interface ManageReportDatacenterType {
    id: number;
    cabinets: ManageReportDatacenterCabinetType[];
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: ManageReportDatacenterStatusType[];
    customer: number;
}

export interface ManageReportDatacenterCabinetType {
    url: string;
    id: number;
    name: string;
    uuid: string;
}

export interface ManageReportDatacenterStatusType {
    status: string;
    category: string;
}