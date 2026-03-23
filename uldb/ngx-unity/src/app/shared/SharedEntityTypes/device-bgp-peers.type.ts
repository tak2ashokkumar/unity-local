export interface DeviceBGPPeersSummaryType {
    Established: number;
    OpenConfirm: number;
    OpenSent: number;
    Idle: number;
    Connect: number;
    Active: number;
    total_bgp_peers: number;
}

export interface DeviceBGPPeersType {
    identifier: string;
    remote_as: number;
    local_port: number;
    remote_addr: string;
    local_addr: string;
    state: string;
    remote_port: number;
}