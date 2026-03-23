export interface StorageOntapClusterPeerType {
    name: string;
    uuid: string;
    state: string;
    encryption_state: string;
    authentication_state: string;
    remote_ip_addresses: string[];
    authentication_in_use: string;
}