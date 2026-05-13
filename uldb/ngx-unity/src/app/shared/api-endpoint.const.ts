import { HttpParams } from '@angular/common/http';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { environment } from 'src/environments/environment';
import { MESH_SERVICE_TYPE_MAPPING } from '../united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DeviceGraphTypeMapping, DeviceMapping, PlatFormMapping, ServerSidePlatFormMapping } from './app-utility/app-utility.service';
import { SelfHelpEndpointMapping } from './self-help-popup/self-help-endpoint.enum';

/**
 * Constant Data loading from uldb/static/assets
 */
export const GET_DUMMY_JSON = () => `${environment.staticData}dummy-api-data/test-data.json`;
export const GET_DUMMY_VM_RESOURCE_PARAMS = () => `${environment.staticData}dummy-api-data/vm-resource-params.json`;
export const GET_INITAIL_WORKFLOW = () => `${environment.staticData}workflow/initial_workflow.json`;
export const GET_WORKFLOW_DETAILS = () => `${environment.staticData}workflow/workflow_details.json`;


export const AZURE_RESOUCE_TEST = () => `${environment.staticData}azure-data/azure-resources.json`;

export const PRIVATE_CLOUDS = () => `customer/private_cloud_fast/`;

export const PRIVATE_CLOUD_FAST_BY_ID = (cloudId: string) => `customer/private_cloud_fast/${cloudId}/`;

export const PRIVATE_CLOUD_BY_ID = (pcId: string) => `customer/private_cloud/${pcId}/`;

export const ADD_PRIVATE_CLOUD = () => `customer/private_cloud/`;

export const PRIVATE_CLOUD_OTHER_DETAILS = (pcId: string, platformType: ServerSidePlatFormMapping) => {
    switch (platformType) {
        case ServerSidePlatFormMapping.VMWARE: return `customer/customer_vcenters/${pcId}/`;
        case ServerSidePlatFormMapping.OPENSTACK: return `customer/openstack_controllers/${pcId}/`;
        case ServerSidePlatFormMapping.VCLOUD: return `customer/vclouds/instance/${pcId}/`;
        case ServerSidePlatFormMapping.PROXMOX: return `customer/proxmox/cluster/${pcId}/`;
        case ServerSidePlatFormMapping.G3_KVM: return `customer/g3_kvm/cluster/${pcId}/`;
        case ServerSidePlatFormMapping.HYPER_V: return `customer/hyperv/cluster/${pcId}/`;
        case ServerSidePlatFormMapping.NUTANIX: return `customer/nutanix/${pcId}/clusters/`;
        default: console.error('Invalid platform type : ', platformType);
    }
}

export const PRIVATE_CLOUD_CHANGE_PASSWORD = (pcId: string, platformType: string) => {
    switch (platformType) {
        case ServerSidePlatFormMapping.VMWARE: return `customer/managed/vcenter/accounts/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER: return `customer/managed/unity-vcenter/accounts/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.OPENSTACK: return `customer/openstack_controllers/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.VCLOUD: return `customer/vclouds/instance/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.PROXMOX: return `customer/proxmox/cluster/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.G3_KVM: return `customer/g3_kvm/cluster/${pcId}/change_password/`;
        case ServerSidePlatFormMapping.HYPER_V: return `customer/hyperv/cluster/${pcId}/change_password/`;
        default: console.error('Invalid platform type : ', platformType);
    }
}

export const VM_LIST_BY_PLATFORM = (cloud_id: string, platformType: string) => {
    switch (platformType) {
        case PlatFormMapping.CUSTOM: return `rest/customer/virtual_machines/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.VMWARE:
        case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
            return `rest/vmware/migrate/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.OPENSTACK: return `rest/openstack/migration/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.VCLOUD: return `customer/vclouds/virtual_machines/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.PROXMOX:
            return `customer/proxmox/vms/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.G3_KVM:
            return `customer/g3_kvm/vms/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.HYPER_V:
            return `customer/hyperv/vms/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.ESXI:
            return `rest/vmware/esxi_vms/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        case PlatFormMapping.NUTANIX:
            return `customer/nutanix-devices/virtual_machines/?platform_type=${platformType}&cloud_id=${cloud_id}`;
        default: console.error('Invalid platform type : ', platformType);
    }
};

export const PRIVATE_CLOUD_WIDGET_DATA = (pcId: string) => `customer/private_cloud/${pcId}/widget_data/`;

export const PRIVATE_CLOUD_ESXI_WIDGET_DATA = (pcId: string, serverId: string) => `customer/private_cloud/${pcId}/esxi_widget_data/${serverId}/`;

export const POLL_PRIVATE_CLOUD_UPDATE = (pcId: string) => `customer/private_cloud/${pcId}/sync_data/`;

export const PRIVATE_CLOUD_CUSTOM_DEVICES = (uuid: string) => CUSTOM_DEVICES(uuid);

export const PRIVATE_CLOUD_CONTAINERS = (uuid: string) => `customer/kubernetes/account/?cloud_uuid=${uuid}`;

export const PRIVATE_CLOUD_CONTAINERS_PODS = (uuid: string) => `customer/kubernetes/pods/?cloud_uuid=${uuid}`;

export const PRIVATE_CLOUD_STORAGE = (uuid: string) => `customer/storagedevices/?uuid=${uuid}`;

export const CUSTOM_DEVICES = (uuid: string) => `customer/customdevices/?uuid=${uuid}`;


export const NUTANIX_WIDGET_DATA = (pcId: string) => `/customer/nutanix/${pcId}/all/`;

export const NUTANIX_CLUSTER = (pcId: string) => `/customer/nutanix/${pcId}/clusters/`;

export const NUTANIX_HOST = (pcId: string) => `/customer/nutanix/${pcId}/hosts/`;

export const NUTANIX_DISK = (pcId: string) => `/customer/nutanix/${pcId}/disks/`;

export const NUTANIX_STORAGE_CONTAINERS = (pcId: string) => `/customer/nutanix/${pcId}/storage_containers/`;
// export const NUTANIX_STORAGE_CONTAINERS_ADD = (pcId: string) => `/customer/nutanix/${pcId}/storage_containers/`;
// export const NUTANIX_STORAGE_CONTAINERS_EDIT = (pcId: string, uuid: string) => `/customer/nutanix/${pcId}/storage_containers/${uuid}/`;
// export const NUTANIX_STORAGE_CONTAINERS_TOGGLE_STATUS = (pcId: string, uuid: string) => `/customer/nutanix/${pcId}/storage_containers/${uuid}/toggle`;
// export const NUTANIX_STORAGE_CONTAINERS_DELETE = (pcId: string, uuid: string) => `/customer/nutanix/${pcId}/storage_containers/${uuid}/`;

export const NUTANIX_VDISK = (pcId: string) => `/customer/nutanix/${pcId}/vdisks/`;

export const NUTANIX_VIRTUAL_MACHINES = (pcId: string) => `/customer/nutanix/${pcId}/vms/`;

export const NUTANIX_STORAGE_POOLS = (pcId: string) => `/customer/nutanix/${pcId}/storage_pools/`;

export const NUTANIX_DISCOVERY_LIST = (pcId: string) => `/customer/nutanix/${pcId}/discovery/`;

export const LIST_USER = () => `customer/organizationusers/`;

export const USER_CARRIER_LIST = () => `customer/carrier_data/?page_size=0`;

export const LIST_ACTIVE_USER = () => `customer/organizationusers/get_active_users/`;

export const CREATE_USER = () => `customer/organizationusers/`;

export const UPDATE_USER = (uuid: string) => `customer/organizationusers/${uuid}/`;

export const INVITE_USER = (userId: string) => `customer/organizationusers/${userId}/send_email_invitation/`;

export const TOGGLE_USER = (uuid: string) => `customer/organizationusers/${uuid}/toggle_status/`;

export const USER_ROLES = () => `/customer/role/?page_size=0`;

export const LIST_MAINTENACE_SCHEDULE = () => `customer/mschedules/`;

export const CREATE_MAINTENACE_SCHEDULE = () => `customer/mschedules/`;

export const UPDATE_MAINTENACE_SCHEDULE = (uuid: string) => `customer/mschedules/${uuid}/`;

export const DELETE_MAINTENACE_SCHEDULE = (uuid: string) => `customer/mschedules/${uuid}/`;

export const RESET_PASSWORD = () => `customer/uldbusers/send_password_reset_link/`;

export const DEVICE_LIST_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return ``
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/`;
        case DeviceMapping.SWITCHES: return `customer/switches/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/`;
        case DeviceMapping.CLOUD_CONTROLLER: return `customer/private_cloud/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/`;
        case DeviceMapping.PDU: return `customer/pdus/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/`;
        case DeviceMapping.MOBILE_DEVICE: return `customer/mobiledevices/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

// export const SERVER_DEVICE_DATA = (deviceId: string) => `customer/observium/servers/${deviceId}/get_device_data/`;

export const DEVICE_DATA_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_device_data/`;
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_device_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_device_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_device_data/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_device_data/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_device_data/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/uptimerobot/${deviceId}/get_device_uptime_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_device_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_device_data/`
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_device_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_device_data/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_device_data/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_device_data/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_device_data/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_device_data/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_device_data/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_device_data/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/monitoring/status/`;

        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/status/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ACTIVITY_LOG = (deviceType: string, deviceId: string) => `/customer/${deviceType}/${deviceId}/update_activity_log/`;

export const CHECK_AUTH_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/check_auth/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/check_auth/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/check_auth/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/check_auth/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/check_auth/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/check_auth/`
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/check_auth/`;
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/check_auth/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `rest/vmware_vms/${deviceId}/check_auth/`;
        case DeviceMapping.DEVOPS_CONTROLLER: return `rest/customer/devops_controllers/${deviceId}/check_auth/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/check_auth/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/check_auth/`;
        case DeviceMapping.PROXMOX: return `customer/proxmox/vms/${deviceId}/check_auth/`;
        case DeviceMapping.G3_KVM: return `customer/g3_kvm/vms/${deviceId}/check_auth/`;
        case DeviceMapping.COLLECTOR: return `customer/agent/config/${deviceId}/check_agent_auth/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/check_auth/?azure=true`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/details/`
        // case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/check_auth`;
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/vmware_vms/${deviceId}/get_vm_details/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const CREATE_TICKET = () => `customer/ticketorganization/create_request/`;

export const GET_DEVICE_SENSOR_BY_DEVICETYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_sensor_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_sensor_data/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_sensor_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_sensor_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_sensor_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_sensor_data/`
        // case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/check_auth`;
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_sensor_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_sensor_data/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_sensor_data/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_sensor_data/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_sensor_data/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_sensor_data/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_sensor_data/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_sensor_data/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_sensor_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_DEVICE_STATUS_BY_DEVICETYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_status_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_status_data/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_status_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_status_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_status_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_status_data/`
        // case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/check_auth`;
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_status_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_status_data/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_status_data/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_status_data/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_status_data/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_status_data/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_status_data/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_status_data/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_status_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}
export const GRAPH_HEIGHT = () => 100;
export const GRAPH_WIDTH = () => 500;
//USED IN OVERVIEW TAB
export const GET_DEVICE_GRAPH_BY_TYPE = (deviceId: string, type: DeviceGraphTypeMapping, deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_graph_by_type/?graph_type=${type}&height=${GRAPH_HEIGHT()}&legend=yes&width=${GRAPH_WIDTH()}/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_graph_by_type/?graph_type=${type}&height=${GRAPH_HEIGHT()}&legend=yes&width=${GRAPH_WIDTH()}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_GRAPH_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_graph_set_by_type/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_graph_set_by_type/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_graph_set_by_type/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_GRAPH_BY_GRAPH_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.LB: return `customer/observium/load_balancer/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_graph_by_type/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_graph_by_type/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_graph_by_type/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_GRAPH_BY_OBSERVIUM_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_graph_by_observium_id/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_graph_by_observium_id/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_graph_by_observium_id/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_GRAPH_SET_BY_DEVICE_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_graph_set_by_id/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_graph_set_by_id/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_graph_set_by_id/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_PORTS_BY_DEVICE_TYPE_AND_DEVICEID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_device_port_details/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_device_port_details/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_device_port_details/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_device_port_details/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_device_port_details/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_device_port_details/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_device_port_details/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_device_port_details/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_device_port_details/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_device_port_details/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_device_port_details/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_device_port_details/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_device_port_details/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_device_port_details/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_device_port_details/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_device_port_details/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_PORT_GRAPH_BY_DEVICE_TYPE_DEVICEID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_port_details_graph_set/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_port_details_graph_set/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_port_details_graph_set/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_alert_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/observium/custom_vm/${deviceId}/get_alert_data/`;
        case DeviceMapping.FIREWALL: return `customer/observium/firewall/${deviceId}/get_alert_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_alert_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/observium/load_balancer/${deviceId}/get_alert_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/observium/openstack/${deviceId}/get_alert_data/`
        case DeviceMapping.SWITCHES: return `customer/observium/switch/${deviceId}/get_alert_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        case DeviceMapping.ESXI:
            return `customer/observium/vmware/${deviceId}/get_alert_data/`;
        case DeviceMapping.VCLOUD: return `customer/observium/vcloud/${deviceId}/get_alert_data/`;
        case DeviceMapping.PDU: return `customer/observium/pdu/${deviceId}/get_alert_data/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `customer/observium/aws/${deviceId}/get_alert_data/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_alert_data/`;
        case DeviceMapping.MAC_MINI: return `customer/observium/macdevice/${deviceId}/get_alert_data/`;
        case DeviceMapping.PROXMOX: return `customer/observium/proxmox/${deviceId}/get_alert_data/`;
        case DeviceMapping.G3_KVM: return `customer/observium/g3_kvm/${deviceId}/get_alert_data/`;
        case DeviceMapping.HYPER_V: return `customer/observium/hyperv/${deviceId}/get_alert_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const DEVICE_POWER_STATUS_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/power_status/`;
        // case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/get_device_data/`;
        // case DeviceMapping.FIREWALL: return `customer/firewall/${deviceId}/get_device_data/`;
        // case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_device_data/`;
        // case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/get_device_data/`;
        // case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/get_device_data/`
        // case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/check_auth`;
        // case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/get_device_data/`;
        // case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `customer/vmware_vms/${deviceId}/get_device_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/check_password/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const TOGGLE_POWER_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, currentStatus: boolean) => {
    const powerStatus: string = currentStatus ? 'power_off' : 'power_on';
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/${powerStatus}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/${powerStatus}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${powerStatus}/`
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${powerStatus}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${powerStatus}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${powerStatus}/`;
        case DeviceMapping.GCP_VIRTUAL_MACHINE: return `customer/gcp/instances/${deviceId}/${powerStatus}/`;
        case DeviceMapping.PROXMOX: return `customer/proxmox/vms/${deviceId}/${powerStatus}/`;
        case DeviceMapping.G3_KVM: return `customer/g3_kvm/vms/${deviceId}/${powerStatus}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const CHASSIS_STATISTICS_BY_DEVICE_ID = (deviceId: string) => `customer/bm_servers/${deviceId}/chassis_statistics/`;

export const CREATE_TASK_BY_CLOUD_ID_AND_PLATFORM = (pcId: string, platform: PlatFormMapping) => {
    switch (platform) {
        case PlatFormMapping.VMWARE:
        case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
            return `rest/vmware/migrate/virtual_machines/?cloud_id=${pcId}`;
        case PlatFormMapping.OPENSTACK:
            return `rest/openstack/migration/${pcId}/virtual_machines/`;
        case PlatFormMapping.VCLOUD:
            return `customer/vclouds/virtual_machines/sync_vms/?cloud_id=${pcId}`;
        case PlatFormMapping.PROXMOX:
            return `customer/proxmox/cluster/${pcId}/sync_vms/`;
        case PlatFormMapping.G3_KVM:
            return `customer/g3_kvm/cluster/${pcId}/sync_vms/`;
        case PlatFormMapping.HYPER_V:
            return `customer/hyperv/cluster/${pcId}/sync_vms/`;
        case PlatFormMapping.ESXI:
            return `rest/vmware/esxi_vms/virtual_machines/?cloud_id=${pcId}`;
        default: console.error('Invalid platform type : ', platform);
            break;
    }
};

export const CREATE_TASK_BY_PLATFORM = (platform: PlatFormMapping) => {
    switch (platform) {
        // case PlatFormMapping.VMWARE:
        //     return `rest/vmware/migrate/virtual_machines/`; // not syncing Vmware so commenting out this api.
        case PlatFormMapping.OPENSTACK:
            return `rest/v3/vm_backup/get_vm_list/`;
        case PlatFormMapping.VCLOUD:
            return `customer/vclouds/virtual_machines/sync_vms/`;
        case PlatFormMapping.PROXMOX:
            return `customer/proxmox/cluster/sync_all_cloud_vms/`;
        case PlatFormMapping.G3_KVM:
            return `customer/g3_kvm/cluster/sync_all_cloud_vms/`;
        case PlatFormMapping.HYPER_V:
            return `customer/hyperv/cluster/sync_all_cloud_vms`;
        case PlatFormMapping.ESXI:
            return `rest/vmware/esxi_vms/virtual_machines/`;
        default: console.error('Invalid platform type : ', platform);
            break;
    }
};

export const CHECK_TASK_STATUS_BY_TASK_ID = (taskId: string) => `task/${taskId}/`;

export const CHECK_TASK_STATUS_BY_TASK_ID_AS_PARAMS = (url: string, taskId: string) => `${url}?task_id=${taskId}`;

export const GET_EXECUTION_STATUS_FOR_ON_CHAT = (taskId: string) => `/rest/orchestration/agentic_workflow_executions/${taskId}/chat_response/`;

export const GET_EXECUTION_STATUS_FOR_AGENTIC_WF_EXECUTE = (taskId: string) => `/rest/orchestration/agentic_workflow_preview/${taskId}/`;

export const GET_VM_LIST_BY_PLATFORM = (platform: PlatFormMapping) => {
    switch (platform) {
        case PlatFormMapping.VMWARE:
            return `rest/vmware/migrate/`;
        case PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
            return `rest/vmware/migrate/`;
        case PlatFormMapping.OPENSTACK:
            return `rest/openstack/migration/`;
        case PlatFormMapping.CUSTOM:
            return 'rest/customer/virtual_machines/';
        case PlatFormMapping.VCLOUD:
            return 'customer/vclouds/virtual_machines/';
        case PlatFormMapping.PROXMOX:
            return `customer/proxmox/vms/`;
        case PlatFormMapping.G3_KVM:
            return `customer/g3_kvm/vms/`;
        case PlatFormMapping.HYPER_V:
            return `customer/hyperv/vms/`;
        case PlatFormMapping.ESXI:
            return `rest/vmware/esxi_vms/`;
        case PlatFormMapping.NUTANIX:
            return `customer/nutanix-devices/virtual_machines/`;
        default: console.error('Invalid platform type : ', platform);
            break;
    }
};

export const GET_VM_BY_PLATFORM_AND_ID = (platform: PlatFormMapping, id: string) => {
    switch (platform) {
        case PlatFormMapping.VMWARE:
            return `rest/vmware/migrate/${id}/`;
        case PlatFormMapping.OPENSTACK:
            return `rest/openstack/migration/${id}/`;
        case PlatFormMapping.VCLOUD:
            return `customer/vclouds/virtual_machines/${id}/`;
        case PlatFormMapping.PROXMOX:
            return `customer/proxmox/vms/${id}/`;
        case PlatFormMapping.G3_KVM:
            return `customer/g3_kvm/vms/${id}/`;
        case PlatFormMapping.ESXI:
            return `rest/vmware/esxi_vms/${id}/`;
        default: console.error('Invalid platform type : ', platform);
            break;
    }
};

export const DATA_CENTERS = () => `customer/colo_cloud/`;

export const ADD_DATA_CENTERS = () => DATA_CENTERS();

export const EDIT_DATA_CENTERS = (dcId: string) => `customer/colo_cloud/${dcId}/`;

export const GET_OFFLINE_LOCATION_DATA = () => `${environment.staticData}locations/offline-locations.json`;

export const PRIVATE_CLOUDS_BY_DATACENTER_ID = (dcId: string) => `customer/colo_cloud/${dcId}/private_clouds`;

export const PUDS_BY_DATACENTER_ID = (dcId: string) => `customer/colo_cloud/${dcId}/pdus/`;

export const CABINET_DEVIECS_BY_CABINET_ID = (cabinetId: string) => `customer/cabinets/${cabinetId}/cabinet_page/`;

export const PDU_SOCKET_MAPPING = (pduId: string) => `customer/pdu_socket_mappings/?pdu_id=${pduId}`;

export const CABINETS_BY_DATACENTER_ID = (dcId: string) => `customer/colo_cloud/${dcId}/cabinets/`;

export const GET_CABINETS = () => `customer/cabinets/`;

export const ADD_CABINET = () => `customer/cabinets/`;

export const EDIT_CABINET = (cabinetId: string) => `customer/cabinets/${cabinetId}/`;

export const DELETE_CABINET = (cabinetId: string) => `customer/cabinets/${cabinetId}/`;

export const UPDATE_CABINET_DEVICE_POSITION = (cabinetId: string) => `customer/cabinets/${cabinetId}/update_cabinet_devices_position/`;

export const DEVICE_PDU_SOCKET_MAPPING = (pduId: number) => `/customer/pdu_socket_mappings/?pdu_id=${pduId}`;

export const BLINK_SERVER = (deviceId: string) => `/customer/bm_servers/${deviceId}/blink/`;

export const CELERY_TASK_FOR_AWS = () => `/customer/managed/aws/virtualmachine`;

export const TOGGLE_AWS_POWER = (powerStatus: boolean, uuid: string) => {
    const action = powerStatus ? 'stop_instance' : 'start_instance'
    // return `customer/aws/${accountId}/region/${region}/instance/${instanceId}/${action}/`
    return `customer/managed/aws/virtualmachine/${uuid}/${action}/`
};

export const GET_ALL_VMS = () => `/customer/virtual_machines/get_all_virtualmachines/`;

export const GET_AZURE_VMS = () => `customer/managed/azure/resources/virtual_machines/`;

export const POWER_TOGGLE_AZURE_VMS = () => `customer/managed/azure/resources/virtual_machines/toggle_power_state/`;

export const DELETE_AZURE_VMS = () => `customer/managed/azure/resources/virtual_machines/delete_azure_vm/`;

export const VCLOUD_VMS_SYNC = (cloudId: string) => `customer/vclouds/virtual_machines/sync_vms/?cloud_id=${cloudId}`;

export const ACTIVITY_LOGS = () => `rest/activity_logs/`;

export const MONITORING_DATACENTER = () => `customer/observium/pdu/`;

export const PDU_GRAPH_HEIGHT = () => 150;

export const PDU_GRAPH_WIDTH = () => 228;

export const PDU_GRAPHS = (pduUUID: string, graphType: string) => `customer/observium/pdu/${pduUUID}/get_graph_by_type/?graph_type=${graphType}&height=${PDU_GRAPH_HEIGHT()}&width=${PDU_GRAPH_WIDTH()}`;

// System Monitoring Constants
export const GET_SYSTEM_MONITORING_DEVICES = () => `customer/monitor_widget`;

export const UPDATE_SYSTEM_MONITORING_GRAPH = () => `customer/monitor_widget/update_graph/`;

export const UPDATE_SYSTEM_MONITORING_DEVICE_POSITION = () => `customer/monitor_widget/update_device/`;

//Dashboard Onboarding WIdget
export const GET_ONBOARDING_DETAILS = () => `customer/organization/`;

//Dashboard Private and Public cloud widgets
export const GET_PRIVATE_CLOUD_FAST = () => `/customer/private_cloud_fast/`;

export const GET_PRIVATE_CLOUD_COUNT = () => `/customer/private_cloud_fast/cloud_count/`;

export const GET_CLOUD_ALERTS = (cloudId: string) => `/customer/private_cloud/${cloudId}/alerts_count/`;

export const GET_AWS_CLOUD_LIST = () => `/customer/aws/`;

export const GET_AWS_SUMMARY = () => `customer/managed/aws/accounts/summary/`;

export const GET_AWS_CLOUD_DATA = (cloudId: number) => `/customer/cloud_data/${cloudId}/aws_data/`;

export const GET_AWS_BUCKET_DATA = (accountId: string, region: string) => `/customer/aws/${accountId}/region/${region}/s3_bucket/`;

export const GET_AZURE_CLOUD_LIST = () => `/customer/azure/`;

export const GET_AZURE_SUMMARY = () => `/customer/managed/azure/accounts/summary/`;

export const GET_AZURE_CLOUD_DATA = (cloudId: number) => `/customer/cloud_data/${cloudId}/azure_data/`;

export const POLL_AWS_AZURE_CLOUD_UPDATE = () => `/customer/cloud_data/update_cloud_data/`;

export const POLL_GCP_CLOUD_UPDATE = () => `/customer/cloud_data/sync_user_gcp_accounts/`;

export const POLL_OCI_CLOUD_UPDATE = () => `/customer/cloud_data/sync_user_oci_accounts/`;

//Dashboard PDU Widgets
export const GET_DASHBOARD_PDU_DATA = () => `customer/observium/pdu/`;

export const GET_PDU_STATUS = (pduId: string) => `customer/observium/pdu/${pduId}/get_device_data/`;

// Dashboard Devices Under MGMT Widget
export const GET_ASSET_COUNTS = () => `customer/stats/get_assets_count/`;

export const GET_ASSET_STATS = () => `customer/stats/get_assets_stat/`;

export const SYNC_ASSET_STATS = () => `customer/stats/sync_assets_status/`;

//Dashboard Maintenance Widget
export const GET_MSCHEDULES = () => '/customer/mschedules/get_data/';

//Dashboard Alerts Widget
export const GET_DASHBOARD_ALERTS_DATA = () => `/customer/stats/get_alerts_count/`;

export const POLL_DASHBOARD_ALERT_DATA = () => `/customer/stats/update_alert_count/`;

// Ticket Management
export const GET_TICKETS_BY_TYPE = () => `customer/ticketorganization/get_paginated_tickets_by_type/`;

export const GET_TICKET_METRICS = () => `customer/ticketorganization/get_ticket_metrics/`;

export const GET_OPEN_TICKET_COUNT = () => `customer/ticketorganization/get_open_tickets_count_by_priority/`;

export const GET_TICKET_GRAPH_DATA = () => `customer/ticketorganization/get_all_tickets_graph_data/`;

export const GET_TICKET_DETAILS_DATA = (ticketId: string) => `customer/ticketorganization/get_tickets_data/?ticket_id=${ticketId}`

export const GET_TICKET_COMMENT_DATA = (ticketId: string) => `customer/ticketorganization/get_comments_data/?ticket_id=${ticketId}`

export const POST_COMMENT = () => `customer/ticketorganization/post_comment/`;

export const CHANGE_PRIORITY = () => `customer/ticketorganization/change_priority/`;

// Dashboard Related Ends

export const GET_DEVICE_ALERTS = (device: string) => `customer/stats/get_observium_alert/?type=${device}`;

export const GET_ALL_DEVICE_ALERTS = (device: string) => `/customer/observium/${device}/get_device_alerts/?alert_type=failed`;

// export const CREATE_REPORT_AN_ISSUE = () => `/customer/ticketorganization/create_unity_problem_request/`;

export const CREATE_REPORT_AN_ISSUE = () => `/customer/dynamics_crm/feedback/`;

export const DEVICE_MONITORING_GROUP = () => `customer/dash_group/?page_size=0`;

export const DEVICE_MONITORING_STATUS = (groupId: string) => `customer/dash_device/?group_uuid=${groupId}`;

export const UPDATE_GROUP_DATA = () => `customer/dash_group/update_group_data/`;

export const DEVICE_MONITORING_ADD_GROUP = () => `customer/dash_group/`;

export const DEVICE_MONITORING_UPDATE_GROUP = (groupId: string) => `customer/dash_group/${groupId}/`;

export const DEVICE_MONITORING_DELETE_GROUP = (groupId: string) => `customer/dash_group/${groupId}/`;

export const UPDATE_GROUP_DATA_ON_DRAG = () => `customer/dash_group/update_group_data/`;

export const UPDATE_DEVICE_DATA_ON_DRAG = () => `customer/dash_device/update_device_data/`;

export const DEVICE_MONITORING_GET_DEVICE_BY_CATEGORY = (deviceCategory: string) => {
    switch (deviceCategory) {
        case 'customdevice': return `customer/customdevices/?page_size=0`;
        case 'switch': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.SWITCHES)}?page_size=0`;
        case 'load_balancer': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER)}?page_size=0`;
        case 'firewall': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.FIREWALL)}?page_size=0`;
        case 'hypervisor': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR)}?page_size=0`;
        case 'bms': return `${BMS_FAST()}?page_size=0`;
        case 'storagedevice': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES)}?page_size=0`;
        case 'macdevice': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI)}?page_size=0`;
        case 'vmware': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE)}?page_size=0`;
        case 'vcloud': return `customer/vclouds/virtual_machines/?page_size=0`;
        case 'esxi': return `rest/vmware/esxi_vms/?page_size=0`;
        case 'hyper-v': return `customer/hyperv/vms/?page_size=0`;
        case 'openstack': return `rest/openstack/migration/?page_size=0`;
        case 'custom_vm': return `${DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.CUSTOM_VIRTUAL_MACHINE)}?page_size=0`;
        default: return `customer/observium/${deviceCategory}/?page_size=0`;
    }
};

export const DEVICE_MONITORING_ADD_DEVICE = () => `customer/dash_device/add_device/`;

export const DEVICE_MONITORING_DELETE_DEVICE = (deviceId: string, groupId: string) => `customer/dash_device/${deviceId}/?group_uuid=${groupId}`;

export const LOGGED_IN_USER_INFO = () => `/customer/uldbusers/`;

export const GET_UNITY_RELEASES_DOC = (releaseType: string) => `rest/release/${releaseType}/`;

//United Connect API's
export const GET_SWITCH_PORTS_FAST = () => `/customer/fast/switchport/?page_size=0`;

export const GET_SWITCH_PORT_DETAILS = (switchUUID: string) => `customer/observium/switch/${switchUUID}/get_device_port_details/`;

export const GET_SWITCH_PORT_GRAPHS = (switchUUID: string, portId: number) => `customer/observium/switch/${switchUUID}/get_port_details_graph_set/?port_id=${portId}`;

export const GET_VXCS = () => `rest/ticketvxc/`;

export const ADD_VXC = () => GET_VXCS();

export const PUBLIC_CLOUDS_FAST = () => `/customer/public_cloud_fast/`;

export const GET_AWS_ACCOUNTS = () => `/customer/managed/aws/accounts/`;

export const ADD_AWS_ACCOUNT = () => `customer/aws/`;

export const EDIT_AWS_ACCOUNT = (id: number) => `customer/aws/${id}/`;

export const DELETE_AWS_ACCOUNT = (id: number) => `customer/aws/${id}/`;

export const UPDATE_AWS_API_KEYS = () => `customer/aws/change_password/`;

export const GET_AWS_SNAPSHOTS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/snapshot/`;

export const COPY_AWS_SNAPSHOT = (accountId: string, regionId: string, snapshotId: string) => `customer/aws/${accountId}/region/${regionId}/snapshot/${snapshotId}/copy_snapshots/`;

export const GET_AWS_VOLUME = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/volume/`;

export const GET_AWS_VPC_LIST = (accountId: string, regionId: string) => `customer/aws/${accountId}/vpc_list/?region=${regionId}`;

export const GET_AWS_SUBNETS_BY_VPC = (accountId: string, regionId: string, zone: string, vpcId: string) => `customer/aws/${accountId}/subnets_list/?region=${regionId}&zone=${zone}&vpc_id=${vpcId}`;

export const GET_AWS_SECURITY_GROUPS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/security_group/`;

export const GET_AWS_SECURITY_GROUPS_BY_VPC = (accountId: string, regionId: string, vpcId: string) => `customer/aws/${accountId}/vpc_security_group_list/?region=${regionId}&vpc_id=${vpcId}`;

export const GET_AWS_KEY_PAIRS = (accountId: string) => `customer/aws/${accountId}/keypair_detail/`;

export const GET_AWS_IMAGES = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/images/`;

export const GET_AWS_LAUNCH_DATA = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/instance_launch_data/`;

export const GET_AWS_INSTANCE_TYPE_LIST = (accountId: string, regionId: string, zone: string) => `customer/aws/${accountId}/instance_type_list/?region=${regionId}&zone=${zone}`;

export const GET_AWS_STORAGE_TYPE_LIST = () => `${environment.staticData}aws-data/aws-storage-types.json`;

export const CELERY_TASK_FOR_AWS_CREATE_INSTANCE = (accountId: number, regionId: string) => `/customer/managed/aws/virtualmachine/`;

export const GET_AWS_LOADBALANCERS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/load_balancer/`;

export const GET_AWS_NETWORK_INTERFACES = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/list_network_interface/`;

export const GET_AWS_USERS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/user/`;

export const GET_AWS_USER_GROUPS = (accountId: string, regionId: string, userName: string) => `customer/aws/${accountId}/region/${regionId}/user/user_group?username=${userName}`;

export const GET_AWS_AUTOSCALING_GROUPS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/list_auto_scaling_group/`;

export const CELERY_TASK_FOR_AWS_INSTANCES = (accountId: number, regionId: string) => `customer/aws/${accountId}/region/${regionId}/instance/`;

export const GET_AWS_S3_bUCKETS = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/s3_buckets/`;

export const DELETE_AWS_S3_bUCKET = (bucketUUID: string) => `customer/managed/aws/resources/s3-buckets/${bucketUUID}`;

export const CREATE_AWS_S3_bUCKET = () => `customer/managed/aws/resources/s3-buckets/`;

export const UPLOAD_FILE_TO_S3BUCKET = () => `customer/managed/aws/resources/s3-buckets-uploaded-files/`;

export const GET_AWS_S3_UPLOADED_FILES = () => `customer/managed/aws/resources/s3-buckets-uploaded-files/`;

export const GET_AWS_LOADBALANCERS_DROPDOWN = (accountId: number, regionId: string, instanceId: string) => `customer/aws/${accountId}/region/${regionId}/instance/${instanceId}/loadbalancer_dropdown/`;

export const GET_AWS_NETWORK_INTERFACES_DROPDOWN = (uuid: string) => `/customer/managed/aws/virtualmachine/${uuid}/network_interface/`;

export const GET_AWS_INSTANCE_DETAILS = (accountId: string) => `customer/managed/aws/virtualmachine/${accountId}/instance_detail/`;

export const GET_AWS_AUTOSCALING_GROUPS_DROPDOWN = (uuid: string) => `customer/managed/aws/virtualmachine/${uuid}/asg`;

export const CELERY_TASK_FOR_AWS_CREATE_IMAGE = (uuid: string) => `/customer/managed/aws/virtualmachine/${uuid}/create_image/`;

export const CELERY_TASK_FOR_AWS_ATTACH_AUTOSCALE = (accountId: string, regionId: string, instanceId: string) => `customer/aws/${accountId}/region/${regionId}/instance/${instanceId}/attach_asg/`;

export const CELERY_TASK_FOR_AWS_ATTACH_NW_INTERFACE = (uuid: string, regionId: string, instanceId: string) => `/customer/managed/aws/virtualmachine/${uuid}/network_interface/`;

export const CELERY_TASK_FOR_AWS_ATTACH_LB = (accountId: number, regionId: string, instanceId: string) => `customer/aws/${accountId}/region/${regionId}/instance/${instanceId}/attach_loadbalancer/`;

export const CELERY_TASK_FOR_AWS_TERMINATE_INSTANCE = (uuid: string) => `customer/managed/aws/virtualmachine/${uuid}/terminate_instance/`;

export const GET_USER_PROFILE = () => `customer/uldbusers/`;

export const GET_ZENDESK_STATUS = () => `customer/tickets/user_status/`;

export const LOGOUT = () => `logout/`;

export const UPDATE_PASSWORD = () => `customer/uldbusers/change_own_password/`;

export const UPDATE_TIMEZONE = () => `customer/uldbusers/change_own_timezone/`;

export const DEVOPS_CONTROLLER = () => `customer/devops_controllers/`;

export const DELETE_DEVOPS_CONTROLLER = (controllerUUID: string) => `customer/devops_controllers/${controllerUUID}/`;

export const CREATE_DEVOPS_CONTROLLER = () => `customer/devops_controllers/`;

export const GET_VM_MIGRATIONS = (cloudId: string, platformType: string) => {
    switch (platformType) {
        // case ServerSidePlatFormMapping.VMWARE: return `/rest/vmware/migrate/virtual_machines/?cloud_id=${cloudId}`; // not doing syncing so commented out the api
        case ServerSidePlatFormMapping.OPENSTACK: return `/rest/v3/vm_backup/get_vm_list/?cloud_id=${cloudId}`;
        default: console.error('Invalid platform type : ', platformType);
            break;
    }
};

export const GET_VM_MIGRATIONS_FROM_DB = (platformType: string) => {
    switch (platformType) {
        case ServerSidePlatFormMapping.VMWARE: return `/rest/vmware/migrate/`;
        case ServerSidePlatFormMapping.OPENSTACK: return `/rest/openstack/migration/`;
        default: console.error('Invalid platform type : ', platformType);
            break;
    }
};

export const VMWARE_AUTH_CHECK = () => `/rest/vmware/migrate/vcenter_auth_check/`;

export const GET_CABIINET_WIDGET_METADATA = () => `/customer/colo_cloud/dc_cabinets_count/`;

export const GET_CABINET_WIDGET_DATA = () => `/customer/colo_cloud/datacenter_widget/`;

export const SYNC_CABINET_WIDGET_DATA = () => `/customer/colo_cloud/sync_datacenter_widget/`;

export const GET_BANDWIDTH_BILLING_INFO = () => `/customer/observium/billing/bill_data/`;

export const CHECK_PDU_AUTHENTICATION = (pduId: string) => `/customer/pdus/${pduId}/check_auth_pdu/`;

export const RECYCLE_PDU = (pduId: string) => `/customer/pdus/${pduId}/recycle_pdu/`;

export const GET_UNITY_CONSTANTS = () => `${environment.staticData}/ul-constants-data/ul-constants-data.json`;

export const CREATE_UNITY_VPN_REQUEST = () => `/customer/ticketorganization/create_unity_vpn_ticket/`;

export const GET_EXCEL_ONBARDING_FILE_PATH = () => `/customer/excel_onboard/`;

export const ON_BOARD_EXCEL_FILE = () => GET_EXCEL_ONBARDING_FILE_PATH();

export const GET_ONBOARDING_NETWORK_SCAN = () => `/customer/network_scan/`;

export const NEW_NETWORK_SCAN = () => GET_ONBOARDING_NETWORK_SCAN();

export const SCAN_ONBOARDING_NETWORK = (uuid: string) => `/customer/network_scan/${uuid}/`;

export const DELETE_ONBOARDING_NETWORK_SCAN = (uuid: string) => `/customer/network_scan/${uuid}/`;

export const GET_CUSTOMER_VCENTERS = () => `/customer/customer_vcenters/`;

export const UPDATE_CUSTOMER_VCENTERS = () => `/customer/customer_vcenters/verify_and_update_vcenters/`;

export const UPLOAD_VM_MONITORING_FILE = () => `/customer/enable_vm_monitoring/`;

export const GET_UN_MAPPED_DEVICES = () => `/customer/observium/activate_monitoring/observium_unmapped_devices/`;

export const ACTIVATE_MONITORING = () => `/customer/observium/activate_monitoring/`;

export const ACTIVATE_MGMT_ACCESS = () => `/customer/activate_mgmt_access/`;

export const GET_AWS_REGION_LIST = () => `${environment.staticData}aws-data/aws-regions.json`;

export const GET_AWS_NETWORK_BANDWIDTH_VALUES = () => `${environment.staticData}aws-data/aws-network-bandwidth-values.json`;

export const GET_AWS_STORAGE_TYPES = () => `${environment.staticData}aws-data/aws-storage-data.json`;

export const GET_AWS_STORAGE_RATES = () => `customer/ebs_storage_pricing/`;

export const GET_AWS_INSTANCE_PRICES = () => `rest/aws_pricing/`;

export const GET_AZURE_REGION_LIST = () => `${environment.staticData}azure-data/azure-regions.json`;

export const GET_AZURE_TIERS = () => `${environment.staticData}azure-data/azure-tiers.json`;

export const GET_AZURE_STORAGE_TYPES = () => `${environment.staticData}azure-data/azure-storage-types.json`;

export const GET_AZURE_STORAGE_RATES = () => `customer/azure_storage_pricing/`;

export const GET_AZURE_INSTANCE_PRICES = () => `rest/azure_pricing/`;

export const ENABLE_WELCOME_PAGE = () => `/customer/uldbusers/set_welcome_page/`;

export const CELERY_TASK_FOR_AWS_CLOUD_WATCH = (accountId: string) => `/customer/managed/aws/virtualmachine/${accountId}/monitoring_graph/`;

export const GET_GCP_CLOUD_LIST = () => `/customer/gcp/account/`;

export const GET_GCP_SUMMARY = () => `/customer/managed/gcp/accounts/summary/`;

export const GET_GCP_CLOUD_DATA = (cloudId: number) => `/customer/cloud_data/${cloudId}/gcp_data/`;

export const GET_GCP_SNAPSHOTS = () => `customer/gcp/snapshots/`;

export const SYNC_GCP_SNAPSHOTS = (accountId: string, region: string) => `customer/gcp/snapshots/sync_snapshots/?account_id=${accountId}&region=${region}`;

export const GET_GCP_VMS = () => `customer/gcp/instances/`;

export const ADD_GCP_VMS = (accountId: string) => `customer/gcp/account/${accountId}/create_virtual_machine/`;

export const SYNC_GCP_VMS_WITH_ACCOUNT_AND_REGION = (accountId: string, region: string) => `customer/gcp/instances/sync_vms/?account_id=${accountId}&region=${region}`;

export const SYNC_ALL_GCP_VMS = () => `customer/gcp/instances/sync_vms/`;

export const GET_GCP_VMS_METADATA = (accountId: string) => `customer/gcp/account/${accountId}/get_vm_create_metadata/`;

export const GET_GCP_VMS_MACHINE_TYPE = (accountId: string, zone: string) => `customer/gcp/account/${accountId}/get_machine_types/?zone=${zone}`;

export const GET_GCP_VMS_IMAGES = (architecture: string) => `customer/integration/gcp/accounts/get_images/?architecture=${architecture}`;

export const GET_GCP_VMS_MACHINE_TYPES = (zone: string) => `customer/integration/gcp/accounts/get_machine_types/?zone=${zone}`;

export const GET_GCP_ACCOUNTS = () => `customer/managed/gcp/accounts/`;

export const GET_GCP_REGIONS = () => `customer/gcp/account/gcp_regions/`;

export const ADD_GCP_ACCOUNT = () => GET_GCP_CLOUD_LIST();

export const EDIT_GCP_ACCOUNT = (uuid: string) => `customer/gcp/account/${uuid}/`;

/* -- Needs to remove the below billing and sustainability after testing new implementation -- */
// export const GET_GCP_BILLING_DATASETS = (uuid: string) => `customer/gcp/account/${uuid}/list_datasets/`;
export const GET_GCP_BILLING_DATASETS = (uuid: string) => `customer/integration/gcp/accounts/${uuid}/list_datasets/`;
// export const GET_GCP_BILLING_ACCOUNTS = (uuid: string) => `customer/gcp/account/${uuid}/get_billing_info/`;
export const GET_GCP_BILLING_ACCOUNTS = (uuid: string) => `customer/integration/gcp/accounts/${uuid}/get_billing_info/`;
// export const UPDATE_GCP_BILLING_DETAILS = (uuid: string) => `customer/gcp/account/${uuid}/update_billing_details/`;
export const UPDATE_GCP_BILLING_DETAILS = (uuid: string) => `customer/integration/gcp/accounts/${uuid}/update_billing_details/`;
// export const UPDATE_GCP_SUSTAINABILITY_DETAILS = (uuid: string) => `customer/gcp/account/${uuid}/update_sustainability_details/`;
export const UPDATE_GCP_SUSTAINABILITY_DETAILS = (uuid: string) => `customer/integration/gcp/accounts/${uuid}/update_sustainability_details/`;

export const DELETE_GCP_ACCOUNT = (uuid: string) => EDIT_GCP_ACCOUNT(uuid);

export const UPDATE_PDU_MAPPING = () => `/customer/pdu_socket_mappings/update_mappings/`;

export const VMWARE_VM_MIGRATE = () => `/rest/vmware/migrate/vm_migrate/`;

export const OPENSTACK_VM_MIGRATE = () => `/rest/openstack/migration/vm_migrate/`;

export const VMWARE_VM_AWS_BACKUP = () => `/rest/vmware/migrate/vmware_vm_backup/`;

export const OPENSTACK_VM_AWS_BACKUP = () => `/rest/v3/vm_backup/create_openstack_backup/`;

export const OPENSTACK_VM_BACKUP_HISTORY = (backupId: number) => `/rest/v3/vm_backup/${backupId}/openstack_backup_history/`;

export const VMWARE_VM_BACKUP_HISTORY = (backupId: number) => `/rest/vmware/migrate/${backupId}/vmware_backup_history/`;

export const GET_AZURE_RESOURCE_GROUP = (accountId: number) => `/customer/azure/${accountId}/resource_group/`;

export const GET_AZURE_STORAGE_ACCOUNT = (accountId: number, resource: string) =>
    `/customer/azure/${accountId}/resource_group/${resource}/storage_account/`;

export const GET_AZURE_CONTAINER = (accountId: number, resource: string, storage: string) =>
    `/customer/azure/${accountId}/resource_group/${resource}/${storage}/blob/`;

export const GET_AZURE_ACCOUNTS = () => `/customer/managed/azure/accounts/`;

export const GET_AZURE_RESOURCE_GROUPS_BY_ACCOUNT_ID = (accountId: string) => `customer/azure/${accountId}/resource_group/`;

export const GET_AZURE_RESOURCE_GROUP_SUMMARY_BY_ACCOUNT_ID = (accountId: string) => `customer/azure/${accountId}/resource_list/`;

export const GET_AZURE_RESOURCES_BY_ACCOUNT_ID_AND_RESOURCE = (accountId: string, resource: string) => `customer/azure/${accountId}/resource_group/${resource}/resources/`;

export const GET_AZURE_VMS_BY_ACCOUNT_ID_AND_RESOURCE = (accountId: string, resource: string) => `customer/azure/${accountId}/resource_group/${resource}/virtual_machines/`;

export const DELETE_AZURE_ACCOUNT = (accountId: number) => `customer/azure/${accountId}/`;

export const EDIT_AZURE_ACCOUNT = (accountId: number) => `customer/azure/${accountId}/`;

export const CHANGE_AZURE_PASSWORD = () => `customer/azure/change_password/`;

export const GET_AZURE_LOCATIONS = () => `customer/managed/azure/locations/`;

export const GET_AZURE_VM_IMAGES = (location: string) => `customer/azure_vm_images/?location=${location}&page_size=0`;

export const GET_AZURE_RESOURCE_VM_AVAILABILITY_SET = (accountId: string, resourceGroup: string) => `customer/managed/azure/resources/virtual_machines/availability_sets/`;

export const GET_AZURE_RESOURCE_VM_STORAGE_ACCOUNT = (accountId: string, resourceGroup: string) => `customer/managed/azure/resources/virtual_machines/storage_accounts/`;

export const GET_AZURE_RESOURCE_VM_NIC = (accountId: string, resourceGroup: string) => `customer/azure/${accountId}/resource_group/${resourceGroup}/nic/`;

export const DELETE_AZURE_RESOURCE_GROUP = (accountId: string, resourceGroup: string) => `customer/azure/${accountId}/resource_group/${resourceGroup}/delete_resource_group/`

export const ADD_AZURE_RESOURCE_VIRTUAL_MACHINE = (accountId: string) => `customer/azure/${accountId}/virtual_machines/`;

export const GET_AZURE_RESOURCE_NIC_VNET = (accountId: string, resourceGroup: string) => `customer/azure/${accountId}/resource_group/${resourceGroup}/virtual_network/`;

export const GET_AZURE_RESOURCE_NIC_SUBNET = (accountId: string, resourceGroup: string, vnet: string) => `customer/azure/${accountId}/resource_group/${resourceGroup}/${vnet}/subnet/`;

export const CREATE_NIC_FOR_RESOURCE_GROUP = (accountId: string) => `customer/managed/azure/resources/create_azure_nic/`;

export const GET_NICS = (accountId: number, resourceGroup: string) => `customer/managed/azure/resources/virtual_machines/nics/`;

export const CREATE_AZURE_VM = (accountId: string) => `customer/azure/${accountId}/virtual_machines/`;

export const GET_AGENT_CONFIGURATIONS = () => `customer/agent/config/`;

export const ADD_AGENT_CONFIGURATIONS = () => `customer/agent/config/`;

export const DOWNLOAD_COLLECTOR = (type: string) => `customer/agent/config/download_collector/?type=${type}`;

export const EDIT_AGENT_CONFIGURATION = (uuid: string) => `customer/agent/config/${uuid}/`;

export const DELETE_AGENT_CONFIGURATION = (uuid: string) => `customer/agent/config/${uuid}/`;

export const STOP_IMPERSONATING = () => `hijack/release-hijack/`;

export const GET_GCP_REGION_LIST = () => `${environment.staticData}gcp-data/gcp-regions.json`;

export const GET_GCP_STORAGE_TYPE_LIST = () => `${environment.staticData}gcp-data/gcp-storage-types.json`;

export const GET_GCP_INSTANCES_DATA = () => `${environment.staticData}gcp-data/gcp-instances-data.json`;

export const GET_GCP_STORAGE_PRICING = () => `/customer/gcp_storage_pricing`;

export const GET_GCP_MACHINE_TYPE_PRICING = () => `/customer/gcp_machine_type_pricing`;

export const FIREWALL_MANUFACTURERS = () => `rest/manufacturer/?page_size=0`;

export const FIREWALL_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const FIREWALL_MODELS = (manufacturer: string) => `rest/firewallmodel/?page_size=0&manufacturer=${manufacturer}`;

export const FIREWALL_CABINETS = () => `customer/cabinets/?page_size=0`;

export const FIREWALL_DELETE = (uuid: string) => `customer/firewalls/${uuid}/`;

export const FIREWALL_UPDATE = (uuid: string) => `customer/firewalls/${uuid}/`;

export const SWITCH_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const SWITCH_MANUFACTURERS = () => `rest/manufacturer/?page_size=0`;

export const SWITCH_MODELS = (manufacturer: string) => `rest/switchmodel/?page_size=0&manufacturer=${manufacturer}`;

export const SWITCH_CABINETS = () => `customer/cabinets/?page_size=0`;

export const SWITCH_DELETE = (uuid: string) => `customer/switches/${uuid}/`;

export const SWITCH_UPDATE = (uuid: string) => `customer/switches/${uuid}/`;

export const LOAD_BALANCER_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const LOAD_BALANCER_MANUFACTURERS = () => `rest/manufacturer/?page_size=0`;

export const LOAD_BALANCER_MODELS = (manufacturer: string) => `rest/loadbalancermodel/?page_size=0&manufacturer=${manufacturer}`;

export const LOAD_BALANCER_CABINETS = () => `customer/cabinets/?page_size=0`;

export const LOAD_BALANCER_DELETE = (uuid: string) => `customer/load_balancers/${uuid}/`;

export const LOAD_BALANCER_UPDATE = (uuid: string) => `customer/load_balancers/${uuid}/`;

export const HYPERVISOR_MANUFACTURERS = () => `rest/server_manufacturer/?page_size=0`;

export const HYPERVISOR_MODELS = (manufacturer: string) => `rest/server_model/?page_size=0&manufacturer=${manufacturer}`;

export const HYPERVISOR_OS = () => `rest/os/?page_size=0`;

export const HYPERVISOR_CABINETS = () => `customer/cabinets/?page_size=0`;

export const HYPERVISOR_DELETE = (uuid: string) => `customer/servers/${uuid}/`;

export const HYPERVISOR_UPDATE = (uuid: string) => `customer/servers/${uuid}/`;

export const HYPERVISOR_RESET_PASSWORD = (uuid: string) => `customer/servers/${uuid}/reset_password/`;

export const HYPERVISOR_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const CHECK_USER_IN_ZENDESK = () => `customer/ticketorganization/check_user_in_zendesk/`;

export const GET_CONTAINER_CONTROLLERS = () => `/customer/container_clouds/`;

export const GET_DOCKER_CONTROLLERS = () => `/customer/docker/account`;

export const GET_DOCKER_CONTROLLERS_BY_CLOUD_TYPE_AND_ID = (type: string, uuid: string) => {
    const KUBERNETES_BASE_URL = `/customer/docker/account`
    switch (type) {
        case 'AWS': return `${KUBERNETES_BASE_URL}/?aws_uuid=${uuid}&page_size=0`;
        case 'GCP': return `${KUBERNETES_BASE_URL}/?gcp_uuid=${uuid}&page_size=0`;
        case 'Azure': return `${KUBERNETES_BASE_URL}/?azure_uuid=${uuid}&page_size=0`;
        default:
            return `${KUBERNETES_BASE_URL}/?cloud_uuid=${uuid}&page_size=0`;
            break;
    }
}
export const ADD_DOCKER_CONTROLLER = () => `/customer/docker/account/`;

export const UPDATE_DOCKER_CONTROLLER = (controllerId: string) => `/customer/docker/account/${controllerId}/`;

export const DELETE_DOCKER_CONTROLLER = (controllerId: string) => `/customer/docker/account/${controllerId}`;

export const CHANGE_DOCKER_CREDENTIALS = (controllerId: string) => `customer/docker/account/${controllerId}/change_password/`;

export const GET_KUBERNETES_CONTROLLERS = () => `/customer/kubernetes/account`;

// export const GET_KUBERNETE_CONTROLLERS = (urlParam: string, accountId: string) => {
//     if(urlParam){
//         return `/customer/kubernetes/account/?${urlParam}=${accountId}`;
//     }else{
//         return `/customer/kubernetes/account`;
//     }
// };

export const GET_KUBERNETES_CONTROLLERS_BY_CLOUD_TYPE_AND_ID = (type: string, uuid: string) => {
    const KUBERNETES_BASE_URL = `/customer/kubernetes/account`
    switch (type) {
        case 'AWS': return `${KUBERNETES_BASE_URL}/?aws_uuid=${uuid}&page_size=0`;
        case 'GCP': return `${KUBERNETES_BASE_URL}/?gcp_uuid=${uuid}&page_size=0`;
        case 'Azure': return `${KUBERNETES_BASE_URL}/?azure_uuid=${uuid}&page_size=0`;
        default:
            return `${KUBERNETES_BASE_URL}/?cloud_uuid=${uuid}&page_size=0`;
            break;
    }
}
export const ADD_KUBERNETES_CONTROLLER = () => `/customer/kubernetes/account/`;

export const UPDATE_KUBERNETES_CONTROLLER = (controllerId: string) => `/customer/kubernetes/account/${controllerId}/`;

export const DELETE_KUBERNETES_CONTROLLER = (controllerId: string) => `/customer/kubernetes/account/${controllerId}`;

export const CHANGE_CONTROLLER_PASSWORD = (controllerId: string) => `customer/kubernetes/account/${controllerId}/change_password/`;


export const GET_AWS_KUBERNETES_CONTROLLERS = (accountId: string) => `/customer/kubernetes/account/?aws_id=${accountId}`;

export const ADD_AWS_KUBERNETES_CONTROLLERS = () => `/customer/kubernetes/account/`;

export const UPDATE_AWS_KUBERNETES_CONTROLLERS = (controllerId: string) => `/customer/kubernetes/account/${controllerId}/`;

export const DELETE_AWS_KUBERNETES_CONTROLLER = (controllerId: string) => `/customer/kubernetes/account/${controllerId}`;

export const GET_GCP_KUBERNETES_CONTROLLERS = (accountId: string) => `/customer/kubernetes/account/?gcp_uuid=${accountId}`;

export const ADD_GCP_KUBERNETES_CONTROLLERS = () => `/customer/kubernetes/account/`;

export const UPDATE_GCP_KUBERNETES_CONTROLLERS = (controllerId: string) => `/customer/kubernetes/account/${controllerId}/`;

export const DELETE_GCP_KUBERNETES_CONTROLLER = (controllerId: string) => `/customer/kubernetes/account/${controllerId}`;

export const CONTAINER_CONTROLLER_BY_ID_AND_TYPE = (svcId: string, type: CONTROLLER_TYPE_MAPPING) => {
    switch (type) {
        case CONTROLLER_TYPE_MAPPING.KUBERNETES: return `customer/kubernetes/account/${svcId}/?`;
        case CONTROLLER_TYPE_MAPPING.DOCKER: return `customer/docker/account/${svcId}/`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const ADD_CONTAINER_CONTROLLER = (type: CONTROLLER_TYPE_MAPPING) => {
    switch (type) {
        case CONTROLLER_TYPE_MAPPING.KUBERNETES: return ADD_KUBERNETES_CONTROLLER();
        case CONTROLLER_TYPE_MAPPING.DOCKER: return ADD_DOCKER_CONTROLLER();

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const EDIT_CONTAINER_CONTROLLER = (svcId: string, type: CONTROLLER_TYPE_MAPPING) => {
    switch (type) {
        case CONTROLLER_TYPE_MAPPING.KUBERNETES: return `${UPDATE_KUBERNETES_CONTROLLER(svcId)}`;
        case CONTROLLER_TYPE_MAPPING.DOCKER: return `${UPDATE_DOCKER_CONTROLLER(svcId)}`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const DELETE_CONTAINER_CONTROLLER = (svcId: string, type: CONTROLLER_TYPE_MAPPING) => {
    switch (type) {
        case CONTROLLER_TYPE_MAPPING.KUBERNETES: return `${DELETE_KUBERNETES_CONTROLLER(svcId)}`;
        case CONTROLLER_TYPE_MAPPING.DOCKER: return `${DELETE_DOCKER_CONTROLLER(svcId)}`;
        default: console.error('Invalid type : ', type);
            break;
    }
}

export const MESH_SERVICE_MANAGERS = () => `customer/service_mesh/`;

export const MESH_SERVICE_MANAGER_BY_ID_AND_TYPE = (svcId: string, type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return `customer/gcp/account/${svcId}/?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.AWS: return `customer/aws/${svcId}/?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return `customer/kubernetes/account/${svcId}/?service_mesh=True`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const ADD_SERVICE_MANAGER = (type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return ADD_GCP_ACCOUNT();
        case MESH_SERVICE_TYPE_MAPPING.AWS: return ADD_AWS_ACCOUNT();
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return ADD_KUBERNETES_CONTROLLER();

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const EDIT_SERVICE_MANAGER = (svcId: string, type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return `${EDIT_GCP_ACCOUNT(svcId)}?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.AWS: return `${EDIT_AWS_ACCOUNT(parseInt(svcId))}?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return `${UPDATE_KUBERNETES_CONTROLLER(svcId)}?service_mesh=True`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const DELETE_SERVICE_MANAGER = (svcId: string, type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return `${DELETE_GCP_ACCOUNT(svcId)}?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.AWS: return `${DELETE_AWS_ACCOUNT(parseInt(svcId))}?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return `${DELETE_KUBERNETES_CONTROLLER(svcId)}/?service_mesh=True`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const SYNC_TRAFFIC_DIRECTORS = (meshId: string) => `customer/gcp/account/${meshId}/get_traffic_director_services`;

export const GET_TRAFFIC_DIRECTORS = (meshId: string) => `customer/gcp/tfd_services/?account_id=${meshId}`;

export const SYNC_NEG_LIST = (meshId: string, serviceName: string) => `customer/gcp/account/${meshId}/get_service_negs/?service_name=${serviceName}`;

export const GET_NEG_LIST = (meshId: string, serviceName: string) => `customer/gcp/tfd_negs/?account_id=${meshId}&service_name=${serviceName}`;

export const SYNC_BACKEND_LIST = (meshId: string, serviceName: string, zone: string, neg: string) => `customer/gcp/account/${meshId}/get_network_endpoints/?service_name=${serviceName}&zone=${zone}&network_endpint_group=${neg}`;

export const GET_BACKEND_LIST = (meshId: string, serviceName: string, zone: string, neg: string) => `customer/gcp/tfd_nw_endpoints/?account_id=${meshId}&service_name=${serviceName}&zone=${zone}&network_endpint_group=${neg}`;

export const AWS_MESH_SERVICE = (accountId: string, regionId: string) => `customer/aws/${accountId}/region/${regionId}/app_mesh/`;

export const AWS_VIRTUAL_SERVICE = (accountId: string, regionId: string, meshName: string) => `customer/aws/${accountId}/region/${regionId}/app_mesh/${meshName}/virtual_services`;

export const GET_MESH_SERVICE_WIDGET_DATA = (svcId: string, type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return `customer/gcp/account/${svcId}/get_traffic_director_widget_data/`;
        case MESH_SERVICE_TYPE_MAPPING.AWS: return `customer/aws/${svcId}/app_mesh_widget/`;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return `customer/kubernetes/account/${svcId}/get_widget_status/`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const AWS_VIRTUAL_ROUTERS = (accountId: string, regionId: string, meshName: string, routerName: string) => `customer/aws/${accountId}/region/${regionId}/app_mesh/${meshName}/virtual_services/${routerName}/routes`;

export const AWS_VIRTUAL_NODES = (accountId: string, regionId: string, meshName: string, nodeName: string) => `customer/aws/${accountId}/region/${regionId}/app_mesh/${meshName}/virtual_services/${nodeName}/virtual_node`;

export const GET_ISTIO_VIRTUAL_SERVICE = (meshId: string) => `customer/kubernetes/account/${meshId}/list_virtual_services/`;

export const GET_ISTIO_DESTINATION_RULES = (meshId: string, namespace: string) => `customer/kubernetes/account/${meshId}/list_destination_rules/?namespace=${namespace}`;

export const GET_ISTIO_SERVICES = (meshId: string, namespace: string) => `customer/kubernetes/account/${meshId}/list_services/?namespace=${namespace}`;

export const GET_ISTIO_SERVICE_PODS = (meshId: string, namespace: string, serviceName: string) => `customer/kubernetes/account/${meshId}/list_service_pods/?namespace=${namespace}&service_name=${serviceName}`;

export const GET_ISTIO_SERVICE_CONTAINERS = (meshId: string, namespace: string, podName: string) => `customer/kubernetes/account/${meshId}/get_containers/?namespace=${namespace}&pod_name=${podName}`;

export const AWS_BACKEND_VIRTUAL_NODES = (accountId: string, regionId: string, meshName: string, nodeName: string) => AWS_VIRTUAL_NODES(accountId, regionId, meshName, nodeName);

export const CHANGE_SERVICE_MANAGER_PASSWORD = (svcId: string, type: MESH_SERVICE_TYPE_MAPPING) => {
    switch (type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS: return `customer/gcp/account/${svcId}/change_password/?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.AWS: return `${UPDATE_AWS_API_KEYS()}?service_mesh=True`;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO: return `${CHANGE_CONTROLLER_PASSWORD(svcId)}?service_mesh=True`;

        default: console.error('Invalid type : ', type);
            break;
    }
}

export const GET_G3_STORAGE_TYPES = () => `${environment.staticData}g3-data/g3-storage-types.json`;

export const GET_G3_REGION_LIST = () => `${environment.staticData}g3-data/g3-regions.json`;

export const EXPORT_COST_COMPARATOR_DATA_TO_EXCEL = (params: HttpParams) => `customer/cost_calculator/download_excel/?${params}`;

export const SEND_COST_COMPARATOR_DATA_BY_EMAIL = () => `customer/cost_calculator/send_cost_calculator_email/`;

export const GET_SELF_HELP_DATA = (selfHelpEndpointMapping: SelfHelpEndpointMapping) => `${environment.staticData}self-help-data/${selfHelpEndpointMapping}`;

export const GET_SERVICE_CATEGORY = () => `customer/service_catalogues/types/?page_size=0`;

export const SERVICE_CATALOG_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    //In future use switch to get endpoint param by  devicetype
    return `customer/service_catalogues/?page_size=0&&device_type=${deviceType}`;
};

export const BMServer_MANUFACTURERS = () => `rest/server_manufacturer/?page_size=0`;

export const BMServer_MODELS = (manufacturer: string) => `rest/server_model/?page_size=0&manufacturer=${manufacturer}`;

export const BMServer_OS = () => `rest/os/?page_size=0`;

export const BMServer_CABINETS = () => `customer/cabinets/?page_size=0`;

export const BMServer_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const BMServer_DELETE = (uuid: string) => `customer/bm_servers/${uuid}/`;

export const BMServer_UPDATE = (uuid: string) => `customer/bm_servers/${uuid}/`;

export const GET_TRAFFIC_DIRECTORS_NETWORK_DATA = (meshId: string, serviceName: string) => `customer/gcp/account/${meshId}/get_service_tree_view_data/?service_name=${serviceName}`;

export const GET_AWS_NETWORK_GRAPH_DATA = (accountId: string, regionId: string, meshName: string) => `customer/aws/${accountId}/region/${regionId}/app_mesh/${meshName}/service_tree_view_data`;

export const GET_ISTIO_NETWORK_GRAPH_DATA = (accountId: string, namespace: string, gateway: string) => `customer/kubernetes/account/${accountId}/get_service_tree_view_data/?namespace=${namespace}&virtual_service=${gateway}`;

export const UPDATE_VM_MGMT_IP = (vmId: string, type: PlatFormMapping) => {
    switch (type) {
        case PlatFormMapping.VMWARE: return `rest/vmware/migrate/${vmId}/associate_mgmt_ip/`;
        case PlatFormMapping.VCLOUD: return `customer/vclouds/virtual_machines/${vmId}/associate_mgmt_ip/`;
        case PlatFormMapping.PROXMOX: return `customer/proxmox/vms/${vmId}/associate_mgmt_ip/`;
        case PlatFormMapping.G3_KVM: return `customer/g3_kvm/vms/${vmId}/associate_mgmt_ip/`;
        case PlatFormMapping.ESXI: return `rest/vmware/esxi_vms/${vmId}/associate_mgmt_ip/`;
        default: console.error('Invalid type ', type);
            break;
    }
};

export const UPDATE_VM_TAGS = (vmId: string, type: PlatFormMapping) => {
    switch (type) {
        case PlatFormMapping.VMWARE: return `rest/vmware/migrate/${vmId}/associate_tag/`;
        case PlatFormMapping.OPENSTACK: return `rest/openstack/migration/${vmId}/associate_tag/`;
        case PlatFormMapping.VCLOUD: return `customer/vclouds/virtual_machines/${vmId}/associate_tag/`;
        case PlatFormMapping.HYPER_V: return `customer/hyperv/vms/${vmId}/associate_tag/`;
        case PlatFormMapping.PROXMOX: return `customer/proxmox/vms/${vmId}/associate_tag/`;
        case PlatFormMapping.G3_KVM: return `customer/g3_kvm/vms/${vmId}/associate_tag/`;
        case PlatFormMapping.ESXI: return `rest/vmware/esxi_vms/${vmId}/associate_tag/`;
        case PlatFormMapping.CUSTOM: return `rest/customer/virtual_machines/${vmId}/associate_tag/`;
        default: console.error('Invalid type ', type);
            break;
    }
};

export const UPDATE_DEVICE_TAGS = (deviceType: DeviceMapping, deviceId: string,) => {
    switch (deviceType) {
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/associate_tag/`;
        default: console.error('Invalid type ', deviceType);
            break;
    }
};

export const GET_DASHBOARD_KUBERNETES_CONTROLLERS = () => `customer/kubernetes/account/get_kubernetes_controller_fast/`;

export const GET_DASHBOARD_KUBERNETES_CONTROLLER_WIDGET_DATA = (controllerId: string) => `customer/kubernetes/account/${controllerId}/get_kubernetes_widget_data/`;

export const GET_ISTIO_VIRTUAL_SERVICE_STATUS = (meshId: string, serviceName: string, namespace: string) => `/customer/kubernetes/account/${meshId}/get_virtual_service_status/?namespace=${namespace}&virtual_service=${serviceName}&service_mesh=True`;

export const GET_ISTIO_SERVICE_STATUS = (meshId: string, serviceName: string, namespace: string) => `/customer/kubernetes/account/${meshId}/get_service_status/?namespace=${namespace}&service_name=${serviceName}&service_mesh=True`;

export const MESH_MAP_VM = (meshId: string) => `customer/gcp/tfd_nw_endpoints/${meshId}/map_cloud_vm/`;

export const GET_CLOUD_BY_CLOUD_TYPE = (type: string) => {
    switch (type) {
        case PlatFormMapping.AWS: return `customer/aws/`;
        case PlatFormMapping.AZURE: return `customer/azure/`;
        case PlatFormMapping.GCP: return `customer/gcp/account/`;
        case PlatFormMapping.OPENSTACK: return `customer/private_cloud_fast/?platform_type=OpenStack`;
        case PlatFormMapping.VMWARE: return `customer/private_cloud_fast/?platform_type=VMware`;
        case PlatFormMapping.VCLOUD: return `customer/private_cloud_fast/?platform_type=vCloud Director`;
    }
}

export const GET_VM_BY_CLOUD = (type: string, uuid: string) => {
    switch (type) {
        case PlatFormMapping.AWS: return `customer/aws_fast_instance/?adapter=${uuid}&page_size=0`;
        case PlatFormMapping.AZURE: return `customer/azure/virtual_machines/?adapter=${uuid}&page_size=0`;
        case PlatFormMapping.GCP: return `customer/gcp/instances/?account_id=${uuid}&page_size=0`;
        case PlatFormMapping.OPENSTACK: return `rest/openstack/migration/?cloud_id=${uuid}&page_size=0`;
        case PlatFormMapping.VMWARE: return `rest/vmware/migrate/?cloud_id=${uuid}&page_size=0`;
        case PlatFormMapping.VCLOUD: return `customer/vclouds/virtual_machines/?cloud_id=${uuid}&page_size=0`;
    }
}

export const GET_CONTAINER_BY_CLOUD = (uuid: string) => `customer/kubernetes/containers/?cloud_uuid=${uuid}&page_size=0`;

export const GET_CONTAINER_BY_CLUSTER = (uuid: string) => `customer/kubernetes/containers/?account_uuid=${uuid}&page_size=0`;

export const GET_NEG_SERVICE_STATUS = (uuid: string, meshId: string, serviceName: string) => `customer/gcp/tfd_negs/${uuid}/get_endpoint_status/?account_id=${meshId}&service_name=${serviceName}`;

export const STORAGE_MANUFACTURERS = () => `rest/storage_manufacturer/?page_size=0`;

export const STORAGE_MODELS = (manufacturer: string) => `rest/storage_model/?page_size=0&manufacturer=${manufacturer}`;

export const STORAGE_DEVICE_CABINETS = () => `customer/cabinets/?page_size=0`;

export const STORAGE_DEVICE_OS = () => `rest/os/?page_size=0`;

export const STORAGE_DEVICE_UPDATE = (uuid: string) => `customer/storagedevices/${uuid}/`;

export const STORAGE_DEVICE_DELETE = (uuid: string) => `customer/storagedevices/${uuid}/`;

export const GET_STORAGE_DATA_BRIEF = (monitoredBy: string, uuid: string) => {
    switch (monitoredBy) {
        case 'observium': return `customer/observium/storagedevice/${uuid}/get_storage_data_brief/`;
        case 'zabbix': return `customer/storagedevices/${uuid}/monitoring/get_storage_data_brief/`;
    }
}

export const GET_STORAGE_DATA = (uuid: string) => `customer/observium/storagedevice/${uuid}/get_storage_data/`;

export const PDU_MANUFACTURERS = () => `rest/pdu_manufacturer/?page_size=0`;

export const PDU_MODELS = () => `rest/pdumodel/?page_size=0`;

export const PDU_POWER_CIRCUITS = () => `rest/powercircuit/?page_size=0`;

export const PDU_DELETE = (uuid: string) => `customer/pdus/${uuid}/`;

export const PDU_UPDATE = (uuid: string) => `customer/pdus/${uuid}/`;

export const SYNC_DATACENTER_STATUS = () => `customer/colo_cloud/sync_datacenter_status/`;

export const LOCATION_STATUS = () => `customer/colo_cloud/location_status/`;

export const GET_LDAP_CONFIG = () => `customer/ldap_config/?page_size=0`;

export const ADD_LDAP_CONFIG = () => `customer/ldap_config/`;

export const GET_LDAP_CONFIG_DETAILS_BY_ID = (ldapConfigId: string) => `customer/ldap_config/${ldapConfigId}/`;

export const SYNC_LDAP_CONFIG_BY_ID = (ldapConfigId: string) => `/customer/ldap_config/${ldapConfigId}/run_now/`;

export const EDIT_LDAP_CONFIG = (ldapConfigId: string) => `customer/ldap_config/${ldapConfigId}/`;

export const DELETE_LDAP_CONFIG = (ldapConfigId: string) => `customer/ldap_config/${ldapConfigId}/`;

export const GET_LDAP_USERS_BY_LDAP_CONFIG_ID = (ldapConfigId: string) => `/customer/ldap_config/${ldapConfigId}/ldap_users/`;

export const IMPORT_LDAP_USERS_BY_LDAP_CONFIG_ID = (ldapConfigId: string) => `/customer/ldap_config/${ldapConfigId}/import_ldap_users/`;

export const IMPORT_LDAP_USER_BY_LDAP_CONFIG_ID = (ldapConfigId: string) => `/customer/ldap_config/${ldapConfigId}/import_ldap_user/`;

export const IMPORT_LDAP_USER = () => `customer/ldap_config/import_ldap_user/`;

export const GET_CPU_MEMORY_STORAGE_DATA = (deviceId: string, deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/observium/bm_servers/${deviceId}/get_cpu_memory_storage_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/observium/servers/${deviceId}/get_cpu_memory_storage_data/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/observium/storagedevice/${deviceId}/get_cpu_memory_storage_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_CPU_MEMORY_STORAGE_DATA_FOR_STORAGE = (deviceId: string) => `customer/observium/storagedevice/${deviceId}/get_cpu_memory_storage_data/`;

export const GET_SERVICE_CATALOGUE_TERMS = () => `customer/service_terms/get_term_list/`;

export const GET_TERMS_BY_SERVICE_CATALOGUE = (catalogueId: number) => `customer/service_terms/get_terms_by_catalogue/?catalogue=${catalogueId}`;

export const GET_SERVICE_CATELOGUES_BY_TERM = (term: string) => `customer/service_catalogues/?term=${term}`;

export const CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/discovery/bms/`
        case DeviceMapping.HYPERVISOR: return `customer/discovery/servers/`;
        case DeviceMapping.MAC_MINI: return `customer/discovery/macdevices/`;

        case DeviceMapping.FIREWALL: return `customer/discovery/firewalls/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/discovery/load_balancers/`;
        case DeviceMapping.SWITCHES: return `customer/discovery/switches/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/discovery/storagedevices/`;
        case DeviceMapping.PDU: return `customer/discovery/pdus/`;

        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_DISCOVERY_NW_SCAN = () => `customer/discovery/request/`;

export const DELETE_DEVICE_DISCOVERY_NW_SCAN = (uuid: string) => `customer/discovery/request/${uuid}/`;

export const CANCEL_DEVICE_DISCOVERY_NW_SCAN = (uuid: string) => `customer/discovery/request/${uuid}/cancel/`;

export const DEVICE_DISCOVERY_SCAN_OP = (deviceType?: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/discovery/devices/?device_type=server`;
        case DeviceMapping.HYPERVISOR: return `customer/discovery/devices/?device_type=hypervisor`;
        case DeviceMapping.MAC_MINI: return `customer/discovery/devices/?device_type=mac`;

        case DeviceMapping.FIREWALL: return `customer/discovery/devices/?device_type=firewall`;
        case DeviceMapping.LOAD_BALANCER: return `customer/discovery/devices/?device_type=loadbalancer`;
        case DeviceMapping.SWITCHES: return `customer/discovery/devices/?device_type=network`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/discovery/devices/?device_type=storage`;
        case DeviceMapping.PDU: return `customer/discovery/devices/?device_type=power`;
        default: return `customer/discovery/devices/`;
    }
}

export const DEVICE_DISCOVERY_SUMMMARY = () => `customer/discovery/summary/`;

// export const DEVICE_DISCOVERY_SUMMMARY_NETWORK = () => `${environment.staticData}network-topology/discovery-summary.json`;

// export const DEVICE_DISCOVERY_NETWORK = (discoveryId: string) => `${environment.staticData}network-topology/discovery.json`;

export const DEVICE_DISCOVERY_SUMMMARY_NETWORK = () => `customer/unity_discovery/summary/topology/`;

export const DEVICE_DISCOVERY_NETWORK = (discoveryId: string) => `customer/unity_discovery/discovery/${discoveryId}/topology/`;

export const ADD_PANEL_DEVICES = () => `/customer/paneldevices/`;

export const UPDATE_PANEL_DEVICE = (deviceId: string) => `/customer/paneldevices/${deviceId}/`;

export const GET_PANEL_DEVICES_BY_CABINET = (cabinetId: string) => `/customer/paneldevices/?page_size=0&uuid=${cabinetId}`;

export const DELETE_PANEL_DEVICE_BY_ID = (deviceId: string, cabinetId: string) => `/customer/paneldevices/${deviceId}/?uuid=${cabinetId}`;

export const GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE = () => `customer/cloud_accounts/`;

export const GET_REPORTS_BY_CLOUD_NAMES = () => `customer/cloud_vms/`;

export const AWS_TOTAL_COST = (accountId: number) => `/customer/cloudbilling/aws/${accountId}/total_cost/`;

export const AWS_COST_BY_SERVICE = (accountId: number) => `/customer/cloudbilling/aws/${accountId}/cost_by_service/`;

export const AWS_COST_BY_REGION = (accountId: number) => `/customer/cloudbilling/aws/${accountId}/cost_by_region/`;

export const GCP_TOTAL_COST = (accountId: string) => `/customer/cloudbilling/gcp/${accountId}/total_cost/`;

export const GCP_COST_BY_SERVICE = (accountId: string) => `/customer/cloudbilling/gcp/${accountId}/cost_by_service/`;

export const GCP_COST_BY_REGION = (accountId: string) => `/customer/cloudbilling/gcp/${accountId}/cost_by_region/`;

export const CLOUD_COST_AWS_SUMMARY_DATA = () => `/customer/cloudbilling/aws/summary/`;

export const CLOUD_COST_GCP_SUMMARY_DATA = () => `/customer/cloudbilling/gcp/summary/`;

export const GET_SERVICE_PROVIDERS = () => `customer/service_catalogues/providers/`;

export const GET_DASHBOARD_DOCKERS_CONTROLLERS = () => `customer/docker/account/get_docker_controller_fast/`;

export const GET_DASHBOARD_DOCKERS_CONTROLLER_WIDGET_DATA = (controllerId: string) => `customer/docker/account/${controllerId}/get_docker_widget_data/`;

export const DOWNLOAD_SCAN_RESULT = () => `/customer/discovery/excel_download/`;

export const AZURE_TOTAL_COST = (accountId: number) => `/customer/cloudbilling/azure/${accountId}/total_cost/`;

export const AZURE_COST_BY_SERVICE = (accountId: number) => `/customer/cloudbilling/azure/${accountId}/cost_by_service/`;

export const AZURE_COST_BY_REGION = (accountId: number) => `/customer/cloudbilling/azure/${accountId}/cost_by_region/`;

export const CLOUD_COST_AZURE_SUMMARY_DATA = () => `/customer/cloudbilling/azure/summary/`;

export const GET_CLOUD_COST_CHARTS_DATA = (cloudType: string, accountId: string, target: string) => `/customer/cloudbilling/${cloudType}/${accountId}/cost_by_${target}/`;

export const MAC_MANUFACTURERS = () => `rest/server_manufacturer/?page_size=0`;

export const MAC_MODELS = (manufacturer: string) => `rest/server_model/?page_size=0&manufacturer=${manufacturer}`;

export const MAC_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const MAC_OS = () => `rest/os/?page_size=0&search=MacOS`;

export const MAC_DELETE = (uuid: string) => `customer/macdevices/${uuid}/`;

export const MAC_UPDATE = (uuid: string) => `customer/macdevices/${uuid}/`;

export const MAC_CABINETS = () => `customer/cabinets/?page_size=0`;

export const MOBILE_MANUFACTURERS = () => `rest/mobile_manufacturer/?page_size=0`;

export const MOBILE_MODELS = (manufacturer: string) => `rest/mobile_model/?page_size=0&manufacturer=${manufacturer}`;

export const MOBILE_DEVICE_UPDATE = (uuid: string) => `customer/mobiledevices/${uuid}/`;

export const MOBILE_DEVICE_DELETE = (uuid: string) => `customer/mobiledevices/${uuid}/`;

export const INSTALL_VMWARE_TOOLS = (uuid: string) => `/rest/vmware/migrate/${uuid}/install_vmware_tools/`;

export const UN_INSTALL_VMWARE_TOOLS = (uuid: string) => `/rest/vmware/migrate/${uuid}/uninstall_vmware_tools/`;

export const VM_CLONE_BY_DEVICE_TYPE = (deviceMapping: DeviceMapping, uuid: string) => {
    switch (deviceMapping) {
        case DeviceMapping.PROXMOX: return `/customer/proxmox/vms/${uuid}/clone/`;
        case DeviceMapping.G3_KVM: return `/customer/g3_kvm/vms/${uuid}/clone/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${uuid}/clone/`;
        default: console.error('Invalid device type : ', deviceMapping)
            break;
    }
};

export const VM_REBOOT_BY_DEVICE_TYPE = (deviceMapping: DeviceMapping, uuid: string) => {
    switch (deviceMapping) {
        case DeviceMapping.PROXMOX: return `/customer/proxmox/vms/${uuid}/reboot/`;
        case DeviceMapping.G3_KVM: return `/customer/g3_kvm/vms/${uuid}/reboot/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${uuid}/reboot/`;
        default: console.error('Invalid device type : ', deviceMapping)
            break;
    }
};

export const VM_SHUTDOWN_GUEST_OS_BY_DEVICE_TYPE = (deviceMapping: DeviceMapping, uuid: string) => {
    switch (deviceMapping) {
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${uuid}/guest_shutdown/`;
        default: console.error('Invalid device type : ', deviceMapping)
            break;
    }
};

export const VM_CONVERT_TO_TEMPLATE_BY_DEVICE_TYPE = (deviceMapping: DeviceMapping, uuid: string) => {
    switch (deviceMapping) {
        case DeviceMapping.PROXMOX: return `/customer/proxmox/vms/${uuid}/convert_to_template/`;
        case DeviceMapping.G3_KVM: return `/customer/g3_kvm/vms/${uuid}/convert_to_template/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${uuid}/convert_to_template/`;
        default: console.error('Invalid device type : ', deviceMapping)
            break;
    }
};

export const VM_DELETE_BY_DEVICE_TYPE = (deviceMapping: DeviceMapping, uuid: string) => {
    switch (deviceMapping) {
        case DeviceMapping.PROXMOX: return `/customer/proxmox/vms/${uuid}/`;
        case DeviceMapping.G3_KVM: return `/customer/g3_kvm/vms/${uuid}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${uuid}/`;
        default: console.error('Invalid device type : ', deviceMapping)
            break;
    }
};

export const S3_UL_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/?page_size=0`;

export const GET_UL_S3_ACCOUNTS = () => `customer/uls3_accounts/`;

export const ADD_UL_S3_ACCOUNT = () => `customer/uls3_accounts/`;

export const EDIT_UL_S3_ACCOUNT = (accountId: string) => `customer/uls3_accounts/${accountId}/`;

export const DELETE_UL_S3_ACCOUNT = (accountId: number) => `customer/uls3_accounts/${accountId}/`;

export const UPDATE_UL_S3_API_KEYS = () => `customer/uls3_accounts/change_password/`;

export const GET_UL_S3_BUCKETS = (accountId: string) => `customer/uls3_buckets/?adapter_pk=${accountId}`;

export const CREATE_UL_S3_BUCKET = (accountId: string) => `customer/uls3_buckets/?adapter_pk=${accountId}`;

export const DELETE_UL_S3_BUCKET = (accountId: string) => `customer/uls3_buckets/delete_bucket/?adapter_pk=${accountId}`;

export const UPLOAD_FILE_TO_UL_S3BUCKET = (accountId: string) => `/customer/uls3_buckets_uploaded_files/?adapter_id=${accountId}`;

export const GET_UL_S3_UPLOADED_FILES = (bucketId: string) => `/customer/uls3_buckets_uploaded_files/?bucket_uuid=${bucketId}`;

export const GENERATE_DATACENTER_INVENTORY_REPORT = () => `/customer/datacenter_inventory/`;

export const DOWNLOAD_DATACENTER_INVENTORY_REPORT = () => `/customer/datacenter_inventory/download/`;

export const EMAIL_DATACENTER_INVENTORY_REPORT = () => `/customer/datacenter_inventory/send_report_email/`;

export const DOWNLOAD_CLOUD_INVENTORY_REPORT = () => `/customer/reports/download/`;

export const EMAIL_CLOUD_INVENTORY_REPORT = () => `/customer/reports/send_report_email/`;

export const CABINET_CARBON_FOOTPRINT = (cabinetId: string) => `/customer/cabinets/${cabinetId}/carbon_footprint/`;

export const LIST_UL_S3_FILES = (accountId: string, bucketId: string) => `customer/uls3_buckets/list_files/?adapter_pk=${accountId}&bucket_uuid=${bucketId}`;

export const DELETE_UL_S3_FILES = (accountId: string, bucketId: string) => `customer/uls3_buckets/delete_file/?adapter_pk=${accountId}&bucket_uuid=${bucketId}`;

export const DEVICE_TAG_LIST_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `${BMS_FAST()}?page_size=0`;
        case DeviceMapping.MAC_MINI: return `customer/macdevice_fast/?page_size=0`;
    }
}

export const DC_CO2_EMISSION_VALUE = (dcId: string) => `customer/colo_cloud/${dcId}/carbon_footprint/`;

export const DOWNLOAD_MOBILE_DEVICES_REPORT = () => `/customer/mobiledevices/download/`;

export const GET_MOBILE_DEVICES_REPORT = (fileName: string) => `/customer/mobiledevices/get_report/?file_name=${fileName}`;

export const GET_DC_COST_DATA = () => `/customer/colo_cloud/dclist/`;

export const GET_DC_BILL_SUMMARY = () => `/customer/colo_cloud/summary/`;

export const CREATE_DC_BILL = () => `/customer/datacenterbilling/account/`;

export const DC_BILL = (billId: string) => `/customer/datacenterbilling/account/${billId}/`;

export const DC_BILL_DETAILS = (dcId: string) => `/customer/colo_cloud/${dcId}/billing_info/`;

export const DOWNLOAD_MAC_DEVICES_REPORT = () => `/customer/macdevices/download/ `;

export const GET_MAC_DEVICES_REPORT = (fileName: string) => `/customer/macdevices/get_report/?file_name=${fileName}`;

export const ADD_SERVICE_NOW = () => `customer/service_now/`;

export const EDIT_SERVICE_NOW = (serviceNowId: string) => `customer/service_now/${serviceNowId}/`;

export const GET_SERVICE_NOW_TICKET_BY_TYPE = (uuid: string) => `customer/service_now/${uuid}/get_tickets/`;

export const CREATE_SERVICE_NOW_TICKET = (uuid: string, type: string) => `customer/service_now/${uuid}/create_ticket/?ticket_type=${type}`;

export const DB_PRIVATE_CLOUD_FAST = () => `customer/cloud_fast/?page_size=0`;

export const DB_BMS = () => `${BMS_FAST()}?page_size=0`;

export const GET_SERVICE_NOW_STATES = (uuid: string, type: string) => `customer/service_now/${uuid}/get_ticket_states/${type ? '?ticket_type=' + type : ''}`;

export const GET_SERVICE_NOW_PRIORITIES = (uuid: string, type: string) => `customer/service_now/${uuid}/get_ticket_priorities/${type ? '?ticket_type=' + type : ''}`;

export const GET_SERVICE_NOW_TICKET_BY_ID = (uuid: string, ticketId: string, type?: string) => `customer/service_now/${uuid}/get_ticket/?ticket_id=${ticketId}${type ? '&ticket_type=' + type : ''}`;

export const GET_SERVICE_NOW_ATTACHMENTS_BY_TICKET_ID = (uuid: string, ticketId: string) => `customer/service_now/${uuid}/get_attachments/?ticket_id=${ticketId}`;

export const GET_SERVICE_NOW_COMMENTS_BY_TICKET_ID = (uuid: string, ticketId: string) => `customer/service_now/${uuid}/get_comments/?ticket_id=${ticketId}`;

export const PUT_SERVICE_NOW_TICKET_BY_ID = (uuid: string, type: string, ticketId: string) => `customer/service_now/${uuid}/add_comment/?ticket_type=${type}&ticket_id=${ticketId}`;

export const GET_SERVICE_NOW_GRAPH_DATA = (uuid: string) => `customer/service_now/${uuid}/get_graph_data/`;

export const GET_TICKET_MGMT_LIST = () => `customer/ticket_accounts/`;

export const SYNC_ALL_MAC_MINIS = () => `customer/macdevices/sync_mac_devices/`;

export const GET_ALL_DEVICES_TAGS = () => `customer/tags/?page_size=0`;

export const GET_OCI_ACOUNTS = () => `customer/managed/oci/account/`;

export const GET_OCI_REGIONS = () => `${environment.staticData}oci-data/oci-regions.json`;

export const GET_OCI_ACCOUNT_BY_ID = (uuid: string) => `customer/oci/account/${uuid}/`;

export const CREATE_OCI_ACCOUNT = () => `customer/oci/account/`;

export const UPDATE_OCI_ACCOUNT = (uuid: string) => `customer/oci/account/${uuid}/`;

export const DELETE_OCI_ACCOUNT = (uuid: string) => `customer/oci/account/${uuid}/`;

export const SYNC_OCI_VMS_BY_ACCOUNT_ID = (uuid: string) => `customer/oci/account/${uuid}/vm_sync/`;

export const SYNC_ALL_OCI_VMS = () => `/customer/managed/oci/account/all_vm_sync/`;

export const GET_OCI_VMS = () => `customer/managed/oci/instances/`;

export const OCI_VMS_BY_VM_ID = (uuid: string) => `customer/oci/instances/${uuid}/`;

export const OCI_VMS_ACTION_BY_VM_ID = (uuid: string) => `customer/managed/oci/instances/${uuid}/vm_action/`;

export const OCI_VMS_TERMINATE_BY_VM_ID = (uuid: string) => `customer/managed/oci/instances/${uuid}/vm_terminate/`;

export const OCI_VMS_CREATE = () => `customer/managed/oci/instances/`;

export const OCI_COMPARTMENTS_BY_ACCOUNT_ID = (uuid: string) => `customer/managed/oci/account/${uuid}/get_compartments/`;

export const OCI_REGIONS_BY_ACCOUNT_ID = (uuid: string) => `customer/managed/oci/account/${uuid}/get_subscribed_regions/`;

export const OCI_USERS_BY_ACCOUNT_ID = (uuid: string) => `customer/oci/account/${uuid}/get_users/`;

export const OCI_AVAILABLILITY_DOMAIN_BY_ACCOUNT_ID = (uuid: string, compartmentId: string) => `customer/managed/oci/account/${uuid}/get_ads/?compartment_id=${compartmentId}`;

export const OCI_SHAPE_BY_ACCOUNT_ID = (uuid: string, compartmentId: string) => `customer/managed/oci/account/${uuid}/get_shapes/?compartment_id=${compartmentId}`;

export const OCI_SUBNET_BY_ACCOUNT_ID = (uuid: string, compartmentId: string) => `customer/managed/oci/account/${uuid}/get_subnets/?compartment_id=${compartmentId}`;

export const OCI_IMAGE_BY_ACCOUNT_ID = (uuid: string, compartmentId: string, shape: string) => `customer/managed/oci/account/${uuid}/get_images/?compartment_id=${compartmentId}&shape=${shape}`;

export const OCI_BUCKETS_BY_ACCOUNT_ID = (OCIAccountUUID: string) => `customer/oci/account/${OCIAccountUUID}/get_buckets/`;

export const CREATE_OCI_BUCKET = (OCIAccountUUID: string) => `customer/managed/oci/account/${OCIAccountUUID}/create_bucket/`;

export const DELETE_OCI_BUCKET = (OCIAccountUUID: string) => `customer/managed/oci/account/${OCIAccountUUID}/delete_bucket/`;

export const LIST_OCI_BUCKET_FILES = (OCIAccountUUID: string, bucketName: string) => `customer/managed/oci/account/${OCIAccountUUID}/list_files/?bucket_name=${bucketName}`;

export const UPLOAD_FILE_TO_OCI_BUCKET = (OCIAccountUUID: string) => `customer/managed/oci/account/${OCIAccountUUID}/upload_file/`;

export const DELETE_FILE_FROM_OCI_BUCKET = (OCIAccountUUID: string) => `customer/managed/oci/account/${OCIAccountUUID}/delete_file/`;

export const GET_OCI_CLOUD_DATA = (cloudId: number) => `/customer/cloud_data/${cloudId}/oci_data/`;

export const REPORT_SCHDULES = () => `/customer/reporting/schedulers/`;

export const REPORT_SCHDULES_BY_ID = (uuid: string) => `/customer/reporting/schedulers/${uuid}/`;

export const TOGGLE_REPORT_SCHDULE = (uuid: string) => `/customer/reporting/schedulers/${uuid}/toggle/`;

export const OCI_TOTAL_COST = (accountId: string) => `/customer/cloudbilling/oci/${accountId}/total_cost/`;

export const CLOUD_COST_OCI_SUMMARY_DATA = () => `/customer/cloudbilling/oci/summary/`;

export const DB_TYPES = () => `/rest/database_type/?page_size=0`;

export const DB_SERVERS = (dbId: string) => `/customer/database_servers/${dbId}/`;

export const DB_ENABLE_MONITORING = (dbId: string) => `/customer/database_servers/${dbId}/monitoring/`;

export const DB_TOGGLE_MONITORING = (dbId: string, action: string) => `/customer/database_servers/${dbId}/monitoring/${action}/`;

export const DB_ALERTS = (instanceId: string) => `/customer/database_servers/${instanceId}/monitoring/alerts/`;

export const DB_GRAPHS = (instanceId: string) => `/customer/database_servers/${instanceId}/monitoring/graphs/`;

export const MANAGE_DB_GRAPH = (instanceId: string, graphId: string) => `/customer/database_servers/${instanceId}/monitoring/graphs/${graphId}/`;

export const DB_GRAPH_IMAGE = (instanceId: string, graphId: string) => `/customer/database_servers/${instanceId}/monitoring/graph_image/${graphId}/`;

export const DB_GRAPH_ITEMS = (instanceId: string) => `/customer/database_servers/${instanceId}/monitoring/items/`;

export const BMS_IPMI_DRAC_RESET_PASSWORD = (id: string) => `/customer/bm_servers/${id}/reset_password/`;

export const MONITORING_CONFIGURATION_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/monitoring/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/`;
        case DeviceMapping.MAC_MINI: return `/customer/macdevices/${deviceId}/monitoring/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `/customer/managed/azure/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.AWS_RESOURCES: return `customer/managed/aws/resources/${deviceId}/monitoring/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `/customer/managed/azure/resources/${deviceId}/monitoring/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/managed/vcenter/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/`;
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/monitoring/`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/monitoring/`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/monitoring/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DOWNLOAD_AGENT_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => `${MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId)}download_agent/`;

export const TOGGLE_MONITORING_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, enabled: boolean) => {
    const action: string = enabled ? 'stop' : 'start';
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.MAC_MINI: return `/customer/macdevices/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `/customer/managed/azure/resources/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `/customer/integration/vcenter/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/monitoring/${action}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const TOGGLE_SNMP_TRAP_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, enabled: boolean) => {
    const action: string = enabled ? 'stop' : 'start';
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/snmptrap//${action}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.MAC_MINI: return `/customer/macdevices/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/azure/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/${action}/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/${action}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_DEVICE_MONITORING_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return SWITCH_UPDATE(deviceId);
        case DeviceMapping.FIREWALL: return FIREWALL_UPDATE(deviceId);
        case DeviceMapping.LOAD_BALANCER: return LOAD_BALANCER_UPDATE(deviceId);
        case DeviceMapping.HYPERVISOR: return HYPERVISOR_UPDATE(deviceId);
        case DeviceMapping.BARE_METAL_SERVER: return BMServer_UPDATE(deviceId);//This is to get from `customer/servers/{uuid}`
        case DeviceMapping.STORAGE_DEVICES: return STORAGE_DEVICE_UPDATE(deviceId);
        case DeviceMapping.PDU: return PDU_UPDATE(deviceId);//This is to get from `customer/servers/{uuid}` 
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/`;
        case DeviceMapping.MAC_MINI: return MAC_UPDATE(deviceId);
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `/customer/managed/azure/accounts/${deviceId}/`;
        case DeviceMapping.AWS_ACCOUNTS: return `/customer/managed/aws/accounts/${deviceId}/`;
        case DeviceMapping.GCP_ACCOUNTS: return `/customer/managed/gcp/accounts/${deviceId}/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `/customer/managed/azure/resources/${deviceId}/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/managed/vcenter/accounts/${deviceId}/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/`;
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.MAC_MINI: return `/customer/macdevices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/device_data`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/devices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/device_data/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/device_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.GCP_VIRTUAL_MACHINE: return `customer/managed/gcp/resources/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.DOCKER_CONTAINER: return `customer/docker/containers/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/alerts/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/alerts/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_GRAPHS = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.LB: return `customer/load_balancers/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.DB_SERVER: return DB_GRAPHS(deviceId);
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.GCP_VIRTUAL_MACHINE: return `customer/managed/gcp/resources/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.AWS_ACCOUNTS: return `/customer/managed/aws/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.SDWAN_DEVICES: return `customer/sdwan/devices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/graphs/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/graphs/`;
        default: console.error('Invalid device type : ', deviceType);

    }
}

export const MANAGE_ZABBIX_DEVICE_GRAPH = (deviceType: DeviceMapping, deviceId: string, graphId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.DB_SERVER: return MANAGE_DB_GRAPH(deviceId, graphId);
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/azure_discover/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `customer/viptela/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.VIPTELA_DEVICE: return `customer/viptela/devices/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `customer/meraki/accounts/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.MERAKI_DEVICE: return `customer/meraki/devices/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/graphs/${graphId}/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/graphs/${graphId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_GRAPH_IMAGE = (deviceType: DeviceMapping, deviceId: string, graphId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.DB_SERVER: return DB_GRAPH_IMAGE(deviceId, graphId);
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/devices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/graph_image/${graphId}/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/graph_image/${graphId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_GRAPH_ITEMS = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/items/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/items/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/items/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/items/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/items/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/items/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/items/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/items/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/items/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/items/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/items/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/items/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/items/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/items/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/items/`;
        case DeviceMapping.DB_SERVER: return DB_GRAPH_ITEMS(deviceId);
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/items/`;
        case DeviceMapping.AWS_ACCOUNTS: return `/customer/managed/aws/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/items/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/items/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/items/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/items/`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/items/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/items/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/items/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/items/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/items/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/items/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.DB_SERVER: return `/customer/database_servers/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/items/`;
        case DeviceMapping.AWS_ACCOUNTS: return `/customer/managed/aws/accounts/${deviceId}/monitoring/numeric_items/`
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/items/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/numeric_items/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/items/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/items/`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/items/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/items/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/items/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/items/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/monitoring/items/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/monitoring/items/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/monitoring/items/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_SENSOR_DATA_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/sensor_data/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/sensor_data/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const TRIGGERS_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, triggerId?: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `/customer/managed/azure/resources/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/resources/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.DOCKER_CONTAINER: return `/customer/docker/containers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.AZURE_SERVICES: return `/customer/managed/azure/resources/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `/customer/sdwan/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/devices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/devices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/devices/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/monitoring/triggers/${triggerId ? triggerId.concat('/') : ''}`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_OBSERVIUM_ALL_DEVICE_ALERTS = (deviceType: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/observium/switch/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.FIREWALL: return `/customer/observium/firewall/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.LOAD_BALANCER: return `/customer/observium/load_balancer/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.BARE_METAL_SERVER: return `/customer/observium/bm_servers/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.HYPERVISOR: return `/customer/observium/servers/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.MAC_MINI: return `/customer/observium/macdevice/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/observium/aws/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/customer/observium/vmware/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `/customer/observium/openstack/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `/customer/observium/custom_vm/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.VCLOUD: return `/customer/observium/vcloud/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.PROXMOX: return `/customer/observium/proxmox/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.G3_KVM: return `/customer/observium/g3_kvm/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.HYPER_V: return `/customer/observium/hyperv/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.STORAGE_DEVICES: return `/customer/observium/storagedevice/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.PDU: return `/customer/observium/pdu/get_device_alerts/?alert_type=failed`;
        case DeviceMapping.VIRTUAL_MACHINE: return GET_DEVICE_ALERTS('vms');
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_ZABBIX_ALL_DEVICE_ALERTS_BY_DEVICE_TYPE = (deviceType: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/monitoring/all_alerts/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/monitoring/all_alerts/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/monitoring/all_alerts/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/monitoring/all_alerts/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/monitoring/all_alerts/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/monitoring/all_alerts/`;
        case DeviceMapping.PDU: return `customer/pdus/monitoring/all_alerts/`;
        case DeviceMapping.VIRTUAL_MACHINE: return `customer/virtual_machines/monitoring/all_alerts/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/monitoring/all_alerts/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/monitoring/all_alerts/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ZABBIX_TRIGGER_SCRIPTS = () => `/ssr/scripts/`;

export const GET_SCRIPT = (deviceType?: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `ssr/scripts/?device=Bare%20Metal%20Servers`;
        case DeviceMapping.HYPERVISOR: return `ssr/scripts/?device=Hypervisors`;
        case DeviceMapping.VIRTUAL_MACHINE: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.PROXMOX: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.HYPER_V: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.G3_KVM: return `ssr/scripts/?device=Virtual%20Machines`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `ssr/scripts/?device=Virtual%20Machines`;
        default: return `ssr/scripts/`;
    }
}

export const ADD_SCRIPT = () => '/ssr/scripts/';

export const UPDATE_SCRIPT = (uuid: string) => `/ssr/scripts/${uuid}/`;

export const DELETE_SCRIPT = (uuid: string) => `/ssr/scripts/${uuid}/`;

export const GET_CREDENTIALS = () => '/customer/unity_discovery/fast/credential/';

export const GET_MONITORING_CONFIG = () => `/customer/monitoring_config/`;

export const UNITY_CREDENTIALS = () => `/customer/unity_discovery/credential/`;

export const UNITY_CREDENTIALS_FAST = () => `/customer/unity_discovery/fast/credential/`;

export const UNITY_CREDENTIALS_BY_ID = (uuid: string) => `/customer/unity_discovery/credential/${uuid}/`;

export const GET_ADVANCED_DISCOVERY_CREDENTIALS = () => `/customer/unity_discovery/credential/`;

export const CREATE_ADVANCED_DISCOVERY_CREDENTIALS = () => `/customer/unity_discovery/credential/`;

export const UPDATE_ADVANCED_DISCOVERY_CREDENTIALS = (uuid: string) => `/customer/unity_discovery/credential/${uuid}/`;

export const DELETE_ADVANCED_DISCOVERY_CREDENTIALS = (uuid: string) => `/customer/unity_discovery/credential/${uuid}/`;

export const GET_ADVANCED_DISCOVERY_LIST = () => `/customer/unity_discovery/discovery/`;

export const CREATE_ADVANCED_DISCOVERY = () => `/customer/unity_discovery/discovery/`;

export const UPDATE_ADVANCED_DISCOVERY = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/`;

export const DELETE_ADVANCED_DISCOVERY = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/`;

export const EXECUTE_ADVANCED_DISCOVERY = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/restart/`;

export const ADVANCED_DISCOVERY_HISTORY = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/schedule_history/`;

export const TOGGLE_DISCOVERY_SCHDULE = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/toggle/`;

export const GET_DEVICES_BY_DISCOVERY_ID = (uuid: string) => `/customer/unity_discovery/discovery/${uuid}/discovered_devices/`;

export const GET_ADVANCED_DISCOVERY_SCAN_OUTPUT = (discoveryId: string, deviceType?: DeviceMapping) => {
    // let endpoint = `/customer/unity_discovery/scan_output/`;
    let endpoint = 'customer/unity_discovery/discovery';
    switch (deviceType) {
        case DeviceMapping.PDU: return `${endpoint}/${discoveryId}/resources/?resource_type=pdu`;
        case DeviceMapping.SWITCHES: return `${endpoint}/${discoveryId}/resources/?resource_type=switch`;
        case DeviceMapping.FIREWALL: return `${endpoint}/${discoveryId}/resources/?resource_type=firewall`;
        case DeviceMapping.LOAD_BALANCER: return `${endpoint}/${discoveryId}/resources/?resource_type=load_balancer`;
        case DeviceMapping.HYPERVISOR: return `${endpoint}/${discoveryId}/resources/?resource_type=hypervisor`;
        case DeviceMapping.BARE_METAL_SERVER: return `${endpoint}/${discoveryId}/resources/?resource_type=baremetal`;
        case DeviceMapping.MAC_MINI: return `${endpoint}/${discoveryId}/resources/?resource_type=mac`;
        case DeviceMapping.STORAGE_DEVICES: return `${endpoint}/${discoveryId}/resources/?resource_type=storage`;
        default: return `${endpoint}/${discoveryId}/resources/`;
    }
}

export const SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE = (discoveryId?: string, resourceId?: string, deviceType?: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.PDU: return `customer/unity_discovery/pdus/`;
        case DeviceMapping.SWITCHES: return `customer/unity_discovery/switches/`;
        case DeviceMapping.FIREWALL: return `customer/unity_discovery/firewalls/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/unity_discovery/loadbalancers/`;
        case DeviceMapping.HYPERVISOR: return `customer/unity_discovery/servers/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/unity_discovery/bms/`;
        case DeviceMapping.MAC_MINI: return `customer/unity_discovery/macdevices/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/unity_discovery/storagedevices/`;
        default: return `customer/unity_discovery/discovery/${discoveryId}/resources/${resourceId}/`;
    }
}

export const ONBOARD_ADVANCED_DISCOVERY_SCAN_RESULT = (discovery: string, uuid: string) => `customer/unity_discovery/discovery/${discovery}/resources/${uuid}/onboard/`;

export const DOWNLOAD_ADVANCED_DISCOVERY_SCAN_RESULT = () => `/customer/unity_discovery/discovery/`;

export const GET_ADVANCED_DISCOVERY_SUMMMARY = (discoveryId: string) => discoveryId ? `/customer/unity_discovery/discovery/${discoveryId}/summary/` : `/customer/unity_discovery/summary/`;

export const BMS_FAST = () => `/customer/bm_server_fast/`;

export const ENABLE_TRIGGER = (deviceType: DeviceMapping, deviceId: string, triggerId: string) => `${TRIGGERS_BY_DEVICE_TYPE(deviceType, deviceId, triggerId)}enable/`;

export const DISABLE_TRIGGER = (deviceType: DeviceMapping, deviceId: string, triggerId: string) => `${TRIGGERS_BY_DEVICE_TYPE(deviceType, deviceId, triggerId)}disable/`;

export const UPDATE_AZURE_VM_TAGS = () => `customer/managed/azure/resources/virtual_machines/tag_azure_vm/`;

export const CO2_EMISSION_VALUE_BY_DEVICE_TYPE = (id: string, deviceType?: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.CABINET_VIZ: return `customer/cabinets/${id}/carbon_footprint/`;
        case DeviceMapping.PDU: return `customer/pdus/${id}/monitoring/carbon_footprint/`;
        default: return `customer/colo_cloud/${id}/carbon_footprint/`;
    }
}

export const DEVICES_FAST_BY_DEVICE_TYPE = (deviceType: DeviceMapping, withShared?: boolean) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/fast/switches/?page_size=0${withShared ? '' : '&is_shared=False'}`;
        case DeviceMapping.FIREWALL: return `/customer/fast/firewalls/?page_size=0${withShared ? '' : '&is_shared=False'}`;
        case DeviceMapping.LOAD_BALANCER: return `/customer/fast/load_balancers/?page_size=0${withShared ? '' : '&is_shared=False'}`;
        case DeviceMapping.HYPERVISOR: return `/customer/fast/servers/?page_size=0`;
        case DeviceMapping.BARE_METAL_SERVER: return `/customer/fast/bm_servers/?page_size=0`;
        case DeviceMapping.STORAGE_DEVICES: return `/customer/fast/storagedevices/?page_size=0`;
        case DeviceMapping.MAC_MINI: return `/customer/fast/macdevices/?page_size=0`;
        case DeviceMapping.DB_SERVER: return `/customer/fast/database_servers/?page_size=0`;
        case DeviceMapping.PDU: return `/customer/fast/pdus/?page_size=0`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/customer/fast/vmware_vm/?page_size=0`;
        case DeviceMapping.VCLOUD: return `/customer/fast/vcloud_vm/?page_size=0`;
        case DeviceMapping.HYPER_V: return `/customer/fast/hyperv_vm/?page_size=0`;
        case DeviceMapping.ESXI: return `/customer/fast/esxi_vm/?page_size=0`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `/customer/fast/openstack_vm/?page_size=0`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `/customer/fast/custom_vms/?page_size=0`;
        case DeviceMapping.DC_VIZ: return `/customer/colo_cloud_fast/?page_size=0`;
        case DeviceMapping.CABINET_VIZ: return `/customer/cabinets_fast/?page_size=0`;
        case DeviceMapping.PC_VIZ: return `/customer/private_cloud_fast/?page_size=0`;
        case DeviceMapping.SDWAN_DEVICES: return `/customer/sdwan/fast/devices/?page_size=0`;
        case DeviceMapping.VIPTELA_DEVICE: return `/customer/viptela/fast/devices/?page_size=0`;
        case DeviceMapping.MERAKI_DEVICE: return `/customer/meraki/fast/devices/?page_size=0`;
        default: console.error('Invalid Input');
    }
}

export const PRIVATE_CLOUD_FAST_BY_DC_ID = (dcId: string) => `/customer/private_cloud_fast/?datacenter=${dcId}&page_size=0`;

export const CABINET_FAST_BY_DEVICE_ID = (dcId: string) => `/customer/cabinets_fast/?datacenter=${dcId}&page_size=0`;

export const ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, graphId: number) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.ESXI: return `customer/vmware/esxi_vms/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/openstack/migration/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `/customer/virtual_machines/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/preview_graph_image/${graphId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const SYSTEM_MONITORING_WIDGET = (widgetId?: string) => `/customer/monitor_widget/${widgetId ? widgetId.concat('/') : ''}`;

export const ZABBIX_ALL_ALERTS = () => `/customer/zabbix/alerts/`;

export const ZABBIX_GROUP_BY_ALERTS = () => `/customer/zabbix/alerts/group_by_view`;

export const ZABBIX_ALL_ALERTS_SUMMARY = () => `/customer/zabbix/alerts/summary/`;

export const ZABBIX_ALERT_HISTORY = () => `/customer/zabbix/alerts/history/`;

export const ZABBIX_ALERT_ACTIONS = (alertId: number) => `/customer/zabbix/alerts/${alertId}/actions/`;

export const ZABBIX_ALERT_BULK_ACTIONS = () => `/customer/zabbix/alerts/bulk_actions/`;

export const TOP_10_CO2_EMITTED_DEVICES = () => `/customer/sustainability/c02_emitted_top_devices/`;

export const CO2_EMISSION_BY_DC = () => `/customer/sustainability/c02_emission_by_datacenter/`;

export const CO2_EMISSION_BY_GCP = () => `/customer/sustainability/gcp_co2_total_current_year/`;

export const CO2_EMISSION_BY_GCP_YEAR = () => 'customer/sustainability/gcp_co2_yearly/';

export const CO2_EMISSION_BY_CABINET = () => `/customer/sustainability/c02_emission_by_cabinet/`;

export const CO2_EMISSION_BY_PRIVATE_CLOUD = () => `/customer/sustainability/c02_emission_by_private_cloud/`;

export const CO2_EMISSION_BY_DEVICE_TYPE = () => `/customer/sustainability/c02_emission_by_device_type/`;

export const CO2_EMISSION_BY_QUARTER = () => `/customer/sustainability/c02_emission_by_quarter/`;

export const CO2_EMISSION_BY_YEAR = () => `/customer/sustainability/c02_emission_by_years/`;

export const CO2_EMISSION_BY_DC_BY_QUARTER = () => `/customer/sustainability/c02_emission_by_datacenter_quarter/`;

export const CO2_EMISSION_BY_DEVICES = () => `/customer/sustainability/c02_emission_by_devices/`;

export const TOP_10_CO2_EMITTED_TAG_GROUPS = () => `/customer/sustainability/c02_emitted_top_tags/`;

export const CO2_EMITTED_BY_REGION = () => `/customer/sustainability/c02_emission_by_region/`;

export const CO2_DASHBOARD_SUMMARY = () => '/customer/sustainability/co2_dashboard_summary/';

export const GCP_CO2_BY_SUMMARY = () => `/customer/sustainability/gcp_co2_summary/`;

export const GCP_CO2_BY_PRODUCT = () => `/customer/sustainability/gcp_co2_product/`;

export const GCP_CO2_BY_PROJECT = () => `/customer/sustainability/gcp_co2_project/`;

export const GCP_CO2_BY_REGION = () => `/customer/sustainability/gcp_co2_region/`;

export const GCP_CO2_BY_QUARTERLY = () => `/customer/sustainability/gcp_co2_quarterly/`;

export const GCP_CO2_BY_MONTH = () => `/customer/sustainability/gcp_co2_monthly/`;

export const GCP_CO2_BY_YEAR = () => `/customer/sustainability/gcp_co2_yearly/`;

export const SAVE_EXCEL_DATA_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/onboarding/bms/`;
        case DeviceMapping.HYPERVISOR: return `customer/onboarding/servers/`;
        case DeviceMapping.MAC_MINI: return `customer/onboarding/macdevices/`;
        case DeviceMapping.MOBILE_DEVICE: return `customer/onboarding/mobiledevices/`;
        case DeviceMapping.FIREWALL: return `customer/onboarding/firewalls/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/onboarding/load_balancers/`;
        case DeviceMapping.SWITCHES: return `customer/onboarding/switches/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/onboarding/storagedevices/`;
        case DeviceMapping.PDU: return `customer/onboarding/pdus/`;
        case DeviceMapping.DB_SERVER: return `customer/onboarding/databases/`;

        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_EXCEL_DATA_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/onboard_excel_data/get_all_result/?type=Bare_Metals`;
        case DeviceMapping.HYPERVISOR: return `customer/onboard_excel_data/get_all_result/?type=Hypervisors`;
        case DeviceMapping.MAC_MINI: return `customer/onboard_excel_data/get_all_result/?type=MAC_Mini`;
        case DeviceMapping.MOBILE_DEVICE: return `customer/onboard_excel_data/get_all_result/?type=Mobile_Devices`;
        case DeviceMapping.FIREWALL: return `customer/onboard_excel_data/get_all_result/?type=Firewalls`;
        case DeviceMapping.LOAD_BALANCER: return `customer/onboard_excel_data/get_all_result/?type=Load_Balancers`;
        case DeviceMapping.SWITCHES: return `customer/onboard_excel_data/get_all_result/?type=Switches`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/onboard_excel_data/get_all_result/?type=Storage`;
        case DeviceMapping.PDU: return `customer/onboard_excel_data/get_all_result/?type=PDUs`;
        case DeviceMapping.DB_SERVER: return `customer/onboard_excel_data/get_all_result/?type=Databases`;
        default: console.error('Invalid device type : ', deviceType);
    }
}
export const GET_CABINET_EXCEL_DATA = () => `customer/onboard_excel_data/get_all_result/?type=Cabinets`;

export const GET_DATA_CENTER_EXCEL_DATA = () => `customer/onboard_excel_data/get_all_result/?type=Datacenters`;

export const SAVE_CABINET_EXCEL_DATA = () => `customer/onboarding/cabinets/`;

export const SAVE_DATA_CENTER_EXCEL_DATA = () => `customer/onboarding/datacenter/`;

export const GET_EXCEL_ON_BOARD_DATA = () => `/customer/onboard_excel_data/`;

export const DELETE_EXCEL_ON_BOARD_DATA = () => `/customer/onboard_excel_data/delete_device/`;

export const GET_EXCEL_ON_BOARD_SUMMARY_DATA = () => `/customer/onboard_excel_data/total_summary/`;

export const GET_UPLOADED_FILES_DETAILS = () => GET_EXCEL_ON_BOARD_DATA();

export const DELETE_UPLOADED_FILES_DETAILS = (uuid: string) => `customer/onboard_excel_data/${uuid}/delete_excel/`;

export const SAVE_FILE_DETAILS_TO_TEMP = () => `customer/onboard_excel_data/onboard_next/`;

export const GET_ALERTS_BY_SEVERITY = () => `/customer/zabbix/alerts/graphs/alert_count/`;

export const GET_ALERT_TREND_BY_SEVERITY = () => `/customer/zabbix/alerts/graphs/alert_trend/`;

export const GET_TOP_10_DEVICES_BY_ALERTS = () => `/customer/zabbix/alerts/graphs/top_devices/`;

export const GET_TOP_10_DEVICES_TREND_BY_ALERTS = () => `/customer/zabbix/alerts/graphs/top_trend/`;

export const GET_ALERTS_BY_DC = () => `/customer/zabbix/alerts/graphs/alert_count_dc/`;

export const GET_ALERT_TREND_BY_DC = () => `/customer/zabbix/alerts/graphs/alert_trend_dc/`;

export const GET_VCENTER_VM_PROVISION_METADATA = (pcId: string) => `/customer/private_cloud/${pcId}/retrieve_resource_params/`;

export const GET_VCENTER_VM_ISO_LIST = (pcId: string) => `/customer/private_cloud/${pcId}/retrieve_datastore_files/`;

export const VCENTER_VM_PROVISION = (pcId: string, cloudName: string) => `/customer/managed/${cloudName}/accounts/${pcId}/provision_vm/`;

export const VCENTER_VM_HARDWARE_DETAILS = (pcId: string, cloudName: string, name: string) => `/customer/managed/${cloudName}/accounts/${pcId}/fetch_vm_hardware/?vm=${name}`;

export const UPDATE_VCENTER_VM = (pcId: string, cloudName: string) => `/customer/managed/${cloudName}/accounts/${pcId}/update_vm/`;

export const GET_UNITED_CONNECT_PORTS = () => `/customer/zabbix/mapped_ports/`;

export const GET_PORTS_BY_DEVICE = (deviceType: string, deviceId: string) => `/customer/${deviceType}/${deviceId}/monitoring/port_items/`;

export const UNITED_CONNECT_PORTS_CRUD = (deviceType: string, deviceId: string) => `/customer/${deviceType}/${deviceId}/monitoring/mapped_ports/`;

export const DEVICES_MONITORING_SUMMARY = () => `/customer/all_devices/summary/`;

export const DEVICES_MONITORING_DETAILS = () => `/customer/all_devices/`;

export const BULK_MONITORING = () => `/customer/bulk_monitoring/`;

export const ACTIVATE_BULK_MONITORING = () => `/customer/bulk_monitoring/activate/`;

export const ENABLE_BULK_MONITORING = () => `/customer/bulk_monitoring/enable/`;

export const DISABLE_BULK_MONITORING = () => `/customer/bulk_monitoring/disable/`;

export const DELETE_BULK_MONITORING = () => `/customer/bulk_monitoring/delete/`;

export const TEST_AGENT_CONNECTION = (uuid: string) => `customer/agent/config/${uuid}/check_connectivity/`;

export const CREATE_VCENTER_SNAPSHOT = (uuid: string) => `/rest/vmware/migrate/${uuid}/add_snapshot/`;

export const GET_VCENTER_SNAPSHOT = (uuid: string) => `/rest/vmware/migrate/${uuid}/list_snapshot/`;

export const DELETE_VCENTER_SNAPSHOT = (uuid: string) => `/rest/vmware/migrate/${uuid}/delete_snapshot/`;

export const DELETE_ALL_VCENTER_SNAPSHOT = (uuid: string) => `/rest/vmware/migrate/${uuid}/delete_all_snapshot/`;

export const REVERT_VCENTER_SNAPSHOT = (uuid: string) => `/rest/vmware/migrate/${uuid}/revert_snapshot/`;

export const DYNAMICCRM_CLIENTS = () => `customer/dynamics_crm/instances/`;

export const DYNAMICCRM_TICKETS = (instanceId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/`;

export const DYNAMICCRM_TICKETS_REPORT = (instanceId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/download_report/`;

export const DYNAMICCRM_TICKETS_REPORT_DOWNLOAD = (instanceId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/get_report/`;

export const DYNAMICCRM_TICKET_GRAPHS = (instanceId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/get_graph_data/`;

export const DYNAMICCRM_TICKET_BY_TICKET_ID = (instanceId: string, ticketId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/${ticketId}/`;

export const DYNAMICCRM_TICKETS_BY_TYPE = (instanceId: string, type: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/?ticket_type=${type}`;

export const DYNAMICCRM_TIMELINE = (instanceId: string, ticketId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/${ticketId}/timeline/`;

export const DYNAMICCRM_TICKET_RESOLVE = (instanceId: string, ticketId: string) => `customer/dynamics_crm/instances/${instanceId}/tickets/${ticketId}/resolve/`;

export const DYNAMICCRM_TICKET_CANCEL = (instanceId: string, ticketId: string, cancelledStateVal: number) => `customer/dynamics_crm/instances/${instanceId}/tickets/${ticketId}/cancel/?state=${cancelledStateVal}`;

export const DYNAMICCRM_TICKET_REACTIVATE = (instanceId: string, ticketId: string, activeStateVal: number) => `customer/dynamics_crm/instances/${instanceId}/tickets/${ticketId}/reactivate/?state=${activeStateVal}`;

export const DYNAMICCRM_NOTES = (instanceId: string) => `customer/dynamics_crm/instances/${instanceId}/notes/`;

export const DYNAMICCRM_TICKET_NOTE_ATTACHMENTS = (instanceId: string, noteId: string) => `customer/dynamics_crm/instances/${instanceId}/notes/${noteId}/document/`;

export const GET_VCENTER_CONTENT_LIBRARIES = (pcId: string) => `customer/managed/vcenter/accounts/${pcId}/list_content_library/`;

export const GET_VCENTER_CONTENT_LIBRARY_FILES = (pcId: string, libId: string) => `customer/managed/vcenter/accounts/${pcId}/list_content_library_files/?library_id=${libId}`;

export const UPLOAD_FILE_TO_VCENTER_CONTENT_LIBRARY = (pcId: string) => `customer/managed/vcenter/accounts/${pcId}/upload_to_content_library/`;

export const UPLOAD_FILE_IN_CHUNKS = () => `customer/chunk_upload/`;

export const UPLOAD_LARGE_FILE_TO_VCENTER_CONTENT_LIBRARY = (pcId: string) => `customer/managed/vcenter/accounts/${pcId}/chunk_upload_to_content_library/`;

export const DELETE_FILE_FROM_VCENTER_CONTENT_LIBRARY = (pcId: string) => `customer/managed/vcenter/accounts/${pcId}/remove_file_from_content_library/`;

export const DEVICE_BY_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/`;
        case DeviceMapping.VCLOUD: return `rest/openstack/migration/${deviceId}/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/`;
        case DeviceMapping.DC_VIZ: return `customer/colo_cloud/${deviceId}/`;
        case DeviceMapping.NUTANIX_VIRTUAL_MACHINE: return `customer/nutanix-devices/virtual_machines/${deviceId}/`;
        case DeviceMapping.SDWAN_DEVICES: return `customer/sdwan/devices/${deviceId}/`;
        case DeviceMapping.VIPTELA_DEVICE: return `customer/viptela/devices/${deviceId}/`;
        case DeviceMapping.MERAKI_DEVICE: return `customer/meraki/devices/${deviceId}/`;
        case DeviceMapping.SENSOR: return `customer/sensors/${deviceId}/`;
        case DeviceMapping.SMART_PDU: return `customer/smart_pdus/${deviceId}/`;
        case DeviceMapping.RFID_READER: return `customer/rfid_readers/${deviceId}/`;

        case DeviceMapping.LLM_SERVICE: return `/customer/observability/llms/${deviceId}/`;
        case DeviceMapping.VECTOR_DB_SERVICE: return `/customer/observability/vectordbs/${deviceId}/`;
        case DeviceMapping.GPU_SERVICE: return `/customer/observability/gpus/${deviceId}/`;
        case DeviceMapping.DB_SERVER: return `/customer/database_servers/${deviceId}/`;
        case DeviceMapping.DB_ENTITY: return `/customer/database_entity/${deviceId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_INTERFACES_BY_DEVICE_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/interfaces/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/interfaces/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/interfaces/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/interfaces/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/interfaces/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/interfaces/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/interfaces/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/interfaces/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/interfaces/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/interfaces/`
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/interfaces/`;
        case DeviceMapping.VCLOUD: return `rest/openstack/migration/${deviceId}/interfaces/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/interfaces/`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/interfaces/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/interfaces/`;
        case DeviceMapping.DC_VIZ: return `customer/colo_cloud/${deviceId}/interfaces/`;
        case DeviceMapping.SDWAN_DEVICES: return `customer/sdwan/devices/${deviceId}/interfaces/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_CUSTOM_ATTRIBUTES_BY_DEVICE_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/custom_attribute/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/custom_attribute/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/custom_attribute/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/custom_attribute/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/custom_attribute/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/custom_attribute/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/custom_attribute/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/bm_servers/${deviceId}/custom_attribute/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/custom_attribute/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/custom_attribute/`
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/custom_attribute/`;
        case DeviceMapping.VCLOUD: return `rest/openstack/migration/${deviceId}/custom_attribute/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/custom_attribute/`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/custom_attribute/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/custom_attribute/`;
        case DeviceMapping.DC_VIZ: return `customer/colo_cloud/${deviceId}/custom_attribute/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/${deviceId}/custom_attribute/`;
        case DeviceMapping.DB_ENTITY: return `customer/database_entity/${deviceId}/custom_attribute/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}


export const DEVICE_MANUFACTURERS = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `rest/manufacturer/?page_size=0`;
        case DeviceMapping.FIREWALL: return `rest/manufacturer/?page_size=0`;
        case DeviceMapping.LOAD_BALANCER: return `rest/manufacturer/?page_size=0`;
        case DeviceMapping.HYPERVISOR: return `rest/server_manufacturer/?page_size=0`;;
        case DeviceMapping.BARE_METAL_SERVER: return `rest/server_manufacturer/?page_size=0`;
        case DeviceMapping.MAC_MINI: return `rest/server_manufacturer/?page_size=0`;
        case DeviceMapping.STORAGE_DEVICES: return `rest/storage_manufacturer/?page_size=0`;
        case DeviceMapping.PDU: return `rest/pdu_manufacturer/?page_size=0`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_MODELS = (deviceType: DeviceMapping, manufacturer: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `rest/switchmodel/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.FIREWALL: return `rest/firewallmodel/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.LOAD_BALANCER: return `rest/loadbalancermodel/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.HYPERVISOR: return `rest/server_model/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.BARE_METAL_SERVER: return `rest/server_model/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.MAC_MINI: return `rest/server_model/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.STORAGE_DEVICES: return `rest/storage_model/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.PDU: return `rest/pdumodel/?manufacturer=${manufacturer}&page_size=0`;
        case DeviceMapping.MOBILE_DEVICE: return `rest/mobile_model/?manufacturer=${manufacturer}&page_size=0`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OS = (deviceType?: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.MAC_MINI: return `rest/os/?page_size=0&search=MacOS`;
        default: return `rest/os/?page_size=0`;
    }
}

export const ORG_ZABBIX_EMAIL_ALERT_CONFIG = (orgId: string) => `customer/organization/${orgId}/alert_notification_config/`;

export const DEVICE_ZABBIX_EMAIL_ALERT_CONFIG = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/alert_notification_config/`;
        case DeviceMapping.FIREWALL: return `/customer/firewalls/${deviceId}/alert_notification_config/`;
        case DeviceMapping.LOAD_BALANCER: return `/customer/load_balancers/${deviceId}/alert_notification_config/`;
        case DeviceMapping.HYPERVISOR: return `/customer/servers/${deviceId}/alert_notification_config/`;
        case DeviceMapping.BARE_METAL_SERVER: return `/customer/bm_servers/${deviceId}/alert_notification_config/`;
        case DeviceMapping.STORAGE_DEVICES: return `/customer/storagedevices/${deviceId}/alert_notification_config/`;
        case DeviceMapping.MAC_MINI: return `/customer/macdevices/${deviceId}/alert_notification_config/`;
        case DeviceMapping.DB_SERVER: return `/customer/database_servers/${deviceId}/alert_notification_config/`;
        case DeviceMapping.PDU: return `/customer/pdus/${deviceId}/alert_notification_config/`;
        case DeviceMapping.MOBILE_DEVICE: return `/customer/mobiledevices/${deviceId}/alert_notification_config/`;
        // case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/customer/vmware_vm/?page_size=0`;
        // case DeviceMapping.VCLOUD: return `/customer/vcloud_vm/?page_size=0`;
        // case DeviceMapping.HYPER_V: return `/customer/hyperv_vm/?page_size=0`;
        // case DeviceMapping.ESXI: return `/customer/esxi_vm/?page_size=0`;
        // case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `/customer/openstack_vm/?page_size=0`;
        // case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `/customer/custom_vms/?page_size=0`;
        // case DeviceMapping.DC_VIZ: `${GET_CABINET_WIDGET_DATA()}?page_size=0`;
        // case DeviceMapping.CABINET_VIZ: return `/customer/cabinets_fast/?page_size=0`;
        default: console.error('Invalid Input');
    }
}

export const DYNAMICCRM_FEEDBACK_TICKETS = () => `customer/dynamics_crm/feedback/`;

export const DYNAMICCRM_FEEDBACK_TICKETS_REPORT = () => `customer/dynamics_crm/feedback/download_report/`;

export const DYNAMICCRM_FEEDBACK_TICKETS_REPORT_DOWNLOAD = () => `customer/dynamics_crm/feedback/get_report/`;

export const DYNAMICCRM_FEEDBACK_TICKET_GRAPHS = () => `customer/dynamics_crm/feedback/get_graph_data/`;

export const DYNAMICCRM_FEEDBACK_TICKET_BY_TICKET_ID = (ticketId: string) => `customer/dynamics_crm/feedback/${ticketId}/`;

export const DYNAMICCRM_FEEDBACK_TICKET_TIMELINE = (ticketId: string) => `customer/dynamics_crm/feedback/${ticketId}/timeline/`;

export const DYNAMICCRM_FEEDBACK_TICKET_RESOLVE = (ticketId: string) => `customer/dynamics_crm/feedback/${ticketId}/resolve/`;

export const DYNAMICCRM_FEEDBACK_TICKET_CANCEL = (ticketId: string, cancelledStateVal: number) => `customer/dynamics_crm/feedback/${ticketId}/cancel/?state=${cancelledStateVal}`;

export const DYNAMICCRM_FEEDBACK_TICKET_REACTIVATE = (ticketId: string, activeStateVal: number) => `customer/dynamics_crm/feedback/${ticketId}/reactivate/?state=${activeStateVal}`;

export const DYNAMICCRM_FEEDBACK_TICKET_NOTES = () => `customer/dynamics_crm/feedback/create_note/`;

export const DYNAMICCRM_FEEDBACK_TICKET_NOTE_ATTACHMENTS = (noteId: string) => `customer/dynamics_crm/feedback/note_document/?note_uuid=${noteId}`;

export const DYNAMICCRM_FEEDBACK_CHANGE_PRIORITY = (ticketId: string) => `customer/dynamics_crm/feedback/${ticketId}/`;

export const DYNAMICCRM_FEEDBACK_RETRIEVE_TICKET_NOTES = (noteId: string) => `customer/dynamics_crm/feedback/retrieve_note/?note_uuid=${noteId}`;

export const UNITY_NETWORK_TOPOLOGY = (view: string, node?: string, nodeId?: string) => {
    let endpoint: string;
    switch (view) {
        case 'colocloud':
            endpoint = `/customer/unity_discovery/unity_view/topology/?view=dc_view&node=${node}`;
            return nodeId ? `${endpoint}&uuid=${nodeId}` : endpoint;
        case 'private_cloud':
            endpoint = `/customer/unity_discovery/unity_view/topology/?view=pc_view&node=${node}`;
            return nodeId ? `${endpoint}&uuid=${nodeId}` : endpoint;
        default: return `/customer/unity_discovery/unity_view/topology/?view=default&node=${node}`;
    }
};

export const GET_ALL_NOTIFICATION_GROUP = () => `/customer/alert_notification_group/`;

export const GET_NOTIFICATION_GROUP = (uuid: string) => `/customer/alert_notification_group/${uuid}/`;

export const CREATE_NOTIFICATION_GROUP = () => `/customer/alert_notification_group/`;

export const UPDATE_NOTIFICATION_GROUP = (uuid: string) => `/customer/alert_notification_group/${uuid}/`;

export const DELETE_NOTIFICATION_GROUP = (uuid: string) => `/customer/alert_notification_group/${uuid}/`;

export const TOGGLE_ALL_NOTIFICATION_GROUP = () => `/customer/alert_notification_group/toggle_all_notifications/`;

export const TOGGLE_NOTIFICATION_GROUP = (uuid: string) => `/customer/alert_notification_group/${uuid}/toggle_status/`;

export const TOGGLE_STATUS = (uuid: string, data: string) => `orchestration/repo/${uuid}/toggle_feature/`;

export const GET_AIOPS_EVENTS = () => `/customer/aiops/events/`;

export const GET_AIOPS_EVENT_BY_ID = (uuid: string) => `/customer/aiops/events/${uuid}/`;

export const GET_AIOPS_EVENT_SUMMARY = () => `/customer/aiops/events/summary/`;

export const GET_AIOPS_NOISY_EVENTS = () => `/customer/aiops/events/noisy/`;

export const GET_AIOPS_EVENT_NOISY_HOSTS = () => `/customer/aiops/events/noisy_host/`;

export const GET_AIOPS_EVENT_COUNT_BY_TYPE = () => `/customer/aiops/events/count/`;

export const GET_AIOPS_EVENT_COUNT_BY_DEVICE_TYPE = () => `/customer/aiops/events/event_by_device/`;

export const GET_AIOPS_ALERTS = () => `/customer/aiops/alerts/`;

export const GET_AIOPS_ALERT_BY_ID = (uuid: string) => `/customer/aiops/alerts/${uuid}/`;

export const GET_AIOPS_ALERTS_SUMMARY = () => `/customer/aiops/alerts/summary/`;

export const GET_AIOPS_NOISY_ALERTS = () => `/customer/aiops/alerts/noisy/`;

export const GET_AIOPS_SUPPRESSED_ALERTS = () => `/customer/aiops/supressed/`;

export const GET_AIOPS_ALERTS_COUNT_BY_DEVICE_TYPE = () => `/customer/aiops/alerts/count/?count_by=device_type`;

export const GET_AIOPS_ALERTS_COUNT = () => `/customer/aiops/alerts/count/`;

export const GET_AIOPS_CONDITIONS_SUMMARY = () => `/customer/aiops/conditions/summary/`;

export const GET_AIOPS_CONDITIONS = () => `/customer/aiops/conditions/`;

export const GET_AIOPS_CONDITION_BY_ID = (uuid: string) => `customer/aiops/conditions/${uuid}/`;

export const AIOPS_SUPPRESSION_RULE = () => `/customer/aiops/srules/`;

export const AIOPS_SUPPRESSION_RULE_BY_ID = (ruleId: string) => `/customer/aiops/srules/${ruleId}/`;

export const AIOPS_SUPPRESSION_RULE_ENABLE = (ruleId: string) => `/customer/aiops/srules/${ruleId}/enable/`;

export const AIOPS_SUPPRESSION_RULE_DISABLE = (ruleId: string) => `/customer/aiops/srules/${ruleId}/disable/`;

export const AIOPS_ANALYTICS_SUPPRESSION_RULES = () => `/customer/aiops/srules/suppress_timeline/`;

export const AIOPS_CORRELATION_RULES = () => `/customer/aiops/correlation_rules/`;

export const AIOPS_CORRELATION_RULE_BY_ID = (ruleId: string) => `/customer/aiops/correlation_rules/${ruleId}/`;

export const AIOPS_CORRELATION_RULE_ENABLE = (ruleId: string) => `/customer/aiops/correlation_rules/${ruleId}/enable/`;

export const AIOPS_CORRELATION_RULE_DISABLE = (ruleId: string) => `/customer/aiops/correlation_rules/${ruleId}/disable/`;

export const AIOPS_CORRELATION_RULE_UPDATE_PRIORITY = (uuid: string) => `/customer/aiops/correlation_rules/${uuid}/update_priority/`;

export const AIOPS_ANALYTICS_CORRELATION_RULES = () => `/customer/aiops/correlation_rules/correlation_timeline/`;

export const GET_AIOPS_ANALYTICS_SUMMARY = () => `/customer/aiops/conditions/analytics_summary/`;

export const AIOPS_TRENDS_BY_TIMELINE = () => `/customer/aiops/events/trends_graph/`;

export const GET_TAGGED_DEVICES = () => `customer/tags/devices/`;

export const GET_DATASET_ITEMS = () => `/rest/zabbix/host_items/`;

// export const GET_ALL_CUSTOM_DASHBOARD_WIDGET = () => `customer/zabbix/graph_widget/`;
export const GET_ALL_CUSTOM_DASHBOARD_WIDGET = () => `customer/custom_widget/widget/`;

export const SYNC_ALL_CUSTOM_DASHBOARD_WIDGET = () => `customer/custom_widget/widget/sync_widget_data/`;

export const GET_CUSTOM_DASHBOARD_WIDGET_BY_ID = (id: number) => `customer/zabbix/graph_widget/${id}/`;

export const CREATE_CUSTOM_DASHBOARD_WIDGET = () => `customer/zabbix/graph_widget/`;

export const UPDATE_CUSTOM_DASHBOARD_WIDGET = (id: number) => `customer/zabbix/graph_widget/${id}/`;

export const CUSTOM_DASHBOARD_ALERTS_COUNT = (id: number) => `/customer/zabbix/graph_widget/${id}/get_alerts_count/`;

export const CUSTOM_DASHBOARD_DEVICE_STATUS = (id: number) => `/customer/zabbix/graph_widget/${id}/get_device_status/`;

export const CUSTOM_DASHBOARD_USAGE_DETAILS = (id: number) => `/customer/zabbix/graph_widget/${id}/details/`;

export const UPLOAD_OVF_VMDK_FILE = (pcId: string, cloudName: string) => `customer/managed/${cloudName}/accounts/${pcId}/upload_ovf_template/`;

export const DEPLOY_OVF_TEMPLATE = (pcId: string, cloudName: string) => `customer/managed/${cloudName}/accounts/${pcId}/deploy_ovf_template/`;

export const DEPLOY_OVA_TEMPLATE = (pcId: string, cloudName: string) => `customer/managed/${cloudName}/accounts/${pcId}/deploy_ova_template/`;

export const VMWARE_VCENTER_RENAME = (uuid: string) => `/rest/vmware/migrate/${uuid}/rename/`;

export const AZURE_SYNC_DISCOVERED_VMS = () => `customer/managed/azure/accounts/discover_azure_resource_vms/`;

export const GET_AWSCO2_ACCOUNT_LIST = () => `customer/sustainability/awsco2uploadedfile/get_awsco2_account_list/`;

export const UPLOAD_IMPORT_AWS_DATA_FILE = () => `customer/sustainability/awsco2uploadedfile/`;

export const AWS_CO2_DATA = () => `/customer/sustainability/awsco2uploadedfilelist/`;

export const AWS_CO2_ACCOUNT_INFO = () => `/customer/sustainability/awsco2uploadedfile/get_awsco2_account_list/`;

export const AWS_CO2_BY_SERVICE = () => `/customer/sustainability/awsemission/get_co2_record_for_services/`;

export const AWS_CO2_BY_GEOGRAPHIES = () => `/customer/sustainability/awsemission/get_co2_record_for_geographies/`;

export const AWS_CO2_BY_ACCOUNT_ID = () => `/customer/sustainability/awsemission/get_co2_record_for_account_id/`;

export const AWS_CO2_BY_SUMMARY = () => `/customer/sustainability/awsemission/get_co2_record_for_list_accounts/`;

export const AWS_CO2_BY_QUARTER = () => `/customer/sustainability/awsemission/get_co2_record_for_quarterly/`;

export const AWS_CO2_BY_MONTH = () => `/customer/sustainability/awsemission/get_co2_record_for_monthly/`;

export const AWS_CO2_BY_YEAR = () => `/customer/sustainability/awsemission/get_co2_record_for_yearly/`;

export const AWS_CO2_BY_ACCOUNT = () => `/customer/sustainability/awsemission/get_co2_record_for_accounts/`;

export const ZABBIX_GRAPH_PORT_GRAPH = (portId: string) => `/customer/zabbix/mapped_ports/${portId}/get_port_graph/`;

export const DEVICE_UPTIME_BY_DEVICE_ID = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/uptime/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${uuid}/uptime/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${uuid}/uptime/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${uuid}/uptime/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/uptime/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${uuid}/uptime/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/uptime/`;
        case DeviceMapping.PDU: return `customer/pdus/${uuid}/uptime/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${uuid}/uptime/`
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `customer/openstack/${uuid}/uptime/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/${uuid}/uptime/`;
        case DeviceMapping.ESXI: return `customer/esxi_vms/${uuid}/uptime/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `customer/virtual_machines/${uuid}/uptime/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ORCHESTRATION_TASK_PARAM_BY_ID = (uuid: string) => `orchestration/tasks/${uuid}/get_parameters/`;

export const ORCHESTRATION_EXECUTE_TASK = (uuid: string) => `orchestration/tasks/${uuid}/execute/`;

export const ORCHESTRATION_GET_TASK = () => 'rest/orchestration/tasks/';

export const ORCHESTRATION_GET_TASK_BY_ID = (uuid: string) => `orchestration/tasks/${uuid}/`;

export const ORCHESTRATION_GET_META_DATA = () => `orchestration/tasks/get_metadata/`;

export const ORCHESTRATION_ADD_TASK = () => 'rest/orchestration/tasks/';

export const ORCHESTRATION_CATEGORY = (uuid?: string) => uuid ? `orchestration/category/${uuid}/` : 'orchestration/category/';

export const ORCHESTRATION_GET_REPOS = () => 'orchestration/repo/';

export const ORCHESTRATION_GET_PLAYBOOKS = (uuid: string) => `orchestration/playbook/${uuid}/get_repo_playbook/`;

export const ORCHESTRATION_EDIT_TASK = (uuid: string) => `orchestration/tasks/${uuid}/`;

export const ORCHESTRATION_CLONE_TASK = (uuid: string) => `orchestration/tasks/${uuid}/clone/`;

export const ORCHESTRATION_STATUS_TOGGLE = (uuid: string) => `orchestration/tasks/${uuid}/toggle/`;

export const ORCHESTRATION_LIST_SUMMARY = () => `orchestration/tasks/list_summary/`;

export const ORCHESTRATION_EDIT_INSTANCE = (uuid: string) => `orchestration/repo/${uuid}/`;

export const ORCHESTRATION_DELETE_TASK = (uuid: string) => `orchestration/tasks/${uuid}/`;

export const ORCHESTRATION_VIEW_HISTORY = (uuid: string) => `orchestration/tasks/${uuid}/get_execution_history/`;

export const ORCHESTRATION_ADD_INSTANCE = () => 'orchestration/repo/';

export const ORCHESTRATION_VIEW_DETAILS = (repoId: string) => `orchestration/repo/${repoId}/`;

export const ORCHESTRATION_ADD_PLAYBOOK = () => 'orchestration/playbook/';

export const ORCHESTRATION_EDIT_PLAYBOOK = (uuid: string) => `orchestration/playbook/${uuid}/`;

export const ORCHESTRATION_DELETE_PLAYBOOK = (uuid: string) => `orchestration/playbook/${uuid}/`;

export const ORCHESTRATION_EXECUTION_LIST_SUMMARY = () => `orchestration/workflow/execution/list_summary/`;

export const ORCHESTRATION_EXECUTION_FULL_LIST = () => `orchestration/workflow/execution/full_list/`;

export const ORCHESTRATION_EXECUTION_TASKS = (uuid: string) => `/orchestration/execute/${uuid}/`;

export const ORCHESTRATION_EXECUTION_TASK_LOGS = (uuid: string) => `/orchestration/execute/${uuid}/execution_log/`;

export const ORCHESTRATION_EXECUTION_TASK_OUTPUT = (uuid: string) => `/orchestration/execute/${uuid}/output/`;

export const ORCHESTRATION_EXECUTION_WORKFLOWS = (workflowId: string) => `orchestration/workflow/execution/${workflowId}/`;

export const ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOWS = (workflowId: string) => `rest/orchestration/agentic_workflow_executions/${workflowId}/`;

export const ORCHESTRATION_EXECUTION_WORKFLOW_LOGS = (workflowId: string) => `orchestration/workflow/execution/${workflowId}/execution_log/`;

export const ORCHESTRATION_AGENTIC_EXECUTION_WORKFLOW_LOGS = (workflowId: string) => `rest/orchestration/agentic_workflow_executions/${workflowId}/execution_log/`;

export const ORCHESTRATION_EXECUTION_WORKFLOW_OUTPUT = (workflowId: string) => `orchestration/workflow/execution/${workflowId}/output/`;

export const ORCHESTRATION_EXECUTION_AGENTIC_WORKFLOW_OUTPUT = (workflowId: string) => `rest/orchestration/agentic_workflow_executions/${workflowId}/output/`;

export const ORCHESTRATION_INPUT_TEMPLATE = () => `orchestration/input_template/`;

export const ORCHESTRATION_INPUT_TEMPLATE_DELETE = (uuid: string) => `orchestration/input_template/${uuid}/`;

export const ORCHESTRATION_INPUT_TEMPLATE_STATUS_TOGGLE = (uuid: string) => `orchestration/input_template/${uuid}/toggle/`;

export const ORCHESTRATION_INPUT_TEMPLATE_CLONE = (uuid: string) => `orchestration/input_template/${uuid}/clone/`;

export const SERVICE_CATALOG = (catalogId?: string) => catalogId ? `/service_catalog/catalogs/${catalogId}/` : `/service_catalog/catalogs/`;

export const SERVICE_CATALOG_METADATA = () => `/service_catalog/catalogs/get_metadata/`;

export const SERVICE_CATALOG_ORDER_GET_VARIABLES = (uuid: string) => `/service_catalog/catalogs/${uuid}/get_variable/`;

export const SERVICE_CATALOG_ORDER_ACCOUNTS = (accountId: string) => `/orchestration/input_template/${accountId}/options/`;

export const SERVICE_CATALOG_ORDER_TEMPLATES = (templateId: string) => `/orchestration/input_template/${templateId}/options/`;

export const SERVICE_CATALOG_ORDERS = (catalogId: string) => catalogId ? `/service_catalog/orders/${catalogId}/` : `/service_catalog/orders/`;

export const IMAGE_MAPPING = (uuid?: string) => uuid ? `orchestration/vmimage/${uuid}/` : `orchestration/vmimage/`;

export const UNITY_ORG_SETTINGS = () => `/customer/organization_settings/?page_size=0`;

export const UNITY_ORG_SETTINGS_DETAILS = (uuid: string) => `/customer/organization_settings/${uuid}/`;

export const REPORT_SCHEDULE_COUNT = () => `customer/reporting/reports/report_counts/`;

export const GET_REPORT_BY_ID = (uuid: string) => `customer/reporting/reports/${uuid}/`;

export const MANAGE_CREATE_REPORT = () => `customer/reporting/reports/`;

export const GET_REPORT_FIELDS_BY_TYPE = () => `customer/reporting/reports/reporting_fields/`;

// export const CREATE_SCHEDULES_FOR_REPORTS = (uuid: string) => `customer/reporting/reports/${uuid}/`;

export const CREATE_SCHEDULES_FOR_REPORTS = () => `/customer/reporting/schedulers/`;

export const UPDATE_SCHEDULES_FOR_REPORTS = (uuid: string) => `/customer/reporting/schedulers/${uuid}/`;


export const DELETE_REPORTS = (uuid: string) => `customer/reporting/reports/${uuid}`;

export const ALL_REPORTS_BY_FEATURE = (feature: string) => `/customer/reporting/reports/?feature=${feature}`;

export const UPDATE_REPORT_BY_ID = (uuid: string) => `customer/reporting/reports/${uuid}/`;

export const MULTIPLE_REPORT_SCHEDULE_DELETE = () => `customer/reporting/reports/multi_delete/`;

export const TOGGLE_REPORT = (uuid: string) => `/customer/reporting/reports/${uuid}/toggle/`;

export const DOWNLOAD_REPORT = (uuid: string) => `/customer/reporting/multireport/${uuid}/download/`;

export const GET_REPORT_PREVIEW_COLUMNS = (uuid: string) => `/customer/reporting/multireport/${uuid}/column_fields/`;

export const MANAGE_REPORT_PREVIEW = (uuid: string) => `/customer/reporting/multireport/${uuid}/get_report/`;

export const GET_REPORT_SCHDULES_BY_ID = (uuid: string) => `customer/reporting/schedulers/${uuid}/`;

export const CREATE_REPORT_SCHDULES = () => `customer/reporting/schedulers/`;

export const ALL_SCHDULES_BY_FEATURE = (feature: string) => `customer/reporting/schedulers/?feature=${feature}`;

export const UPDATE_REPORT_SCHDULES = (uuid: string) => `customer/reporting/schedulers/${uuid}/`;

export const DELETE_SCHEDULE = (uuid: string) => `customer/reporting/schedulers/${uuid}/delete_schedule/`;

export const MULTIPLE_DELETE_SCHEDULE = () => `customer/reporting/schedulers/multi_delete`;

export const DATACENTER_GET_COST_PLANNER = () => `/customer/cost_planner/`;

export const GET_DATACENTER_LIST = () => `/customer/colo_cloud/`;

export const DATACENTER_ADD_COST_PLANNER = () => `/customer/cost_planner/`;

export const DATACENTER_DELETE_COST_PLANNER = (uuid: string) => `/customer/cost_planner/${uuid}/`;

export const GET_COST_PLANNER = (uuid: string) => `/customer/cost_planner/${uuid}/`;

export const EDIT_COST_PLANNER = (uuid: string) => `/customer/cost_planner/${uuid}/`;

export const DATACENTER_GET_SUMMARY = (timestamp: string) => `/customer/colo_cost_summery/?date=${timestamp}`;

export const DATACENTER_WIDGETS_GET_SUMMARY = (timestamp: string) => `/customer/colo_cost_summery/total_summery/?date=${timestamp}`;

export const GET_SCHEDULE_BY_ID = (uuid: string) => `/customer/reporting/schedulers/${uuid}`;
export const GET_ONTAP_CLUSTER = (uuid: string) => `customer/netapp_cluster/${uuid}/`;

export const GET_UUID_FOR_ITSM = () => `/customer/ticket_accounts/?page_size=0`;

export const GET_GCP_ACCOUNT_LIST = () => `/customer/cloud_accounts/?cloud=GCP`;

export const SAVE_ONTAP_CLUSTER = () => `customer/netapp_cluster/`;

export const TENANT_TEMPLATES = () => `/customer/mtp/tenant-templates/?page_size=0`;

export const ADD_NAGIOS_INSTANCE = () => `/customer/aiops/event-ingestion-instance/`;

export const GET_NAGIOS_INSTANCE = () => `/customer/aiops/event-ingestion-instance/`;

export const EDIT_NAGIOS_INSTANCE = (uuid: string) => `/customer/aiops/event-ingestion-instance/${uuid}/`;

export const DELETE_NAGIOS_INSTANCE = (uuid: string) => `/customer/aiops/event-ingestion-instance/${uuid}/`;

export const DOWNLOAD_NAGIOS_INSTANCE = (uuid: string) => `/customer/aiops/event-ingestion-instance/${uuid}/download_script/`;

export const TOGGLE_NAGIOS_INSTANCE = (uuid: string) => `/customer/aiops/event-ingestion-instance/${uuid}/toggle_feature/`;

export const EDIT_ZABBIX_INSTANCE = (uuid: string) => `/customer/aiops/zabbix-media/${uuid}/`;

export const DELETE_ZABBIX_INSTANCE = (uuid: string) => `/customer/aiops/zabbix-media/${uuid}/`;

export const DOWNLOAD_ZABBIX_INSTANCE = (uuid: string) => `/customer/aiops/zabbix-media/${uuid}/download_script/`;

export const TOGGLE_ZABBIX_INSTANCE = (uuid: string) => `/customer/aiops/zabbix-media/${uuid}/toggle/`;

export const ADDING_EVENT_TYPE = () => `customer/aiops/event-types/`;

export const UPDATE_EVENT_TYPE = (uuid: string) => `/customer/aiops/event-types/${uuid}/`;

export const DELETE_EVENT_TYPE = (uuid: string) => `/customer/aiops/event-types/${uuid}/`;

export const GET_EVENT_TYPE = () => `/customer/aiops/event-types/`;

export const TOGGLE_EVENT_TYPE = (uuid: string) => `/customer/aiops/event-types/${uuid}/toggle_feature/`;

export const ADDING_CATEGORY_TYPE = () => `customer/aiops/event-categories/`;

export const UPDATE_CATEGORY_TYPE = (uuid: string) => `customer/aiops/event-categories/${uuid}/`;

export const DELETE_CATEGORY_TYPE = (uuid: string) => `customer/aiops/event-categories/${uuid}/`;

export const GET_CATEGORY_TYPE = () => `customer/aiops/event-categories/`;

export const TOGGLE_CATEGORY_TYPE = (uuid: string) => `customer/aiops/event-categories/${uuid}/toggle_feature/`;

export const FILTER_DATA = (uuid: string) => `customer/aiops/customer-event-source/${uuid}/`;

export const GET_UPDATED_DATA = () => `customer/aiops/customer-event-source/`;

export const ADDING_DEFAULT_EVENT_TYPE = () => `/customer/aiops/default-event-types/`;

export const GET_DEFAULT_EVENT_TYPE = () => `/customer/aiops/default-event-types/`;

export const UPDATE_DEFAULT_EVENT_TYPE = (uuid: string) => `/customer/aiops/default-event-types/${uuid}/`;

export const DELETE_DEFAULT_EVENT_TYPE = (uuid: string) => `/customer/aiops/default-event-types/${uuid}/`;

export const ADDING_DEFAULT_CATEGORY_TYPE = () => `/customer/aiops/default-event-categories/`;

export const GET_DEFAULT_CATEGORY_TYPE = () => `/customer/aiops/default-event-categories/`;

export const UPDATE_DEFAULT_CATEGORY_TYPE = (uuid: string) => `/customer/aiops/default-event-categories/${uuid}/`;

export const DELETE_DEFAULT_CATEGORY_TYPE = (uuid: string) => `/customer/aiops/default-event-categories/${uuid}/`;

export const SERVICE_NOW_LIST = () => `customer/service_now/`;

export const ADD_SERVICE_NOW_ACCOUNT = () => `customer/service_now/`;

export const MANAGE_SERVICE_NOW = (uuid: string) => `customer/service_now/${uuid}/`;

export const CREATE_SCHEDULE = () => `customer/ms/schedules/`;

export const GET_SCHEDULE = (uuid: string) => `/customer/ms/schedules/${uuid}/`;

export const EDIT_SCHEDULE = (uuid: string) => `/customer/ms/schedules/${uuid}/`;

export const GET_MAINTENANCE_INSTANCE = () => `/customer/ms/schedules/`;

export const DELETE_MAINTENANCE_INSTANCE = (uuid: string) => `/customer/ms/schedules/${uuid}`;

export const GET_DATACENTER_FAST = () => `customer/colo_cloud_fast/`;

export const GET_TEANT_USER_GROUPS = () => `customer/mtp/mtp_group_roles/`;

export const GET_USERS = () => `customer/organizationusers/`;

export const GET_NETWORK_SUMMARY = () => `customer/network_summary/`;

export const GET_ALERT_DETAILS = () => `customer/event_detail_summary/`;

export const GET_ALERT_LIST = () => `customer/alert_detail_list/`;

export const GET_NETWORK_SUMMARY_STATUS_BY_GROUP = () => `customer/network_device_group/`;

export const GET_NETWORK_INTERFACE_SUMMARY = () => `customer/interface_summary/`;

export const GET_NETWORK_SUMMARY_INTERFACE_DETAILS = () => `customer/interface_details/`;

export const GET_NETWORK_SUMMARY_CPU_MEMORY_UTILIZATION = () => `customer/cpu_memory_usage/`;

export const ORCHESTRATION_DELETE_INSTANCE = (uuid: string) => `orchestration/repo/${uuid}`
export const GET_INFRASTRUCTURE_SUMMARY = () => `customer/infra_datacenter_summary/`;

export const GET_INFRASTRUCTURE_TOTAL_DEVICES_SUMMARY = () => `customer/total_devices_summary/`;

export const GET_INFRASTRUCTURE_PRIVATE_CLOUD_SUMMARY = () => `customer/privatecloud_summary/`;

export const GET_INFRASTRUCTURE_PUBLIC_CLOUD_SUMMARY = () => `customer/public_cloud_summary/`;

export const GET_ALERTS_SUMMARY = () => `customer/infra_alert_detail_list/`;

export const GET_DC_CLOUD_COST_SUMMARY = () => `customer/datacenter_public_cloud_cost/`;

export const GET_UTILIZATION_SUMMARY = () => `customer/infra_cpu_memory_usage/`;

export const GET_INFRASTRUCTURE_DC_TWELVE_MONTHS = () => `customer/dc_twelve_months_cost/`;

export const GET_INFRASTRUCTURE_PC_TWELVE_MONTHS = () => `customer/cloud_twelve_months_cost/`;

export const GET_INFRASTRUCTURE_ALERT_TREND_SUMMARY = () => `customer/alerts_trend/`;

export const GET_INFRASTRUCTURE_DEVICE_GROUP_SUMMARY = () => `/customer/infra_network_device_group/`;

export const GET_DYNAMIC_CRM_TICKET_STATES = (instanceId: string) => `/customer/dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statecode`;

export const GET_DYNAMIC_CRM_TICKET_TYPES = (instanceId: string) => `/customer/dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=casetype`;

export const GET_DYNAMIC_CRM_TICKET_PRIORITIES = (instanceId: string) => `/customer/dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=prioritycode`;

export const GET_DYNAMIC_CRM_TICKET_RESOLUTION_TYPES = (instanceId: string, resolvedStateVal: number) => `/customer/dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statuscode&resolve=true&state=${resolvedStateVal}`;

export const GET_DYNAMIC_CRM_TICKET_STATUS = (instanceId: string, cancelledStateVal: number) => `/customer/dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statuscode&cancel=true&state=${cancelledStateVal}`;

export const GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATES = () => `/customer/dynamics_crm/feedback/unity_crm_account_attributes/?attribute=statecode`;

export const GET_DYNAMIC_CRM_FEEDBACK_TICKET_TYPES = () => `/customer/dynamics_crm/feedback/unity_crm_account_attributes/?attribute=casetypecode`;

export const GET_DYNAMIC_CRM_FEEDBACK_TICKET_PRIORITIES = () => `/customer/dynamics_crm/feedback/unity_crm_account_attributes/?attribute=prioritycode`;

export const GET_DYNAMIC_CRM_FEEDBACK_TICKET_RESOLUTION_TYPES = (resolvedStateVal: number) => `/customer/dynamics_crm/feedback/unity_crm_account_attributes/?attribute=statuscode&resolve=true&state=${resolvedStateVal}`;

export const GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATUS = (cancelledStateVal: number) => `/customer/dynamics_crm/feedback/unity_crm_account_attributes/?attribute=statuscode&cancel=true&state=${cancelledStateVal}`;

export const SYNC_DYNAMIC_CRM_TICKET_ATTRIBUTES = (instanceId: string) => `/customer/dynamics_crm/instances/${instanceId}/sync_attributes/`;

export const SYNC_ALL_VMS = () => `customer/virtual_machines/get_vm/`;

export const DEVICES_LIST_BY_DEVICE_TYPE = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/`
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/`;
        case DeviceMapping.SWITCHES: return `customer/switches/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/`;
        case DeviceMapping.PDU: return `customer/pdus/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/`;
        case DeviceMapping.DB_SERVER: return `customer/database_servers/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/`;
        case DeviceMapping.PROXMOX: return `customer/proxmox/vms/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/`;
        case DeviceMapping.NUTANIX_VIRTUAL_MACHINE: return `customer/nutanix-devices/virtual_machines/`
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const ADD_TARGET_DEVICE_FOR_INTERFACE_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/interfaces_map/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/interfaces_map/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/interfaces_map/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/interfaces_map/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/interfaces_map/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/interfaces_map/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/interfaces_map/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/interfaces_map/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/interfaces_map/`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/interfaces_map/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/interfaces_map/`;
        case DeviceMapping.SDWAN_DEVICES: return `customer/sdwan/devices/${deviceId}/interfaces_map/`;
        case DeviceMapping.VIPTELA_DEVICE: return `customer/viptela/devices/${deviceId}/interfaces_map/`;
        case DeviceMapping.MERAKI_DEVICE: return `customer/meraki/devices/${deviceId}/interfaces_map/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/serial_number/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/serial_number/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/serial_number/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/serial_number/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/serial_number/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/serial_number/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/serial_number/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/serial_number/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/serial_number/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/serial_number/`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/serial_number/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/serial_number/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_INTERFACE_DETAILS_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string, interfaceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.ESXI: return `/rest/vmware/esxi_vms/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/interface_details/?interface_id=${interfaceId}`;
        default: console.error('Invalid device type : ', deviceType);
    }
};

export const GET_CONFIGURED_DEVICES = () => `/customer/fast/monitored_devices`;

export const UPDATE_VM_DETAILS_BY_DEVICE_TYPE = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `/rest/vmware/migrate/${deviceId}/update_vm_details/`;
        case DeviceMapping.HYPER_V: return `/customer/hyperv/vms/${deviceId}/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_AZURE_USERS = (accountId: string) => `/customer/managed/azure/accounts/${accountId}/azure_users/`;

export const IMPORT_USERS_FROM_AZURE = (accountId: string) => `/customer/managed/azure/accounts/${accountId}/import_azure_users/`;

export const GET_USER_GROUPS_LIST = () => `/customer/rbac/user_groups/`;

export const ADD_USER_GROUP = () => `/customer/rbac/user_groups/`;

export const EDIT_USER_GROUP = (userGroupId: string) => `/customer/rbac/user_groups/${userGroupId}/`;

export const GET_USER_GROUP_DETAIL = (userGroupId: string) => `/customer/rbac/user_groups/${userGroupId}/`;

export const TOGGLE_USER_GROUP_STATUS = (userGroupId: string) => `/customer/rbac/user_groups/${userGroupId}/toggle_status/`;

export const DELETE_USER_GROUP = (userGroupId: string) => `/customer/rbac/user_groups/${userGroupId}/`;

export const GET_ROLES_LIST = () => `/customer/rbac/roles/`;

export const ADD_ROLE = () => `/customer/rbac/roles/`;

export const EDIT_ROLE = (roleId: string) => `/customer/rbac/roles/${roleId}/`;

export const GET_ROLE_DETAIL = (roleId: string) => `/customer/rbac/roles/${roleId}/`;

export const TOGGLE_ROLE_STATUS = (roleId: string) => `/customer/rbac/roles/${roleId}/toggle_status/`;

export const DELETE_ROLE = (roleId: string) => `/customer/rbac/roles/${roleId}/`;

export const GET_PERMISSION_SETS_LIST = () => `/customer/rbac/permission_sets/`;

export const ADD_PERMISSION_SET = () => `/customer/rbac/permission_sets/`;

export const EDIT_PERMISSION_SET = (permissionSetId: string) => `/customer/rbac/permission_sets/${permissionSetId}/`;

export const GET_PERMISSION_SET_DETAIL = (permissionSetId: string) => `/customer/rbac/permission_sets/${permissionSetId}/`;

export const TOGGLE_PERMISSION_SET_STATUS = (permissionSetId: string) => `/customer/rbac/permission_sets/${permissionSetId}/toggle_status/`;

export const DELETE_PERMISSION_SET = (permissionSetId: string) => `/customer/rbac/permission_sets/${permissionSetId}/`;

export const GET_MODULES_AND_PERMISSIONS = () => `/customer/rbac/permissions/permission_modules/`;

export const GET_ENTITY_GROUP_LIST = () => `/customer/rbac/entity_groups/`;

export const GET_ENTITY_GROUP_LIST_FAST = () => `/customer/rbac/entity_groups_fast/`;

export const ADD_ENTITY_GROUP_LIST = () => `/customer/rbac/entity_groups/`;

export const EDIT_ENTITY_GROUP_LIST = (groupUUID: string) => `/customer/rbac/entity_groups/${groupUUID}/`;

export const TOGGLE_ENTITY_GROUP_STATUS = (groupUUID: string) => `/customer/rbac/entity_groups/${groupUUID}/toggle_status`;

export const DELETE_ENTITY_GROUP_LIST = (groupUUID: string) => `/customer/rbac/entity_groups/${groupUUID}/`;

export const GET_ENTITY_TYPES_LIST = () => `/customer/rbac/rbac_models/`;

export const GET_ENTITY_RESOURCES_LIST = () => `/customer/model_objects/`;

export const MANAGE_CUSTOM_ATTRIBUTES = (attrId?: string) => {
    if (attrId) {
        return `/customer/custom_attributes/${attrId}/`;
    } else {
        return `/customer/custom_attributes/`;
    }
}

export const CUSTOM_ATTRIBUTES_BY_DEVICE_TYPE = (deviceType: string) => `/customer/custom_attributes/?resource_type=${deviceType}`;

export const CUSTOM_ATTRIBUTES_FAST_BY_DEVICE_TYPE = (deviceType: string) => `/customer/fast/custom_attributes/?resource_type=${deviceType}&page_size=0`;

export const COLLECTOR_LIST_FOR_MANUAL_ONBOARDING = () => `/customer/agent/config/?page_size=0`;

//Devices API endpoints for bulk delete
export const BULK_DELETE_FOR_SWITCHES = () => `/customer/switches/bulk_delete/`;
export const BULK_DELETE_FOR_FIREWALLS = () => `/customer/firewalls/bulk_delete/`;
export const BULK_DELETE_FOR_LOAD_BALANCER = () => `/customer/load_balancers/bulk_delete/`;
export const BULK_DELETE_FOR_BMSEVERS = () => `/customer/bm_servers/bulk_delete/`;
export const BULK_DELETE_FOR_MAC_DEVICES = () => `/customer/macdevices/bulk_delete/`;
export const BULK_DELETE_FOR_STORAGE_DEVICES = () => `/customer/storagedevices/bulk_delete/`;

export const ZABBIX_DEVICE_EVENTS_BY_DEVICE_TYPE_AND_DEVICE_ID = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `/customer/switches/${deviceId}/monitoring/events/`;
        case DeviceMapping.FIREWALL: return `customer/firewalls/${deviceId}/monitoring/events/`;
        case DeviceMapping.LOAD_BALANCER: return `customer/load_balancers/${deviceId}/monitoring/events/`;
        case DeviceMapping.HYPERVISOR: return `customer/servers/${deviceId}/monitoring/events/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${deviceId}/monitoring/events/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${deviceId}/monitoring/events/`;
        case DeviceMapping.PDU: return `customer/pdus/${deviceId}/monitoring/events/`;
        case DeviceMapping.OTHER_DEVICES: return `customer/customdevices/${deviceId}/monitoring/events/`;
        case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return `rest/vmware/migrate/${deviceId}/monitoring/events/`;
        case DeviceMapping.VCLOUD: return `customer/vclouds/virtual_machines/${deviceId}/monitoring/events/`;
        case DeviceMapping.HYPER_V: return `customer/hyperv/vms/${deviceId}/monitoring/events/`;
        case DeviceMapping.ESXI: return `rest/vmware/esxi_vms/${deviceId}/monitoring/events/`;
        case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return `rest/openstack/migration/${deviceId}/monitoring/events/`;
        case DeviceMapping.MAC_MINI: return `customer/macdevices/${deviceId}/monitoring/events/`;
        case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return `rest/customer/virtual_machines/${deviceId}/monitoring/events/`;
        case DeviceMapping.AZURE_ACCOUNTS: return `customer/managed/azure/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.GCP_ACCOUNTS: return `customer/managed/gcp/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.AZURE_VIRTUAL_MACHINE: return `customer/managed/azure/resources/${deviceId}/monitoring/events/`;
        case DeviceMapping.GCP_VIRTUAL_MACHINE: return `customer/managed/gcp/resources/${deviceId}/monitoring/events/`;
        case DeviceMapping.AWS_ACCOUNTS: return `customer/managed/aws/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.AWS_VIRTUAL_MACHINE: return `/customer/managed/aws/virtualmachine/${deviceId}/monitoring/events/`;
        case DeviceMapping.AWS_RESOURCES: return `/customer/managed/aws/resources/${deviceId}/monitoring/events/`;
        case DeviceMapping.NUTANIX_ACCOUNT: return `customer/nutanix/${deviceId}/monitoring/events/`;
        case DeviceMapping.CONTAINER_CONTROLLER: return `customer/docker/account/${deviceId}/monitoring/events/`;
        case DeviceMapping.DOCKER_CONTAINER: return `customer/docker/containers/${deviceId}/monitoring/events/`;
        case DeviceMapping.AZURE_SERVICES: return `customer/managed/azure/resources/${deviceId}/monitoring/events/`;
        case DeviceMapping.SDWAN_ACCOUNTS: return `customer/sdwan/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.SDWAN_DEVICES: return `customer/sdwan/devices/${deviceId}/monitoring/events/`;
        case DeviceMapping.VMWARE_ACCOUNT: return `customer/integration/vcenter/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.DB_SERVER: return `/customer/database_servers/${deviceId}/monitoring/events/`
        case DeviceMapping.VIPTELA_ACCOUNT: return `customer/viptela/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.VIPTELA_DEVICE: return `customer/viptela/devices/${deviceId}/monitoring/events/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `customer/meraki/accounts/${deviceId}/monitoring/events/`;
        case DeviceMapping.MERAKI_DEVICE: return `customer/meraki/devices/${deviceId}/monitoring/events/`;
        case DeviceMapping.MERAKI_ORG: return `/customer/meraki/organizations/${deviceId}/monitoring/events/`;
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/monitoring/events/`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/monitoring/events/`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/monitoring/events/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const GET_NETWORK_CONTROLLERS = () => `/customer/network_controllers/`;

export const UPDATE_NETWORK_CONTROLLER_TAGS = (deviceType: DeviceMapping, deviceId: string,) => {
    switch (deviceType) {
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/associate_tag/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/associate_tag/`;
        default: console.error('Invalid type ', deviceType);
            break;
    }
};

export const MANAGE_NETWORK_CONTROLLER = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.VIPTELA_ACCOUNT: return `/customer/viptela/accounts/${deviceId}/`;
        case DeviceMapping.MERAKI_ACCOUNT: return `/customer/meraki/accounts/${deviceId}/`;
        default: console.error('Invalid type ', deviceType);
            break;
    }
};

export const UPDATE_IOT_DEVICE_TAGS = (deviceType: DeviceMapping, deviceId: string) => {
    switch (deviceType) {
        case DeviceMapping.SENSOR: return `/customer/sensors/${deviceId}/associate_tag/`;
        case DeviceMapping.SMART_PDU: return `/customer/smart_pdus/${deviceId}/associate_tag/`;
        case DeviceMapping.RFID_READER: return `/customer/rfid_readers/${deviceId}/associate_tag/`;
        default: console.error('Invalid type ', deviceType);
            break;
    }
};

export const GET_IOT_DEVICE_Models = (deviceType: DeviceMapping) => {
    switch (deviceType) {
        case DeviceMapping.SENSOR: return `rest/sensormodels/?page_size=0`;
        case DeviceMapping.SMART_PDU: return `rest/smartpdumodels/?page_size=0`;
        case DeviceMapping.RFID_READER: return `rest/rfidreadermodels/?page_size=0`;
        default: console.error('Invalid type ', deviceType);
            break;
    }
};

export const SYNC_REDFISH_SYSTEM = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_system/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_system/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_system/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_HEALTH_SERVERS = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/server_health/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/server_health/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/server_health/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_SERVER_INFO = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_system/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_system/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_system/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SERVER_INFO = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/server_info/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/server_info/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/server_info/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_FAN_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_fans/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_fans/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_fans/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_FAN_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/fans/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/fans/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/fans/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_POWER_STATS = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_power_supplies/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_power_supplies/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_power_supplies/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_POWER_STATS = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/power_supplies/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/power_supplies/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/power_supplies/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_CPU_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_processors/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_processors/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_processors/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_CPU_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/processors/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/processors/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/processors/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_MEMORY_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_memories/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_memories/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_memories/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_MEMORY_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/memories/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/memories/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/memories/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_TEMPERATURE_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_temperatures/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_temperatures/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_temperatures/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_TEMPERATURE_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/temperatures/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/temperatures/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/temperatures/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_PHYSICAL_DISKS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_physical_disks/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_physical_disks/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_physical_disks/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_PHYSICAL_DISKS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/physical_disks/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/physical_disks/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/physical_disks/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_VIRTUAL_DISKS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_virtual_disks/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_virtual_disks/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_virtual_disks/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}


export const DEVICE_OVERVIEW_BY_VIRTUAL_DISKS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/virtual_disks/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/virtual_disks/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/virtual_disks/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_CHASSIS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_chassis/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_chassis/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_chassis/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_CHASSIS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/chassis/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/chassis/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/chassis/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_VOLTAGE_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_voltages/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_voltages/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_voltages/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_VOLTAGE_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/voltages/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/voltages/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/voltages/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_PROCESSORS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/processors/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/processors/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/processors/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_MANAGERS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_managers/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_managers/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_managers/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_MANAGERS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/managers/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/managers/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/managers/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_ENCLOSURES_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_enclosures/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_enclosures/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_enclosures/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_ENCLOSURES_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/enclosures/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/enclosures/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/enclosures/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_STORAGE_CONTROLLERS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_storage_controllers/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_storage_controllers/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_storage_controllers/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_STORAGE_CONTROLLERS_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/storage_controllers/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/storage_controllers/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/storage_controllers/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_SYNC_BATTERIES_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/sync_redfish_batteries/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/sync_redfish_batteries/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/sync_redfish_batteries/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}

export const DEVICE_OVERVIEW_BY_BATTERIES_DATA = (deviceType: DeviceMapping, uuid: string) => {
    switch (deviceType) {
        case DeviceMapping.SWITCHES: return `customer/switches/${uuid}/batteries/`;
        case DeviceMapping.BARE_METAL_SERVER: return `customer/bm_servers/${uuid}/batteries/`;
        case DeviceMapping.STORAGE_DEVICES: return `customer/storagedevices/${uuid}/batteries/`;
        default: console.error('Invalid device type : ', deviceType);
    }
}
