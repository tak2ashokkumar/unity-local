import { Routes } from "@angular/router";
import { ZabbixEventsComponent } from "../zabbix-events/zabbix-events.component";
import { ZabbixGraphCrudComponent } from "../zabbix-graph-crud/zabbix-graph-crud.component";
import { ZabbixTriggerCrudComponent } from "../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggersComponent } from "../zabbix-triggers/zabbix-triggers.component";
import { ZabbixAwsMonitoringConfigComponent } from "./zabbix-aws-monitoring-config/zabbix-aws-monitoring-config.component";
import { ZabbixGraphsComponent } from "../zabbix-graphs/zabbix-graphs.component";

export const ZABBIX_AWS_ACCOUNT_ROUTES: Routes = [
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
    component: ZabbixAwsMonitoringConfigComponent,
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