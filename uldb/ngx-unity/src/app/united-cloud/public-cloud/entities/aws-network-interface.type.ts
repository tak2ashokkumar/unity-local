interface AWSNetworkInterface {
    description: string;
    uuid: string;
    vpc_id: string;
    owner_id: string;
    status: string;
    availability_zone: string;
    subnet_id: string;
    interface_type: string;
    private_dns_name: string;
    network_interface_id: string;
    requester_managed: boolean;
    mac_address: string;
    private_ip_address: string;
    requester_id: string;
}
