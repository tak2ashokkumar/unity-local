import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DEVICE_LIST_BY_DEVICE_TYPE, UNITY_NETWORK_TOPOLOGY } from 'src/app/shared/api-endpoint.const';
import { DataSet, Edge, Node, Data } from 'vis-network/standalone';
import { clone as _clone } from 'lodash-es';
import { UnityViewNetworkTopology, UnityViewNetworkTopologyLink, UnityViewNetworkTopologyNode, UnityViewNetworkTopologyNodeAlertTypes } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { UnityTopologydataService } from '../unity-topologydata.service';
import { AlertCriticalColors, AlertInfoColors, AlertWarningColors, DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUpColors } from 'src/app/shared/device-icon.service';
import { AppUtilityService, DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityTopologyViewType } from '../unity-topology.service';
import { Firewall } from 'src/app/united-cloud/shared/entities/firewall.type';
import { Switch } from 'src/app/united-cloud/shared/entities/switch.type';

@Injectable()
export class UnityTopologyViewService {

  constructor(private http: HttpClient,
    private dataSvc: UnityTopologydataService,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getDeviceNetwork(viewType: UnityTopologyViewType): Observable<UnityViewNetworkTopology> {
    return this.http.get<UnityViewNetworkTopology>(UNITY_NETWORK_TOPOLOGY(viewType.view, viewType.node, viewType.nodeId));
  }

  // getAllFirewalls(dcId:string): Observable<Firewall[]> {
  //   return this.http.get<Firewall[]>(`/customer/firewalls/?datacenter=${dcId}`);
  // }

  // getAllSwitches(dcId:string): Observable<Switch[]> {
  //   return this.http.get<Switch[]>(`/customer/switches/?datacenter=${dcId}`);
  // }

  getNodesandEdges(data: UnityViewNetworkTopology): { nodes: UnityViewNetworkTopologyNode[], links: UnityViewNetworkTopologyLink[] } {
    let nodes = data.nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    nodes.map(n => {
      n.displayType = this.util.getDeviceMappingByDeviceType(n.device_type);
      n.deviceMapping = this.util.getDeviceMappingByDeviceType(n.device_type);
      n.redirectLink = this.dataSvc.getNodeRedirectLink(n);
      n.fa_icon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type));
      if (n.fa_icon == FaIconMapping.VIRTUAL_MACHINE) {
        n.displayType = DeviceMapping.VIRTUAL_MACHINE;
      }
      n.is_device = (n.device_type !== 'organization') && (n.device_type !== 'colocloud') && (n.device_type !== 'private_cloud') && (n.device_type !== 'cabinet');
      n.alert_data_view = new UnityViewNetworkTopologyNodeAlertTypes();
      n.showBadge = true;
      if (n.alert_data) {
        if (n.alert_data.length) {
          n.alert_data.map(subArray => {
            Object.keys(n.alert_data_view).map(key => {
              if (key == subArray[0]) {
                n.alert_data_view[key] = <number>subArray[1];
              }
            })
          })
        }
      }
      if (n.alert_count) {
        n.badgeColors = n.alert_data_view.Critical ? AlertCriticalColors : n.alert_data_view.Warning ? AlertWarningColors : AlertInfoColors;
      }
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
    switch (n.status) {
      case "1":
        node.color = {
          border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG,
          hover: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, },
          highlight: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedUpColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedUpColors.FONT };
        break;
      case "0":
        node.color = {
          border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG,
          hover: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, },
          highlight: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedDownColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedDownColors.FONT };
        break;
      default:
        node.color = {
          border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG,
          hover: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, },
          highlight: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedNotUPNotDownColors, n.badgeColors));
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

  convertToViewData(data: UnityViewNetworkTopology): UnityNetworkTopologyViewData {
    let a: UnityNetworkTopologyViewData = new UnityNetworkTopologyViewData();
    let networkData = this.getNodesandEdges(_clone(data));
    a.nodes = networkData.nodes;
    a.edges = networkData.links;
    a.nodeDataset = new DataSet<Node>(this.getNodes(networkData.nodes));
    a.edgeDataset = new DataSet<Edge>(this.getEdges(networkData.links));
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }
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
