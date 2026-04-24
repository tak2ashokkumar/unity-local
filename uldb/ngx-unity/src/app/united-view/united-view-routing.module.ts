import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityLogsComponent } from 'src/app/united-view/activity-logs/activity-logs.component';
import { UNITY_VIEW_MONITORING_ROUTES } from './monitoring/monitoring-routing.const';
import { UNITY_ALERTS_ROUTES } from './unity-alerts/unity-alerts-routing.const';
import { UnityNetworkTopologyComponent } from './unity-network-topology/unity-network-topology.component';
import { UNITY_SERVICE_TOPOLOGY_ROUTES } from './unity-service-topology/unity-service-topology-routing.const';
import { NETWORK_TOPOLOGY_ROUTES } from './unity-topology/unity-topology-routing.const';

export const unityviewroutes: Routes = [
  ...UNITY_VIEW_MONITORING_ROUTES,
  {
    path: 'activitylogs',
    component: ActivityLogsComponent,
    data: {
      breadcrumb: {
        title: 'Activity Logs'
      }
    },
  },
  ...UNITY_ALERTS_ROUTES,
  ...NETWORK_TOPOLOGY_ROUTES,
  ...UNITY_SERVICE_TOPOLOGY_ROUTES,
  {
    path: 'network',
    component: UnityNetworkTopologyComponent,
    data: {
      breadcrumb: {
        title: 'Network Topology'
      }
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(unityviewroutes)],
  exports: [RouterModule]
})
export class UnitedViewRoutingModule { }
