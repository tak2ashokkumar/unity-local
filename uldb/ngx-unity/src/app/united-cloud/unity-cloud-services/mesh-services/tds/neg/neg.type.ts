export interface NEGType {
    capacity: number;
    name: string;
    zone: string;
    service_name: string;
    network_endpoint_type: string;
    healthy_count: number;
    neg_backends_count: number;
    max_rps: number;
    uuid: string;
}