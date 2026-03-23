export interface OVFDeployWizardStepType {
    icon: string;
    stepName: string;
    active: boolean;
    visited: boolean;
}

export enum DEPLOY_OVF_TEMPLATE_STEPS {
    UPLOAD_FILES = 'Upload',
    NAME_AND_FOLDER = 'Name and Folder',
    COMPUTE_RESOURCE = 'Compute Resource',
    REVIEW = 'Review',
    STORAGE = 'Storage',
    NETWORK = 'Network',
    SUMMARY = 'Summary'
}

export type OVFDeployAllStepsDataType = {
    [key in DEPLOY_OVF_TEMPLATE_STEPS]: any
}

export interface VcenterOVFDeployMetaData {
    datacenter: string;
    host: string;
    network: string[];
    datastore: VcenterOVFDeployDatastoreItem[];
    cluster: VcenterOVFDeployClusterItem[];
}
export interface VcenterOVFDeployDatastoreItem {
    name: string;
    summary: VcenterOVFDeploySummary;
    isSelected?: boolean;
}
export interface VcenterOVFDeploySummary {
    access: string;
    freespace: string;
    freespaceInBytes: number;
    provisioned: string;
    capacity: string;
    capacity_fmt: number;
    type: string;
}
export interface VcenterOVFDeployClusterItem {
    pool_data: string[];
    name: string;
}