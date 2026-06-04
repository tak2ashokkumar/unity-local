export type CollectorUpdateAction = 'ip' | 'ttl';

export interface UpdateCollectorIpPayload {
    ip_address: string;
}

export interface UpdateCollectorTtlPayload {
    cert_ttl: number;
}
