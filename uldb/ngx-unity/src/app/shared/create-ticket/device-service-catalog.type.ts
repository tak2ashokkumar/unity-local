export interface DeviceServiceCatalog {
    id: number;
    device_type: string;
    description: string;
}

export interface DeviceServiceCatalogTerms {
    id: number;
    term: string;
    charge: string;
    service_catalogue_id: number;
}