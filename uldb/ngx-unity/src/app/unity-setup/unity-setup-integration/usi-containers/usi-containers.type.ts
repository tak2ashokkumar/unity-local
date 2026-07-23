import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';

export interface ContainerCloudOption {
    uuid: string;
    name: string;
}

export interface KubernetesIntegrationAccountType {
    uuid?: string;
    name: string;
    hostname: string;
    port?: number;
    api_token?: string;
    collector: string;
    cloud?: string;
    status?: string;
    display_type?: string;
    schedule_meta?: UnityScheduleType;
}
