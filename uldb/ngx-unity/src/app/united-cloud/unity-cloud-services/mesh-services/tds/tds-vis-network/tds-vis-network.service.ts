import { Injectable } from '@angular/core';
import { Node, Edge } from 'vis-network/standalone';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_TRAFFIC_DIRECTORS_NETWORK_DATA } from 'src/app/shared/api-endpoint.const';
import { TDSNetworkData, TDSNode, TDSEdge } from './tds-network-data.type';

@Injectable()
export class TdsVisNetworkService {

  constructor(private http: HttpClient) { }

  getNetworkData(meshId: string, serviceName: string) {
    // return of(data);
    return this.http.get<TDSNetworkData>(GET_TRAFFIC_DIRECTORS_NETWORK_DATA(meshId, serviceName));
  }

  convertToNodeViewData(data: TDSNode[]): Node[] {
    let nodes: Node[] = [];
    data.map((n, index) => {
      let node: Node = { id: n.id, label: n.label };
      switch (n.health) {
        case 'HEALTHY': node.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
          break;
        case 'UNHEALTHY': node.color = getComputedStyle(document.documentElement).getPropertyValue('--danger');
          break;
        case 'PARTIALLY_HEALTHY': node.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
          break;
        case 'NA': node.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
          break;
      }
      nodes.push(node);
    });
    return nodes;
  }

  convertToEdgeViewData(data: TDSEdge[]): Edge[] {
    let edges: Edge[] = [];
    data.map(e => {
      let edge: Edge = { from: e.from, to: e.to, color: getComputedStyle(document.documentElement).getPropertyValue('--primary') };
      edges.push(edge);
    });
    return edges;
  }
}

const data = { "nodes": [{ "type": "network_endpoint", "health": "NA", "id": 3, "label": "10.128.0.17:80" }, { "type": "network_endpoint", "health": "NA", "id": 4, "label": "10.192.8.60:80" }, { "type": "network_endpoint", "health": "NA", "id": 5, "label": "172.30.0.108:80" }, { "type": "backend", "health": "NA", "id": 2, "label": "app-backend-shopping-cart-neg" }, { "type": "service", "health": "NA", "id": 1, "label": "app-backend-shopping-cart-service" }], "edges": [{ "to": 2, "from": 1 }, { "to": 3, "from": 2 }, { "to": 4, "from": 2 }, { "to": 5, "from": 2 }] };