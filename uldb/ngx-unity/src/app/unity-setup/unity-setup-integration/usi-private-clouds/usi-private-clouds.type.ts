import { DatacenterFast } from "src/app/shared/SharedEntityTypes/datacenter.type";
import { UnityNotificationType, UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";
import { DeviceDiscoveryAgentConfigurationType } from "../../unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type";
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { UsiEventIngestionAttribute } from "../unity-setup-integration.service";

export interface VMwareVCenterAccount {
    uuid: string;
    name: string;
    discover_resources: boolean;
    discover_dependency: boolean;
    is_managed: boolean;
    ingest_event: boolean;
    event_inbound_webhook: VMwareVCenterEventIngestion;
    schedule_meta: UnityScheduleType;
    notification: UnityNotificationType;
    colocation_cloud: DatacenterFast;
    hostname: string;
    username: string;
    password: string;
    resource_pool_name: string;
    collector: DeviceDiscoveryAgentConfigurationType;
    ticket_subject_format: string;
}

export interface VMwareVCenterEventIngestion {
    webhook_url: string;
    token: string;
    attribute_map: VMwareVCenterEventIngestionAttribute[]
}

export interface VMwareVCenterEventIngestionAttribute {
    unity_attribute: string;
    mapped_attribute_expression: string;
    expression_type: string;
    regular_expression: string;
    custom_field?: string;
    choice_map: any[];
}

export interface VMwareVcenterEventIngestion {
    meta_data: VMwareVCenterParams[];
    attribute_map: UsiEventIngestionAttribute[];
}

export interface VMwareVCenterParams {
    type: string;
    required: boolean;
    display_name: string;
    name: string;
    choices: any[];
}

export interface VMwareVCenterScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}

export interface VMwareVM {
    id: number;
    cloud: Cloud;
    uuid: string;
    name: string;
    instance_id: string;
    management_ip: string;
    mgmt_ip_address: string;
    console_url: string;
    os_name: string;
    ssr_os: string;
    host_name: string;
    cpu_core: number;
    vcpus: number;
    disk_space: number;
    state: string;
    datacenter: string;
    guest_memory: number;
    vmpath_name: string;
    migration_date: any;
    migration_status: any;
    backup_date: any;
    backup_status: any;
    is_visible: boolean;
    ip_address: any;
    snmp_community: string;
    actions_in_progress: VMwareVMActionsInProgress;
    is_template: boolean;
    tags: string[];
    monitoring: DeviceMonitoringType;
    vmware_tools_mounted: boolean;
  }
  interface Cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
  }
  interface VMwareVMActionsInProgress {
    clone: boolean;
    reboot: boolean;
    convert_to_template: boolean;
    delete: boolean;
    power_off: boolean;
    power_on: boolean;
    guest_shutdown: boolean;
  }