export const TICKET_SUBJECT = (deviceType: string, deviceName: string) => `Manage Ticket for ${deviceType} - ${deviceName}`;

export const DEVICE_WEB_ACCESS_SUBJECT = (deviceType: string, deviceName: string) => `Request Web Access for ${deviceType} - ${deviceName}`;

export const SERVICE_CATELOGUE_TICKET_SUBJECT = (serviceType: string) => `Manage Ticket for Service Catalog - ${serviceType}`;

export const DATABASE_GRAPH_TICKET_SUBJECT = (graphName: string) => `Manage Ticket for Graph ${graphName}`;

export const HYPERVISOR_TICKET_METADATA =
    (deviceType: string, deviceName: string, virtualizationType: string, os: string, managementIP: string) =>
        `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nVirtualization Type: ${virtualizationType}\nOperating System: ${os}\nManagement IP: ${managementIP}`;

export const BM_SERVER_TICKET_METADATA = (deviceType: string, deviceName: string, powerStatus: string, os: string, managementIP: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nDevice Status: ${powerStatus}\nOperating System: ${os}\nManagement IP: ${managementIP}`;

export const VM_WARE_TICKET_METADATA = (deviceType: string, deviceName: string, powerStatus: string, os: string, managementIP: string, hostName: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nDevice Status: ${powerStatus}\nOperating System: ${os}\nManagement IP: ${managementIP}\nHost Name: ${hostName}`;

export const PROXMOX_TICKET_METADATA = (vmId: string, deviceType: string, deviceName: string, powerStatus: string, os: string, managementIP: string, hostName: string) =>
    `Device Type: ${deviceType}\nVM ID: ${vmId}\nDevice Name: ${deviceName}\nDevice Status: ${powerStatus}\nOperating System: ${os}\nManagement IP: ${managementIP}\nHost Name: ${hostName}`;

export const OPENSTACK_WARE_TICKET_METADATA = (deviceType: string, deviceName: string, powerStatus: string, os: string, managementIP: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nDevice Status: ${powerStatus}\nImage: ${os}\nManagement IP: ${managementIP}`;

export const CUSTOM_TICKET_METADATA = (deviceType: string, deviceName: string, os: string, managementIP: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nOperating System: ${os}\nManagement IP: ${managementIP}`;

export const SWITCH_TICKET_METADATA = (deviceType: string, deviceName: string, deviceStatus: string, model: string, type: string, managementIp: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nDevice Status: ${deviceStatus}\nModel: ${model}\nType : ${type}\nManagement IP: ${managementIp}`;

export const OTHER_DEVICES_TICKET_METADATA = (deviceType: string, deviceName: string, deviceStatus: string, deviceConfigured: boolean, description: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nDevice Status: ${deviceStatus}\nMonitoring Configured: ${deviceConfigured}\nDescription: ${description}`;

export const SUMMARY_TICKET_METADATA = (deviceType: string, deviceName: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}`;

export const AWS_TICKET_METADATA = (deviceType: string, instanceId: string, region: string, instanceType: string, publicIp: string) =>
    `Device Type: ${deviceType}\nInstance ID: ${instanceId}\nInstance Type: ${instanceType}\nRegion: ${region}\nPublic IP: ${publicIp}`;

export const AWS_ACCOUNT_TICKET_METADATA = (userName: string) => `AWS Account ${userName}`;

export const ORACLE_ACCOUNT_TICKET_METADATA = (userName: string) => `Oracle Account ${userName}`;

export const UL_S3_ACCOUNT_TICKET_METADATA = (accountName: string, url: string) => `UL S3 Account: ${accountName}\nEndpoint URL: ${url}`;

export const CLOUD_CONTROLLER_TICKET_METADATA =
    (deviceName: string, virtualizationType: string) =>
        `Device Name: ${deviceName}\nVirtualization Type: ${virtualizationType}`;

export const DEVOPS_CONTROLLER_TICKET_METADATA =
    (deviceName: string, os: string, ipAddress: string, port: string) =>
        `Device Name: ${deviceName}\nOperation System Type: ${os}\nIP Address: ${ipAddress}\nPort: ${port}`;

export const VXC_TICKET_SUBJECT = (VXCType: string) => `UnitedConnect: Request for ${VXCType} connection`;

export const CLOSE_VXC_TICKET_SUBJECT = (VXCType: string) => `UnitedConnect: Request for closing ${VXCType} connection`;

export const CONTAINER_CONTROLLER_TICKET_METADATA = (deviceType: string, deviceName: string, hosturl: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nHost: ${hosturl}`;

export const DOCKER_CONTROLLER_TICKET_METADATA = (deviceType: string, deviceName: string, hosturl: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nHost: ${hosturl}`;

export const TICKET_DESC = (email: string) =>
    `\n \n \n \n \n ##- Please type your description above this line -##\n===============\nUser Email: ${email}\n===============`;
export const TICKET_DESC_BY_VXC_TYPE = (email: string, VXCType: string) =>
    `\n \n \n \n \n ##- Please type your description above this line -##\n===============\nUser Email: ${email}\nConnection Type: ${VXCType}\n===============`;
export const TICKET_DESC_BY_VXC_TYPE_REGION = (email: string, VXCType: string, region: string) =>
    `\n \n \n \n \n ##- Please type your description above this line -##\n===============\nUser Email: ${email}\nConnection Type: ${VXCType}\nRegion: ${region}\n===============`;
export const CLOSE_VXC_TICKET_DESC = (email: string, VXCType: string, ticketId: number) =>
    `\n \n \n \n \n ##- Please type your description above this line -##\n===============\nUser Email: ${email}\nConnection Type: ${VXCType}\nCreation Ticket: ${ticketId}\n===============`;

export const CABINET_TICKET_METADATA = (cabinetName: string, cabinetModel: string, cabinetSize: number, availableRU: string) =>
    `Cabinet Name: ${cabinetName}\nCabinet Model: ${cabinetModel}\nCabinet Size: ${cabinetSize}\nAvailable RU: ${availableRU}`;

export const PDU_TICKET_METADATA = (pduName: string, pduType: string, socketCount: number, pduSize: number) =>
    `PDU Name: ${pduName}\nPDU Type: ${pduType}\nNumber of Sockets: ${socketCount}\nPDU Size: ${pduSize}`;

export const UNITY_CONNECT_VPN_METADATA = (conn_request: ConnectionRequest) => "###- VPN CONNECTIVITY DETAILS -###\n" +
    "===================================\n" +
    '\n ##- Contact Info -##\n' +
    "Requester: " + conn_request.userEmail + "\n" +
    "Email: " + ((conn_request.cust_email == '') ? 'Not Available' : conn_request.cust_email) + "\n" +
    "Contact Number : " + ((conn_request.cust_contact_number == '') ? 'Not Available' : conn_request.cust_contact_number) + "\n" +

    "===================================\n" +
    '\n ##- Firewall Info -##\n' +
    "Manufacturer : " + ((conn_request.manufacturer == '') ? 'Not Available' : conn_request.manufacturer) + "\n" +
    "Model : " + ((conn_request.model == '') ? 'Not Available' : conn_request.model) + "\n" +
    "Version : " + ((conn_request.version == '') ? 'Not Available' : conn_request.version) + "\n" +

    "===================================\n" +
    '\n ##- IP addressing  -##\n' +
    "Peer IP Adresses: " + ((conn_request.peer_ip_addresses == '') ? 'Not Available' : conn_request.peer_ip_addresses) + "\n" +

    "===================================\n" +
    '\n ##- Inside Hosts or Subnets  -##\n' +
    "Hosts or Subnets : " + ((conn_request.subnets == '') ? 'Not Available' : conn_request.subnets) + "\n" +

    "===================================\n" +
    '\n ##- Settings  -##\n' +
    "Authentication Method : " + ((conn_request.auth_method == '') ? 'Not Available' : conn_request.auth_method) + "\n" +
    "DH Group Identifier : " + ((conn_request.dh_group_identifier == '') ? 'Not Available' : conn_request.dh_group_identifier) + "\n" +
    "IKE Encryption Algorithm : " + ((conn_request.ike_encryption_algorithm == '') ? 'Not Available' : conn_request.ike_encryption_algorithm) + "\n" +
    "IKE Security Lifetime : " + ((conn_request.ike_security_lifetime == '') ? 'Not Available' : conn_request.ike_security_lifetime) + "\n" +
    "IKE Hash Algorithm : " + ((conn_request.ike_hash_algorithm == '') ? 'Not Available' : conn_request.ike_hash_algorithm) + "\n" +
    "IPSEC Encryption Algorithm : " + ((conn_request.ipsec_encryption_algorithm == '') ? 'Not Available' : conn_request.ipsec_encryption_algorithm) + "\n" +
    "IPSEC Security Lifetime ( range - 460 secs to 28,800 secs) : " + ((conn_request.ipsec_security_lifetime == '') ? 'Not Available' : conn_request.ipsec_security_lifetime) + "\n" +
    "IPSEC Hash Algorithm : " + ((conn_request.ipsec_hash_algorithm == '') ? 'Not Available' : conn_request.ipsec_hash_algorithm) + "\n" +
    "IPSEC Security Protocol : " + ((conn_request.ipsec_security_protocol == '') ? 'Not Available' : conn_request.ipsec_security_protocol) + "\n";
"===================================\n";

export const GCP_SNAPSHOT_TICKET_METADATA = (deviceType: string, deviceName: string, sourceVm: string, storageLocation: string, creationTime: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nSource VM: ${sourceVm}\nStorage Location: ${storageLocation}\nCreation Time: ${creationTime}`;

export const GCP_VM_TICKET_METADATA = (deviceType: string, deviceName: string, operatingSystem: string, cpuPlatform: string, machineType: string, status: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nOperating System: ${operatingSystem}\nCPU Platform: ${cpuPlatform}\nMachine Type: ${machineType}\nPower State: ${status}`;

export const GCP_ACCOUNT_TICKET_METADATA = (deviceType: string, deviceName: string, projectId: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${deviceName}\nProject ID: ${projectId}`;
// export const GCP_ACCOUNT_TICKET_METADATA = (userName: string) => `GCP Account ${userName}`;

export const MESH_SERVICE_MANAGER_TICKET_METADATA = (deviceType: string, deviceName: string, type: string) =>
    `Device Type: ${deviceType}\nService MAnager Name: ${deviceName}\nService Type: ${type}`;

export const TDS_TICKET_METADATA = (deviceType: string, deviceName: string, associatedUrlMap: string, regions: string, negCount: string) =>
    `Device Type: ${deviceType}\nTDS Name: ${deviceName}\nAssociated Url Map: ${associatedUrlMap}\nRegions: ${regions}\nNEG count: ${negCount}`;

export const NEG_TICKET_METADATA = (deviceType: string, capacity: string, name: string,
    zone: string, networkEndpointType: string, health: string, maxRps: string) =>
    `Device Type: ${deviceType}\nNEG Name: ${name}\Capacity: ${capacity}\nZone: ${zone}\nType: ${networkEndpointType}\nHealth: ${health}\nMAX RPS: ${maxRps}`;

export const BACKEND_TICKET_METADATA = (deviceType: string, instance: string, ip: string, port: string, health: string) =>
    `Device Type: ${deviceType}\nInstance: ${instance}\nIP: ${ip}\nHeath: ${health}\nPort: ${port}`;

export const APP_MESH_TICKET_METADATA = (deviceType: string, name: string, status: string, virNodes: string, virRouters: string, virServices: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nStatus: ${status}\nVirtual Node Count: ${virNodes}\nVirtual Routers Count: ${virRouters}\nVirtual Service Count: ${virServices}`;

export const APP_MESH_VIRTUAL_SERVICE_TICKET_METADATA = (deviceType: string, serviceName: string, routerStatus: string, routerName: string, meshName: string) =>
    `Device Type: ${deviceType}\nVirtual Service Name: ${serviceName}\nnVirtual Router Status: ${routerStatus}\nVirtual Router Name: ${routerName}\nMesh Name: ${meshName}`;

export const APP_MESH_VIRTUAL_ROUTER_TICKET_METADATA = (deviceType: string, routerName: string, routerStatus: string, nodeCount: string, meshName: string) =>
    `Device Type: ${deviceType}\nVirtual Router Name: ${routerName}\nnVirtual Router Status: ${routerStatus}\nVirtual Node count: ${nodeCount}\nMesh Name: ${meshName}`;


export const ISTIO_VIRTUAL_SERVICE_TICKET_METADATA = (deviceType: string, name: string, gateways: string, destinationHost: string, namespace: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nGateways: ${gateways}\nDestination Host: ${destinationHost}\nNamespace: ${namespace}`;

export const ISTIO_DESTINATION_RULES_TICKET_METADATA = (deviceType: string, name: string, versions: string, host: string, namespace: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nversions: ${versions}\nHost: ${host}\nNamespace: ${namespace}`;

export const ISTIO_SERVICES_TICKET_METADATA = (deviceType: string, name: string, clusterIp: string, namespace: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nCluster IP: ${clusterIp}\nNamespace: ${namespace}`;

export const ISTIO_POD_TICKET_METADATA = (deviceType: string, name: string, podIp: string, namespace: string, hostIp: string, status: string, startTime: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nPod IP: ${podIp}\nNamespace: ${namespace}\nHost IP: ${hostIp}\nStatus: ${status}\nStart Time: ${startTime}`;

export const ISTIO_CONTAINER_TICKET_METADATA = (deviceType: string, name: string, image: string, status: string, cpuRequest: string, memoryRequest: string) =>
    `Device Type: ${deviceType}\nName: ${name}\nImage: ${image}\nStatus: ${status}\nCPU Request: ${cpuRequest}\nMemory request: ${memoryRequest}`;

export const LDAP_CONFIG_TICKET_METADATA = (ldapUrl: string, username: string) =>
    `LDAP Url: ${ldapUrl}\nUsername: ${username}`;

export const SERVICE_CATALOGUE_TICKET_METADATA =
    (serviceCategory: string, provider: string, serviceName: string, term: string) =>
        `Service Category: ${serviceCategory}\nProvider: ${provider}\nService Name: ${serviceName}\nTerm: ${term}`;

export const HYPERV_TICKET_METADATA = (vmId: string, deviceType: string, deviceName: string, powerStatus: string, os: string, managementIP: string, hostName: string) =>
    `Device Type: ${deviceType}\nVM ID: ${vmId}\nDevice Name: ${deviceName}\nDevice Status: ${powerStatus}\nOperating System: ${os}\nManagement IP: ${managementIP}\nHost Name: ${hostName}`;

export const MOBILE_TICKET_METADATA = (device: string, deviceName: string, ipAddress: string, model: string, platform: string, deviceType: string) =>
    `Device: ${device}\nDevice Name: ${deviceName}\nIP Address: ${ipAddress}\nModel: ${model}\nPlatform: ${platform}\nDevice Type: ${deviceType}`;


export const DATACENTER_BILL_TICKET_SUBJECT = (datacenterName: string) => `Manage Ticket for Datacenter Billing - ${datacenterName}`;

export const DATACENTER_BILL_TICKET_METADATA = (datacenterName: string, datacenterLocation: string, bill?: string) => {
    let a: string = `Datacenter Name: ${datacenterName}\nLocation: ${datacenterLocation}`;
    a = bill ? a.concat(`\nBill Amount: ${bill}`) : a;
    return a;
};

export const DATABASE_TICKET_METADATA = (deviceType: string, instanceName: string, status: string, serverName: string, os: string, managementIp: string) =>
    `Device Type: ${deviceType}\nInstance Name: ${instanceName}\nStatus: ${status}\nServer Name: ${serverName}\nOperating System : ${os}\nManagement IP: ${managementIp}`;

export const DATABASE_GRAPH_TICKET_METADATA = (deviceType: string, graphName: string,) => `Device Type: ${deviceType}\nGraph Name: ${graphName}`;

export const OCI_ACCOUNT_TICKET_METADATA = (userId: string) => `OCI Account ${userId}`;

export const OCI_VM_TICKET_METADATA = (vmName: string, powerStatus: string, region: string) =>
    `VM Name: ${vmName}\nPower Status: ${powerStatus}\nRegion: ${region}`;

export const REPORT_SCHEDULER_TICKET_METADATA = (name: string, frequency: string, active: string) =>
    `Name: ${name}\nSchedule: ${frequency}\nActive: ${active}\n`;

export const GREEN_IT_DEVICE_METADATA = (deviceName: string, deviceType: string, datacenter: string, powerConsumed: number, Co2Emitted: number) => {
    `Device Name: ${deviceName}\nDevice Type: ${deviceType}\nDatacenter: ${datacenter}\nPower Consumed: ${powerConsumed}\nCo2 Emitted : ${Co2Emitted}\n\n`;
}

export const ALERT_TICKET_METADATA = (deviceName: string, alert: string) =>
    `Device Name: ${deviceName}\nAlert: ${alert}`;

export const COLLECTOR_TICKET_METADATA = (deviceName: string, ip: string, user: string, port: string) =>
    `Collector Name: ${deviceName}\nIP: ${ip}\nUser: ${user}\nPort: ${port}`;

export const AIOPS_HOST_EVENT_TICKET_SUBJECT = (ticketType: string, hostName: string, eventDescription: string) => `${ticketType} : ${hostName} : ${eventDescription}`;

export const AIOPS_HOST_EVENT_TICKET_METADATA = (deviceType: string, deviceName: string, description: string) =>
    `Device Name: ${deviceName}\nDevice Type: ${deviceType}\nDescription: ${description}`;


export const DATACENTER_COST_SUMMARY_TICKET_METADATA = (dcName: string, location: string, deviceType: string, deviceName: string) =>
    `Datacenter Name: ${dcName}\nLocation : ${location}\nDevice Type: ${deviceType}\nDevice Name: ${deviceName}`;

export const DATACENTER_SUMMARY_TICKET_METADATA = (dcName: string, location: string) =>
    `Datacenter Name: ${dcName}\nLocation : ${location}`;

export const SHELVES_TICKET_METADATA = (deviceName: string, serialNumber: string) =>
    `Device Name: ${deviceName}\nSerial Number: ${serialNumber}`;

export const SNAP_MIRRORS_TICKET_METADATA = (deviceName: string, healthy: string) =>
    `Device Name: ${deviceName}\nHealthy: ${healthy}`;

export const AZURE_ACCOUNT_TICKET_METADATA = (userName: string) => `AZURE Account ${userName}`;

export const AZURE_VM_TICKET_METADATA = (name:string,accountName: string,region: string, operatingSystem: string, IpType: string, osName: string, managementIp: string) =>
    `Name: ${name}\nAccount Name: ${accountName}\nRegion: ${region}\nOS Type: ${operatingSystem}\nIP Type: ${IpType}\nOS Name: ${osName}\nManagement IP: ${managementIp}`;

//For nutanix view devices
export const CLUSTER_TICKET_METADATA = (name: string, deviceType: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}`;

export const HOST_TICKET_METADATA = (name: string, deviceType: string, memoryUsage: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}\nDevice Status: ${memoryUsage}`;

export const DISK_TICKET_METADATA = (name: string, deviceType: string, memoryUsage: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}\nDevice Status: ${memoryUsage}`;

export const STORAGE_CONTAINERS_TICKET_METADATA = (name: string, deviceType: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}`;

export const NUTANIX_VM_TICKET_METADATA = (name: string, deviceType: string,) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}`;

export const VDISK_TICKET_METADATA = (name: string, deviceType: string, status: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}\nDevice Status: ${status}`;

export const STORAGE_POOLS_TICKET_METADATA = (name: string, deviceType: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}`;

export const NUTANIX_TICKET_METADATA = (name: string, deviceType: string) =>
    `Device Type: ${deviceType}\nDevice Name: ${name}`;

export const SDWAN_ACCOUNT_TICKET_METADATA = (userName: string) => `Sdwan Account ${userName}`;

export const VIPTELA_ACCOUNT_TICKET_METADATA = (accountName: string, accountType: string, accountUrl: string, path: string) =>
    `Account Name: ${accountName}\nAccount Type: ${accountType}\nAccount URL: ${accountUrl}\nPath: ${path}`;

export const MERAKI_ACCOUNT_TICKET_METADATA = (accountName: string, accountType: string, accountUrl: string, path: string) =>
    `Account Name: ${accountName}\nAccount Type: ${accountType}\nAccount URL: ${accountUrl}\nPath: ${path}`;
