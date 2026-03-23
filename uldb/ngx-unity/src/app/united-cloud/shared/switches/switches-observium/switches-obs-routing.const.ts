import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { SwitchesAlertComponent } from "./switches-alert/switches-alert.component";
import { SwitchesGraphNetstatsComponent } from "./switches-graph/switches-graph-netstats/switches-graph-netstats.component";
import { SwitchesGraphPollerComponent } from "./switches-graph/switches-graph-poller/switches-graph-poller.component";
import { SwitchesGraphSystemComponent } from "./switches-graph/switches-graph-system/switches-graph-system.component";
import { SwitchesGraphComponent } from "./switches-graph/switches-graph.component";
import { SwitchesHealthOverviewComponent } from "./switches-health/switches-health-overview/switches-health-overview.component";
import { SwitchesHealthComponent } from "./switches-health/switches-health.component";
import { SwitchesOverviewComponent } from "./switches-overview/switches-overview.component";
import { SwitchPortGraphsComponent } from "./switches-port/switch-port-graphs/switch-port-graphs.component";
import { SwitchPortUsageGraphsComponent } from "./switches-port/switch-port-graphs/switch-port-usage-graphs/switch-port-usage-graphs.component";
import { SwitchesPortComponent } from "./switches-port/switches-port.component";

export const OBSERVIUM_SWITCH_ROUTES: Routes = [
    {
        path: 'overview',
        component: SwitchesOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Switch Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: SwitchesGraphComponent,
        data: {
            breadcrumb: {
                title: 'Switch Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: SwitchesGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: SwitchesGraphPollerComponent
            },
            {
                path: 'system',
                component: SwitchesGraphSystemComponent
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
        component: SwitchesHealthComponent,
        data: {
            breadcrumb: {
                title: 'Switch Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: SwitchesHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: SwitchesPortComponent,
        data: {
            breadcrumb: {
                title: 'Switch Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: SwitchPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: SwitchPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: SwitchesAlertComponent,
        data: {
            breadcrumb: {
                title: 'Switch Alerts',
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