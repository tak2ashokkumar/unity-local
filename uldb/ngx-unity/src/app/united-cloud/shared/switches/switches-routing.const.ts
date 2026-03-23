import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { WebAccessComponent } from "../web-access/web-access.component";
import { OBSERVIUM_SWITCH_ROUTES } from "./switches-observium/switches-obs-routing.const";
import { ZABBIX_SWITCH_ROUTES } from "./switches-zabbix/switches-zabbix-routing.const";
import { SwitchesZabbixComponent } from "./switches-zabbix/switches-zabbix.component";
import { SwitchesComponent } from "./switches.component";

/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
export const ALL_DEVICES_SWITCH_ROUTES: Routes = [

    {
        path: 'alldevices/switches/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/switches/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/switches/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_SWITCH_ROUTES
    },
    {
        path: 'alldevices/switches/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_SWITCH_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const SWITCH_ROUTES: Routes = [
    {
        path: 'switches',
        component: SwitchesComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'switches/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'switches/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'switches/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_SWITCH_ROUTES
    },
    {
        path: 'switches/:deviceid/zbx',
        component: SwitchesZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Switches',
                stepbackCount: 2
            }
        },
        children: ZABBIX_SWITCH_ROUTES
    }
]