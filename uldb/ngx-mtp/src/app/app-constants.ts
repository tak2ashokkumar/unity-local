export const FEATURE_NOT_ENABLED_MESSAGE = () => `This feature is not enabled`;

export const VM_CONSOLE_CLIENT = () => `/main#/unityterminal/`;

export const WINDOWS_CONSOLE_CLIENT = (managementIP: string) => `/rdp?ip=${managementIP}&domain=unityone.ai`;

export const WINDOWS_CONSOLE_VIA_AGENT = (rdpURL: string, managementIP: string) => `${rdpURL}?ip=${managementIP}&domain=unityone.ai`;

export const MANAGEMENT_NOT_ENABLED_MESSAGE = () => `This feature is not enabled`;

export const SYNC_KUBERNETES_PODS = (controllerId: string) => `customer/kubernetes/account/${controllerId}/sync_pods`;

export const GET_KUBERNETES_PODS = () => `customer/kubernetes/pods/`;

export const DELETE_KUBERNETES_PODS = (controllerId: string) => `customer/kubernetes/pods/${controllerId}/`;

export const GET_KUBERNETES_CONTAINERS = () => `customer/kubernetes/containers/`;

export const SYNC_KUBERNETES_NODES = (controllerId: string) => `customer/kubernetes/account/${controllerId}/sync_nodes`;

export const GET_KUBERNETES_NODES = () => `customer/kubernetes/nodes/`;

export const SYNC_DOCKER_CONTAINERS = (controllerId: string) => `customer/docker/account/${controllerId}/sync_containers`;

export const GET_DOCKER_CONTAINERS = () => `customer/docker/containers/`;

export const SYNC_DOCKER_NODES = (controllerId: string) => `customer/docker/account/${controllerId}/sync_nodes`;

export const GET_DOCKER_NODES = () => `customer/docker/nodes/`;

export const DELETE_DOCKER_NODE = (nodeId: string) => `customer/docker/nodes/${nodeId}/`;