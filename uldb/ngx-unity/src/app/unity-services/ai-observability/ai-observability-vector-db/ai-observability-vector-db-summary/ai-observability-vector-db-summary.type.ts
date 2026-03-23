export interface VectorDbListType {
    service_type: string;
    uuid: string;
    name: string;
}

export interface DurationDropdownType {
    period: string;
    from: string;
    to: string;
}

export interface VectorDbSummaryType {
    total_requests: VectorDbSummaryTotalRequestType;
    average_request_duration: VectorDbSummaryDetailsType;
}

export interface VectorDbSummaryTotalRequestType {
    total: number;
    previous_total: number;
    change_percent: number;
}

export interface VectorDbSummaryDetailsType {
    average: number;
    previous_average: number;
    change_percent: number;
}

export interface VectorDbGenerationByOperationType {
    name: string;
    total: number;
    percentage: number;
}

export interface VectorDbGenerationBySystemType extends VectorDbGenerationByOperationType { }

export interface VectorDbGenerationByApplicationType extends VectorDbGenerationByOperationType { }

export interface VectorDbGenerationByEnvironmentType extends VectorDbGenerationByOperationType { }