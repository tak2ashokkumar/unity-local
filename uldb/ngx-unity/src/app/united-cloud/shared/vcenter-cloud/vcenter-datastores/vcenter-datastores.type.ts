export interface DatastoreType {
    id: number;
    created_at: string;
    updated_at: string;
    uuid: string;
    name: string;
    datastore_id: string;
    datastore_type: string;
    host_count: number;
    vm_count: number;
    storage_usage: StorageUsageType;
    vsan: VsanType;
    datastore_status: string;
    cloud: number;
    datacenter: number;
    vcenter: number;
    cluster: number;
  }
  
  export interface StorageUsageType {
    provisioned: StorageUsageTypeValueUnitType;
    capacity: StorageUsageTypeValueUnitType;
    freespace: StorageUsageTypeValueUnitType;
    provisioned_percentage: StorageUsageTypeValueUnitType;
    access: string;
    unity: boolean;
    type: string;
  }
  
  export interface StorageUsageTypeValueUnitType{
    value:number;
    unit:string;
  }

  export interface VsanType extends StorageUsageType { }