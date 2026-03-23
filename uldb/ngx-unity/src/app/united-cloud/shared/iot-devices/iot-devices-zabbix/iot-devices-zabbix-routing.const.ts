import { Routes } from "@angular/router";
import { ZabbixGraphsComponent } from "../../zabbix-graphs/zabbix-graphs.component";
import { ZabbixGraphCrudComponent } from "../../zabbix-graph-crud/zabbix-graph-crud.component";
import { ZabbixEventsComponent } from "../../zabbix-events/zabbix-events.component";
import { DevicesMonitoringConfigComponent } from "../../devices-monitoring-config/devices-monitoring-config.component";
import { ZabbixTriggersComponent } from "../../zabbix-triggers/zabbix-triggers.component";
import { ZabbixTriggerCrudComponent } from "../../zabbix-trigger-crud/zabbix-trigger-crud.component";
import { ZabbixTriggerScriptsComponent } from "../../zabbix-trigger-scripts/zabbix-trigger-scripts.component";
import { ZabbixIotDeviceSensorDetailsComponent } from "./zabbix-iot-device-sensor-details/zabbix-iot-device-sensor-details.component";
import { ZabbixIotDeviceSmartPduDetailsComponent } from "./zabbix-iot-device-smart-pdu-details/zabbix-iot-device-smart-pdu-details.component";
import { ZabbixIotDeviceRfidReaderDetailsComponent } from "./zabbix-iot-device-rfid-reader-details/zabbix-iot-device-rfid-reader-details.component";
import { ZabbixIotDeviceSensorOverviewComponent } from "./zabbix-iot-device-sensor-overview/zabbix-iot-device-sensor-overview.component";

export const ZABBIX_IOT_DEVICE_ROUTES: Routes = [
    {
        path: 'sensor-overview',
        component: ZabbixIotDeviceSensorOverviewComponent,
        data: {
            breadcrumb: {
                title: 'Overview',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'sensor-details',
        component: ZabbixIotDeviceSensorDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'smart-pdu-details',
        component: ZabbixIotDeviceSmartPduDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'rfid-reader-details',
        component: ZabbixIotDeviceRfidReaderDetailsComponent,
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