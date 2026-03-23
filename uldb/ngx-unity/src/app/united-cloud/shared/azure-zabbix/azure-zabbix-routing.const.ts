import { Routes } from "@angular/router";
import { ZabbixEventsComponent } from "../zabbix-events/zabbix-events.component";
import { ZabbixGraphsComponent } from "../zabbix-graphs/zabbix-graphs.component";
import { ZabbixTriggerCrudComponent } from "../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggersComponent } from "../zabbix-triggers/zabbix-triggers.component";
import { ZabbixAzureGraphsCrudComponent } from "./zabbix-azure-graphs-crud/zabbix-azure-graphs-crud.component";
import { ZabbixAzureMonitoringConfigComponent } from "./zabbix-azure-monitoring-config/zabbix-azure-monitoring-config.component";
import { DevicesMonitoringConfigComponent } from "../devices-monitoring-config/devices-monitoring-config.component";

export const ZABBIX_AZURE_ACCOUNT_ROUTES: Routes = [
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
    component: ZabbixAzureGraphsCrudComponent,
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
    component: ZabbixAzureMonitoringConfigComponent,
    data: {
      breadcrumb: {
        title: 'Configuration',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'configureAzure',
    component: DevicesMonitoringConfigComponent,
    data: {
      breadcrumb: {
        title: 'Azure Configuration',
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