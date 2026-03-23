import { Routes } from "@angular/router";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { MacMiniComponent } from "./mac-mini.component";
import { OBSERVIUM_MACMINI_ROUTES } from "./macmini-observium/macmini-obs-routing.const";
import { ZABBIX_MACMINI_ROUTES } from "./macmini-zabbix/macmini-zabbix-routing.const";
import { MacminiZabbixComponent } from "./macmini-zabbix/macmini-zabbix.component";


/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
 export const ALL_DEVICES_MACMINI_ROUTES: Routes = [
    
    {
        path: 'alldevices/macdevices/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_MACMINI_ROUTES
    },
    {
        path: 'alldevices/macdevices/:deviceid/zbx',
        component: MacminiZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_MACMINI_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const MACMINI_ROUTES: Routes = [
    {
        path: 'macdevices',
        component: MacMiniComponent,
        data: {
            breadcrumb: {
                title: 'Mac Mini',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'macdevices/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Mac Mini',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_MACMINI_ROUTES
    },
    {
        path: 'macdevices/:deviceid/zbx',
        component: MacminiZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Mac Mini',
                stepbackCount: 2
            }
        },
        children: ZABBIX_MACMINI_ROUTES
    }
]