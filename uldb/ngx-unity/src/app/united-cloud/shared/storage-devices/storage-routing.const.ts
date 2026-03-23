import { Routes } from "@angular/router";
import { ConsoleAccessComponent } from "src/app/shared/console-access/console-access.component";
import { DeviceTabComponent } from "../device-tab/device-tab.component";
import { WebAccessComponent } from "../web-access/web-access.component";
import { StorageDevicesComponent } from "./storage-devices.component";
import { OBSERVIUM_STORAGE_ROUTES } from "./storage-observium/storage-obs-routing.const";
import { ONTAP_ROUTES } from "./storage-ontap/storage-ontap-routing.const";
import { PureStorageHostGroupsComponent } from "./storage-pure/pure-storage-host-groups/pure-storage-host-groups.component";
import { PureStorageHostsComponent } from "./storage-pure/pure-storage-hosts/pure-storage-hosts.component";
import { PureStoragePodsComponent } from "./storage-pure/pure-storage-pods/pure-storage-pods.component";
import { PureStorageProtectionGroupSnapshotsComponent } from "./storage-pure/pure-storage-protection-group-snapshots/pure-storage-protection-group-snapshots.component";
import { PureStorageProtectionGroupsComponent } from "./storage-pure/pure-storage-protection-groups/pure-storage-protection-groups.component";
import { PureStorageVolumeGroupsComponent } from "./storage-pure/pure-storage-volume-groups/pure-storage-volume-groups.component";
import { PureStorageVolumeSnapshotsComponent } from "./storage-pure/pure-storage-volume-snapshots/pure-storage-volume-snapshots.component";
import { PureStorageVolumesComponent } from "./storage-pure/pure-storage-volumes/pure-storage-volumes.component";
import { StoragePureComponent } from "./storage-pure/storage-pure.component";
import { ZABBIX_STORAGE_ROUTES } from "./storage-zabbix/storage-zabbix-routing.const";
import { StorageZabbixComponent } from "./storage-zabbix/storage-zabbix.component";

/**
 * THIS SECTION IS RELATED TO ALL DEVICES ROUTES
 */
export const ALL_DEVICES_STORAGE_ROUTES: Routes = [

    {
        path: 'alldevices/storagedevices/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'alldevices/storagedevices/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'alldevices/storagedevices/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: OBSERVIUM_STORAGE_ROUTES
    },
    {
        path: 'alldevices/storagedevices/:deviceid/zbx',
        component: StorageZabbixComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 3
            }
        },
        children: ZABBIX_STORAGE_ROUTES
    }
]

/**
 * THIS SECTION IS RELATED TO PRIVATE CLOUD ROUTES
 */

export const PURE_STORAGE_DETAILS_ROUTES: Routes = [
    {
        path: 'storagedevices/:deviceid/arrays',
        component: StoragePureComponent,
        data: {
            breadcrumb: {
                title: 'Storage',
                stepbackCount: 2
            }
        },
        children: [
            {
                path: ':arrayId/hosts',
                component: PureStorageHostsComponent,
                data: {
                    breadcrumb: {
                        title: 'Hosts',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/host-groups',
                component: PureStorageHostGroupsComponent,
                data: {
                    breadcrumb: {
                        title: 'Host Groups',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/volumes',
                component: PureStorageVolumesComponent,
                data: {
                    breadcrumb: {
                        title: 'Volumes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/volume-groups',
                component: PureStorageVolumeGroupsComponent,
                data: {
                    breadcrumb: {
                        title: 'Volume Groups',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/volume-snapshots',
                component: PureStorageVolumeSnapshotsComponent,
                data: {
                    breadcrumb: {
                        title: 'Volume Snapshots',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/protection-groups',
                component: PureStorageProtectionGroupsComponent,
                data: {
                    breadcrumb: {
                        title: 'Protection Groups',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/protection-group-snapshots',
                component: PureStorageProtectionGroupSnapshotsComponent,
                data: {
                    breadcrumb: {
                        title: 'Protection Group Snapshots',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: ':arrayId/pods',
                component: PureStoragePodsComponent,
                data: {
                    breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 0
                    }
                }
            },
        ]
    }
]

export const STORAGE_ROUTES: Routes = [
    {
        path: 'storagedevices',
        component: StorageDevicesComponent,
        data: {
            breadcrumb: {
                title: 'Storage Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'storagedevices/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'storagedevices/:deviceId/console',
        component: ConsoleAccessComponent
    },
    {
        path: 'storagedevices/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
            breadcrumb: {
                title: 'Storage',
                stepbackCount: 2
            }
        },
        children: OBSERVIUM_STORAGE_ROUTES
    },
    {
        path: 'storagedevices/:deviceid/zbx',
        component: StorageZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Storage',
                stepbackCount: 2
            }
        },
        children: ZABBIX_STORAGE_ROUTES
    },
    ...ONTAP_ROUTES,
    ...PURE_STORAGE_DETAILS_ROUTES
]