export interface OCIVmType {
    id: number;
    uuid: string;
    name: string;
    shape: string;
    ip_address: string;
    region: string;
    creation_date: string;
    availability_zone: string;
    instance_id: string;
    vm_name: string;
    instance_type: string;
    compartment_id: string;
    status: OCIVMStates;
    os: string;
    account: number;
    account_name: string;
    tags: OCIVMTagsType;
}

export enum OCIVMStates {
    MOVING = 'MOVING',
    PROVISIONING = 'PROVISIONING',

    RUNNING = 'RUNNING',
    STARTING = 'STARTING',
    STOPPING = 'STOPPING',
    STOPPED = 'STOPPED',

    CREATING_IMAGE = 'CREATING_IMAGE',

    TERMINATING = 'TERMINATING',
    TERMINATED = 'TERMINATED'
}

export interface OCICompartmentType {
    name: string;
    compartment_id: string;
}

export interface OCIAvailabilityDomainType {
    name: string;
    id: string;
    compartment_id: string;
}

export interface OCIShapeType {
    shape: string;
}

export interface OCISubnetType {
    display_name: string;
    id: string;
    compartment_id: string;
}

export interface OCIImageType {
    display_name: string;
    id: string;
    compartment_id: string;
}

export interface OCIRegionType {
    status: string;
    region_key: string;
    region_name: string;
    is_home_region: boolean;
}

export interface OCIVMTagsType {
    [key: string]: string;
}