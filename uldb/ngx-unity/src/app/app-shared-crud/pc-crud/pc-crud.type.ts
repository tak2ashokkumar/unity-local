export interface Base {
    platform_type: string;
    name: string;
    colocation_cloud: any;
}

export interface VMwareRaw {
    hostname: string;
    username: string;
    password: string;
}

export interface VcloudRaw {
    project: string;
    user_domain: String;
    project_domain: string;
}

export interface OpenstackRaw {
    vcloud_org: string;
}

export interface VMware extends Base {
    hostname: string;
    username: string;
    password: string;
    resource_pool_name: string;
    private_cloud : PrivateCloudDataType;
}

export interface PrivateCloudDataType{
    id : number;
    name : string;
    uuid : string;
    platform_type : string;
    collector : CollectorType;
}

export interface CollectorType {
    name: string;
    uuid: string;
}

export interface Openstack extends VMware {
    project: string;
    user_domain: String;
    project_domain: string;
}

export interface Vcloud extends VMware {
    vcloud_org: string;
    endpoint: string;
}

export interface Proxmox extends Base {
    host_address: string;
    username: string;
    password: string;
    domain?: string;
    private_cloud : PrivateCloudDataType;
}