export interface AgentConfigurationType {
    id: number;
    name: string;
    ip_address: string;
    poller_id: number;
    status: string;
    uuid: string;
    poller_name: string;
    ssh_username: string;
    ssh_password: string;
    ssh_port: number;
    snmp_community: string;
    deployment_status: number;
    created_at: string;
    updated_at: string;
    customer: number;
}
