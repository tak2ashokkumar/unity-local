import { UnityAttributeUnitType } from "src/app/shared/SharedEntityTypes/common-utils.type";

export interface AddVMWizardStepType {
    icon: string;
    stepName: string;
    active: boolean;
    visited: boolean;
}

export enum ADD_VM_STEPS {
    CREATION_TYPE = 'Creation Type',
    NAME_AND_FOLDER = 'Name and Folder',
    COMPUTE_RESOURCE = 'Compute Resource',
    STORAGE = 'Storage',
    GUEST_OS = 'Guest OS',
    HARDWARE = 'Hardware',
    SUMMARY = 'Summary'
}

export type AllStepsDataType = {
    [key in ADD_VM_STEPS]: any
}

export interface VcenterVMCreationMetaData {
    datacenter: string;
    host: string;
    network: string[];
    datastore: VcenterVMCreateDatastoreItem[];
    cluster: VcenterVMCreateClusterItem[];
}
export interface VcenterVMCreateDatastoreItem {
    name: string;
    summary: VcenterVMCreateSummary;
    status?: string;
    host_count: number;
    cluster_ids: string[];
    ds_obj: string;
    host_name?: string;
    os?: string;
    vm_count: number;

    // added for UI purpose
    isSelected?: boolean;
}
export interface VcenterVMCreateSummary {
    access: string;
    freespace: UnityAttributeUnitType;
    provisioned: UnityAttributeUnitType;
    capacity: UnityAttributeUnitType;
    provisioned_percentage: UnityAttributeUnitType;
    unity: boolean;
    type: string;

    // added for UI purpose
    freespaceInBytes: number;
}
export interface VcenterVMCreateClusterItem {
    pool_data: string[];
    hosts: string[];
    name: string;
}


/**
 * Edit types
 */
export interface EditVMHardwareConfigType {
    network: EditVMNetworkItem[];
    harddisk: EditVMHarddiskItem[];
    datastore: EditVMDatastore[];
    controller: string;
    controller_editable: boolean;
    memory: EditVMMemory;
    cdrom: EditVMCdrom;
    cpu: { hot_add_cpu: boolean, value: number };
    video_card: EditVMVideoCard;
    USB_xHCI_controller: { label: string, value: string };
    USB_controller: { label: string, value: string };
    NVMe_controller: { label: string, value: string }[];
    SATA_controller: { label: string, value: string }[];
    SCSI_controller: { label: string, value: string }[];
    storage_controller_list: string[];
}
export interface EditVMNetworkItem {
    value: string;
    label: string;
}
export interface EditVMHarddiskItem {
    value: number;
    unit: string;
    label: string;
    editable: boolean;
    controller: string;
    datastore: EditVMDatastore;
}
export interface EditVMDatastore {
    name: string;
    summary: EditVMSummary;
}
export interface EditVMSummary {
    freeSpace: string;
    capacity: string;
}
export interface EditVMMemory {
    hot_add_memory: boolean;
    value: number;
    unit: string;
}
export interface EditVMCdrom {
    value: string;
    label: string;
}
export interface EditVMVideoCard {
    ram_size_in_MB: number;
    label: string;
    num_display: number;
    value: string;
    settings: string;
}
