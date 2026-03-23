interface ConnectionRequest {
    userEmail: string;
    cust_email: string;
    cust_contact_number: string;
    manufacturer: string;
    model: string;
    version: string;
    peer_ip_addresses: string;
    subnets: string;
    auth_method: string;
    pre_shared_secret: string;
    dh_group_identifier: string;
    ike_encryption_algorithm: string;
    ike_security_lifetime: string;
    ike_hash_algorithm: string;
    ipsec_encryption_algorithm: string;
    ipsec_security_lifetime: string;
    ipsec_hash_algorithm: string;
    ipsec_security_protocol: string;
}