import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface LDAPConfigType {
    ldap_url: string;
    username: string;
    dc: string;
    uuid: string;
    ldap_port: number;
    schedule_meta: UnityScheduleType;
}

export interface LDAPUserType {
    first_name: string;
    last_name: string;
    email: string;
    ldap_user_id: string;
}

export interface LDAPUserImportFormDataType {
    cn: string;
    ou: string;
}

export interface LDAPConfigFormDataType {
    ldap_url: string;
    username: string;
    password?: string;
    dc: string;
    ldap_port: number;
}