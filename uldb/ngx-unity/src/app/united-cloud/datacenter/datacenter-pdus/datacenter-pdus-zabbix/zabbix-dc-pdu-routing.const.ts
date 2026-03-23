import { Routes } from "@angular/router";
import { DevicesMonitoringConfigComponent } from "src/app/united-cloud/shared/devices-monitoring-config/devices-monitoring-config.component";
import { ZabbixEventsComponent } from "src/app/united-cloud/shared/zabbix-events/zabbix-events.component";
import { ZabbixGraphCrudComponent } from 'src/app/united-cloud/shared/zabbix-graph-crud/zabbix-graph-crud.component';
import { ZabbixTriggerCrudComponent } from 'src/app/united-cloud/shared/zabbix-trigger-crud/zabbix-trigger-crud.component';
import { ZabbixTriggersComponent } from 'src/app/united-cloud/shared/zabbix-triggers/zabbix-triggers.component';
import { ZabbixDcPduDetailsComponent } from './zabbix-dc-pdu-details/zabbix-dc-pdu-details.component';
import { ZabbixDcPduGraphsComponent } from "./zabbix-dc-pdu-graphs/zabbix-dc-pdu-graphs.component";
import { ZabbixGraphsComponent } from "src/app/united-cloud/shared/zabbix-graphs/zabbix-graphs.component";


export const ZABBIX_DC_PDU_ROUTES: Routes = [
  {
    path: 'details',
    component: ZabbixDcPduDetailsComponent,
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
    },
  }
]