import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { WebAccessComponent } from "../web-access/web-access.component";
import { VmsVmwareSnapshotsComponent } from "./vms-list-vmware/vms-vmware-snapshots/vms-vmware-snapshots.component";
import { OBSERVIUM_VMS_ROUTES } from "./vms-observium/vms-obs-routing.const";
import { ZABBIX_VMS_ROUTES } from "./vms-zabbix/vms-zabbix-routing.const";
import { VmsZabbixComponent } from "./vms-zabbix/vms-zabbix.component";
import { VmsComponent } from "./vms.component";
import { NutanixVmsDetailsComponent } from "./vms-list-nutanix/nutanix-vms-details/nutanix-vms-details.component";
import { VmBackupHistoryComponent } from "src/app/shared/vm-backup-history/vm-backup-history.component";
/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
export const ALL_DEVICES_VMS_ROUTES: Routes = [
    {
        path: 'alldevices/vms/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/vms/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/vms/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_VMS_ROUTES
    },
    {
        path: 'alldevices/vms/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_VMS_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */
export const VMS_ROUTES: Routes = [
    {
        path: 'vms',
        component: VmsComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'vms/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'vms/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'vms/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_VMS_ROUTES
    },
    {
        path: 'vms/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 2
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'vcenter',
        component: VmsComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'vcenter/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'vcenter/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'vcenter/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_VMS_ROUTES
    },
    {
        path: 'vcenter/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 2
            }
        },
        children: ZABBIX_VMS_ROUTES
    },
    {
        path: 'vcenter/:deviceid',
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 1
            }
        },
        children: [{
            path: 'snapshots',
            component: VmsVmwareSnapshotsComponent,
            data: {
                breadcrumb: {
                    title: 'Snapshots',
                    stepbackCount: 0
                }
            }
        }]
    },
    {
        path: 'vcenter/:backupId/vm-backup-history',
        component: VmBackupHistoryComponent,
        data: {
            breadcrumb: {
                title: 'VM Backup History',
                stepbackCount: 0
            }
        },
    },
    {
        path: 'vms/:vmId/details',
        component: NutanixVmsDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Virtual Machines',
                stepbackCount: 2
            }
        }
    }
]