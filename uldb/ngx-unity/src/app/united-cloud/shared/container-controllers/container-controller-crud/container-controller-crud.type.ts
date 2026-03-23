import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';

export interface ControllerCRUDBase {
    controller_type: CONTROLLER_TYPE_MAPPING;
}

export interface KubernetesCRUDRaw {
    uuid?: string;
    name: string;
    hostname: string;
    username: string;
    password: string;
}
export interface DockerCRUDRaw {
    uuid?: string;
    name: string;
    hostname: string;
    cert: any;
    key: any;
    ca: any;
}

export interface KubernetesCRUDType extends ControllerCRUDBase, KubernetesCRUDRaw {
}

export interface DockerCRUDType extends ControllerCRUDBase, DockerCRUDRaw {
}

export interface KubernetesCredType {
    password: string;
    confirm_password: string;
}

export interface DockerCredType {
    cert: any;
    key: any;
    ca: any;
}

