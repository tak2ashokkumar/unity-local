import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { clone as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { DEVICE_DISCOVERY_NETWORK } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService, NotOnboardedColors, OnboardedColors } from 'src/app/shared/device-icon.service';
import { UnityDeviceNetworkLink, UnityDeviceNetworkNode, UnityNetworkTopology } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { Data, DataSet, Edge, Node } from 'vis-network/standalone';
import { AdvancedDeviceDiscoveryService } from '../../advanced-device-discovery.service';


@Injectable()
export class AdvancedDiscoverySummaryNetworkViewService {

  constructor(private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getDeviceNetwork(): Observable<UnityNetworkTopology[]> {
    // return this.http.get<UnityNetworkTopology[]>(DEVICE_DISCOVERY_SUMMMARY_NETWORK());
    return this.http.get<UnityNetworkTopology[]>(DEVICE_DISCOVERY_NETWORK(this.discoveryService.getSelectedDiscoveryId()));
  }

  getNodelabel(node: UnityDeviceNetworkNode) {
    if (node.hostname.length) {
      return node.hostname.length < 15 ? node.hostname : `${node.hostname.slice(0, 12)}...`;
    } else {
      return node.ip_address;
    }
  }

  getNodesandEdges(data: UnityNetworkTopology[]): { nodes: UnityDeviceNetworkNode[], links: UnityDeviceNetworkLink[] } {
    let networks = data.flatMap((elem) => elem.network_topology).filter(nt => nt);
    let nodes = networks.flatMap((elem => elem.nodes));

    nodes = nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.id === value.id))
    )

    nodes.map(n => {
      n.displayType = this.util.getDeviceMappingByDeviceType(n.device_type);
      n.fa_icon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type));
      if (n.fa_icon == FaIconMapping.VIRTUAL_MACHINE) {
        n.displayType = DeviceMapping.VIRTUAL_MACHINE;
      }
    })

    let links = networks.flatMap((elem => elem.links));
    links = links.filter((value, index, self) =>
      index === self.findIndex((t) => (t.source_id === value.source_id && t.target_id == value.target_id))
    )

    return { nodes: nodes, links: links };
  }

  getNode(n: UnityDeviceNetworkNode): Node {
    let node: Node = { id: n.id, label: this.getNodelabel(n) };
    node.shape = "image";
    node.imagePadding = 1;
    node.borderWidth = 1;
    node.size = 20;

    let nodeColors = n.onboarded ? OnboardedColors : NotOnboardedColors;
    node.color = {
      border: nodeColors.BORDER, background: nodeColors.BG,
      hover: { border: nodeColors.BORDER, background: nodeColors.BG, },
      highlight: { border: nodeColors.BORDER, background: nodeColors.BG, }
    };
    node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), nodeColors));
    node.font = { size: 10, color: nodeColors.FONT };
    return node;
  }

  getNodes(nds: UnityDeviceNetworkNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getEdge(ln: UnityDeviceNetworkLink): Edge {
    let edge: Edge = { from: ln.source_id, to: ln.target_id };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.font = { size: 12 };
    edge.color = { inherit: 'to', opacity: 0.3 };
    return edge;
  }

  getEdges(lnks: UnityDeviceNetworkLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  convertToNetworkViewdata(data: UnityNetworkTopology[]): DeviceDiscoveryNetworkViewdata {
    let a: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
    let networkData = this.getNodesandEdges(_clone(data));
    a.nodes = networkData.nodes;
    a.edges = networkData.links;

    a.nodeDataset = new DataSet<Node>(this.getNodes(networkData.nodes));
    a.edgeDataset = new DataSet<Edge>(this.getEdges(networkData.links));
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }

  getFilterNetworkData(filterData: DeviceDiscoveryNetworkViewdata, filter: string): DeviceDiscoveryNetworkViewdata {
    const light = getComputedStyle(document.documentElement).getPropertyValue('--gray-300');

    let a: DeviceDiscoveryNetworkViewdata = new DeviceDiscoveryNetworkViewdata();
    a.nodes = filterData.nodes;
    a.edges = filterData.edges;

    let nodes: Node[] = [];
    filterData.nodes.map((n, index) => {
      let node: Node = { id: n.id, label: this.getNodelabel(n) };
      node.shape = "image";
      node.imagePadding = 1;
      node.borderWidth = 1;
      node.size = 20;

      let nodeColors = n.onboarded ? OnboardedColors : NotOnboardedColors;
      if (n.onboarded) {
        node.color = {
          border: (filter == 'all' || filter == 'onboarded') ? nodeColors.BORDER : light,
          background: (filter == 'all' || filter == 'onboarded') ? nodeColors.BG : light,
          highlight: {
            border: (filter == 'all' || filter == 'onboarded') ? nodeColors.BORDER : light,
            background: (filter == 'all' || filter == 'onboarded') ? nodeColors.BG : light,
          },
          hover: {
            border: (filter == 'all' || filter == 'onboarded') ? nodeColors.BORDER : light,
            background: (filter == 'all' || filter == 'onboarded') ? nodeColors.BG : light,
          }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), nodeColors));
        node.font = { size: 10, color: (filter == 'all' || filter == 'onboarded') ? nodeColors.FONT : light };
        node.opacity = (filter == 'all' || filter == 'onboarded') ? 1 : 0.5;
      } else {
        node.color = {
          border: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BORDER : light,
          background: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BG : light,
          highlight: {
            border: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BORDER : light,
            background: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BG : light,
          },
          hover: {
            border: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BORDER : light,
            background: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.BG : light,
          }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), nodeColors));
        node.font = { size: 10, color: (filter == 'all' || filter == 'not_onboarded') ? nodeColors.FONT : light };
        node.opacity = (filter == 'all' || filter == 'not_onboarded') ? 1 : 0.5;
      }

      nodes.push(node);
    })
    a.nodeDataset = new DataSet<Node>(nodes);

    let edges: Edge[] = [];
    filterData.edges.map(ln => {
      let edge: Edge = { from: ln.source_id, to: ln.target_id };
      edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
      edge.font = { size: 12 };
      edge.color = { inherit: 'to', opacity: 0.3 };
      edges.push(edge);
    })
    a.edgeDataset = new DataSet<Edge>(edges);
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }
}

export class DeviceDiscoveryNetworkViewdata {
  constructor() { }
  nodes: UnityDeviceNetworkNode[] = [];
  edges: UnityDeviceNetworkLink[] = [];
  nodeDataset: DataSet<Node> = null;
  edgeDataset: DataSet<Edge> = null;
  data: Data = null;
}
