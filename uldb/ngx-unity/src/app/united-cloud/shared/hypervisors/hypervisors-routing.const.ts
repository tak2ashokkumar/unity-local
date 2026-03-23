import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { VMS_ROUTES } from "../vms/vms-routing.const";
import { WebAccessComponent } from "../web-access/web-access.component";
import { HypervisorsEsxiPlaceholderComponent } from "./hypervisors-observium/hypervisors-esxi-placeholder/hypervisors-esxi-placeholder.component";
import { HypervisorsEsxiVmsComponent } from "./hypervisors-observium/hypervisors-esxi-vms/hypervisors-esxi-vms.component";
import { OBSERVIUM_HYPERVISOR_ROUTES } from "./hypervisors-observium/hypervisors-obs-routing.const";
import { ZABBIX_HYPERVISOR_ROUTES } from "./hypervisors-zabbix/hypervisors-zabbix-routing.const";
import { HypervisorsZabbixComponent } from "./hypervisors-zabbix/hypervisors-zabbix.component";
import { HypervisorsComponent } from "./hypervisors.component";

/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
export const ALL_DEVICES_HYPERVISOR_ROUTES: Routes = [
    {
        path: 'alldevices/hypervisors/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/hypervisors/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/hypervisors/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_HYPERVISOR_ROUTES
    },
    {
        path: 'alldevices/hypervisors/:deviceid/zbx',
        component: HypervisorsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_HYPERVISOR_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const HYPERVISOR_ROUTES: Routes = [
    {
        path: 'hypervisors',
        component: HypervisorsComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'hypervisors/:deviceId',
        component: HypervisorsEsxiPlaceholderComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 1
            }
        },
        children: VMS_ROUTES
    },
    {
        path: 'hypervisors/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'hypervisors/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'hypervisors/:deviceId/vms',
        component: HypervisorsEsxiVmsComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 2
            }
        }
    },
    {
        path: 'hypervisors/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_HYPERVISOR_ROUTES
    },
    {
        path: 'hypervisors/:deviceid/zbx',
        component: HypervisorsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Hypervisors',
                stepbackCount: 2
            }
        },
        children: ZABBIX_HYPERVISOR_ROUTES
    }
]