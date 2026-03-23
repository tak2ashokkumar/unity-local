import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { DataCenterCabinet } from "../../shared/entities/datacenter-cabinet.type";
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';

export interface PDU {
    id: number;
    uuid: string;
    name: string;
    url: string;
    serial_number: string;
    manufacturer: PDUManufacturer;
    model: string;
    model_id: string;
    ip_address: string;
    cabinet: CabinetFast;
    max_amps: number;
    outlet_count: number;
    outlet_type: string;
    voltage: number;
    observium_status: any;
    colo_cloud_uuid: string;
    position: string;
    size: number;
    pdu_type: string;
    asset_tag: string;
    sockets: number;
    power_circuit: string;
    power_circuit_id: string;
    snmp_community: string;
    management_ip: string;
    cost: number;
    annual_escalation: number;
    co2_emission_value: number;
    monitoring: DeviceMonitoringType;
    tags: string[];
    failed_alerts_count: number;
    status: string;
    alias_name: string;
    os_type: string;
    os_name: string;
    dns_name: string;
    domain: string;
    discovery_method: string;
    first_discovered: string;
    environment: string;
    last_discovered: string;
    number_of_ports: number;
    last_rebooted: string;
    last_updated: string;
    description: string;
    note: string;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    uptime: string;
    collector: CollectorType;
}

export interface PDUManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface CollectorType {
    name: string;
    uuid: string;
}