import { MESH_SERVICE_TYPE_MAPPING } from '../mesh-service.type';

export interface MeshServiceCRUDBase {
    service_type: MESH_SERVICE_TYPE_MAPPING;
    service_mesh: boolean;
}

export interface AnthosCRUDRaw {
    uuid?: string,
    name: string,
    email: string,
    service_account_info: string
}
export interface AmppMeshCRUDRaw {
    account_name: string,
    access_key: string,
    secret_key: string
}

export interface IstioCRUDRaw {
    name: string;
    hostname: string;
    username: string;
    password: string;
    service_mesh: boolean;
}

export interface AnthosCRUDType extends MeshServiceCRUDBase, AnthosCRUDRaw {
}

export interface AppMeshCRUDType extends MeshServiceCRUDBase, AmppMeshCRUDRaw {
}

export interface IstioCRUDType extends MeshServiceCRUDBase, IstioCRUDRaw {
}

export interface AnthosCredType {
    service_account_info: string;
}

export interface AppMeshCredType {
    id: number;
    access_key: string;
    secret_key: string;
}

export interface IstioCredType {
    password: string;
    confirm_password: string;
}

