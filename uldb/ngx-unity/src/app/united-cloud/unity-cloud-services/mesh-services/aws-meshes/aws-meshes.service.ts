import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AwsMeshType } from './aws-meshes.type';
import { AWS_MESH_SERVICE } from 'src/app/shared/api-endpoint.const';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AwsMeshesService {

  constructor(private http: HttpClient) { }

  getAwsMesh(accountId: string, regionId: string) {
    return this.http.get<AwsMeshType[]>(AWS_MESH_SERVICE(accountId, regionId));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.ACTIVE:
        return 'fa-circle text-success';
      default:
        return 'fa-circle text-danger';
    }
  }

  convertToViewData(data: AwsMeshType[]) {
    let viewData: AwsMeshViewData[] = [];
    data.map(mesh => {
      let view = new AwsMeshViewData();
      view.name = mesh.name;
      view.status = mesh.status;
      view.statusIcon = this.getStatusIcon(mesh.status);
      view.virtualNodesCount = `${mesh.virtual_nodes_count}`;
      view.virtualRoutersCount = `${mesh.virtual_routers_count}`;
      view.virtualServicesCount = `${mesh.virtual_services_count}`;
      viewData.push(view);
    });
    return viewData;
  }

}
export class AwsMeshViewData {
  constructor() { }
  status: string;
  statusIcon: string;
  virtualNodesCount: string;
  virtualRoutersCount: string;
  name: string;
  virtualServicesCount: string;
}