import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { MacminiAlertComponent } from "./macmini-alert/macmini-alert.component";
import { MacminiGraphNetstatsComponent } from "./macmini-graph/macmini-graph-netstats/macmini-graph-netstats.component";
import { MacminiGraphPollerComponent } from "./macmini-graph/macmini-graph-poller/macmini-graph-poller.component";
import { MacminiGraphSystemComponent } from "./macmini-graph/macmini-graph-system/macmini-graph-system.component";
import { MacminiGraphComponent } from "./macmini-graph/macmini-graph.component";
import { MacminiHealthOverviewComponent } from "./macmini-health/macmini-health-overview/macmini-health-overview.component";
import { MacminiHealthComponent } from "./macmini-health/macmini-health.component";
import { MacminiOverviewComponent } from "./macmini-overview/macmini-overview.component";
import { MacminiPortGraphsComponent } from "./macmini-ports/macmini-port-graphs/macmini-port-graphs.component";
import { MacminiPortUsageGraphsComponent } from "./macmini-ports/macmini-port-graphs/macmini-port-usage-graphs/macmini-port-usage-graphs.component";
import { MacminiPortsComponent } from "./macmini-ports/macmini-ports.component";


export const OBSERVIUM_MACMINI_ROUTES: Routes = [
    {
        path: 'overview',
        component: MacminiOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: MacminiGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: MacminiGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: MacminiGraphPollerComponent
            },
            {
                path: 'system',
                component: MacminiGraphSystemComponent
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
        component: MacminiHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: MacminiHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: MacminiPortsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: MacminiPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: MacminiPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: MacminiAlertComponent,
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