import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MESH_SERVICE_MANAGERS } from 'src/app/shared/api-endpoint.const';
import { MeshServiceManager, MESH_SERVICE_TYPE_MAPPING } from './mesh-service.type';

@Injectable()
export class MeshServiceManagerService {

  constructor(private http: HttpClient) { }

  getMeshServices() {
    return this.http.get<MeshServiceManager[]>(MESH_SERVICE_MANAGERS());
  }

  convertToViewData(serviceManagers: MeshServiceManager[]) {
    let viewData: MeshServiceViewData[] = [];
    serviceManagers.map(sm => {
      let data = new MeshServiceViewData();
      data.serviceType = sm.service_type;
      data.name = sm.name;
      data.displayType = sm.display_type;
      data.drillDownTollitipMsg = sm.display_type;
      switch (sm.service_type) {
        case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
          data.serviceId = `${sm.uuid}`;
          data.url = `${data.serviceId}/tds`;
          data.changePasswordTooltipMessage = 'Change Service Account Info';
          break;
        case MESH_SERVICE_TYPE_MAPPING.AWS:
          data.serviceId = `${sm.id}`;
          data.url = `${data.serviceId}/awsmesh/us-west-2`;
          data.changePasswordTooltipMessage = 'Change keys'
          break;
        case MESH_SERVICE_TYPE_MAPPING.ISTIO:
          data.serviceId = `${sm.uuid}`;
          data.url = `${data.serviceId}/istio`;
          data.changePasswordTooltipMessage = 'Change password';
          break;
        default:
          break;
      }
      viewData.push(data);
    });
    return viewData;
  }
}

export class MeshServiceViewData {
  constructor() { }
  serviceType: MESH_SERVICE_TYPE_MAPPING;
  serviceId: string;
  name: string;
  displayType: string;
  drillDownTollitipMsg: string;
  url: string;
  changePasswordTooltipMessage: string;
}