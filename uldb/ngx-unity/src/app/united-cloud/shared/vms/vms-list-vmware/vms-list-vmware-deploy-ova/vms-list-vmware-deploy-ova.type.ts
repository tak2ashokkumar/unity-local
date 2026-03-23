export interface OVADeployWizardStepType {
    icon: string;
    stepName: string;
    active: boolean;
    visited: boolean;
}

export enum DEPLOY_OVA_TEMPLATE_STEPS {
    UPLOAD_FILES = 'Upload',
    NAME_AND_FOLDER = 'Name and Folder',
    COMPUTE_RESOURCE = 'Compute Resource',
    STORAGE = 'Storage',
    NETWORK = 'Network',
    SUMMARY = 'Summary'
}

export type OVADeployAllStepsDataType = {
    [key in DEPLOY_OVA_TEMPLATE_STEPS]: any
}

export interface VcenterOVADeployMetaData {
    datacenter: string;
    host: string;
    network: string[];
    datastore: VcenterOVADeployDatastoreItem[];
    cluster: VcenterOVADeployClusterItem[];
}
export interface VcenterOVADeployDatastoreItem {
    name: string;
    summary: VcenterOVADeploySummary;
    isSelected?: boolean;
}
export interface VcenterOVADeploySummary {
    access: string;
    freespace: string;
    freespaceInBytes: number;
    provisioned: string;
    capacity: string;
    capacity_fmt: number;
    type: string;
}
export interface VcenterOVADeployClusterItem {
    pool_data: string[];
    name: string;
}