export interface OnboaringCustomerVCenter {
    id: number;
    private_cloud: OnboaringPrivateCloud;
    hostname: string;
    username: string;
    port: number;
}
export interface OnboaringPrivateCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
