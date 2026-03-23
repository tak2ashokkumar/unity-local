import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { WebAccessComponent } from "../web-access/web-access.component";
import { OBSERVIUM_LOADBALANCER_ROUTES } from "./loadbalancers-observium/loadbalancers-obs-routing.const";
import { ZABBIX_LOADBALANCERS_ROUTES } from "./loadbalancers-zabbix/loadbalancers-zabbix-routing.const";
import { LoadbalancersZabbixComponent } from "./loadbalancers-zabbix/loadbalancers-zabbix.component";
import { LoadbalancersComponent } from "./loadbalancers.component";

/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
 export const ALL_DEVICES_LOADBALANCER_ROUTES: Routes = [
    {
        path: 'alldevices/loadbalancers/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/loadbalancers/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/loadbalancers/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_LOADBALANCER_ROUTES
    },
    {
        path: 'alldevices/loadbalancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const LOADBALANCER_ROUTES: Routes = [
    {
        path: 'loadbalancers',
        component: LoadbalancersComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'loadbalancers/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'loadbalancers/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'loadbalancers/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_LOADBALANCER_ROUTES
    },
    {
        path: 'loadbalancers/:deviceid/zbx',
        component: LoadbalancersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Load Balancers',
                stepbackCount: 2
            }
        },
        children: ZABBIX_LOADBALANCERS_ROUTES
    }
]