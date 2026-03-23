import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/device-common-utils.type";

export interface LicenseStates {
    expiring: number;
    unused: number;
    recently_queued: number;
    active: number;
    expired: number;
    unused_active: number;
  }
  
  export interface SystemManagerData {
    active_seats: number;
    unassigned_seats: number;
    total_seats: number;
    orgwide_enrolled_devices: number;
  }
  
  export interface OrganizationType {
    uuid: string;
    meraki_organization_id: string;
    name: string;
    clients_count: number;
    licensing_model: string;
    region_host: string;
    region_name: string;
    tags: string[];
    license_count: number;
    license_states: LicenseStates;
    license_status: string;
    expiry_date: string;
    system_manager_data: SystemManagerData;
    account: string;
    devices_count: number;
    networks_count: number;
    monitoring: DeviceMonitoringType;
  }
  