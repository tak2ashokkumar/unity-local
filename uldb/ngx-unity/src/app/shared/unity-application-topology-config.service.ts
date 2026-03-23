import { Injectable } from '@angular/core';
import { AppUtilityService, DeviceMapping, FaIconMapping } from './app-utility/app-utility.service';
import { DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUpColors } from './device-icon.service';
import { ApplicationNetworkTopology, ApplicationNetworkTopologyLink, ApplicationNetworkTopologyNode } from './SharedEntityTypes/unity-application-topology.type';
import { DataSet, Edge, Node, Data, Options } from 'vis-network/standalone';
import { clone as _clone } from 'lodash-es';


@Injectable({
  providedIn: 'root'
})
export class UnityApplicationTopologyConfigService {

  constructor(private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  convertToViewData(data: ApplicationNetworkTopology): UnityAplicationTopologyViewData {
    let a = new UnityAplicationTopologyViewData();
    let networkData = this.getNodesandEdges(_clone(data));
    a.nodes = networkData.nodes;
    a.edges = networkData.links;
    a.nodeDataset = new DataSet<Node>(this.getNodes(networkData.nodes));
    a.edgeDataset = new DataSet<Edge>(this.getEdges(networkData.links));
    a.data = { nodes: a.nodeDataset, edges: a.edgeDataset };
    return a;
  }

  getColletorNode(data: ApplicationNetworkTopology) {
    let node = data.nodes.find(n => n.type == 'device' && n.name.includes('collector'));
    if (node) {
      return node;
    }
  }

  getHostNode(data: ApplicationNetworkTopology) {
    let node = data.nodes.find(n => n.type == 'device' && !n.name.includes('collector') && !n.layer);
    if (node) {
      return node;
    }
  }

  getInfrastructureNode(data: ApplicationNetworkTopology) {
    let node = data.nodes.find(n => n.layer && n.layer == 'infrastructure');
    if (node) {
      return node;
    }
  }

  getApplicationNode(data: ApplicationNetworkTopology) {
    let node = data.nodes.find(n => n.layer && n.layer == 'application');
    if (node) {
      return node;
    }
  }

  getNodesandEdges(data: ApplicationNetworkTopology): { nodes: ApplicationNetworkTopologyNode[], links: ApplicationNetworkTopologyLink[] } {
    const sorted = [
      ...data.nodes.filter(node => node.type === 'Data Center'),
      ...data.nodes.filter(node => node.type === 'Cloud'),
      ...data.nodes.filter(node => node.layer === 'host/infrastructure' && node.device_type === 'hypervisor'),
      ...data.nodes.filter(node => node.layer === 'host/infrastructure' && node.device_type === 'vmware'),
      ...data.nodes.filter(node => node.layer === 'host/infrastructure' && node.device_type !== 'hypervisor' && node.type !== 'vmware'),
      ...data.nodes.filter(node => node.layer === 'host/infrastructure' && !node.device_type),
      ...data.nodes.filter(node => node.layer === 'application'),
      ...data.nodes.filter(node => node.layer === 'service'),
      ...data.nodes.filter(node => node.layer === 'component'),
      ...data.nodes.filter(node => node.layer === 'process'),
      ...data.nodes.filter(node => node.layer === 'database'),
      ...data.nodes
    ];
    let nodes = sorted.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    nodes.map(n => {
      n.displayType = this.util.getDeviceMappingByDeviceType(n.type);
      n.deviceMapping = this.util.getDeviceMappingByDeviceType(n.type);
      // n.redirectLink = this.getNodeRedirectLink(n);
      n.fa_icon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.type));
      if (n.fa_icon == FaIconMapping.VIRTUAL_MACHINE) {
        n.displayType = DeviceMapping.VIRTUAL_MACHINE;
      }
    });

    let links = data.links.filter((value, index, self) =>
      index === self.findIndex((t) => (t.source_uuid === value.source_uuid && t.target_uuid == value.target_uuid))
    )
    console.log('nodes : ', nodes);
    return { nodes: nodes, links: links };
  }

  getNodes(nds: ApplicationNetworkTopologyNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getNode(n: ApplicationNetworkTopologyNode): Node {
    let node: Node = { id: n.uuid, label: this.getNodelabel(n) };
    node.shape = "image";
    node.imagePadding = 1;
    node.borderWidth = 1;
    node.size = 25;
    if (typeof n.status === 'number') {
      n.statusText = (n.status as number).toString();
    }
    switch (n.statusText) {
      case "1":
        node.color = {
          border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG,
          hover: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, },
          highlight: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.type), OnboardedUpColors));
        node.font = { size: 15, color: OnboardedUpColors.FONT, vadjust: -14 };
        break;
      case "0":
        node.color = {
          border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG,
          hover: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, },
          highlight: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.type), OnboardedDownColors));
        node.font = { size: 15, color: OnboardedDownColors.FONT, vadjust: -14 };
        break;
      default:
        node.color = {
          border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG,
          hover: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, },
          highlight: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.type), OnboardedNotUPNotDownColors));
        node.font = { size: 15, color: OnboardedNotUPNotDownColors.FONT, vadjust: -14 };
    }
    return node;
  }

  getEdges(lnks: ApplicationNetworkTopologyLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  getEdge(ln: ApplicationNetworkTopologyLink): Edge {
    let edge: Edge = { from: ln.source_uuid, to: ln.target_uuid };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.color = { inherit: 'to', opacity: 0.8 };
    edge.arrows = {
      to: {
        enabled: true,
        scaleFactor: 1,
        type: "arrow"
      }
    };
    edge.label = ln.type;
    edge.font = { size: 14, bold: { size: 14, vadjust: 0, mod: 'bold' } };
    return edge;
  }

  getOptions(nodesCount?: number) {
    switch (true) {
      case nodesCount <= 100: return this.getInitialViewOptions();
      case nodesCount <= 500: return this.getMediumViewOptions();
      case nodesCount > 500: return this.getLargeViewOptions();
      default: return this.getInitialViewOptions();
    }
  }

  getInitialViewOptions() {
    return {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: true,
          direction: "LR", // Left to Right
          sortMethod: "directed", // hubsize, directed
          shakeTowards: 'roots',
          levelSeparation: 250,   // increase distance between levels
          nodeSpacing: 120,       // spacing between nodes in same level
        }
      },
      physics: {
        hierarchicalRepulsion: {
          centralGravity: 10,
          nodeDistance: 120,
          springLength: 140,
          springConstant: 0.08,
          avoidOverlap: 1
        },
        stabilization: {
          fit: true
        },
      }
    };
  }

  getMediumViewOptions() {
    return {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      layout: {
        improvedLayout: false,
        hierarchical: {
          enabled: true,
          direction: "LR", // Left to Right
          sortMethod: "directed",
          shakeTowards: 'roots',
          levelSeparation: 200,  // space between levels
          nodeSpacing: 120,      // same level spacing
        }
      },
      physics: {
        enabled: false          // Disable physics for hierarchical layout
      }
    };
  }

  getLargeViewOptions() {

  }

  getNodeSizeByLength(nodeCount: number) {
    return nodeCount <= 15 ? 25 : 20;
  }

  getNodelabel(node: ApplicationNetworkTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 15)}...`;
    } else {
      return node.name;
    }
  }

  getNodeRedirectLink(node: ApplicationNetworkTopologyNode) {
    switch (node.type) {
      case 'switch': return `/unitycloud/devices/switches/${node.uuid}/zbx/details`;
      case 'firewall': return `/unitycloud/devices/firewalls/${node.uuid}/zbx/details`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers/${node.uuid}/zbx/details`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors/${node.uuid}/zbx/details`;
      case 'bms': return `unitycloud/devices/bmservers/${node.uuid}/zbx/details`;
      case 'mac_device': return `/unitycloud/devices/macdevices/${node.uuid}/zbx/details`;
      case 'storage': return `/unitycloud/devices/storagedevices/${node.uuid}/zbx/details`;
      case 'database': return `/unitycloud/devices/databases`;
      case 'mobile': return `/unitycloud/devices/mobiledevices`;
      case 'vmware': return `/unitycloud/devices/vms/vmware/${node.uuid}/zbx/details`;
      case 'vcloud': return `/unitycloud/devices/vms/vcloud/`;
      case 'hyperv': return `/unitycloud/devices/vms/hyperv/${node.uuid}/zbx/details`;
      case 'esxi': return `/unitycloud/devices/vms/esxi/${node.uuid}/zbx/details`;
      case 'open_stack': return `/unitycloud/devices/vms/openstack/`;
      case 'g3_kvm': return `/unitycloud/devices/vms/g3kvm/`;
      case 'proxmox': return `/unitycloud/devices/vms/proxmox/`;
      case 'vm':
      case 'virtual_machine': return `/unitycloud/devices/vms/custom/${node.uuid}/zbx/details`;
      case 'instance': return `/unitycloud/devices/vms/aws/`;
      case 'azurevirtualmachine': return `/unitycloud/devices/vms/azure/`;
      case 'gcpvirtualmachines': return `/unitycloud/devices/vms/gcp`;
      case 'oraclevirtualmachine':
      case 'ocivirtualmachines': return `/unitycloud/devices/vms/oracle`;
      default:
        // pdu commented due to un availability of dcid with pdu id
        // case 'pdu': return `unitycloud/datacenter/af8345e6-6569-4fb6-8a1b-732e777fe7d2/pdus/${node.uuid}/zbx/details`;
        return null;
    }
  }
}

export class UnityAplicationTopologyViewData {
  constructor() { }
  nodes: ApplicationNetworkTopologyNode[] = [];
  edges: ApplicationNetworkTopologyLink[] = [];
  nodeDataset: DataSet<Node> = null;
  edgeDataset: DataSet<Edge> = null;
  data: Data = null;
}
export enum ApplicationTopologyLayoutOptions {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  HORIZONTAL_HIERARCHIAL = 'horizontal_hierarchial',
  VERTICAL_HIERARCHIAL = 'vertical_hierarchial'
}
