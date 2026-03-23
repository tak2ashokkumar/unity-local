import { Routes, UrlSegment } from '@angular/router';
import { UsiPcVmwareVcenterCrudComponent } from 'src/app/unity-setup/unity-setup-integration/usi-private-clouds/usi-pc-vmware-vcenter-crud/usi-pc-vmware-vcenter-crud.component';
import { AllDevicesComponent } from './all-devices/all-devices.component';
import { ALL_DEVICES_BMS_ROUTES, BMS_ROUTES } from './bm-servers/bm-servers-routing.const';
import { ZABBIX_CONTAINER_CONTROLLER_ROUTES } from './container-controllers/container-controllers-zabbix/container-controllers-zabbix-routing.const';
import { ContainerControllersZabbixComponent } from './container-controllers/container-controllers-zabbix/container-controllers-zabbix.component';
import { ContainerControllersComponent } from './container-controllers/container-controllers.component';
import { DockerContainerComponent } from './container-controllers/docker-containers/docker-container.component';
import { ZABBIX_DOCKER_CONTAINER_ROUTES } from './container-controllers/docker-containers/docker-containers-zabbix/docker-containers-zabbix-routing.const';
import { DockerContainersZabbixComponent } from './container-controllers/docker-containers/docker-containers-zabbix/docker-containers-zabbix.component';
import { DockerNodesComponent } from './container-controllers/docker-nodes/docker-nodes.component';
import { DockerTabsComponent } from './container-controllers/docker-tabs/docker-tabs.component';
import { KubernetesNodesComponent } from './container-controllers/kubernetes-nodes/kubernetes-nodes.component';
import { KubernetesContainersComponent } from './container-controllers/kubernetes-pods/kubernetes-containers/kubernetes-containers.component';
import { KubernetesPodsComponent } from './container-controllers/kubernetes-pods/kubernetes-pods.component';
import { KubernetesTabsComponent } from './container-controllers/kubernetes-tabs/kubernetes-tabs.component';
import { ZABBIX_DBS_ROUTES } from './database-servers/database-zabbix-routing.const';
import { ALL_DEVICES_FIREWALL_ROUTES, FIREWALL_ROUTES } from './firewalls/firewalls-routing.const';
import { ALL_DEVICES_HYPERVISOR_ROUTES, HYPERVISOR_ROUTES } from './hypervisors/hypervisors-routing.const';
import { ALL_DEVICES_LOADBALANCER_ROUTES, LOADBALANCER_ROUTES } from './loadbalancers/loadbalancers-routing.const';
import { ALL_DEVICES_MACMINI_ROUTES, MACMINI_ROUTES } from './mac-mini/mac-mini-routing.const';
import { NutanixClusterDetailsComponent } from './nutanix/nutanix-clusters/nutanix-cluster-details/nutanix-cluster-details.component';
import { NutanixClustersComponent } from './nutanix/nutanix-clusters/nutanix-clusters.component';
import { NutanixDiskDetailsComponent } from './nutanix/nutanix-disks/nutanix-disk-details/nutanix-disk-details.component';
import { NutanixDisksComponent } from './nutanix/nutanix-disks/nutanix-disks.component';
import { NutanixHostDetailsComponent } from './nutanix/nutanix-hosts/nutanix-host-details/nutanix-host-details.component';
import { NutanixHostsComponent } from './nutanix/nutanix-hosts/nutanix-hosts.component';
import { NutanixStorageContainersDetailsComponent } from './nutanix/nutanix-storage-containers/nutanix-storage-containers-details/nutanix-storage-containers-details.component';
import { NutanixStorageContainersComponent } from './nutanix/nutanix-storage-containers/nutanix-storage-containers.component';
import { NutanixStoragePoolsDetailsComponent } from './nutanix/nutanix-storage-pools/nutanix-storage-pools-details/nutanix-storage-pools-details.component';
import { NutanixStoragePoolsComponent } from './nutanix/nutanix-storage-pools/nutanix-storage-pools.component';
import { NutanixVirtualDisksDetailsComponent } from './nutanix/nutanix-virtual-disks/nutanix-virtual-disks-details/nutanix-virtual-disks-details.component';
import { NutanixVirtualDisksComponent } from './nutanix/nutanix-virtual-disks/nutanix-virtual-disks.component';
import { NUTANIX_ZABBIX_ROUTES } from './nutanix/nutanix-zabbix/nutanix-zabbix-routing.const';
import { NutanixZabbixComponent } from './nutanix/nutanix-zabbix/nutanix-zabbix.component';
import { OTHER_DEVICE_ROUTES } from './otherdevices/otherdevices-routing.const';
import { ALL_DEVICES_STORAGE_ROUTES, STORAGE_ROUTES } from './storage-devices/storage-routing.const';
import { SummaryComponent } from './summary/summary.component';
import { ALL_DEVICES_SWITCH_ROUTES, SWITCH_ROUTES } from './switches/switches-routing.const';
import { UnityS3AccountComponent } from './unity-s3-account/unity-s3-account.component';
import { UnityS3TabsComponent } from './unity-s3-account/unity-s3-tabs/unity-s3-tabs.component';
import { UnityS3BucketFilesComponent } from './unity-s3-account/unity-s3/unity-s3-bucket-files/unity-s3-bucket-files.component';
import { UnityS3Component } from './unity-s3-account/unity-s3/unity-s3.component';
import { VcenterClusterItemsComponent } from './vcenter-cloud/vcenter-clusters/vcenter-cluster-items/vcenter-cluster-items.component';
import { VcenterClustersComponent } from './vcenter-cloud/vcenter-clusters/vcenter-clusters.component';
import { VcenterDatastoresComponent } from './vcenter-cloud/vcenter-datastores/vcenter-datastores.component';
import { VcenterNetworksComponent } from './vcenter-cloud/vcenter-networks/vcenter-networks.component';
import { ZABBIX_VCENTER_ROUTES } from './vcenter-cloud/vcenter-zabbix/vcenter-zabbix-routing.const';
import { VcenterZabbixComponent } from './vcenter-cloud/vcenter-zabbix/vcenter-zabbix.component';
import { VcenterContentLibraryFilesComponent } from './vcenter-content-library/vcenter-content-library-files/vcenter-content-library-files.component';
import { VcenterContentLibraryComponent } from './vcenter-content-library/vcenter-content-library.component';
import { OBSERVIUM_VMS_ROUTES } from './vms/vms-observium/vms-obs-routing.const';
import { ALL_DEVICES_VMS_ROUTES, VMS_ROUTES } from './vms/vms-routing.const';
import { ZABBIX_VMS_ROUTES } from './vms/vms-zabbix/vms-zabbix-routing.const';
import { VmsZabbixComponent } from './vms/vms-zabbix/vms-zabbix.component';
import { VmsComponent } from './vms/vms.component';
import { WebAccessComponent } from './web-access/web-access.component';
import { PcCrudComponent } from 'src/app/shared/pc-crud/pc-crud.component';

export const SharedVMsRoutes: Routes = OBSERVIUM_VMS_ROUTES;

export function MyAwesomeMatcher(url: UrlSegment[]) {
    if (url.length === 0) {
        return null;
    }
    const reg = /^(alldevices)$/;
    const param = url[0].toString();
    if (param.match(reg)) {
        return ({ consumed: url });
    }
    return null;
}

const SUMMARY_ROUTES: Routes = [
    {
        path: 'summary',
        component: SummaryComponent,
        data: {
            breadcrumb: {
                title: 'Summary',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'summary/:instanceId/vmware-vcenter/edit',
        component: UsiPcVmwareVcenterCrudComponent
    },
    {
        path: 'summary/:instanceId/unity-vcenter/edit',
        component: UsiPcVmwareVcenterCrudComponent
    },
    {
        path: 'summary/:deviceId/webaccess',
        component: WebAccessComponent
    },
    {
        path: 'summary/vcenter/zbx',
        component: VcenterZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Summary',
                stepbackCount: 0
            }
        },
        children: ZABBIX_VCENTER_ROUTES
    },
    {
        path: 'summary/add',
        component: PcCrudComponent
    },
    {
        path: 'summary/:pcId/edit',
        component: PcCrudComponent
    },
    {
        path: 'summary/:dcId/add',
        component: PcCrudComponent
    },
    {
        path: 'summary',
        data: {
            breadcrumb: {
                title: 'Summary',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'contentlib',
                component: VcenterContentLibraryComponent,
                data: {
                    breadcrumb: {
                        title: 'Content Library',
                        stepbackCount: 1
                    }
                }
            },
            {
                path: 'contentlib',
                data: {
                    breadcrumb: {
                        title: 'Content Library',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: ':libId/files',
                        component: VcenterContentLibraryFilesComponent,
                        data: {
                            breadcrumb: {
                                title: 'Files',
                                stepbackCount: 0
                            }
                        }
                    },
                ]
            },
        ]
    },
];

const allDeviceTempRoute: Routes = [
    {
        path: 'alldevices',
        component: AllDevicesComponent,
        data: {
            breadcrumb: {
                title: 'All Devices',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'alldevices/kubernetescontrollers/:controllerId',
        data: {
            breadcrumb: {
                title: 'Controllers',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'pods',
                component: KubernetesPodsComponent,
                data: {
                    breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'nodes',
                component: KubernetesNodesComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'pods/:podId',
                data: {
                    breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 1
                    }
                },
                children: [
                    {
                        path: 'containers',
                        component: KubernetesContainersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Containers',
                                stepbackCount: 0
                            }
                        }
                    }
                ]
            }
        ]
    }
];

const tempRoute: Routes = [
    {
        path: 'containercontrollers',
        component: ContainerControllersComponent,
        data: {
            breadcrumb: {
                title: 'Controllers',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'containercontrollers/:deviceid/zbx',
        component: ContainerControllersZabbixComponent,
        data: {
            breadcrumb: {
                title: 'Controller',
                stepbackCount: 2
            }
        },
        children: ZABBIX_CONTAINER_CONTROLLER_ROUTES
    },
    {
        path: 'containercontrollers/docker/:controllerId',
        component: DockerTabsComponent,
        data: {
            breadcrumb: {
                title: 'Controllers',
                stepbackCount: 1
            }
        },
        children: [
            {
                path: 'dockernodes',
                component: DockerNodesComponent,
                data: {
                    breadcrumb: {
                        title: 'Docker Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'dockercontainers',
                component: DockerContainerComponent,
                data: {
                    breadcrumb: {
                        title: 'Docker Containers',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'dockercontainers/:deviceid/zbx',
                component: DockerContainersZabbixComponent,
                data: {
                    breadcrumb: {
                        title: 'Docker Container',
                        stepbackCount: 0
                    }
                },
                children: ZABBIX_DOCKER_CONTAINER_ROUTES
            }
        ]
    },
    {
        path: 'containercontrollers/kubernetes/:controllerId',
        component: KubernetesTabsComponent,
        data: {
            breadcrumb: {
                title: 'Controllers',
                stepbackCount: 1
            }
        },
        children: [
            {
                path: 'dockernodes',
                component: DockerNodesComponent,
                data: {
                    breadcrumb: {
                        title: 'Docker Nodes',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'dockercontainers',
                component: DockerContainerComponent,
                data: {
                    breadcrumb: {
                        title: 'Docker Containers',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'pods',
                component: KubernetesPodsComponent,
                data: {
                    breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'pods/:podId',
                data: {
                    breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 1
                    }
                },
                children: [
                    {
                        path: 'containers',
                        component: KubernetesContainersComponent,
                        data: {
                            breadcrumb: {
                                title: 'Containers',
                                stepbackCount: 0
                            }
                        }
                    }
                ]
            },
            {
                path: 'nodes',
                component: KubernetesNodesComponent,
                data: {
                    breadcrumb: {
                        title: 'Nodes',
                        stepbackCount: 0
                    }
                }
            },
        ]
    },
    {
        path: 's3account',
        component: UnityS3AccountComponent,
        data: {
            breadcrumb: {
                title: 'S3 Account',
                stepbackCount: 0
            }
        }
    },
    {
        path: 's3account/:accountId',
        component: UnityS3TabsComponent,
        data: {
            breadcrumb: {
                title: 'S3 Account',
                stepbackCount: 1
            }
        },
        children: [
            {
                path: 's3',
                component: UnityS3Component,
                data: {
                    breadcrumb: {
                        title: 'S3 Buckets',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 's3/:bucketId',
                data: {
                    breadcrumb: {
                        title: 'S3 Buckets',
                        stepbackCount: 1
                    }
                },
                children: [
                    {
                        path: 'files',
                        component: UnityS3BucketFilesComponent,
                        data: {
                            breadcrumb: {
                                title: 'Files',
                                stepbackCount: 0
                            }
                        }
                    }
                ]
            },
        ]
    }
];

//All paths neeeds bo be add here
const NUTANIX_ROUTES: Routes = [
    {
        path: 'summary/zbx',
        component: NutanixZabbixComponent,
        data: {
            breadcrumb: {
                title: '',
                stepbackCount: 0
            }
        },
        children: NUTANIX_ZABBIX_ROUTES
    },
    {
        path: 'clusters',
        component: NutanixClustersComponent,
        data: {
            breadcrumb: {
                title: 'Clusters',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'clusters/:clusterId/details',
        component: NutanixClusterDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Clusters',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'hosts',
        component: NutanixHostsComponent,
        data: {
            breadcrumb: {
                title: 'Hosts',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'hosts/:hostId/details',
        component: NutanixHostDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'disks',
        component: NutanixDisksComponent,
        data: {
            breadcrumb: {
                title: 'Disks',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'disks/:deviceId/details',
        component: NutanixDiskDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'storagecontainers',
        component: NutanixStorageContainersComponent,
        data: {
            breadcrumb: {
                title: 'Storage Containers',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'storagecontainers/:scId/details',
        component: NutanixStorageContainersDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 1
            }
        }
    },
    {
        path: 'virtualdisks',
        component: NutanixVirtualDisksComponent,
        data: {
            breadcrumb: {
                title: 'VDisk',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'virtualdisks/:diskId/details',
        component: NutanixVirtualDisksDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Details',
                stepbackCount: 1
            }
        }
    },
    {
        path: 'storagepools',
        component: NutanixStoragePoolsComponent,
        data: {
            breadcrumb: {
                title: 'Storage Pools',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'storagepools/:spId/details',
        component: NutanixStoragePoolsDetailsComponent,
        data: {
            breadcrumb: {
                title: 'Storage Pools',
                stepbackCount: 0
            }
        }
    },
];

const VCENTER_ROUTES: Routes = [
    {
        path: 'vcclusters',
        component: VcenterClustersComponent,
        data: {
            breadcrumb: {
                title: 'Clusters',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'vcclusters/:clusterId',
        component: VcenterClusterItemsComponent,
        data: {
            breadcrumb: {
                title: 'Clusters',
                stepbackCount: 0
            }
        },
        children: [
            // {
            //     path: 'hosts',
            //     component: HypervisorsComponent,
            //     data: {
            //         breadcrumb: {
            //             title: 'Hosts',
            //             stepbackCount: 0
            //         }
            //     },
            // },
            ...HYPERVISOR_ROUTES,
            {
                path: 'datastores',
                component: VcenterDatastoresComponent,
                data: {
                    breadcrumb: {
                        title: 'Datastores',
                        stepbackCount: 0
                    }
                }
            },
            {
                path: 'networks',
                component: VcenterNetworksComponent,
                data: {
                    breadcrumb: {
                        title: 'Networks',
                        stepbackCount: 0
                    }
                }
            },
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
                path: 'vms/:deviceid/zbx',
                component: VmsZabbixComponent,
                data: {
                    breadcrumb: {
                        title: 'Virtual Machines',
                        stepbackCount: 2
                    }
                },
                children: ZABBIX_VMS_ROUTES
            }
        ]
    },
    {
        path: 'datastores',
        component: VcenterDatastoresComponent,
        data: {
            breadcrumb: {
                title: 'Datastores',
                stepbackCount: 0
            }
        }
    },
    {
        path: 'networks',
        component: VcenterNetworksComponent,
        data: {
            breadcrumb: {
                title: 'Networks',
                stepbackCount: 0
            }
        }
    }
]

export const DevicesRoutes: Routes = [
    ...SUMMARY_ROUTES,
    ...allDeviceTempRoute,
    ...ALL_DEVICES_SWITCH_ROUTES,
    ...ALL_DEVICES_FIREWALL_ROUTES,
    ...ALL_DEVICES_LOADBALANCER_ROUTES,
    ...ALL_DEVICES_BMS_ROUTES,
    ...ALL_DEVICES_HYPERVISOR_ROUTES,
    ...ALL_DEVICES_STORAGE_ROUTES,
    ...ALL_DEVICES_VMS_ROUTES,
    ...ALL_DEVICES_MACMINI_ROUTES,
    {
        matcher: MyAwesomeMatcher,
        redirectTo: 'alldevices',
    },
    ...tempRoute,
    ...SWITCH_ROUTES,
    ...FIREWALL_ROUTES,
    ...LOADBALANCER_ROUTES,
    ...BMS_ROUTES,
    ...HYPERVISOR_ROUTES,
    // ...[
    //     {
    //         path: 'hypervisors/:deviceId',
    //         component: HypervisorsEsxiPlaceholderComponent,
    //         data: {
    //             breadcrumb: {
    //                 title: 'Hypervisors',
    //                 stepbackCount: 1
    //             }
    //         },
    //         children: VMS_ROUTES
    //     }
    // ],
    ...STORAGE_ROUTES,
    ...ZABBIX_DBS_ROUTES,
    ...VMS_ROUTES,
    ...MACMINI_ROUTES,
    ...OTHER_DEVICE_ROUTES,
    ...NUTANIX_ROUTES,
    ...NUTANIX_ZABBIX_ROUTES,
    ...VCENTER_ROUTES
];