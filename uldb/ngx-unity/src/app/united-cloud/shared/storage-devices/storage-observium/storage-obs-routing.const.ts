import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "../../graph-details/graph-details.component";
import { StorageAlertComponent } from "./storage-alert/storage-alert.component";
import { StorageGraphPollerComponent } from "./storage-graph/storage-graph-poller/storage-graph-poller.component";
import { StorageGraphStorageComponent } from "./storage-graph/storage-graph-storage/storage-graph-storage.component";
import { StorageGraphSystemComponent } from "./storage-graph/storage-graph-system/storage-graph-system.component";
import { StorageGraphComponent } from "./storage-graph/storage-graph.component";
import { StorageHealthDiskIOComponent } from "./storage-health/storage-health-diskio/storage-health-diskio.component";
import { StorageHealthOverviewComponent } from "./storage-health/storage-health-overview/storage-health-overview.component";
import { StorageHealthComponent } from "./storage-health/storage-health.component";
import { StorageOverviewComponent } from "./storage-overview/storage-overview.component";
import { StoragePortGraphsComponent } from "./storage-port/storage-port-graphs/storage-port-graphs.component";
import { StoragePortUsageGraphsComponent } from "./storage-port/storage-port-graphs/storage-port-usage-graphs/storage-port-usage-graphs.component";
import { StoragePortComponent } from "./storage-port/storage-port.component";


export const OBSERVIUM_STORAGE_ROUTES: Routes = [
    {
        path: 'overview',
        component: StorageOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'graphs',
        component: StorageGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'storage',
                component: StorageGraphStorageComponent
            },
            {
                path: 'poller',
                component: StorageGraphPollerComponent
            },
            {
                path: 'system',
                component: StorageGraphSystemComponent
            },
            {
                path: 'storage/details',
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
        ]
    },
    {
        path: 'health',
        component: StorageHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'overview',
                component: StorageHealthOverviewComponent
            },
            {
                path: 'disk_io',
                component: StorageHealthDiskIOComponent
            },
            {
                path: 'overview/details',
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
        component: StoragePortComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'ports/:portId',
        component: StoragePortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: StoragePortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: StorageAlertComponent,
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