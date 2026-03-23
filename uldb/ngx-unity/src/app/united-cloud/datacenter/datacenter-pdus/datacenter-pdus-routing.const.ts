import { Routes } from "@angular/router";
import { DeviceTabComponent } from "../../shared/device-tab/device-tab.component";
import { OBSERVIUM_PDU_ROUTES } from "./datacenter-pdus-observium/datacenter-pdus-obs-routing.const";
import { DatacenterPdusZabbixComponent } from "./datacenter-pdus-zabbix/datacenter-pdus-zabbix.component";
import { ZABBIX_DC_PDU_ROUTES } from "./datacenter-pdus-zabbix/zabbix-dc-pdu-routing.const";
import { DatacenterPdusComponent } from "./datacenter-pdus.component";



/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const DC_PDU_ROUTES: Routes = [
    {
        path: 'pdus',
        component: DatacenterPdusComponent,
        data: {
            breadcrumb: {
                title: 'PDUs'
            }
        }
    },
    {
        path: 'pdus/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'PDUs',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_PDU_ROUTES
    },
    {
        path: 'pdus/:deviceid/zbx',
        component: DatacenterPdusZabbixComponent,
        data: {
            breadcrumb: {
                title: 'PDUs',
                stepbackCount: 2
            }
        },
        children: ZABBIX_DC_PDU_ROUTES
    }
]