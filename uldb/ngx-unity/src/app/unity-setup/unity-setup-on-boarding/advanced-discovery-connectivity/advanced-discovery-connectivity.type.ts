export type CollectorUpdateAction = 'ip' | 'ttl';

export interface UpdateCollectorIpPayload {
    ip_address: string;
}

export interface UpdateCollectorTtlPayload {
    cert_ttl: number;
}

export interface ConsoleResult {
    status: string;
    output: string[];
    command: string;
    exit_code: number;
    summary: string;
}
