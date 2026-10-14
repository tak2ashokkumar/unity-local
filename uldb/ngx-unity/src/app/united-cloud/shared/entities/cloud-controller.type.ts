import { PrivateCloudRemoteWebAccessType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';

export interface CloudController {
    name: string;
    uuid: string;
    platform_type: string;
    proxy: CloudControllerProxy;
    hypervisors: Hypervisors[];
    remote_web_access?: PrivateCloudRemoteWebAccessType;
}

export interface Hypervisors {
    name: string;
}

export interface CloudControllerProxy {
    proxy_fqdn: string;
    same_tab: boolean;
}
