import { Routes } from "@angular/router";
import { ZabbixSdwanDeviceDetailsComponent } from "./zabbix-sdwan-device-details/zabbix-sdwan-device-details.component";
import { ZabbixEventsComponent } from "../../../zabbix-events/zabbix-events.component";
import { ZabbixTriggersComponent } from "../../../zabbix-triggers/zabbix-triggers.component";
import { ZabbixTriggerCrudComponent } from "../../../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggerScriptsComponent } from "../../../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { ZabbixGraphsComponent } from "../../../zabbix-graphs/zabbix-graphs.component";
import { ZabbixGraphCrudComponent } from "../../../zabbix-graph-crud/zabbix-graph-crud.component";


// device level no configure page
export const ZABBIX_SDWAN_DEVICES_ROUTES: Routes = [
  {
    path: 'details',
    component: ZabbixSdwanDeviceDetailsComponent,
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
