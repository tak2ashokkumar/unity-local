import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessComponent } from 'src/app/shared/console-access/console-access.component';
import { SWITCH_ROUTES } from 'src/app/united-cloud/shared/switches/switches-routing.const';
import { AwsDeviceTabComponent } from '../shared/aws-device-tab/aws-device-tab.component';
import { BMS_ROUTES } from '../shared/bm-servers/bm-servers-routing.const';
import { KubernetesNodesComponent } from '../shared/container-controllers/kubernetes-nodes/kubernetes-nodes.component';
import { KubernetesContainersComponent } from '../shared/container-controllers/kubernetes-pods/kubernetes-containers/kubernetes-containers.component';
import { KubernetesPodsComponent } from '../shared/container-controllers/kubernetes-pods/kubernetes-pods.component';
import { KubernetesTabsComponent } from '../shared/container-controllers/kubernetes-tabs/kubernetes-tabs.component';
import { ZABBIX_DBS_ROUTES } from '../shared/database-servers/database-zabbix-routing.const';
import { DeviceTabComponent } from '../shared/device-tab/device-tab.component';
import { FIREWALL_ROUTES } from '../shared/firewalls/firewalls-routing.const';
import { HYPERVISOR_ROUTES } from '../shared/hypervisors/hypervisors-routing.const';
import { LOADBALANCER_ROUTES } from '../shared/loadbalancers/loadbalancers-routing.const';
import { MACMINI_ROUTES } from '../shared/mac-mini/mac-mini-routing.const';
import { OtherdevicesComponent } from '../shared/otherdevices/otherdevices.component';
import { PublicCloudAwsCloudwatchComponent } from '../shared/public-cloud-aws-cloudwatch/public-cloud-aws-cloudwatch.component';
import { SharedVMsRoutes } from '../shared/shared-route';
import { STORAGE_ROUTES } from '../shared/storage-devices/storage-routing.const';
import { UnityS3AccountComponent } from '../shared/unity-s3-account/unity-s3-account.component';
import { UnityS3TabsComponent } from '../shared/unity-s3-account/unity-s3-tabs/unity-s3-tabs.component';
import { UnityS3BucketFilesComponent } from '../shared/unity-s3-account/unity-s3/unity-s3-bucket-files/unity-s3-bucket-files.component';
import { UnityS3Component } from '../shared/unity-s3-account/unity-s3/unity-s3.component';
import { VmsListCustomComponent } from '../shared/vms/vms-list-custom/vms-list-custom.component';
import { VmsListEsxiComponent } from '../shared/vms/vms-list-esxi/vms-list-esxi.component';
import { VmsListHypervComponent } from '../shared/vms/vms-list-hyperv/vms-list-hyperv.component';
import { VmsListOpenstackComponent } from '../shared/vms/vms-list-openstack/vms-list-openstack.component';
import { VmsListProxmoxComponent } from '../shared/vms/vms-list-proxmox/vms-list-proxmox.component';
import { VmsListVcloudComponent } from '../shared/vms/vms-list-vcloud/vms-list-vcloud.component';
import { VmsListVmwareComponent } from '../shared/vms/vms-list-vmware/vms-list-vmware.component';
import { OBSERVIUM_VMS_ROUTES } from '../shared/vms/vms-observium/vms-obs-routing.const';
import { VMS_ROUTES } from '../shared/vms/vms-routing.const';
import { ZABBIX_VMS_ROUTES } from '../shared/vms/vms-zabbix/vms-zabbix-routing.const';
import { VmsZabbixComponent } from '../shared/vms/vms-zabbix/vms-zabbix.component';
import { WebAccessComponent } from '../shared/web-access/web-access.component';
import { AssetsCloudControllersComponent } from './assets-cloud-controllers/assets-cloud-controllers.component';
import { AssetsMobileDeviceComponent } from './assets-mobile-device/assets-mobile-device.component';
import { AssetsVmsResolverService } from './assets-vms-resolver.service';
import { AssetsVmsAllComponent } from './assets-vms/assets-vms-all/assets-vms-all.component';
import { AssetsVmsAwsComponent } from './assets-vms/assets-vms-aws/assets-vms-aws.component';
import { AssetsVmsAzureComponent } from './assets-vms/assets-vms-azure/assets-vms-azure.component';
import { AssetsVmsGcpComponent } from './assets-vms/assets-vms-gcp/assets-vms-gcp.component';
import { AssetsVmsOracleComponent } from './assets-vms/assets-vms-oracle/assets-vms-oracle.component';
import { AssetsVmsComponent } from './assets-vms/assets-vms.component';
import { AssetsComponent } from './assets.component';
import { AzureZabbixComponent } from '../shared/azure-zabbix/azure-zabbix.component';
import { ZABBIX_AZURE_ACCOUNT_ROUTES } from '../shared/azure-zabbix/azure-zabbix-routing.const';
import { OtherdevicesCrudComponent } from '../shared/otherdevices/otherdevices-crud/otherdevices-crud.component';
import { OTHER_DEVICE_ROUTES } from '../shared/otherdevices/otherdevices-routing.const';
import { ZabbixVmsGraphsComponent } from '../shared/vms/vms-zabbix/zabbix-vms-graphs/zabbix-vms-graphs.component';
import { AwsZabbixComponent } from '../shared/aws-zabbix/aws-zabbix.component';
import { ZABBIX_AWS_ACCOUNT_ROUTES } from '../shared/aws-zabbix/aws-zabbix-routing.const';
import { VmsListNutanixComponent } from '../shared/vms/vms-list-nutanix/vms-list-nutanix.component';
import { NutanixVmsDetailsComponent } from '../shared/vms/vms-list-nutanix/nutanix-vms-details/nutanix-vms-details.component';
import { ZABBIX_GCP_ACCOUNT_ROUTES } from '../shared/gcp-zabbix/gcp-zabbix-routing.const';
import { GcpZabbixComponent } from '../shared/gcp-zabbix/gcp-zabbix.component';
import { VmBackupHistoryComponent } from 'src/app/shared/vm-backup-history/vm-backup-history.component';
import { SDWAN_ROUTES } from '../shared/sdwans/sdwans-routing.const';
import { NETWORK_CONTROLLER_ROUTES } from '../shared/network-controllers/network-controllers-routng.const';
import { IOT_DEVICE_ROUTES } from '../shared/iot-devices/iot-devices-routing.const';



const tempRoutes: Routes = [
  {
    path: 'vms',
    component: AssetsVmsComponent,
    resolve: {
      tabItems: AssetsVmsResolverService
    },
    data: {
      breadcrumb: {
        title: 'Virtual Machines',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'allvms',
        component: AssetsVmsAllComponent,
        data: {
          breadcrumb: {
            title: 'All VMs',
            stepbackCount: 1
          }
        }
      },
      {
        path: 'vmware',
        component: VmsListVmwareComponent,
        data: {
          breadcrumb: {
            title: 'VMware VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'vmware/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'VMware VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'vmware/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'VMware VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'vmware/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'VMware VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'vmware/:backupId/vm-backup-history',
        component: VmBackupHistoryComponent,
        data: {
          breadcrumb: {
            title: 'VM Backup History',
            stepbackCount: 0
          }
        },
      },
      {
        path: 'openstack',
        component: VmsListOpenstackComponent,
        data: {
          breadcrumb: {
            title: 'Openstack VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'openstack/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'Openstack VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'openstack/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'Openstack VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'openstack/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Openstack VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'vcloud',
        component: VmsListVcloudComponent,
        data: {
          breadcrumb: {
            title: 'vCloud VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'vcloud/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'vCloud VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'vcloud/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'vCloud VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'vcloud/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'vCloud VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'esxi',
        component: VmsListEsxiComponent,
        data: {
          breadcrumb: {
            title: 'ESXi VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'esxi/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'ESXi VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'esxi/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'ESXi VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'esxi/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'ESXi VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'hyperv',
        component: VmsListHypervComponent,
        data: {
          breadcrumb: {
            title: 'Hyper-V VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'hyperv/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'Hyper-V VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'hyperv/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Hyper-V VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'proxmox',
        component: VmsListProxmoxComponent,
        data: {
          breadcrumb: {
            title: 'Proxmox VMs',
            stepbackCount: 0
          },
          platformType: PlatFormMapping.PROXMOX,
          deviceMapping: DeviceMapping.PROXMOX
        }
      },
      {
        path: 'proxmox/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'Proxmox VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'proxmox/:deviceid',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'Proxmox VMs',
            stepbackCount: 1
          }
        },
        children: SharedVMsRoutes
      },
      {
        path: 'g3kvm',
        component: VmsListProxmoxComponent,
        data: {
          breadcrumb: {
            title: 'G3 KVM VMs',
            stepbackCount: 0
          },
          platformType: PlatFormMapping.G3_KVM,
          deviceMapping: DeviceMapping.G3_KVM
        }
      },
      {
        path: 'g3kvm/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'G3 KVM VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'g3kvm/:deviceid',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'G3 KVM VMs',
            stepbackCount: 1
          }
        },
        children: SharedVMsRoutes
      },
      {
        path: 'aws',
        component: AssetsVmsAwsComponent,
        data: {
          breadcrumb: {
            title: 'AWs VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'aws/:accountId/cloudwatch/:instanceId',
        component: AwsDeviceTabComponent,
        children: [
          {
            path: 'overview',
            component: PublicCloudAwsCloudwatchComponent,
            data: {
              breadcrumb: {
                title: 'Cloud Watch',
                stepbackCount: 0
              }
            }
          }
        ]
      },
      {
        path: 'aws/:deviceid/zbx',
        component: AwsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'AWS',
            stepbackCount: 1
          }
        },
        children: ZABBIX_AWS_ACCOUNT_ROUTES
      },
      {
        path: 'aws/:accountId/:regionId',
        redirectTo: 'aws'
      },
      {
        path: 'aws/:deviceid',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'AWS VMs',
            stepbackCount: 1
          }
        },
        children: SharedVMsRoutes
      },
      {
        path: 'azure',
        component: AssetsVmsAzureComponent,
        data: {
          breadcrumb: {
            title: 'Azure VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'azure/:deviceid/zbx',
        component: AzureZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Azure VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_AZURE_ACCOUNT_ROUTES
      },
      {
        path: 'gcp',
        component: AssetsVmsGcpComponent,
        data: {
          breadcrumb: {
            title: 'GCP VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'gcp/:deviceid/zbx',
        component: GcpZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Gcp VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_GCP_ACCOUNT_ROUTES
      },
      {
        path: 'oracle',
        component: AssetsVmsOracleComponent,
        data: {
          breadcrumb: {
            title: 'Oracle VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'custom',
        component: VmsListCustomComponent,
        data: {
          breadcrumb: {
            title: 'Custom VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'custom/:deviceId/console',
        component: ConsoleAccessComponent,
        data: {
          breadcrumb: {
            title: 'Custom VMs',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'custom/:deviceid/obs',
        component: DeviceTabComponent,
        data: {
          breadcrumb: {
            title: 'Custom VMs',
            stepbackCount: 1
          }
        },
        children: OBSERVIUM_VMS_ROUTES
      },
      {
        path: 'custom/:deviceid/zbx',
        component: VmsZabbixComponent,
        data: {
          breadcrumb: {
            title: 'Custom VMs',
            stepbackCount: 1
          }
        },
        children: ZABBIX_VMS_ROUTES
      },
      {
        path: 'nutanix',
        component: VmsListNutanixComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix VMs',
            stepbackCount: 1
          }
        }
      },
      {
        path: 'nutanix/:vmId/details',
        component: NutanixVmsDetailsComponent,
        data: {
          breadcrumb: {
            title: 'Nutanix VMs',
            stepbackCount: 1
          }
        }
      },
    ]
  },
  {
    path: 'cloudcontrollers/:deviceId/webaccess',
    component: WebAccessComponent,
    data: {
      breadcrumb: {
        title: 'Cloud Controllers',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'cloudcontrollers',
    component: AssetsCloudControllersComponent,
  },
  {
    path: 'kubernetes',
    component: KubernetesTabsComponent,
    data: {
      breadcrumb: {
        title: 'Kubernetes',
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
            stepbackCount: 1
          }
        },
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
            stepbackCount: 1
          }
        },
      },
    ]
  },
  {
    path: 'pods',
    component: KubernetesPodsComponent,
    data: {
      breadcrumb: {
        title: 'Pods',
        stepbackCount: 0
      }
    },
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
    path: 'mobiledevices',
    component: AssetsMobileDeviceComponent,
    data: {
      breadcrumb: {
        title: 'Mobile Devices',
        stepbackCount: 0
      }
    }
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

const routes: Routes = [
  {
    path: 'devices',
    component: AssetsComponent,
    data: {
      breadcrumb: {
        title: 'Devices',
        stepbackCount: 0
      }
    },
    children: [
      ...tempRoutes,
      ...SWITCH_ROUTES,
      ...FIREWALL_ROUTES,
      ...LOADBALANCER_ROUTES,
      ...BMS_ROUTES,
      ...HYPERVISOR_ROUTES,
      ...STORAGE_ROUTES,
      ...VMS_ROUTES,
      ...MACMINI_ROUTES,
      ...OTHER_DEVICE_ROUTES,
      ...ZABBIX_DBS_ROUTES,
      ...SDWAN_ROUTES,
      ...NETWORK_CONTROLLER_ROUTES,
      ...IOT_DEVICE_ROUTES
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
