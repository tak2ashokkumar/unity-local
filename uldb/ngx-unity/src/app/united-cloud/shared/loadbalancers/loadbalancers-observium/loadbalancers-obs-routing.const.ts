import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { LoadbalancersAlertComponent } from "./loadbalancers-alert/loadbalancers-alert.component";
import { LoadbalancersGraphNetstatsComponent } from "./loadbalancers-graph/loadbalancers-graph-netstats/loadbalancers-graph-netstats.component";
import { LoadbalancersGraphPollerComponent } from "./loadbalancers-graph/loadbalancers-graph-poller/loadbalancers-graph-poller.component";
import { LoadbalancersGraphSystemComponent } from "./loadbalancers-graph/loadbalancers-graph-system/loadbalancers-graph-system.component";
import { LoadbalancersGraphComponent } from "./loadbalancers-graph/loadbalancers-graph.component";
import { LoadbalancersHealthOverviewComponent } from "./loadbalancers-health/loadbalancers-health-overview/loadbalancers-health-overview.component";
import { LoadbalancersHealthComponent } from "./loadbalancers-health/loadbalancers-health.component";
import { LoadbalancersOverviewComponent } from "./loadbalancers-overview/loadbalancers-overview.component";
import { LoadbalancerPortGraphsComponent } from "./loadbalancers-port/loadbalancer-port-graphs/loadbalancer-port-graphs.component";
import { LoadbalancerPortUsageGraphsComponent } from "./loadbalancers-port/loadbalancer-port-graphs/loadbalancer-port-usage-graphs/loadbalancer-port-usage-graphs.component";
import { LoadbalancersPortComponent } from "./loadbalancers-port/loadbalancers-port.component";

export const OBSERVIUM_LOADBALANCER_ROUTES: Routes =[
    {
        path: 'overview',
        component: LoadbalancersOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: LoadbalancersGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: LoadbalancersGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: LoadbalancersGraphPollerComponent
            },
            {
                path: 'system',
                component: LoadbalancersGraphSystemComponent
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
            },
            {
                path: 'firewall/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'health',
        component: LoadbalancersHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: LoadbalancersHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: LoadbalancersPortComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: LoadbalancerPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: LoadbalancerPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: LoadbalancersAlertComponent,
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