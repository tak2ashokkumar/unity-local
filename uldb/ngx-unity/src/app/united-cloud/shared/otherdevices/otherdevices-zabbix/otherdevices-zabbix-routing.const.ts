import { Routes } from "@angular/router";
import { ZabbixEventsComponent } from "../../zabbix-events/zabbix-events.component";
import { ZabbixGraphCrudComponent } from "../../zabbix-graph-crud/zabbix-graph-crud.component";
import { ZabbixTriggerCrudComponent } from "../../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggerScriptsComponent } from "../../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { ZabbixTriggersComponent } from "../../zabbix-triggers/zabbix-triggers.component";
import { ZabbixOtherdeviceDetailsComponent } from "./zabbix-otherdevice-details/zabbix-otherdevice-details.component";
import { ZabbixOtherdeviceMonitoringConfigComponent } from "./zabbix-otherdevice-monitoring-config/zabbix-otherdevice-monitoring-config.component";
import { ZabbixGraphsComponent } from "../../zabbix-graphs/zabbix-graphs.component";

export const ZABBIX_OTHER_DEVICE_ROUTES: Routes = [
    {
      path: 'details',
      component: ZabbixOtherdeviceDetailsComponent,
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
      component: ZabbixOtherdeviceMonitoringConfigComponent,
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