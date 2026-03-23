import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { DEVICE_DISCOVERY_NETWORK } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService, OnboardedColors } from 'src/app/shared/device-icon.service';
import { Data, DataSet, Edge, Node } from 'vis-network/standalone';
import { AdvancedDiscoveryTopology, AdvancedDiscoveryTopologyLink, AdvancedDiscoveryTopologyNode } from './advanced-discovery-network-topology.type';

@Injectable()
export class AdvancedDiscoveryNetworkTopologyService {

  constructor(private http: HttpClient,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getDeviceNetwork(discoveryId: string): Observable<AdvancedDiscoveryTopology> {
    return this.http.get<AdvancedDiscoveryTopology>(DEVICE_DISCOVERY_NETWORK(discoveryId));
  }

  getNodelabel(node: AdvancedDiscoveryTopologyNode) {
    if (node.name.length) {
      return node.name.length < 15 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return node.ip_address;
    }
  }

  getNode(n: AdvancedDiscoveryTopologyNode): Node {
    let node: Node = { id: n.id, label: this.getNodelabel(n) };
    node.shape = "image";
    node.imagePadding = 1;
    node.borderWidth = 1;
    node.size = 20;

    node.color = {
      border: OnboardedColors.BORDER, background: OnboardedColors.BG,
      hover: { border: OnboardedColors.BORDER, background: OnboardedColors.BG, },
      highlight: { border: OnboardedColors.BORDER, background: OnboardedColors.BG, }
    };
    node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.resource_type), OnboardedColors));
    node.font = { size: 10, color: OnboardedColors.FONT };
    return node;
  }

  getNodes(nds: AdvancedDiscoveryTopologyNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getEdge(ln: AdvancedDiscoveryTopologyLink): Edge {
    let edge: Edge = { from: ln.source_id, to: ln.target_id };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.font = { size: 12 };
    edge.color = { inherit: 'to', opacity: 0.3 };
    return edge;
  }

  getEdges(lnks: AdvancedDiscoveryTopologyLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  convertToNetworkViewdata(data: AdvancedDiscoveryTopology, discoveryId: string): DeviceDiscoveryNetworkViewdata {
    if (!data.nodes) {
      return;
    } else {
      data.nodes.forEach(dn => {
        dn.display_type = this.util.getDeviceMappingByDeviceType(dn.resource_type);
        dn.fa_icon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(dn.resource_type))
      })
    }
    let a: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
    a.nodes = data.nodes;
    a.edges = data.links;
    a.nodeDataset = new DataSet<Node>(this.getNodes(data.nodes));
    a.edgeDataset = new DataSet<Edge>(this.getEdges(data.links));
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }
}

export class DeviceDiscoveryNetworkViewdata {
  constructor() { }
  nodes: AdvancedDiscoveryTopologyNode[] = [];
  edges: AdvancedDiscoveryTopologyLink[] = [];
  nodeDataset: DataSet<Node> = null;
  edgeDataset: DataSet<Edge> = null;
  data: Data = null;
}
