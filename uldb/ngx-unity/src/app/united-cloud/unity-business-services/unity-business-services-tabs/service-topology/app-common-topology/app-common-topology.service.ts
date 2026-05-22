import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUpColors } from 'src/app/shared/device-icon.service';
import { UnityViewNetworkTopology, UnityViewNetworkTopologyLink, UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { UnityTopologydataService } from 'src/app/united-view/unity-topology/unity-topologydata.service';
import { Data, DataSet, Edge, Node } from 'vis-network/standalone';

@Injectable()
export class AppCommonTopologyService {
  constructor(private http: HttpClient,
    private dataSvc: UnityTopologydataService,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getDeviceNetwork(applications?: string[], selectedView?: string): Observable<TopologyResponse[]> {
    let params = new HttpParams();
    if (selectedView) {
      params = params.set('layer', selectedView);
    }
    if (applications && applications.length > 0) {
      applications.forEach(app => {
        params = params.append('app_id', app);
      });
    }
    return this.http.get<TopologyResponse[]>(`/apm/topology/app_service_topology_details/`, { params });
  }

  getNodesandEdges(data: UnityViewNetworkTopology): { nodes: UnityViewNetworkTopologyNode[], links: UnityViewNetworkTopologyLink[] } {
    let nodes = data.nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    nodes.map(n => {
      n.displayType = 'Switch';
      // n.displayType = this.util.getDeviceMappingByDeviceType(n.device_type);
      // n.deviceMapping = this.util.getDeviceMappingByDeviceType(n.device_type);
      // n.redirectLink = this.dataSvc.getNodeRedirectLink(n);
      // n.fa_icon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type));
      // if (n.fa_icon == FaIconMapping.VIRTUAL_MACHINE) {
      //   n.displayType = DeviceMapping.VIRTUAL_MACHINE;
      // }
      // n.is_device = (n.device_type !== 'organization') && (n.device_type !== 'colocloud') && (n.device_type !== 'private_cloud') && (n.device_type !== 'cabinet');
      // n.alert_data_view = new UnityViewNetworkTopologyNodeAlertTypes();
      // n.showBadge = true;
      // if (n.alert_data) {
      //   if (n.alert_data.length) {
      //     n.alert_data.map(subArray => {
      //       Object.keys(n.alert_data_view).map(key => {
      //         if (key == subArray[0]) {
      //           n.alert_data_view[key] = <number>subArray[1];
      //         }
      //       })
      //     })
      //   }
      // }
      // if (n.alert_count) {
      //   n.badgeColors = n.alert_data_view.Critical ? AlertCriticalColors : n.alert_data_view.Warning ? AlertWarningColors : AlertInfoColors;
      // }
    });

    let links = data.links.filter((value, index, self) =>
      index === self.findIndex((t) => (t.source_uuid === value.source_uuid && t.target_uuid == value.target_uuid))
    )

    return { nodes: nodes, links: links };
  }

  getNode(n: UnityViewNetworkTopologyNode): Node {
    let node: Node = { id: n.uuid, label: this.dataSvc.getNodelabel(n) };
    node.shape = "image";
    node.imagePadding = 1;
    node.borderWidth = 1;
    node.size = 20;
    switch (String(n.status)) {
      case "1":
        node.color = {
          border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG,
          hover: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, },
          highlight: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.icon ? n.icon : 'abc'), OnboardedUpColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedUpColors.FONT };
        break;
      case "0":
        node.color = {
          border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG,
          hover: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, },
          highlight: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.icon ? n.icon : 'abc'), OnboardedDownColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedDownColors.FONT };
        break;
      default:
        node.color = {
          border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG,
          hover: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, },
          highlight: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.icon ? n.icon : 'abc'), OnboardedNotUPNotDownColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedNotUPNotDownColors.FONT };
    }
    return node;
  }

  getNodes(nds: UnityViewNetworkTopologyNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getEdge(ln: UnityViewNetworkTopologyLink): Edge {
    let edge: Edge = { from: ln.source_uuid, to: ln.target_uuid };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.font = { size: 12 };
    edge.color = { inherit: 'to', opacity: 0.6 };
    return edge;
  }

  getEdges(lnks: UnityViewNetworkTopologyLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  convertToViewData(dataList: UnityViewNetworkTopology[]): UnityNetworkTopologyViewData[] {
    return dataList.map(data => {
      let a: UnityNetworkTopologyViewData = new UnityNetworkTopologyViewData();
      let networkData = this.getNodesandEdges(_clone(data));

      a.nodes = networkData.nodes;
      a.edges = networkData.links;
      a.nodeDataset = new DataSet<Node>(this.getNodes(networkData.nodes));
      a.edgeDataset = new DataSet<Edge>(this.getEdges(networkData.links));
      a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };

      return a;
    });
  }
}

export class UnityTopologyViewType {
  constructor() { }
  view: string;
  viewToRender: string;
  node?: string;
  nodeId?: string;
  showCompleteTopology: boolean;
}

export class UnityNetworkTopologyViewType {
  constructor() { }
  view: string;
  viewToRender: string;
  node?: string;
  nodeId?: string;
  showCompleteTopology: boolean;
}


export class UnityNetworkTopologyViewData {
  constructor() { }
  nodes: UnityViewNetworkTopologyNode[] = [];
  edges: UnityViewNetworkTopologyLink[] = [];
  nodeDataset: DataSet<Node> = null;
  edgeDataset: DataSet<Edge> = null;
  data: Data = null;
}

export interface UnityNetworkTopologyNodeViewData extends UnityViewNetworkTopologyNode {
  faIcon?: string;
}

export interface TopologyResponse {
  app_name: string | null;
  service?: UnityViewNetworkTopology[];
  component?: UnityViewNetworkTopology[];
  process?: UnityViewNetworkTopology[];
  database?: UnityViewNetworkTopology[];
  host?: UnityViewNetworkTopology[];
  physical_layer?: UnityViewNetworkTopology[];
}

export interface StatusSummary {
  active: number;
  unknown: number;
  inactive: number;
}
