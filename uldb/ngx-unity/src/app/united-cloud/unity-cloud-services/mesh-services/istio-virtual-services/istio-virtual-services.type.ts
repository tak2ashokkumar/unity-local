export interface IstioVirtualServicesType {
    destination_host: string;
    namespace: string;
    name: string;
    gateways: string;
}

export interface IstioVirtualServiceStatusType {
    status: string;
    virtual_serivce_name: string;
}