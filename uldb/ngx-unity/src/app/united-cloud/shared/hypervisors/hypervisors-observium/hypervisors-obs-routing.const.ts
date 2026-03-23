import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { HypervisorAlertComponent } from "./hypervisor-alert/hypervisor-alert.component";
import { HypervisorGraphNetstatsComponent } from "./hypervisor-graph/hypervisor-graph-netstats/hypervisor-graph-netstats.component";
import { HypervisorGraphPollerComponent } from "./hypervisor-graph/hypervisor-graph-poller/hypervisor-graph-poller.component";
import { HypervisorGraphSystemComponent } from "./hypervisor-graph/hypervisor-graph-system/hypervisor-graph-system.component";
import { HypervisorGraphComponent } from "./hypervisor-graph/hypervisor-graph.component";
import { HypervisorHealthDiskioComponent } from "./hypervisor-health/hypervisor-health-diskio/hypervisor-health-diskio.component";
import { HypervisorHealthOverviewComponent } from "./hypervisor-health/hypervisor-health-overview/hypervisor-health-overview.component";
import { HypervisorHealthStorageComponent } from "./hypervisor-health/hypervisor-health-storage/hypervisor-health-storage.component";
import { HypervisorHealthComponent } from "./hypervisor-health/hypervisor-health.component";
import { HypervisorOverviewComponent } from "./hypervisor-overview/hypervisor-overview.component";
import { HypervisorPortGraphsComponent } from "./hypervisor-port/hypervisor-port-graphs/hypervisor-port-graphs.component";
import { HypervisorPortUsageGraphsComponent } from "./hypervisor-port/hypervisor-port-graphs/hypervisor-port-usage-graphs/hypervisor-port-usage-graphs.component";
import { HypervisorPortComponent } from "./hypervisor-port/hypervisor-port.component";

export const OBSERVIUM_HYPERVISOR_ROUTES: Routes = [
    {
        path: 'overview',
        component: HypervisorOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: HypervisorGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'netstats',
                component: HypervisorGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: HypervisorGraphPollerComponent
            },
            {
                path: 'system',
                component: HypervisorGraphSystemComponent
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
        component: HypervisorHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: HypervisorHealthOverviewComponent
            },
            {
                path: 'storage',
                component: HypervisorHealthStorageComponent
            },
            {
                path: 'disk_io',
                component: HypervisorHealthDiskioComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            },
            {
                path: 'storage/details',
                component: GraphDetailsComponent
            },
            {
                path: 'disk_io/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: HypervisorPortComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: HypervisorPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: HypervisorPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: HypervisorAlertComponent,
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