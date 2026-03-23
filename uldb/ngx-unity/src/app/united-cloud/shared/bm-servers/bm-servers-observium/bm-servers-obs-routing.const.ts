import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { BmServersAlertsComponent } from "./bm-servers-alert/bm-servers-alert.component";
import { BmServersGraphNetstatsComponent } from "./bm-servers-graph/bm-servers-graph-netstats/bm-servers-graph-netstats.component";
import { BmServersGraphPollerComponent } from "./bm-servers-graph/bm-servers-graph-poller/bm-servers-graph-poller.component";
import { BmServersGraphSystemComponent } from "./bm-servers-graph/bm-servers-graph-system/bm-servers-graph-system.component";
import { BmServersGraphComponent } from "./bm-servers-graph/bm-servers-graph.component";
import { BmServersHealthOverviewComponent } from "./bm-servers-health/bm-servers-health-overview/bm-servers-health-overview.component";
import { BmServersHealthComponent } from "./bm-servers-health/bm-servers-health.component";
import { BmServersOverviewComponent } from "./bm-servers-overview/bm-servers-overview.component";
import { BmServerPortGraphsComponent } from "./bm-servers-port/bm-server-port-graphs/bm-server-port-graphs.component";
import { BmServerPortUsageGraphsComponent } from "./bm-servers-port/bm-server-port-graphs/bm-server-port-usage-graphs/bm-server-port-usage-graphs.component";
import { BmServersPortsComponent } from "./bm-servers-port/bm-servers-port.component";

export const OBSERVIUM_BMS_ROUTES: Routes = [
    {
        path: 'overview',
        component: BmServersOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: BmServersGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: BmServersGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: BmServersGraphPollerComponent
            },
            {
                path: 'system',
                component: BmServersGraphSystemComponent
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
        component: BmServersHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: BmServersHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: BmServersPortsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: BmServerPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: BmServerPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: BmServersAlertsComponent,
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