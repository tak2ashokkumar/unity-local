export interface ReportSchedule {
    recipient_emails: string[];
    additional_emails: string[];
    uuid: string;
    name: string;
    frequency: string;
    scheduled_day: string;
    scheduled_time: string;
    report_meta: ReportMeta;
    created_at: string;
    updated_at: string;
    enable: boolean;
    attachment: boolean;
}
export interface ReportMeta {
    report_url: string;
    [key: string]: any;
}