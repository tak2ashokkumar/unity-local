import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "src/app/united-cloud/shared/devices-monitoring-config/devices-monitoring-config.component";
import { GraphDetailsComponent } from "src/app/united-cloud/shared/graph-details/graph-details.component";
import { DatacenterPdusAlertComponent } from "./datacenter-pdus-alert/datacenter-pdus-alert.component";
import { DatacenterPdusGraphNetstatsComponent } from "./datacenter-pdus-graph/datacenter-pdus-graph-netstats/datacenter-pdus-graph-netstats.component";
import { DatacenterPdusGraphPollerComponent } from "./datacenter-pdus-graph/datacenter-pdus-graph-poller/datacenter-pdus-graph-poller.component";
import { DatacenterPdusGraphSystemComponent } from "./datacenter-pdus-graph/datacenter-pdus-graph-system/datacenter-pdus-graph-system.component";
import { DatacenterPdusGraphComponent } from "./datacenter-pdus-graph/datacenter-pdus-graph.component";
import { DatacenterPdusHealthOverviewComponent } from "./datacenter-pdus-health/datacenter-pdus-health-overview/datacenter-pdus-health-overview.component";
import { DatacenterPdusHealthComponent } from "./datacenter-pdus-health/datacenter-pdus-health.component";
import { DatacenterPdusOverviewComponent } from "./datacenter-pdus-overview/datacenter-pdus-overview.component";
import { DatacenterPduPortGraphsComponent } from "./datacenter-pdus-port/datacenter-pdu-port-graphs/datacenter-pdu-port-graphs.component";
import { DatacenterPduPortUsageGraphsComponent } from "./datacenter-pdus-port/datacenter-pdu-port-graphs/datacenter-pdu-port-usage-graphs/datacenter-pdu-port-usage-graphs.component";
import { DatacenterPdusPortComponent } from "./datacenter-pdus-port/datacenter-pdus-port.component";

export const OBSERVIUM_PDU_ROUTES: Routes = [
    {
        path: 'overview',
        component: DatacenterPdusOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview'
            }
        }
    },
    {
        path: 'graphs',
        component: DatacenterPdusGraphComponent,
        data: {
            breadcrumb: {
                title: 'Graphs'
            }
        },
        children: [
            {
                path: 'netstats',
                component: DatacenterPdusGraphNetstatsComponent
            },
            {
                path: 'poller',
                component: DatacenterPdusGraphPollerComponent
            },
            {
                path: 'system',
                component: DatacenterPdusGraphSystemComponent
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
        component: DatacenterPdusHealthComponent,
        data: {
            breadcrumb: {
                title: 'Health'
            }
        },
        children: [
            {
                path: 'overview',
                component: DatacenterPdusHealthOverviewComponent
            },
            {
                path: 'overview/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'ports',
        component: DatacenterPdusPortComponent,
        data: {
            title: 'Ports'
        }
    },
    {
        path: 'ports/:portId',
        component: DatacenterPduPortGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Ports',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'usage',
                component: DatacenterPduPortUsageGraphsComponent,
            },
            {
                path: 'usage/details',
                component: GraphDetailsComponent
            }
        ]
    },
    {
        path: 'alerts',
        component: DatacenterPdusAlertComponent,
        data: {
            title: 'Alerts'
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