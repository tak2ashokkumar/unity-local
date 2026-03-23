import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AwsVirtualserviceType, AwsBackendVirtualNodeInfo } from './aws-virtual-service.type';
import { AWS_VIRTUAL_SERVICE, AWS_BACKEND_VIRTUAL_NODES } from 'src/app/shared/api-endpoint.const';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AwsVirtualServicesService {

  constructor(private http: HttpClient) { }

  getVirtualServices(accountId: string, regionId: string, meshName: string) {
    return this.http.get<AwsVirtualserviceType[]>(AWS_VIRTUAL_SERVICE(accountId, regionId, meshName));
  }

  getVirtualRouterStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.ACTIVE:
        return 'fa-circle text-success';
      default:
        return 'fa-circle text-danger';
    }
  }

  convertToViewData(data: AwsVirtualserviceType[]): AwsVirtualserviceViewData[] {
    let viewData: AwsVirtualserviceViewData[] = []
    data.map(svc => {
      let view = new AwsVirtualserviceViewData();
      view.virtualRouterName = svc.virtual_router_name;
      view.virtualRouterStatus = svc.virtual_router_status;
      view.virtualRouterStatusIcon = this.getVirtualRouterStatusIcon(svc.virtual_router_status)
      view.virtualServiceName = svc.virtual_service_name;
      view.meshName = svc.mesh_name;
      view.backendVirtualNode = svc.backend_virtual_node;
      viewData.push(view);
    });
    return viewData;
  }

  getBackendNodeInfo(accountId: string, regionId: string, meshName: string, nodeName: string) {
    return this.http.get<AwsBackendVirtualNodeInfo>(AWS_BACKEND_VIRTUAL_NODES(accountId, regionId, meshName, nodeName));
  }

  convertToNodeViewData(node: AwsBackendVirtualNodeInfo): AwsBackendVirtualNodeViewdata {
    let view = new AwsBackendVirtualNodeViewdata();
    view.status = node.status;
    view.listenerPort = node.listener_port;
    view.listenerProtocal = node.listener_protocal;
    view.name = node.name;
    view.hostname = node.hostname;
    return view;
  }
}
export class AwsVirtualserviceViewData {
  constructor() { }
  virtualRouterName: string;
  virtualServiceName: string;
  meshName: string;
  virtualRouterStatus: string;
  virtualRouterStatusIcon: string;
  backendVirtualNode: string;
}

export class AwsBackendVirtualNodeViewdata {
  constructor() { }
  status: string;
  listenerProtocal: string;
  hostname: string;
  name: string;
  listenerPort: string;
}