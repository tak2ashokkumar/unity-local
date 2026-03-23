import { Injectable } from '@angular/core';
import { UnityViewNetworkTopology, UnityViewNetworkTopologyLink, UnityViewNetworkTopologyNode, UnityViewNetworkTopologyNodeAlertTypes } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { DataSet, Edge, Node, Data, Options } from 'vis-network/standalone';
import { AlertCriticalColors, AlertInfoColors, AlertWarningColors, DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUpColors } from 'src/app/shared/device-icon.service';
import { AppUtilityService, DeviceMapping, FaIconMapping } from './app-utility/app-utility.service';
import { UnityGCPTopologyNode } from './SharedEntityTypes/gcp.type';
import { UnityOciTopologyNode } from './SharedEntityTypes/oci.type';
import { UnityAzureTopologyNode } from './SharedEntityTypes/azure.type';
import { clone as _clone } from 'lodash-es';


@Injectable({
  providedIn: 'root'
})
export class UnityTopologyConfigService {

  constructor(private util: AppUtilityService,
    private iconService: DeviceIconService) { }

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

  getNodesandEdges(data: UnityViewNetworkTopology): { nodes: UnityViewNetworkTopologyNode[], links: UnityViewNetworkTopologyLink[] } {
    let nodes = data.nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (t.uuid === value.uuid))
    )
    nodes.map(n => {
      n.displayType = this.util.getDeviceMappingByDeviceType(n.device_type);
      n.deviceMapping = this.util.getDeviceMappingByDeviceType(n.device_type);
      n.redirectLink = this.getNodeRedirectLink(n);
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

  getNodes(nds: UnityViewNetworkTopologyNode[]): Node[] {
    let nodes: Node[] = [];
    nds.map(n => {
      nodes.push(this.getNode(n));
    });
    return nodes;
  }

  getNode(n: UnityViewNetworkTopologyNode): Node {
    let node: Node = { id: n.uuid, label: this.getNodelabel(n) };
    node.shape = "image";
    node.imagePadding = 1;
    node.borderWidth = 1;
    node.size = 25;
    if (typeof n.status === 'number') {
      n.status = (n.status as number).toString();
    }
    switch (n.status) {
      case "1":
        node.color = {
          border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG,
          hover: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, },
          highlight: { border: OnboardedUpColors.BORDER, background: OnboardedUpColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedUpColors, n.badgeColors));
        node.font = { size: 15, color: OnboardedUpColors.FONT };
        break;
      case "0":
        node.color = {
          border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG,
          hover: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, },
          highlight: { border: OnboardedDownColors.BORDER, background: OnboardedDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedDownColors, n.badgeColors));
        node.font = { size: 15, color: OnboardedDownColors.FONT };
        break;
      default:
        node.color = {
          border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG,
          hover: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, },
          highlight: { border: OnboardedNotUPNotDownColors.BORDER, background: OnboardedNotUPNotDownColors.BG, }
        };
        node.image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(this.iconService.getTopologyIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.device_type), OnboardedNotUPNotDownColors, n.badgeColors));
        node.font = { size: 15, color: OnboardedNotUPNotDownColors.FONT };
    }
    return node;
  }

  getEdges(lnks: UnityViewNetworkTopologyLink[]): Edge[] {
    let edges: Edge[] = [];
    lnks.map(ln => {
      edges.push(this.getEdge(ln));
    })
    return edges;
  }

  getEdge(ln: UnityViewNetworkTopologyLink): Edge {
    let edge: Edge = { from: ln.source_uuid, to: ln.target_uuid };
    edge.smooth = { enabled: true, type: 'cubicBezier', forceDirection: true, roundness: 0.5 };
    edge.font = { size: 12 };
    edge.color = { inherit: 'to', opacity: 0.6 };
    return edge;
  }

  getOptions(nodesCount?: number) {
    switch (true) {
      case nodesCount <= 100: return this.getInitialOptions();
      case nodesCount <= 500: return this.getMediumViewOptions();
      case nodesCount > 500: return this.getLargeViewOptions();
      default: return this.getInitialOptions();
    }
  }

  getInitialOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
        },
        stabilization: {
          fit: true
        },
      },
      layout: {
        randomSeed: 20,
        improvedLayout: true
      }
    }
    return options;
  }

  getMediumViewOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -2000,
          avoidOverlap: 0.2,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      },
      layout: {
        randomSeed: 20,
        improvedLayout: true
      }
    }
    return options;
  }

  getLargeViewOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -2000,
          avoidOverlap: 0.2,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
      }
    }
    return options;
  }

  getLayoutSubOptions(nodesCount?: number, layoutType?: string) {
    switch (true) {
      case nodesCount <= 100:
        if (layoutType == LayoutOptions.HORIZONTAL_HIERARCHIAL) {
          return this.getHorizontalHierarchialLayoutSubOptions();
        }
        return this.getInitialLayoutSubOptions();
      case nodesCount <= 500: return this.getMediumViewOptions();
      case nodesCount > 500: return this.getLargeViewOptions();
      default: return this.getInitialOptions();
    }
  }

  getInitialLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 20,
        improvedLayout: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
          centralGravity: 0.1,
        },
        stabilization: {
          fit: true
        },
      }
    }
  }

  getHorizontalHierarchialLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 20,
        improvedLayout: true,
        hierarchical: {
          enabled: true,
          direction: 'LR', // Horizontal: Left to Right
          sortMethod: 'hubsize', // or 'directed'
          levelSeparation: 150,
          nodeSpacing: 200,
        },
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
          centralGravity: 0.1,
        },
        stabilization: {
          fit: true
        },
      }
    }
  }

  getMediumLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 2,
        improvedLayout: false
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -10000,
          avoidOverlap: 0.3,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      }
    }
  }

  getLargeLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 2,
        improvedLayout: false
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -10000,
          avoidOverlap: 0.3,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      }
    }
  }

  getNodeSizeByLength(nodeCount: number) {
    return nodeCount < 15 ? 20 : 15;
  }

  getNodelabel(node: UnityViewNetworkTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return node.ip_address;
    }
  }

  getNodeRedirectLink(node: UnityViewNetworkTopologyNode) {
    switch (node.device_type) {
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

  getAzureNodelabel(node: UnityAzureTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getAzureNodeRedirectLink(node: UnityAzureTopologyNode) {
    return `setup/integration/azure/instances/${node.account}/resources/${node.uuid}`;
  }

  getOciNodelabel(node: UnityOciTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getOciNodeRedirectLink(node: UnityOciTopologyNode) {
    return `setup/integration/oci/instances/${node.account}/resources/${node.uuid}`;
  }

  getGCPNodelabel(node: UnityGCPTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getGCPNodeRedirectLink(node: UnityGCPTopologyNode) {
    return `setup/integration/gcp/instances/${node.account}/resources/${node.uuid}`;
  }
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


export enum LayoutOptions {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  HORIZONTAL_HIERARCHIAL = 'horizontal_hierarchial',
  VERTICAL_HIERARCHIAL = 'vertical_hierarchial'
}