import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUnKnownColors, OnboardedUpColors } from 'src/app/shared/device-icon.service';
import { Data, DataSet, Edge, Node } from 'vis-network/standalone';
import { UnityTopologydataService } from '../unity-topologydata.service';
import { GET_DUMMY_JSON } from 'src/app/shared/api-endpoint.const';
import { environment } from 'src/environments/environment';
import { GCPTopologyType, UnityGCPTopologyLink, UnityGCPTopologyNode } from 'src/app/shared/SharedEntityTypes/gcp.type';


@Injectable()
export class UnityGcpTopologyViewService {

  constructor(private http: HttpClient,
    private dataSvc: UnityTopologydataService,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getDeviceNetwork(accountId: string): Observable<GCPTopologyType> {
    // return this.http.get<AzureTopologyType>(GET_DUMMY_JSON());
    return this.http.get<GCPTopologyType>(`/customer/managed/gcp/accounts/${accountId}/topology/`);
  }

  getNodesandEdges(data: GCPTopologyType): { nodes: UnityGCPTopologyNode[], links: UnityGCPTopologyLink[] } {
    let nodes = data.nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    nodes.map(n => {
      n.displayType = n.resource_type;
      n.redirectLink = this.dataSvc.getGCPNodeRedirectLink(n);
      if (n.icon_path && n.icon_path != '') {
        n.icon = `${environment.assetsUrl}external-brand/gcp/${n.icon_path}.svg`;
      }
    });

    let links = data.links.filter((value, index, self) =>
      index === self.findIndex((t) => (t.source_uuid === value.source_uuid && t.target_uuid == value.target_uuid))
    )

    return { nodes: nodes, links: links };
  }

  getNode(n: UnityGCPTopologyNode): Node {
    let node: Node = { id: n.uuid, label: this.dataSvc.getGCPNodelabel(n) };
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
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.resource_type), OnboardedUpColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedUpColors.FONT };
        break;
      case "0":
        node.color = {
          border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG,
          hover: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, },
          highlight: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.resource_type), OnboardedDownColors, n.badgeColors));
        node.font = { size: 10, color: OnboardedDownColors.FONT };
        break;
      default:
        // node.color = {
        //   border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG,
        //   hover: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, },
        //   highlight: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, }
        // };

        node.color = {
          border: OnboardedUnKnownColors.BORDER, background: OnboardedUnKnownColors.BG,
          hover: { border: OnboardedUnKnownColors.BORDER, background: OnboardedUnKnownColors.BG, },
          highlight: { border: OnboardedUnKnownColors.BORDER, background: OnboardedUnKnownColors.BG, }
        };

        if (n.icon) {
          node.image = n.icon;
        } else {
          node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.resource_type), OnboardedUnKnownColors, n.badgeColors));
        }

        // node.font = { size: 10, color: OnboardedNotUPNotDownColors.FONT };
        node.font = { size: 10, color: OnboardedUnKnownColors.FONT };

    }
    return node;
  }

  getNodes(nds: UnityGCPTopologyNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getEdge(ln: UnityGCPTopologyLink): Edge {
    let edge: Edge = { from: ln.source_uuid, to: ln.target_uuid };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.font = { size: 12 };
    edge.color = { inherit: 'to', opacity: 0.6 };
    return edge;
  }

  getEdges(lnks: UnityGCPTopologyLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  convertToViewData(data: GCPTopologyType): UnityGCPTopologyViewData {
    let a = new UnityGCPTopologyViewData();
    let networkData = this.getNodesandEdges(_clone(data));
    a.nodes = networkData.nodes;
    a.edges = networkData.links;
    a.nodeDataset = new DataSet<Node>(this.getNodes(networkData.nodes));
    a.edgeDataset = new DataSet<Edge>(this.getEdges(networkData.links));
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }
}

export class UnityGCPTopologyViewData {
  constructor() { }
  nodes: UnityGCPTopologyNode[] = [];
  edges: UnityGCPTopologyLink[] = [];
  nodeDataset: DataSet<Node> = null;
  edgeDataset: DataSet<Edge> = null;
  data: Data = null;
}

export interface UnityNetworkTopologyNodeViewData extends UnityGCPTopologyNode {
  faIcon?: string;
}
