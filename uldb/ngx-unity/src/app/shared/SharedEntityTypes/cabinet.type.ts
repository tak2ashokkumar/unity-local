export interface Cabinet {
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: any[];
    cabinet_type: CabineType;
    cage: null;
    model: string;
    colocloud_set: any[];
    position: number;
    size: number;
    capacity: number;
}

export interface CabineType {
    url: string;
    id: number;
    cabinet_type: string;
    name: string;
}

export interface CabinetFast {
    url?: string;
    id: number;
    uuid: string;
    name: string;
}