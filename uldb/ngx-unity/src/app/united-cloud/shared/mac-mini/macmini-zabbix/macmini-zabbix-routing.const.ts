import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { ZabbixEventsComponent } from "../../zabbix-events/zabbix-events.component";
import { ZabbixTriggerCrudComponent } from '../../zabbix-trigger-crud/zabbix-trigger-crud.component';
import { ZabbixTriggersComponent } from "../../zabbix-triggers/zabbix-triggers.component";
import { ZabbixMacminiDetailsComponent } from './zabbix-macmini-details/zabbix-macmini-details.component';
import { ZabbixMacminiGraphCrudComponent } from "./zabbix-macmini-graph-crud/zabbix-macmini-graph-crud.component";
import { SharedInterfaceDetailsComponent } from "src/app/shared/shared-interface-details/shared-interface-details.component";
import { ZabbixGraphsComponent } from "../../zabbix-graphs/zabbix-graphs.component";

export const ZABBIX_MACMINI_ROUTES: Routes = [
  {
    path: 'details',
    component: ZabbixMacminiDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Details',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'details/interface-details/:interfaceId',
    component: SharedInterfaceDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Interface Details',
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
    component: ZabbixMacminiGraphCrudComponent,
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
    },
  }
]