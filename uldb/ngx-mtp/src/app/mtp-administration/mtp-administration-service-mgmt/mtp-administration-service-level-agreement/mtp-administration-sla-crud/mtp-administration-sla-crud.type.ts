import { MTPTicketStatusType } from "src/app/shared/SharedEntityTypes/ticket-mgmt.type";

export interface MtpAdministrationSlaItemType {
    uuid: string;
    name: string;
    request_type: string;
    response_sla_kpi: MtpKpiType;
    resolution_sla_kpi: MtpKpiType;
    response_success_condition_values_map: MTPTicketStatusType;
    resolution_success_condition_values_map: MTPTicketStatusType[];
    priority: string;
    sla_group: number;
    tenant_names: string[];
    response_sla_item_id: string;
    resolution_sla_item_id: string;
    response_sla_hr: number;
    response_sla_min: number;
    response_emails: any[];
    response_reminder_percentage: number;
    resolution_sla_hr: number;
    resolution_sla_min: number;
    resolution_emails: any[];
    resolution_reminder_percentage: number;
}

export interface MtpCrmUsersType {
    contact_id: string;
    name: string;
    email: string;
    e_tag: string;
    state_code: number;
    parent_customer_id: string;
}

export interface MtpCrmContactsType {
    id: number;
    uuid: string;
    tenant_uuid: string;
    user_uuid: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_id: string;
    contact_email: string;
    crm_tenant_uuid: string;
}

export interface MtpKpiType {
    msdyn_advancedpauseconfiguration: boolean;
    msdyn_name: string;
    msdyn_entityname: string;
    msdyn_slakpiid: string;
    msdyn_entitydisplayname: string;
    msdyn_pauseconfigurationxml: string;
    statecode: number;
    msdyn_kpifield: string;
    msdyn_applicablefromfield: string;
    statuscode: number;
}