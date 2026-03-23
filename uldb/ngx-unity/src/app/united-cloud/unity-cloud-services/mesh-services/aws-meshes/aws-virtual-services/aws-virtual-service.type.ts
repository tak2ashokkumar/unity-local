export interface AwsVirtualserviceType {
    status: string;
    virtual_router_name: string;
    virtual_service_name: string;
    mesh_name: string;
    virtual_router_status: string;
    backend_virtual_node: string;
}

export interface AwsBackendVirtualNodeInfo {
    status: string;
    listener_protocal: string;
    hostname: string;
    name: string;
    listener_port: string;
}