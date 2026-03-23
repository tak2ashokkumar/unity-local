import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { WebAccessComponent } from "../web-access/web-access.component";
import { OBSERVIUM_BMS_ROUTES } from "./bm-servers-observium/bm-servers-obs-routing.const";
import { BmServersStatsTabComponent } from "./bm-servers-observium/bm-servers-stats-tab/bm-servers-stats-tab.component";
import { BmServersStatsComponent } from "./bm-servers-observium/bm-servers-stats-tab/bm-servers-stats/bm-servers-stats.component";
import { ZABBIX_BMS_ROUTES } from "./bm-servers-zabbix/bm-servers-zabbix-routing.const";
import { BmServersZabbixComponent } from "./bm-servers-zabbix/bm-servers-zabbix.component";
import { BmServersComponent } from "./bm-servers.component";


/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
export const ALL_DEVICES_BMS_ROUTES: Routes = [
    {
        path: 'alldevices/bmservers/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/bmservers/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/bmservers/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_BMS_ROUTES
    },
    {
        path: 'alldevices/bmservers/:deviceid',
        component: BmServersStatsTabComponent,
        data: {
            breadcrumb: {
                title: 'Stats',
                stepbackCount: 2
            }
        },
        children: [
            {
                path: 'stats',
                component: BmServersStatsComponent
            }
        ]
    },
    {
        path: 'alldevices/bmservers/:deviceid/zbx',
        component: BmServersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_BMS_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const BMS_ROUTES: Routes = [
    {
        path: 'bmservers',
        component: BmServersComponent,
        data: {
            breadcrumb: {
                title: 'Bare Metal Servers',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'bmservers/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'bmservers/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'bmservers/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Bare Metal Servers',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_BMS_ROUTES
    },
    {
        path: 'bmservers/:deviceid',
        component: BmServersStatsTabComponent,
        data: {
            breadcrumb: {
                title: 'Stats',
                stepbackCount: 1
            }
        },
        children: [
            {
                path: 'stats',
                component: BmServersStatsComponent
            }
        ]
    },
    {
        path: 'bmservers/:deviceid/zbx',
        component: BmServersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Bare Metal Servers',
                stepbackCount: 2
            }
        },
        children: ZABBIX_BMS_ROUTES
    }
]