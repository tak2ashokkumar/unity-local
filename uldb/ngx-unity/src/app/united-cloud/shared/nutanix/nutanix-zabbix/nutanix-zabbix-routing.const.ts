import { Routes } from "@angular/router";
import { ZabbixGraphCrudComponent } from "../../zabbix-graph-crud/zabbix-graph-crud.component";
import { ZabbixTriggersComponent } from "../../zabbix-triggers/zabbix-triggers.component";
import { ZabbixTriggerCrudComponent } from "../../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggerScriptsComponent } from "../../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { NutanixDetailsComponent } from "./nutanix-details/nutanix-details.component";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { ZabbixGraphsComponent } from "../../zabbix-graphs/zabbix-graphs.component";
import { ZabbixEventsComponent } from "../../zabbix-events/zabbix-events.component";

export const NUTANIX_ZABBIX_ROUTES: Routes = [
    {
        path: 'details',
        component: NutanixDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'monitoring-graphs',
        component: ZabbixGraphsComponent,
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
      component: DevicesMonitoringConfigComponent,
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
        }
    },
    {
        path: 'triggers/crud/scripts',
        component: ZabbixTriggerScriptsComponent,
        data: {
            breadcrumb: {
                title: 'Scripts',
                stepbackCount: 0
            }
        }
    }
]