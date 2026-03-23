import { Injectable } from '@angular/core';
import { AppUtilityService, DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AlertCriticalColors, AlertInfoColors, AlertWarningColors, DeviceIconService, OnboardedDownColors, OnboardedNotUPNotDownColors, OnboardedUpColors } from 'src/app/shared/device-icon.service';
import { UnityViewNetworkTopology, UnityViewNetworkTopologyLink, UnityViewNetworkTopologyNode, UnityViewNetworkTopologyNodeAlertTypes } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { UnityTopologydataService } from 'src/app/united-view/unity-topology/unity-topologydata.service';
import { DataSet } from 'vis-data';
import { Data, Edge, Node } from 'vis-network';
import { clone as _clone } from 'lodash-es';

@Injectable()
export class NtVerifyAndAuditStepService {

  constructor(private dataSvc: UnityTopologydataService,
      private util: AppUtilityService,
      private iconService: DeviceIconService) { }

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

export const jsonOutput = {
    "answer": {
        "stage": "Stage 1",
        "stage_title": "Network Topology",
        "answer": "The network topology for Tenant1-MTP-UnityDemo includes a total of 5 nodes under Custom DC3 private cloud, featuring 2 switches and 12 virtual machines. The switch 'alpha-sw' is directly connected under Custom DC3, alongside Core-Router-Demo, and is part of a larger network structure that includes various virtual machines and a database.",
        "status": "success",
        "data": {
            "nodes": [
                {
                    "uuid": "49e91ec8-a5fd-4571-89ea-9a8e46a9a316",
                    "name": "Tenant1-MTP-UnityDemo",
                    "device_type": "ORGANIZATION",
                    "status": "unknown"
                },
                {
                    "uuid": "8a00a318-61fc-49bd-983b-f1931324b84e",
                    "name": "DC3",
                    "device_type": "COLOCLOUD",
                    "status": "unknown"
                },
                {
                    "uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "name": "Custom DC3",
                    "device_type": "PRIVATE_CLOUD",
                    "status": "unknown"
                },
                {
                    "uuid": "abca4471-3b88-4a6c-a134-cd41c116b41d",
                    "name": "Core-Router-Demo",
                    "device_type": "SWITCH",
                    "status": "active"
                },
                {
                    "uuid": "c014af0a-5f2d-4732-8999-841f977cfc7b",
                    "name": "alpha-sw",
                    "device_type": "SWITCH",
                    "status": "unknown"
                },
                {
                    "uuid": "248aec19-6a76-4e5d-89b0-23e2aa37ba4d",
                    "name": "10.128.7.76",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "inactive"
                },
                {
                    "uuid": "bc386b95-6fa5-4b09-81a7-757e3b48f777",
                    "name": "10.128.7.96",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "a041aa69-2c4d-44a3-b171-81a6657908ef",
                    "name": "ContanerAppsVM1",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "unknown"
                },
                {
                    "uuid": "69cbf8b9-5ce5-46a1-97f3-428858a7e1e9",
                    "name": "linuxvm1-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "inactive"
                },
                {
                    "uuid": "f6af136c-6a66-4a85-a333-979a3a8b0a1b",
                    "name": "linuxvm2-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "8eea103c-6209-4d58-9e09-9a2c2633b620",
                    "name": "linuxvm3-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "9f5ba19a-bb56-4376-83fc-842fe6f53bb1",
                    "name": "test12",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "inactive"
                },
                {
                    "uuid": "df250342-06d0-4892-9689-fb1c957bd623",
                    "name": "Unity-Oracle",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "63bc2476-8299-4f87-9d5c-289b00377baa",
                    "name": "windowsvm1-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "0e76da0f-0971-4faf-9a37-285b87827301",
                    "name": "windowsvm2-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "e9c94d69-0fde-414e-a583-1533dbac548d",
                    "name": "windowsvm3-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "71432d67-0df6-43f8-8f47-b1ef89dd4a55",
                    "name": "windowsvm4-unitydemo",
                    "device_type": "VIRTUAL_MACHINE",
                    "status": "active"
                },
                {
                    "uuid": "e056c4d5-0aea-4f64-b66a-b8fe8a42309a",
                    "name": "MSSQL",
                    "device_type": "DATABASE",
                    "status": "active"
                }
            ],
            "links": [
                {
                    "source_uuid": "49e91ec8-a5fd-4571-89ea-9a8e46a9a316",
                    "target_uuid": "8a00a318-61fc-49bd-983b-f1931324b84e"
                },
                {
                    "source_uuid": "8a00a318-61fc-49bd-983b-f1931324b84e",
                    "target_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "abca4471-3b88-4a6c-a134-cd41c116b41d"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "c014af0a-5f2d-4732-8999-841f977cfc7b"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "248aec19-6a76-4e5d-89b0-23e2aa37ba4d"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "bc386b95-6fa5-4b09-81a7-757e3b48f777"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "a041aa69-2c4d-44a3-b171-81a6657908ef"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "69cbf8b9-5ce5-46a1-97f3-428858a7e1e9"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "f6af136c-6a66-4a85-a333-979a3a8b0a1b"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "8eea103c-6209-4d58-9e09-9a2c2633b620"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "9f5ba19a-bb56-4376-83fc-842fe6f53bb1"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "df250342-06d0-4892-9689-fb1c957bd623"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "63bc2476-8299-4f87-9d5c-289b00377baa"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "0e76da0f-0971-4faf-9a37-285b87827301"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "e9c94d69-0fde-414e-a583-1533dbac548d"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "71432d67-0df6-43f8-8f47-b1ef89dd4a55"
                },
                {
                    "source_uuid": "d408e6b1-85cc-4897-81c4-71f57bb8075c",
                    "target_uuid": "e056c4d5-0aea-4f64-b66a-b8fe8a42309a"
                }
            ]
        },
        "recommended_actions": [
            "Check Device Health",
            "View Network Path",
            "Run Basic CLI Check"
        ]
    },
    "meta": {
        "used_tools": [],
        "filters_used": {
            "org_id": 417,
            "user_id": "1881",
            "application": "Network Agent",
            "count": 0,
            "conversation_id": "c5f0e384-b2ae-4fda-9485-165f0a91b2ec",
            "role": "User",
            "streaming": false,
            "title": "Condition analysis and remediation for 617015",
            "query": "Network topology"
        }
    },
    "conversation_id": "c5f0e384-b2ae-4fda-9485-165f0a91b2ec",
    "title": "Condition analysis and remediation for 617015",
    "role": "Assistant"
};