export enum MESH_SERVICE_TYPE_MAPPING {
    ANTHOS = 'traffic_director',
    AWS = 'app_mesh',
    ISTIO = 'istio'
}

export interface MeshServiceManager {
    service_type: MESH_SERVICE_TYPE_MAPPING;
    uuid: string;
    id: number;
    name: string;
    display_type: string;
}