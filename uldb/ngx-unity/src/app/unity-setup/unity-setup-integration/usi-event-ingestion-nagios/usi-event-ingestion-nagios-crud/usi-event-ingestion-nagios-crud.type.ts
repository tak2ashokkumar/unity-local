export interface NagiosInstanceType {
    uuid: string;
    id: string;
    name: string;
    ingestion_type: string;
    host_identity: string;
    last_ingestion: string;
    enabled: boolean;
    token: string;
}