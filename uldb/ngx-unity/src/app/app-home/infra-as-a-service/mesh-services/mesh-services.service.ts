import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MESH_SERVICE_MANAGERS } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { MESH_SERVICE_TYPE_MAPPING } from 'src/app/united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DashboardMeshServicesData } from './mesh-services.type';

@Injectable()
export class MeshServicesService {

  constructor(private http: HttpClient) { }

  getMeshServives(): Observable<DashboardMeshServicesData[]> {
    return this.http.get<DashboardMeshServicesData[]>(MESH_SERVICE_MANAGERS())
  }

  convertToViewData(meshServices: DashboardMeshServicesData[]): DashboardMeshServicesViewData[] {
    let viewData: DashboardMeshServicesViewData[] = [];
    meshServices.map(meshService => {
      let a: DashboardMeshServicesViewData = new DashboardMeshServicesViewData();
      a.name = meshService.name;
      a.serviceType = meshService.service_type;
      a.displayType = meshService.display_type;

      a.loaderName = `${meshService.service_type}${meshService.uuid}`;

      const link: string = '/unitycloud/services/mesh/';
      switch (meshService.service_type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
          a.serviceId = meshService.uuid;
          a.drillDownLink = `${link}${meshService.uuid}/tds`;
          break;
        case MESH_SERVICE_TYPE_MAPPING.AWS:
          a.serviceId = `${meshService.id}`;
          a.drillDownLink = `${link}${meshService.id}/awsmesh/us-west-2`;
          break;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO:
          a.serviceId = meshService.uuid;
          a.drillDownLink = `${link}${meshService.uuid}/istio`;
          break;
      }
      viewData.push(a);
    })
    return viewData;
  }
}

export class DashboardMeshServicesViewData {
  serviceId: string;
  name: string;
  serviceType: string;
  displayType: string;
  loaderName: string;
  drillDownLink: string;
  isTrafficDirector: boolean;
  isAppMesh: boolean;
  isIstio: boolean;
  constructor() { }
}
