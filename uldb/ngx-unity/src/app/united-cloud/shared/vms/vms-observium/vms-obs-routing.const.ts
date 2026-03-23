import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { VmsAlertComponent } from './vms-alert/vms-alert.component';
import { VmsGraphNetstatsComponent } from './vms-graph/vms-graph-netstats/vms-graph-netstats.component';
import { VmsGraphPollerComponent } from './vms-graph/vms-graph-poller/vms-graph-poller.component';
import { VmsGraphSystemComponent } from './vms-graph/vms-graph-system/vms-graph-system.component';
import { VmsGraphComponent } from './vms-graph/vms-graph.component';
import { VmsHealthOverviewComponent } from './vms-health/vms-health-overview/vms-health-overview.component';
import { VmsHealthComponent } from './vms-health/vms-health.component';
import { VmsOverviewComponent } from './vms-overview/vms-overview.component';
import { VmPortGraphsComponent } from './vms-port/vm-port-graphs/vm-port-graphs.component';
import { VmPortUsageGraphsComponent } from './vms-port/vm-port-graphs/vm-port-usage-graphs/vm-port-usage-graphs.component';
import { VmsPortComponent } from './vms-port/vms-port.component';

export const OBSERVIUM_VMS_ROUTES: Routes = 
[
    {
        path: 'overview',
        component: VmsOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: VmsGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: VmsGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: VmsGraphPollerComponent
            },
            {
                path: 'system',
                component: VmsGraphSystemComponent

            },
            {
                path: 'netstats/details',
                component: GraphDetailsComponent
            },
            {
                path: 'poller/details',
                component: GraphDetailsComponent
            },
            {
                path: 'system/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'health',
        component: VmsHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: VmsHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: VmsPortComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: VmPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: VmPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: VmsAlertComponent,
        data: {
            breadcrumb: {
                title: 'Alerts',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'configure',
        component: DevicesMonitoringConfigComponent,
        data: {
            breadcrumb: {
                title: 'Configuration',
                stepbackCount: 0
            }
        }
    }
]