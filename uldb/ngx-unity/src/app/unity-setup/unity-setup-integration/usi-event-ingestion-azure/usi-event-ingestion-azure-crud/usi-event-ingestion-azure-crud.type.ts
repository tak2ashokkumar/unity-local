// export interface AzureInstanceType {
//     uuid: string;
//     id: string;
//     name: string;
//     ingestion_type: string;
//     host_identity: string;
//     last_ingestion: string;
//     enabled: boolean;
//     token: string;
// }

export interface AzureInstanceType {
    id: number;
    uuid: string;
    instance: string;
    name: string;
    host_identity: string;
    ingestion_type: string;
    last_ingestion: string;
    enabled: boolean;
    token: string;
    webhook_url: string;
    event_ingestion: AzureInstanceEventIngestionType;
}
export interface AzureInstanceEventIngestionType {
    uuid: string;
    customer: number;
    source: number;
    event: string;
    type: string;
}