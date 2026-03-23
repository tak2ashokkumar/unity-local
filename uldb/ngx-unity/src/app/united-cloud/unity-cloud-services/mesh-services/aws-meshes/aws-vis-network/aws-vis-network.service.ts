import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AWSNetworkData, AWSNode, AWSEdge } from './aws-network-data.type';
import { Node, Edge } from 'vis-network/standalone';
import { GET_AWS_NETWORK_GRAPH_DATA } from 'src/app/shared/api-endpoint.const';
import { of } from 'rxjs';

@Injectable()
export class AwsVisNetworkService {

  constructor(private http: HttpClient) { }

  getNetworkData(accountId: string, regionId: string, meshName: string) {
    // return of(data);
    return this.http.get<AWSNetworkData>(GET_AWS_NETWORK_GRAPH_DATA(accountId, regionId, meshName));
  }

  convertToNodeViewData(data: AWSNode[]): Node[] {
    let nodes: Node[] = [];
    data.map((n, index) => {
      let node: Node = { id: n.id, label: n.label };
      switch (n.health) {
        case 'ACTIVE': node.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
          break;
        case 'INACTIVE': node.color = getComputedStyle(document.documentElement).getPropertyValue('--danger');
          break;
        case 'DELETED': node.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
          break;
        case 'N.A': node.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
          break;
      }
      nodes.push(node);
    });
    return nodes;
  }

  convertToEdgeViewData(data: AWSEdge[]): Edge[] {
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
      "type": "mesh",
      "health": "ACTIVE",
      "id": 1,
      "label": "dj-app"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 2,
      "label": "jazz.prod.svc.cluster.local"
    },
    {
      "type": "backend",
      "health": "N.A",
      "id": 3,
      "label": "jazz-route-prod"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 4,
      "label": "jazz-v1-prod"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 5,
      "label": "jazz-v2-prod"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 6,
      "label": "metal.prod.svc.cluster.local"
    },
    {
      "type": "backend",
      "health": "N.A",
      "id": 7,
      "label": "metal-route-prod"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 8,
      "label": "metal-v1-prod"
    },
    {
      "type": "backend",
      "health": "ACTIVE",
      "id": 9,
      "label": "metal-v2-prod"
    }
  ],
  "edges": [
    {
      "to": 2,
      "from": 1
    },
    {
      "to": 6,
      "from": 1
    },
    {
      "to": 3,
      "from": 2
    },
    {
      "to": 7,
      "from": 6
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
      "to": 8,
      "from": 7
    },
    {
      "to": 9,
      "from": 7
    }
  ]
}