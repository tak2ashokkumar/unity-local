import { Injectable } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import { Observable, of } from 'rxjs';


@Injectable()
export class UnityNetworkTopologyService {

  constructor() { }

  getGraphData(): Observable<{ nodes: Node[], links: Edge[] }> {
    const nodes: Node[] = [
      { id: 'sales', label: 'Business Unit: Sales', data: { type: 'group', color: '#FFC107' } },
      { id: 'presales', label: 'License Cost Center: Presales', data: { type: 'group', color: '#FFC107' } },
      { id: 'marketing', label: 'License Cost Center: Marketing', data: { type: 'group', color: '#FFC107' } },
      { id: 'demo', label: 'Application: Demo & Sandbox Platform', data: { type: 'application', color: '#4CAF50' } },
      { id: 'bi', label: 'Application: BI & Analytics Demo', data: { type: 'application', color: '#F44336' } },
      { id: 'web', label: 'Application: Web & Campaign Hosting', data: { type: 'application', color: '#FFC107' } },
      { id: 'micro', label: 'Application: Microservices & Container Registry', data: { type: 'application', color: '#F44336' } },
      { id: 'vm-vm-001', label: 'VM-VM-001', data: { type: 'application', color: '#4CAF50' } },
      { id: 'ocp-vm-009', label: 'OCP-VM-009', data: { type: 'application', color: '#4CAF50' } },
      { id: 'sdwan-vce-011', label: 'SDWAN-VCE-011', data: { type: 'application', color: '#4CAF50' } },
      { id: 'ost-vm-005', label: 'OST-VM-005', data: { type: 'application', color: '#F44336' } },
      { id: 'ost-vm-006', label: 'OST-VM-006', data: { type: 'application', color: '#F44336' } },
      { id: 'ost-vm-007', label: 'OST-VM-007', data: { type: 'application', color: '#FFC107' } },
      { id: 'fs_lb_prod', label: 'FS_LB_Prod', data: { type: 'application', color: '#FFC107' } },
      { id: 'ocp-ns-003', label: 'OCP-NS-003', data: { type: 'application', color: '#F44336' } },
      { id: 'ocp-vm-008', label: 'OCP-VM-008', data: { type: 'application', color: '#F44336' } },
      { id: 'lf-fs-u-009', label: 'LF-FS-U-009', data: { type: 'shared', color: '#4CAF50' } },
      { id: 'silverpeak', label: 'SilverPeak_Edge_RegionX', data: { type: 'shared', color: '#FFC107' } },
      { id: 'sw-core-01', label: 'SW-Core-01', data: { type: 'shared', color: '#F44336' } }
    ];

    const links: Edge[] = [
      { source: 'sales', target: 'presales' },
      { source: 'sales', target: 'marketing' },
      { source: 'presales', target: 'demo' },
      { source: 'presales', target: 'bi' },
      { source: 'marketing', target: 'web' },
      { source: 'marketing', target: 'micro' },
      { source: 'demo', target: 'vm-vm-001' },
      { source: 'demo', target: 'ocp-vm-009' },
      { source: 'demo', target: 'sdwan-vce-011' },
      { source: 'bi', target: 'ost-vm-005' },
      { source: 'bi', target: 'ost-vm-006' },
      { source: 'web', target: 'ost-vm-007' },
      { source: 'web', target: 'fs_lb_prod' },
      { source: 'micro', target: 'ocp-ns-003' },
      { source: 'micro', target: 'ocp-vm-008' },
      { source: 'sdwan-vce-011', target: 'lf-fs-u-009' },
      { source: 'ost-vm-006', target: 'lf-fs-u-009' },
      { source: 'fs_lb_prod', target: 'lf-fs-u-009' },
      { source: 'ocp-vm-008', target: 'lf-fs-u-009' },
      { source: 'lf-fs-u-009', target: 'silverpeak' },
      { source: 'lf-fs-u-009', target: 'sw-core-01' }
    ];

    return of({ nodes, links });
  }

}
