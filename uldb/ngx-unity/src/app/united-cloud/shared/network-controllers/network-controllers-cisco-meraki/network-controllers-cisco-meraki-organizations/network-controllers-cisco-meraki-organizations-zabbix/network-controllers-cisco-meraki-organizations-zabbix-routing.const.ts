import { Routes } from "@angular/router";
import { ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsComponent } from "./zabbix-network-controllers-cisco-meraki-organizations-details/zabbix-network-controllers-cisco-meraki-organizations-details.component";
import { ZabbixGraphsComponent } from "src/app/united-cloud/shared/zabbix-graphs/zabbix-graphs.component";
import { ZabbixGraphCrudComponent } from "src/app/united-cloud/shared/zabbix-graph-crud/zabbix-graph-crud.component";
import { ZabbixEventsComponent } from "src/app/united-cloud/shared/zabbix-events/zabbix-events.component";
import { ZabbixTriggersComponent } from "src/app/united-cloud/shared/zabbix-triggers/zabbix-triggers.component";
import { ZabbixTriggerCrudComponent } from "src/app/united-cloud/shared/zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggerScriptsComponent } from "src/app/united-cloud/shared/zabbix-trigger-scripts/zabbix-trigger-scripts.component";

export const ZABBIX_CISCO_MERAKI_ORGANIZATION_ROUTES: Routes = [
  {
    path: 'details',
    component: ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsComponent,
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
