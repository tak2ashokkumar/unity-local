import { Routes } from "@angular/router"
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component"
import { DeviceTabComponent } from "../device-tab/device-tab.component"
import { WebAccessComponent } from "../web-access/web-access.component"
import { OBSERVIUM_FIREWALL_ROUTES } from "./firewalls-observium/firewalls-obs-routing.const"
import { ZABBIX_FIREWALLS_ROUTES } from "./firewalls-zabbix/firewalls-zabbix-routing.const"
import { FirewallsZabbixComponent } from "./firewalls-zabbix/firewalls-zabbix.component"
import { FirewallsComponent } from "./firewalls.component"

/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
 export const ALL_DEVICES_FIREWALL_ROUTES: Routes = [
    {
        path: 'alldevices/firewalls/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/firewalls/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/firewalls/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_FIREWALL_ROUTES
    },
    {
        path: 'alldevices/firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_FIREWALLS_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const FIREWALL_ROUTES: Routes = [
    {
        path: 'firewalls',
        component: FirewallsComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'firewalls/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'firewalls/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'firewalls/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_FIREWALL_ROUTES
    },
    {
        path: 'firewalls/:deviceid/zbx',
        component: FirewallsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Firewalls',
                stepbackCount: 2
            }
        },
        children: ZABBIX_FIREWALLS_ROUTES
    }
]