import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { FinOpsAlerts, FinOpsCostElements, FinOpsInfrastructureElement } from './unity-service-topology.type';

@Injectable()
export class UnityServiceTopologyService {

  constructor(private http: HttpClient,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  getData(): Observable<DataNode[]> {
    return of(DATA_NODES); //DATA_NODES;
  }

  convertToNodesViewData(nodes: DataNode[]): DataNodeViewData[] {
    let viewData: DataNodeViewData[] = [];
    nodes.map(n => {
      let a = new DataNodeViewData();
      a.uuid = n.uuid;
      a.label = n.label;
      a.entityType = n.entityType;
      a.type = n.type;
      a.status = n.status;
      a.nodeClass = n.status === 'critical' ? 'node-red' : n.status === 'warning' ? 'node-orange' : 'node-green';
      if (n.type === 'bu' || n.type === 'cost_center') {
        a.iconClass = `fas fa-building`;
      } else if (n.type === 'application') {
        a.iconClass = `fab fa-app-store`;
      } else {
        a.iconClass = `fa fas ${this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(n.type))}`;
      }

      if (n.children) {
        a.children = this.convertToNodesViewData(n.children);
      }

      if (n.connectedFrom) {
        a.connectedFrom = n.connectedFrom;
      }
      if (n.connectedTo) {
        a.connectedTo = n.connectedTo;
      }
      viewData.push(a);
    })
    return viewData;
  }

  getSharedResources(): Observable<DataNode[]> {
    return of(SHARED_DATA_NODES); //DATA_NODES;
  }

  getLeaderLineOptions(status?: string): any {
    let color = null;
    if (status) {
      color = status == 'ok' ? '#83dfae' : status == 'warning' ? '#ffe1ac' : '#ffa1a1';
    }
    return {
      path: 'fluid',
      startPlug: 'disc',
      endPlug: 'arrow2',
      size: 1,
      startPlugSize: 2,
      endPlugSize: 2,
      color: color ? color : null,
    }
  }

  getInfrastructureElements(): Observable<FinOpsInfrastructureElement[]> {
    return this.http.get<FinOpsInfrastructureElement[]>(`/customer/finops/building_blocks/infrastructure_element/`);
  }

  convertToInfraElementsViewData(data: FinOpsInfrastructureElement[]): FinOpsInfraElementsViewData[] {
    let viewData: FinOpsInfraElementsViewData[] = [];
    data.map(d => {
      let a = new FinOpsInfraElementsViewData();
      a.deviceName = d['Device Name'];
      a.deviceType = d['Device_Type'];
      a.managementIp = d['Management IP'];
      a.cpuUsage = d['CPU Usage (%)'];
      a.vcpuAllocation = d['vCPU Allocation'];
      a.vcpuUsed = d['vCPU Used'];
      a.vcpuFree = d['vCPU Free'];
      a.vCPUFreePercentage = <number><unknown>a.vcpuFree.split('%')[0];
      a.vCPUUsedPercentage = 100 - a.vCPUFreePercentage;
      a.vCPUUsedBarColor = a.vCPUUsedPercentage < 65 ? 'bg-success' : a.vCPUUsedPercentage >= 65 && a.vCPUUsedPercentage < 85 ? 'bg-warning' : 'bg-danger';

      a.memoryUsage = d['Memory Usage (%)'];
      a.memoryCapacity = d['Memory Capacity'];
      a.memoryUsed = d['Memory Used'];
      a.memoryFree = d['Memory Free'];
      a.memoryFreePercentage = <number><unknown>a.memoryFree.split('%')[0];
      a.memoryUsedPercentage = 100 - a.memoryFreePercentage;
      a.memoryUsedBarColor = a.memoryUsedPercentage < 65 ? 'bg-success' : a.memoryUsedPercentage >= 65 && a.memoryUsedPercentage < 85 ? 'bg-warning' : 'bg-danger';
      viewData.push(a);
    })
    return viewData;
  }

  getAlerts(): Observable<FinOpsAlerts[]> {
    return this.http.get<FinOpsAlerts[]>(`/customer/finops/building_blocks/all_alerts/`);
  }

  convertToAlertsViewData(data: FinOpsAlerts[]): FinOpsAlertsViewData[] {
    let viewData: FinOpsAlertsViewData[] = [];
    data.map(d => {
      let a = new FinOpsAlertsViewData();
      a.alertId = d['Alert ID'];
      a.deviceName = d['Device Name'];
      a.managementIp = d['Management IP'];
      a.deviceType = d['Device Type'];
      a.count = d['Count'];
      a.eventMetric = d['Event Metric'];
      a.eventTime = d['Event Time'] ? this.util.toUnityOneDateFormat(d['Event Time']) : null;;
      a.severity = d['Severity'];
      a.description = d['Description'];
      if (d['Severity'] == 'Critical') {
        a.severityClass = 'text-danger';
        a.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (d['Severity'] == 'Warning') {
        a.severityClass = 'text-warning';
        a.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        a.severityClass = 'text-primary';
        a.severityIcon = 'fa-info-circle text-primary';
      }
      viewData.push(a);
    })
    return viewData;
  }

  getCostDetails(): Observable<FinOpsCostElements[]> {
    return this.http.get<FinOpsCostElements[]>(`/customer/finops/building_blocks/cost_overview/`);
  }

  convertToCostDetailsViewData(data: FinOpsCostElements[]): FinOpsCostElementsViewData[] {
    let viewData: FinOpsCostElementsViewData[] = [];
    data.map(d => {
      let a = new FinOpsCostElementsViewData();
      a.deviceName = d['Device Name'];
      a.ipAddress = d['IP Address'];
      a.deviceType = d['Device Type'];
      a.cpuUsage = d['CPU Usage (%)'];
      a.memoryUsage = d['Memory Usage (%)'];
      a.diskUsage = d['Disk Usage'];
      a.computeCost = d['Compute Cost ($)'];
      a.os = d['OS'];
      viewData.push(a);
    })
    return viewData;
  }
}

export class DataNodeViewData {
  uuid: string;
  label: string;
  entityType: string;
  type: string;
  status: 'critical' | 'warning' | 'ok' = 'ok';
  nodeClass: 'node-orange' | 'node-red' | 'node-green' = 'node-green';
  iconClass: string;
  children?: DataNodeViewData[] = [];
  sharedResources?: DataNodeViewData[] = [];
  connectedFrom?: string[] = [];
  connectedTo?: string[] = [];
}

export class DataNode {
  uuid: string;
  label: string;
  entityType: string;
  type: string;
  status: 'critical' | 'warning' | 'ok';
  children?: DataNode[] = [];
  connectedFrom?: string[] = [];
  connectedTo?: string[] = [];
}
export const DATA_NODES: DataNode[] = [
  {
    uuid: 'business', label: 'Business Unit: Sales', entityType: 'bu', type: 'bu', status: 'warning', children: [
      {
        uuid: 'presales', label: 'License Cost Center: Presales', entityType: 'cost_center', type: 'cost_center', status: 'warning', children: [
          {
            uuid: 'demo', label: 'Application: Demo & Sandbox Platform', entityType: 'application', type: 'application', status: 'ok', children: [
              { uuid: 'vm1', label: 'VMW-VM-001', entityType: 'device', type: 'vm', status: 'ok' },
              { uuid: 'vm2', label: 'OCP-VM-009', entityType: 'device', type: 'vm', status: 'ok' },
              { uuid: 'vm3', label: 'SDWAN-VCF-011', entityType: 'device', type: 'sdwan_device', status: 'ok' },
            ]
          },
          {
            uuid: 'bi', label: 'Application: BI and Analytics Demo', entityType: 'application', type: 'application', status: 'critical', children: [
              { uuid: 'bi1', label: 'OST-VM-005', entityType: 'device', type: 'vm', status: 'critical' },
              { uuid: 'bi2', label: 'OST-VM-006', entityType: 'device', type: 'vm', status: 'critical' },
            ]
          },
        ]
      },
      {
        uuid: 'marketing', label: 'License Cost Center: Marketing', entityType: 'cost_center', type: 'cost_center', status: 'warning', children: [
          {
            uuid: 'web', label: 'Application: Web & Campaign Hosting', entityType: 'application', type: 'application', status: 'warning', children: [
              { uuid: 'web1', label: 'OST-VM-007', entityType: 'device', type: 'vm', status: 'warning' },
              { uuid: 'web2', label: 'FS_LB_Prod', entityType: 'device', type: 'load_balancer', status: 'warning' },
            ]
          },
          {
            uuid: 'micro', label: 'Application: Microservices & Container Registry', entityType: 'application', type: 'application', status: 'critical', children: [
              { uuid: 'ms1', label: 'OCP-NS-003', entityType: 'device', type: 'sdwan_device', status: 'critical' },
              { uuid: 'ms2', label: 'OCP-VM-008', entityType: 'device', type: 'vm', status: 'critical' },
            ]
          },
        ]
      },
      // {
      //   uuid: 'policy', label: 'License Cost Center: Policy', entityType: 'cost_center', type: 'cost_center', status: 'warning', children: [
      //     {
      //       uuid: 'p1', label: 'Application: P1_Web & Campaign Hosting', entityType: 'application', type: 'application', status: 'warning', children: [
      //         { uuid: 'p1web1', label: 'P1_OS-VM-007', entityType: 'device', type: 'vm', status: 'warning' },
      //         { uuid: 'p1web2', label: 'P1_FS_LB_Prod', entityType: 'device', type: 'load_balancer', status: 'warning' },
      //       ]
      //     },
      //     {
      //       uuid: 'p2', label: 'Application: P2_Microservices & Container Registry', entityType: 'application', type: 'application', status: 'critical', children: [
      //         { uuid: 'p2ms1', label: 'P2_OCP-NS-003', entityType: 'device', type: 'sdwan_device', status: 'critical' },
      //         { uuid: '22ms2', label: 'P2_OCP-VM-008', entityType: 'device', type: 'vm', status: 'critical' },
      //       ]
      //     },
      //   ]
      // },
      // {
      //   uuid: 'budget', label: 'License Cost Center: Budget', entityType: 'cost_center', type: 'cost_center', status: 'warning', children: [
      //     {
      //       uuid: 'b1', label: 'Application: B1_Web & Campaign Hosting', entityType: 'application', type: 'application', status: 'warning', children: [
      //         { uuid: 'b1web1', label: 'OSB1-VM-007', entityType: 'device', type: 'vm', status: 'warning' },
      //         { uuid: 'b1web2', label: 'B1_FS_LB_Prod', entityType: 'device', type: 'load_balancer', status: 'warning' },
      //       ]
      //     },
      //     {
      //       uuid: 'b2', label: 'Application: B2_Microservices & Container Registry', entityType: 'application', type: 'application', status: 'critical', children: [
      //         { uuid: 'b2ms1', label: 'B2_OCP-NS-003', entityType: 'device', type: 'sdwan_device', status: 'critical' },
      //         { uuid: 'b2ms2', label: 'B2_OCP-VM-008', entityType: 'device', type: 'vm', status: 'critical' },
      //       ]
      //     },
      //   ]
      // },
    ]
  },
];

export const SHARED_DATA_NODES: DataNode[] = [
  { uuid: 'shared1', label: 'LB-FS-U-009', entityType: 'device', type: 'load_balancer', status: 'ok', connectedFrom: ['vm1', 'vm2'] },
  { uuid: 'shared2', label: 'SilverPeak Edge_RegionX', entityType: 'device', type: 'sdwan_device', status: 'warning', connectedFrom: ['shared1', 'web1', 'web2'] },
  { uuid: 'shared3', label: 'SW-Core-01', entityType: 'device', type: 'switch', status: 'critical', connectedFrom: ['shared2', 'bi1', 'bi2', 'ms1', 'ms2'] },
]

export class FinOpsInfraElementsViewData {
  deviceName: string;
  deviceType: string;
  managementIp: string;
  cpuUsage: number;
  vcpuAllocation: string;
  vcpuUsed: string;
  vcpuFree: string;
  vCPUUsedPercentage: number;
  vCPUFreePercentage: number;
  vCPUUsedBarColor: string;
  memoryUsage: number;
  memoryCapacity: string;
  memoryUsed: string;
  memoryFree: string;
  memoryUsedPercentage: number;
  memoryFreePercentage: number;
  memoryUsedBarColor: string;
}

export class FinOpsAlertsViewData {
  alertId: number;
  deviceName: string;
  managementIp: string;
  deviceType: string;
  count: number;
  eventMetric: string;
  eventTime: string;
  description: string;
  severity: string;
  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
}

export class FinOpsCostElementsViewData {
  deviceName: string;
  ipAddress: string;
  deviceType: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: string;
  computeCost: number;
  os: string;
}
