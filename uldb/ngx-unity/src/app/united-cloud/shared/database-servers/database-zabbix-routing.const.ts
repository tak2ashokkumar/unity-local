import { Routes } from "@angular/router";
import { ZabbixGraphCrudComponent } from '../zabbix-graph-crud/zabbix-graph-crud.component';
import { ZabbixTriggerCrudComponent } from '../zabbix-trigger-crud/zabbix-trigger-crud.component';
import { ZabbixTriggersComponent } from "../zabbix-triggers/zabbix-triggers.component";
import { DatabaseMonitoringConfigComponent } from "./database-monitoring/database-monitoring-config/database-monitoring-config.component";
import { DatabaseMonitoringGraphsComponent } from "./database-monitoring/database-monitoring-graphs/database-monitoring-graphs.component";
import { DatabaseMonitoringComponent } from "./database-monitoring/database-monitoring.component";
import { DatabaseServersComponent } from "./database-servers.component";
import { ZabbixTriggerScriptsComponent } from "../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { ZabbixGraphsComponent } from "../zabbix-graphs/zabbix-graphs.component";
import { ZabbixEventsComponent } from "../zabbix-events/zabbix-events.component";
import { DatabaseZabbixDetailsComponent } from "./database-monitoring/database-zabbix-details/database-zabbix-details.component";
import { DatabaseDetailsComponent } from "./database-monitoring/database-zabbix-details/database-details/database-details.component";

export const ZABBIX_DBS_ROUTES: Routes = [
  {
    path: 'databases',
    component: DatabaseServersComponent,
    data: {
      breadcrumb: {
        title: 'Databases',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'databases/:deviceid',
    component: DatabaseMonitoringComponent,
    data: {
      breadcrumb: {
        title: 'Monitoring',
        stepbackCount: 1
      }
    },
    children: [
      {
        path: 'details',
        component: DatabaseZabbixDetailsComponent,
        data: {
          breadcrumb: {
            title: 'Details',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'details/database_details/:entityId',
        component: DatabaseDetailsComponent,
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
            title: 'Manage Graphs',
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
        component: DatabaseMonitoringConfigComponent,
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
  }
]