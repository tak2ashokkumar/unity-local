import { Routes } from "@angular/router";
import { ZabbixEventsComponent } from "../zabbix-events/zabbix-events.component";
import { ZabbixTriggerCrudComponent } from "../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggersComponent } from "../zabbix-triggers/zabbix-triggers.component";
import { ZabbixGcpGraphsCrudComponent } from "./zabbix-gcp-graphs-crud/zabbix-gcp-graphs-crud.component";
import { ZabbixGcpGraphsComponent } from "./zabbix-gcp-graphs/zabbix-gcp-graphs.component";
import { ZabbixGcpMonitoringConfigComponent } from "./zabbix-gcp-monitoring-config/zabbix-gcp-monitoring-config.component";
import { ZabbixGraphCrudComponent } from "../zabbix-graph-crud/zabbix-graph-crud.component";

export const ZABBIX_GCP_ACCOUNT_ROUTES: Routes = [
    {
        path: 'monitoring-graphs',
        component: ZabbixGcpGraphsComponent,
        data: {
            breadcrumb: {
                title: 'Graphs',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'manage-graphs',
        component: ZabbixGraphCrudComponent,
        data: {
            breadcrumb: {
                title: 'Create Graph',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'events',
        component: ZabbixEventsComponent,
        data: {
            breadcrumb: {
                title: 'Events',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'configure',
        component: ZabbixGcpMonitoringConfigComponent,
        data: {
            breadcrumb: {
                title: 'Configuration',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'triggers',
        component: ZabbixTriggersComponent,
        data: {
            breadcrumb: {
                title: 'Triggers',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'triggers/crud',
        component: ZabbixTriggerCrudComponent,
        data: {
            breadcrumb: {
                title: 'Triggers',
                stepbackCount: 0
            }
        },
    }
]