import { Injectable } from '@angular/core';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { HttpClient } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { switchMap, take } from 'rxjs/operators';
import { MeshBackendType } from './mesh-backend.type';
import { GET_BACKEND_LIST, SYNC_BACKEND_LIST, MESH_MAP_VM, GET_CLOUD_BY_CLOUD_TYPE, GET_CONTAINER_BY_CLUSTER, GET_VM_BY_CLOUD, GET_KUBERNETES_CONTROLLERS_BY_CLOUD_TYPE_AND_ID } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';

@Injectable()
export class MeshBackendService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  syncBackendList(meshId: string, serviceName: string, zone: string, neg: string) {
    return this.http.get<CeleryTask>(SYNC_BACKEND_LIST(meshId, serviceName, zone, neg))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  getBackendList(meshId: string, serviceName: string, zone: string, neg: string) {
    return this.http.get<PaginatedResult<MeshBackendType>>(GET_BACKEND_LIST(meshId, serviceName, zone, neg));
  }

  getCloud(cloud_type: string): Observable<any> {
    return this.http.get<any>(GET_CLOUD_BY_CLOUD_TYPE(cloud_type));
  }

  mapVM(data: any): Observable<MeshBackendType> {
    return this.http.post<MeshBackendType>(MESH_MAP_VM(data.uuid), data);
  }

  getVM(cloudType: string, cloud: string): Observable<any> {
    return this.http.get<any>(GET_VM_BY_CLOUD(cloudType, cloud));
  }

  getCluster(cloudType: string, cloud: string): Observable<any> {
    return this.http.get<any>(GET_KUBERNETES_CONTROLLERS_BY_CLOUD_TYPE_AND_ID(cloudType, cloud));
  }

  getContainer(clusterUuid: string): Observable<any> {
    return this.http.get<any>(GET_CONTAINER_BY_CLUSTER(clusterUuid));
  }

  convert(backend: MeshBackendType) {
    let view: MeshBackendViewDataType = new MeshBackendViewDataType();
    view.status = backend.status ? backend.status : 'N.A';
    view.instance = backend.mapped_device ? backend.mapped_device : (backend.instance ? backend.instance : 'N/A');
    view.ipAddress = backend.ip_address;
    view.port = `${backend.port}`;
    view.uuid = backend.uuid;
    view.statusIcon = backend.status == '1' ? 'fa-circle text-success' : (backend.status == '0' ? 'fa-circle text-danger' : 'fa-exclamation-circle text-warning');
    return view;
  }

  convertToViewData(backends: MeshBackendType[]) {
    let viewData: MeshBackendViewDataType[] = [];
    backends.map(backend => {
      viewData.push(this.convert(backend));
    });
    return viewData;
  }

  resetFormErrors() {
    return {
      'deviceType': '',
      'cloudType': '',
      'cloud': '',
      'vm': '',
	  'cluster': '',
      'container': '',
    };
  }

  validationMessages = {
    'deviceType': {
      'required': 'Device Type is required'
    },
    'cloudType': {
      'required': 'Cloud Type is required'
    },
    'cloud': {
      'required': 'Cloud is required'
    },
    'vm': {
      'required': 'Virtual Machine is required'
    },
    'cluster': {
      'required': 'Kubernetes cluster is required'
    },
    'container': {
      'required': 'Container is required'
    }
  }

  createForm(uuid: string): FormGroup {
    return this.builder.group({
      'deviceType': ['', [Validators.required]],
      'cloudType': ['', [Validators.required]],
      'cloud': ['', [Validators.required]],
      'uuid': [uuid],
    });
  }
}

export class MeshBackendViewDataType {
  constructor() { }
  status: string;
  instance: string;
  ipAddress: string;
  statusIcon: string;
  port: string;
  id: number;
  uuid: string;
}