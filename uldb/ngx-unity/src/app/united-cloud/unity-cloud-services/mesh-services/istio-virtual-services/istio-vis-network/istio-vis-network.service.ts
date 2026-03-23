import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Node, Edge } from 'vis-network/standalone';
import { GET_ISTIO_NETWORK_GRAPH_DATA } from 'src/app/shared/api-endpoint.const';
import { of } from 'rxjs';
import { IstioNetworkData, IstioNode, IstioEdge } from './istio-network-data.type';

@Injectable()
export class IstioVisNetworkService {

  constructor(private http: HttpClient) { }

  getNetworkData(accountId: string, namespace: string, gateway: string) {
    // return of(data);
    return this.http.get<IstioNetworkData>(GET_ISTIO_NETWORK_GRAPH_DATA(accountId, namespace, gateway));
  }

  convertToNodeViewData(data: IstioNode[]): Node[] {
    let nodes: Node[] = [];
    data.map((n, index) => {
      let node: Node = { id: n.id, label: n.label };
      switch (n.health) {
        case 'running': node.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
          break;
        case 'failed': node.color = getComputedStyle(document.documentElement).getPropertyValue('--danger');
          break;
        case 'partially_running': node.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
          break;
        case 'N.A': node.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
          break;
      }
      nodes.push(node);
    });
    return nodes;
  }

  convertToEdgeViewData(data: IstioEdge[]): Edge[] {
    let edges: Edge[] = [];
    data.map(e => {
      let edge: Edge = { from: e.from, to: e.to, color: getComputedStyle(document.documentElement).getPropertyValue('--primary') };
      edges.push(edge);
    });
    return edges;
  }
}


const data = {
  "nodes": [
    {
      "type": "pod",
      "health": "running",
      "id": 3,
      "label": "details-v1-68fbb76fc-zlbks"
    },
    {
      "type": "container",
      "health": "running",
      "id": 4,
      "label": "details"
    },
    {
      "type": "container",
      "health": "running",
      "id": 5,
      "label": "istio-proxy"
    },
    {
      "type": "service",
      "health": "running",
      "id": 2,
      "label": "details"
    },
    {
      "type": "service",
      "health": "running",
      "id": 6,
      "label": "kubernetes"
    },
    {
      "type": "pod",
      "health": "running",
      "id": 8,
      "label": "productpage-v1-6c6c87ffff-n82x4"
    },
    {
      "type": "container",
      "health": "running",
      "id": 9,
      "label": "productpage"
    },
    {
      "type": "container",
      "health": "running",
      "id": 10,
      "label": "istio-proxy"
    },
    {
      "type": "service",
      "health": "running",
      "id": 7,
      "label": "productpage"
    },
    {
      "type": "pod",
      "health": "running",
      "id": 12,
      "label": "ratings-v1-7bdfd65ccc-rrmnh"
    },
    {
      "type": "container",
      "health": "running",
      "id": 13,
      "label": "ratings"
    },
    {
      "type": "container",
      "health": "running",
      "id": 14,
      "label": "istio-proxy"
    },
    {
      "type": "service",
      "health": "running",
      "id": 11,
      "label": "ratings"
    },
    {
      "type": "pod",
      "health": "running",
      "id": 16,
      "label": "reviews-v1-5c5b7b9f8d-hpxsr"
    },
    {
      "type": "container",
      "health": "running",
      "id": 17,
      "label": "reviews"
    },
    {
      "type": "container",
      "health": "running",
      "id": 18,
      "label": "istio-proxy"
    },
    {
      "type": "pod",
      "health": "running",
      "id": 19,
      "label": "reviews-v2-569796655b-qzglh"
    },
    {
      "type": "container",
      "health": "running",
      "id": 20,
      "label": "reviews"
    },
    {
      "type": "container",
      "health": "running",
      "id": 21,
      "label": "istio-proxy"
    },
    {
      "type": "pod",
      "health": "running",
      "id": 22,
      "label": "reviews-v3-844bc59d88-vbknq"
    },
    {
      "type": "container",
      "health": "running",
      "id": 23,
      "label": "reviews"
    },
    {
      "type": "container",
      "health": "running",
      "id": 24,
      "label": "istio-proxy"
    },
    {
      "type": "service",
      "health": "running",
      "id": 15,
      "label": "reviews"
    },
    {
      "type": "v_service",
      "health": "running",
      "id": 1,
      "label": "bookinfo-gateway"
    }
  ],
  "edges": [
    {
      "to": 3,
      "from": 2
    },
    {
      "to": 4,
      "from": 3
    },
    {
      "to": 5,
      "from": 3
    },
    {
      "to": 2,
      "from": 1
    },
    {
      "to": 6,
      "from": 1
    },
    {
      "to": 8,
      "from": 7
    },
    {
      "to": 9,
      "from": 8
    },
    {
      "to": 10,
      "from": 8
    },
    {
      "to": 7,
      "from": 1
    },
    {
      "to": 12,
      "from": 11
    },
    {
      "to": 13,
      "from": 12
    },
    {
      "to": 14,
      "from": 12
    },
    {
      "to": 11,
      "from": 1
    },
    {
      "to": 16,
      "from": 15
    },
    {
      "to": 17,
      "from": 16
    },
    {
      "to": 18,
      "from": 16
    },
    {
      "to": 19,
      "from": 15
    },
    {
      "to": 20,
      "from": 19
    },
    {
      "to": 21,
      "from": 19
    },
    {
      "to": 22,
      "from": 15
    },
    {
      "to": 23,
      "from": 22
    },
    {
      "to": 24,
      "from": 22
    },
    {
      "to": 15,
      "from": 1
    }
  ]
}