import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityLogsComponent } from 'src/app/united-view/activity-logs/activity-logs.component';
import { DashboardComponent } from 'src/app/united-view/dashboard/dashboard.component';
import { CustomDashboardCrudComponent } from './custom-dashboard/custom-dashboard-crud/custom-dashboard-crud.component';
import { CustomDashboardWidgetsComponent } from './custom-dashboard/custom-dashboard-widgets/custom-dashboard-widgets.component';
import { CustomDashboardComponent } from './custom-dashboard/custom-dashboard.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { UNITY_VIEW_MONITORING_ROUTES } from './monitoring/monitoring-routing.const';
import { UNITY_ALERTS_ROUTES } from './unity-alerts/unity-alerts-routing.const';
import { UnityNetworkTopologyComponent } from './unity-network-topology/unity-network-topology.component';
import { UNITY_SERVICE_TOPOLOGY_ROUTES } from './unity-service-topology/unity-service-topology-routing.const';
import { NETWORK_TOPOLOGY_ROUTES } from './unity-topology/unity-topology-routing.const';

export const unityviewroutes: Routes = [
  {
    path: 'root',
    component: DashboardWrapperComponent,
    data: {
      breadcrumb: {
        title: ''
      }
    },
    children: [
      {
        path: 'dashboard',
        data: {
          breadcrumb: {
            title: 'Dashboard'
          }
        },
        component: DashboardComponent
      },
      {
        path: 'customdashboard',
        data: {
          breadcrumb: {
            title: 'Custom Dashboard'
          }
        },
        component: CustomDashboardComponent,
      },
      {
        path: 'customdashboard/widgets',
        component: CustomDashboardWidgetsComponent,
        data: {
          breadcrumb: {
            title: 'Manage Widgets'
          }
        },
      }
    ]
  },
  {
    path: 'root/customdashboard/widget/add',
    component: CustomDashboardCrudComponent,
    data: {
      breadcrumb: {
        title: 'Add Widget'
      }
    },
  },
  {
    path: 'root/customdashboard/widget/edit/:widgetId',
    component: CustomDashboardCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit Widget'
      }
    },
  },
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
