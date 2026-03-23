interface OnbDetails {
    url: string;
    id: number;
    name: string;
    email: string;
    storage: string;
    vpn_status: boolean;
    onb_status: Onb_status;
}
interface Onb_status {
    manage_error: boolean;
    monitoring_start: boolean;
    monitoring_end: boolean;
    excel_start: boolean;
    manage_start: boolean;
    excel_end: boolean;
    monitoring_error: boolean;
    vpn_req: boolean;
    manage_end: boolean;
}