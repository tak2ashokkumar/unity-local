import { Routes } from '@angular/router';
import { UsiPublicCloudAwsCrudComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-aws/usi-public-cloud-aws-crud/usi-public-cloud-aws-crud.component';
import { UsiPublicCloudAwsResourceDataComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-aws/usi-public-cloud-aws-resource-data/usi-public-cloud-aws-resource-data.component';
import { AwsDeviceTabComponent } from '../../shared/aws-device-tab/aws-device-tab.component';
import { ZABBIX_AWS_ACCOUNT_ROUTES } from '../../shared/aws-zabbix/aws-zabbix-routing.const';
import { AwsZabbixComponent } from '../../shared/aws-zabbix/aws-zabbix.component';
import { PublicCloudAwsCloudwatchComponent } from '../../shared/public-cloud-aws-cloudwatch/public-cloud-aws-cloudwatch.component';
import { PublicCloudAwsSummaryDetailsComponent } from './public-cloud-aws-summary/public-cloud-aws-summary-details/public-cloud-aws-summary-details.component';
import { PublicCloudAwsSummaryComponent } from './public-cloud-aws-summary/public-cloud-aws-summary.component';


export const aws_routes: Routes = [
  {
    path: '',
    component: PublicCloudAwsSummaryComponent,
    data: {
      breadcrumb: {
        title: 'AWS',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':instanceId/edit',
    component: UsiPublicCloudAwsCrudComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services',
    component: PublicCloudAwsSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'AWS',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:serviceId',
    component: PublicCloudAwsSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'AWS',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:serviceId/:instanceId/resources/:resourceId',
    component: UsiPublicCloudAwsResourceDataComponent,
    data: {
      breadcrumb: {
        title: 'AWS',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':deviceid/zbx',
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
    path: 'services/:serviceId/:deviceid/zbx',
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
    path: 'services/:serviceId/:accountId/cloudwatch',
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
  }
]


// export const aws_routes: Routes = [
//   // {
//   //   path: 'dashboard',
//   //   component: PublicCloudAwsDashboardComponent,
//   //   data: {
//   //     breadcrumb: {
//   //       title: 'AWS Dashboard',
//   //       stepbackCount: 0
//   //     }
//   //   }
//   // },
//   {
//     path: ':instanceId/edit',
//     component: UsiPublicCloudAwsCrudComponent,
//     data: {
//       breadcrumb: {
//         title: 'Accounts',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard',
//     component: PublicCloudAwsSummaryComponent,
//     data: {
//       breadcrumb: {
//         title: 'AWS Dashboard',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard/:resourceId',
//     component: PublicCloudAwsSummaryDetailsComponent,
//     data: {
//       breadcrumb: {
//         title: 'AWS',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: ':instanceId/resources/:resourceId',
//     component: UsiPublicCloudAwsResourceDataComponent,
//     data: {
//       breadcrumb: {
//         title: 'Azure',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard/:deviceid/zbx',
//     component: AwsZabbixComponent,
//     data: {
//       breadcrumb: {
//         title: 'AWS',
//         stepbackCount: 1
//       }
//     },
//     children: ZABBIX_AWS_ACCOUNT_ROUTES
//   },
//   {
//     path: 'dashboard/:resourcetypeid/:deviceid/zbx',
//     component: AwsZabbixComponent,
//     data: {
//       breadcrumb: {
//         title: 'AWS',
//         stepbackCount: 1
//       }
//     },
//     children: ZABBIX_AWS_ACCOUNT_ROUTES
//   },
//   {
//     path: ':accountId/cloudwatch/:instanceId',
//     component: AwsDeviceTabComponent,
//     children: [
//       {
//         path: 'overview',
//         component: PublicCloudAwsCloudwatchComponent,
//         data: {
//           breadcrumb: {
//             title: 'Cloud Watch',
//             stepbackCount: 0
//           }
//         }
//       }
//     ]
//   },
//   {
//     path: 'overview/:accountId/:regionId',
//     component: PublicAwsCloudOverviewComponent,
//     children: [
//       {
//         path: 'instances',
//         component: PublicAwsCloudInstanceComponent,
//         data: {
//           breadcrumb: {
//             title: 'Instances',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'snapshots',
//         component: PublicCloudAwsSnapshotComponent,
//         data: {
//           breadcrumb: {
//             title: 'Snapshots',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'volumes',
//         component: PublicCloudAwsVolumesComponent,
//         data: {
//           breadcrumb: {
//             title: 'Volumes',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 's3',
//         component: PublicCloudAwsS3Component,
//         data: {
//           breadcrumb: {
//             title: 'S3',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'autoscalinggroups',
//         component: PublicAwsCloudAutoscalingComponent,
//         data: {
//           breadcrumb: {
//             title: 'Auto Scaling Groups',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'securitygroups',
//         component: PublicCloudAwsSecuritygroupComponent,
//         data: {
//           breadcrumb: {
//             title: 'Security Groups',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'loadbalancers',
//         component: PublicCloudAwsLoadbalancerComponent,
//         data: {
//           breadcrumb: {
//             title: 'Load Balancers',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'networkinterfaces',
//         component: PublicCloudAwsNetworkinterfaceComponent,
//         data: {
//           breadcrumb: {
//             title: 'Network Interface',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'users',
//         component: PublicCloudAwsUsersComponent,
//         data: {
//           breadcrumb: {
//             title: 'Users',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'containercontrollers',
//         component: PublicCloudAwsContainerControllersComponent,
//         data: {
//           breadcrumb: {
//             title: 'Controllers',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'containercontrollers/docker/:controllerId',
//         component: DockerTabsComponent,
//         data: {
//           breadcrumb: {
//             title: 'Controllers',
//             stepbackCount: 1
//           }
//         },
//         children: [
//           {
//             path: 'dockernodes',
//             component: DockerNodesComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Docker Nodes',
//                 stepbackCount: 0
//               }
//             }
//           },
//           {
//             path: 'dockercontainers',
//             component: DockerContainerComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Docker Containers',
//                 stepbackCount: 0
//               }
//             }
//           }
//         ]
//       },
//       {
//         path: 'containercontrollers/kubernetes/:controllerId',
//         component: KubernetesTabsComponent,
//         data: {
//           breadcrumb: {
//             title: 'Controllers',
//             stepbackCount: 1
//           }
//         },
//         children: [
//           {
//             path: 'dockernodes',
//             component: DockerNodesComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Docker Nodes',
//                 stepbackCount: 0
//               }
//             }
//           },
//           {
//             path: 'dockercontainers',
//             component: DockerContainerComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Docker Containers',
//                 stepbackCount: 0
//               }
//             }
//           },
//           {
//             path: 'pods',
//             component: KubernetesPodsComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Pods',
//                 stepbackCount: 0
//               }
//             }
//           },
//           {
//             path: 'pods/:podId',
//             data: {
//               breadcrumb: {
//                 title: 'Pods',
//                 stepbackCount: 1
//               }
//             },
//             children: [
//               {
//                 path: 'containers',
//                 component: KubernetesContainersComponent,
//                 data: {
//                   breadcrumb: {
//                     title: 'Containers',
//                     stepbackCount: 0
//                   }
//                 }
//               }
//             ]
//           },
//           {
//             path: 'nodes',
//             component: KubernetesNodesComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Nodes',
//                 stepbackCount: 0
//               }
//             }
//           },
//         ]
//       },
//     ]
//   },
//   {
//     path: 'overview/:accountId/:regionId/instances/:deviceid',
//     component: DeviceTabComponent,
//     children: SharedVMsRoutes
//   },
//   {
//     path: 'overview/:accountId/:regionId/instances/cloudwatch/:instanceId',
//     component: AwsDeviceTabComponent,
//     children: [
//       {
//         path: 'overview',
//         component: PublicCloudAwsCloudwatchComponent,
//         data: {
//           breadcrumb: {
//             title: 'Cloud Watch',
//             stepbackCount: 0
//           }
//         }
//       }
//     ]
//   },
//   {
//     path: 'vms/:accountId/:regionId',
//     component: PublicCloudAwsVmsComponent,
//     data: {
//       breadcrumb: {
//         title: 'AWS VMs',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'vms/:accountId/:regionId/:deviceid',
//     component: DeviceTabComponent,
//     children: SharedVMsRoutes
//   },
//   {
//     path: 'vms/:accountId/:regionId/cloudwatch/:instanceId',
//     component: AwsDeviceTabComponent,
//     children: [
//       {
//         path: 'overview',
//         component: PublicCloudAwsCloudwatchComponent
//       }
//     ]
//   },
// ];