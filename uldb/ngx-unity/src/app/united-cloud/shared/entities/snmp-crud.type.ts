import { SNMPVersionMapping, AuthLevelMapping } from 'src/app/shared/app-utility/app-utility.service';

export interface SNMPCrudType {
    connection_type: string;
    ip_address?: string;
    snmp_version?: SNMPVersionMapping;
    snmp_community?: string;
    snmp_authlevel?: AuthLevelMapping | '';
    snmp_authname?: string;
    snmp_authpass?: string;
    snmp_authalgo?: string;
    snmp_cryptoalgo?: string;
    snmp_cryptopass?: string;
    is_snmptrap_enabled?: boolean;
    mtp_templates?: number[];
    collector?: CollectorType;
}

export interface CollectorType {
    name?: string;
    uuid: string;
}

export class SNMPCrudTypeClass implements SNMPCrudType {
    ip_address: string;
    snmp_version: SNMPVersionMapping;
    snmp_community?: string;
    snmp_authlevel?: AuthLevelMapping | '';
    snmp_authname?: string;
    snmp_authpass?: string;
    snmp_authalgo?: string;
    snmp_cryptoalgo?: string;
    snmp_cryptopass?: string;
    connection_type: string;
    is_snmptrap_enabled?: boolean;
    mtp_templates?: number[];
    collector?: CollectorType;
}
