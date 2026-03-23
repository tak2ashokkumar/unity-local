import { DatacenterFast } from "src/app/shared/SharedEntityTypes/datacenter.type";
import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";
import { DeviceDiscoveryAgentConfigurationType } from "../../unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type";

export interface PublicCloudAccount {
    uuid: string;
    name: string;
    discover_resources: boolean;
    discover_dependency: boolean;
    is_managed: boolean;
    ingest_event: boolean;
    event_inbound_webhook: PublicCloudEventIngestion;
    schedule_meta: UnityScheduleType;
    colocation_cloud: DatacenterFast;
    cost_analysis: boolean;
    azure_ad_integ: boolean;
    hostname: string;
    username: string;
    password: string;
    resource_pool_name: string;
    collector: DeviceDiscoveryAgentConfigurationType;

    // billing_account?: any;
    // billing_enabled?: boolean;
    co2emission_enabled?: boolean;
    sustainability: boolean;
    project_id?: string;
    // dataset?: any;
    // for gcp alone^^
}

export interface PublicCloudEventIngestion {
    webhook_url: string;
    token: string;
    attribute_map: PublicCloudEventIngestionAttribute[]
}

export interface PublicCloudEventIngestionAttribute {
    unity_attribute: string;
    mapped_attribute_expression: string;
    expression_type: string;
    regular_expression: string;
    choice_map: any[];
}

export interface PublicCloudParams {
    type: string;
    required: boolean;
    display_name: string;
    name: string;
    choices: any[];
}

export interface PublicCloudScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}