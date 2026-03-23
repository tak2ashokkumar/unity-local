export interface ManageReportScheduleCountDataType {
    reports: ManageReportSummaryCountDataType;
    schedules: ManageReportSummaryCountDataType;
}

// export interface ManageReportSummaryCountDataType {
//     datacenter: number;
//     public: number;
//     private: number;
// }

export interface ManageReportSummaryCountDataType {
    datacenter: number;
    ITSM: number;
    DCInventory: number;
    sustainability: number;
    Performance: number;
    costAnalysis: number;
    cloudInventory: number;
    'public': number;
    'private': number;
    events: number;
    DevOpsAutomation: number;
    UnityOneITSM: number;
}

export interface ManageReportDataType {
    uuid: string;
    name: string;
    frequency: string;
    feature: string;
    scheduled_time: string;
    report_meta: ManageReportMetaDataType;
    attachment: boolean;
    enable: boolean;
    default: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    scheduled_day: string;
    recipient_emails: string[];
    additional_emails: string[];
    user: string;
    preview?: boolean;
}

export interface ManageReportMetaDataType {
    cloudName?: ManageReportCloudDataType[];
    category?: string;
    cabinets?: string[];
    feature?: string;
    report_url?: string;
    reportType?: string;
    datacenters?: string[];
    active?: boolean;
    duration?: string;
    account?: string;
    report_type?: string;
    uuid?: string[];
    dc_uuids?: string[];
    from?: string;
    device_types?: string[];
    cabinet_uuids?: string[];
    to?: string;
}

export interface ManageReportCloudDataType {
    platform_type: string;
    name: string;
    uuid: string;
}