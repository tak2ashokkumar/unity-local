import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { ZabbixEventsComponent } from "../../zabbix-events/zabbix-events.component";
import { ZabbixGraphCrudComponent } from '../../zabbix-graph-crud/zabbix-graph-crud.component';
import { ZabbixTriggerCrudComponent } from '../../zabbix-trigger-crud/zabbix-trigger-crud.component';
import { ZabbixTriggerScriptsComponent } from "../../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { ZabbixTriggersComponent } from '../../zabbix-triggers/zabbix-triggers.component';
import { ZabbixStorageDetailsComponent } from './zabbix-storage-details/zabbix-storage-details.component';
import { SharedInterfaceDetailsComponent } from "src/app/shared/shared-interface-details/shared-interface-details.component";
import { ZabbixGraphsComponent } from "../../zabbix-graphs/zabbix-graphs.component";
import { DeviceOverviewComponent } from "../../device-overview/device-overview.component";


export const ZABBIX_STORAGE_ROUTES: Routes = [
  {
    path: 'details',
    component: ZabbixStorageDetailsComponent,
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
  },
  {
    path: 'overview',
    component: DeviceOverviewComponent,
    data: {
      breadcrumb: {
        title: 'Overview',
        stepbackCount: 0
      }
    }
  }
]
