export const UNITY_FONT_FAMILY = () => `-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji`;

export const UNITY_TEXT_DEFAULT_COLOR = () => `#23282c`;

export const FEATURE_NOT_ENABLED_MESSAGE = () => `This feature is not enabled`;

export const VM_CONSOLE_CLIENT = () => `/main#/unityterminal/`;

export const WINDOWS_CONSOLE_CLIENT = (managementIP: string) => `/rdp?ip=${managementIP}&domain=unityonecloud.com`;

export const WINDOWS_CONSOLE_VIA_AGENT = (rdpURL: string, managementIP: string) => `${rdpURL}?ip=${managementIP}&domain=unityonecloud.com`;

export const MANAGEMENT_NOT_ENABLED_MESSAGE = () => `This feature is not enabled`;

export const AUTH_ALGOS = [
    { label: 'MD5', value: 'MD5' },
    { label: 'SHA1', value: 'SHA1' },
    { label: 'SHA224', value: 'SHA224' },
    { label: 'SHA256', value: 'SHA256' },
    { label: 'SHA384', value: 'SHA384' },
    { label: 'SHA512', value: 'SHA512' }
];

export const CRYPTO_ALGOS = [
    { label: 'DES', value: 'DES' },
    { label: 'AES128', value: 'AES128' },
    { label: 'AES192', value: 'AES192' },
    { label: 'AES256', value: 'AES256' },
    { label: 'AES192C', value: 'AES192C' },
    { label: 'AES256C', value: 'AES256C' }
];








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

//below mapping of ssh,ssh key,snmpv1,snmpv2,snmpv3 is commented, has now in the credential dropdown on selection of ssh credential type credential
//we need to disable all the other ssh credential type credentials not both ssh and ssh key Credentials types credentials disable and similarly snmpv1,snmpv2,snmpv3
export const CredentialMap = {
    // 'ssh': 'ssh',
    // 'ssh key': 'ssh',
    // 'snmpv1': 'snmp',
    // 'snmpv2': 'snmp',
    // 'snmpv3': 'snmp',
}