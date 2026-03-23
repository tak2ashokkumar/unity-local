import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { FirewallsAlertComponent } from "./firewalls-alert/firewalls-alert.component";
import { FirewallsGraphFirewallComponent } from "./firewalls-graph/firewalls-graph-firewall/firewalls-graph-firewall.component";
import { FirewallsGraphNetstatsComponent } from "./firewalls-graph/firewalls-graph-netstats/firewalls-graph-netstats.component";
import { FirewallsGraphPollerComponent } from "./firewalls-graph/firewalls-graph-poller/firewalls-graph-poller.component";
import { FirewallsGraphSystemComponent } from "./firewalls-graph/firewalls-graph-system/firewalls-graph-system.component";
import { FirewallsGraphComponent } from "./firewalls-graph/firewalls-graph.component";
import { FirewallsHealthOverviewComponent } from "./firewalls-health/firewalls-health-overview/firewalls-health-overview.component";
import { FirewallsHealthComponent } from "./firewalls-health/firewalls-health.component";
import { FirewallsOverviewComponent } from "./firewalls-overview/firewalls-overview.component";
import { FirewallPortGraphsComponent } from "./firewalls-port/firewall-port-graphs/firewall-port-graphs.component";
import { FirewallPortUsageGraphsComponent } from "./firewalls-port/firewall-port-graphs/firewall-port-usage-graphs/firewall-port-usage-graphs.component";
import { FirewallsPortComponent } from "./firewalls-port/firewalls-port.component";

export const OBSERVIUM_FIREWALL_ROUTES: Routes = [
    {
        path: 'overview',
        component: FirewallsOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: FirewallsGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: FirewallsGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: FirewallsGraphPollerComponent
            },
            {
                path: 'system',
                component: FirewallsGraphSystemComponent
            },
            {
                path: 'firewall',
                component: FirewallsGraphFirewallComponent
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
        component: FirewallsHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: FirewallsHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: FirewallsPortComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: FirewallPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: FirewallPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: FirewallsAlertComponent,
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