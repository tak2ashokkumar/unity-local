import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AwsVirtualRouter } from './aws-virtual-routers.type';
import { AWS_VIRTUAL_ROUTERS, AWS_VIRTUAL_NODES } from 'src/app/shared/api-endpoint.const';
import { AwsVirtualNodes } from './aws-virtual-nodes.type';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AwsVirtualRoutersService {

  constructor(private http: HttpClient) { }

  getVirtualRouters(accountId: string, regionId: string, meshName: string, routerName: string) {
    return this.http.get<AwsVirtualRouter[]>(AWS_VIRTUAL_ROUTERS(accountId, regionId, meshName, routerName));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.ACTIVE:
        return 'fa-circle text-success';
      default:
        return 'fa-circle text-danger';
    }
  }

  convertToViewData(data: AwsVirtualRouter[]): AwsVirtualRouterViewdata[] {
    let viewData: AwsVirtualRouterViewdata[] = []
    data.map(rt => {
      let view = new AwsVirtualRouterViewdata();
      view.name = rt.name;
      view.meshName = rt.mesh_name;
      view.routerName = rt.virtual_router_name;
      view.status = rt.status;
      view.statusIcon = this.getStatusIcon(rt.status);
      if (rt.nodes) {
        let arr = rt.nodes.split('\n');
        arr.map(node => {
          const temp = node.split(':');
          view.nodes.push({ name: temp[0].trim(), ratio: temp[1].trim() });
        });
      }
      viewData.push(view);
    });
    return viewData;
  }

  getVirtualNodes(accountId: string, regionId: string, meshName: string, nodeName: string) {
    return this.http.get<AwsVirtualNodes>(AWS_VIRTUAL_NODES(accountId, regionId, meshName, nodeName));
  }

  convertToNodeViewData(node: AwsVirtualNodes): AwsVirtualNodesViewdata {
    let view = new AwsVirtualNodesViewdata();
    view.status = node.status;
    view.listenerPort = node.listener_port;
    view.listenerProtocal = node.listener_protocal;
    view.name = node.name;
    view.hostname = node.hostname;
    return view;
  }
}

export class AwsVirtualRouterViewdata {
  constructor() { }
  status: string;
  statusIcon: string;
  nodes: { name: string, ratio: string }[] = [];
  name: string;
  meshName: string;
  routerName: string;
}


export class AwsVirtualNodesViewdata {
  constructor() { }
  status: string;
  listenerProtocal: string;
  hostname: string;
  name: string;
  listenerPort: string;
}