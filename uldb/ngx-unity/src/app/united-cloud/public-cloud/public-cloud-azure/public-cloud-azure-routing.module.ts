import { Routes } from '@angular/router';
import { UsiPublicCloudAzureCrudComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-azure/usi-public-cloud-azure-crud/usi-public-cloud-azure-crud.component';
import { UsiPublicCloudAzureResourceDataComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-azure/usi-public-cloud-azure-resource-data/usi-public-cloud-azure-resource-data.component';
import { ZABBIX_AZURE_ACCOUNT_ROUTES } from '../../shared/azure-zabbix/azure-zabbix-routing.const';
import { AzureZabbixComponent } from '../../shared/azure-zabbix/azure-zabbix.component';
import { PublicCloudAzureSummaryDetailsComponent } from './public-cloud-azure-summary/public-cloud-azure-summary-details/public-cloud-azure-summary-details.component';
import { PublicCloudAzureSummaryComponent } from './public-cloud-azure-summary/public-cloud-azure-summary.component';


export const azure_routes: Routes = [
  {
    path: '',
    component: PublicCloudAzureSummaryComponent,
    data: {
      breadcrumb: {
        title: 'Azure',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':instanceId/edit',
    component: UsiPublicCloudAzureCrudComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services',
    component: PublicCloudAzureSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Azure',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:serviceId',
    component: PublicCloudAzureSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Azure',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:serviceId/:instanceId/resources/:resourceId',
    component: UsiPublicCloudAzureResourceDataComponent,
    data: {
      breadcrumb: {
        title: 'Azure',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':deviceid/zbx',
    component: AzureZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 1
      }
    },
    children: ZABBIX_AZURE_ACCOUNT_ROUTES
  },
  {
    path: 'services/:serviceId/:deviceid/zbx',
    component: AzureZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Virtual Machines',
        stepbackCount: 1
      }
    },
    children: ZABBIX_AZURE_ACCOUNT_ROUTES
  },
]
// export const azure_routes: Routes = [
//   // {
//   //   path: 'dashboard',
//   //   component: PublicCloudAzureAccountsComponent,
//   //   data: {
//   //     breadcrumb: {
//   //       title: 'Accounts',
//   //       stepbackCount: 0
//   //     }
//   //   }
//   // },
//   {
//     path: ':instanceId/edit',
//     component: UsiPublicCloudAzureCrudComponent,
//     data: {
//       breadcrumb: {
//         title: 'Accounts',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard',
//     component: PublicCloudAzureSummaryComponent,
//     data: {
//       breadcrumb: {
//         title: 'Azure',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard/:resourceId',
//     component: PublicCloudAzureSummaryDetailsComponent,
//     data: {
//       breadcrumb: {
//         title: 'Azure',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard/:resourceId/:deviceid/zbx',
//     component: AzureZabbixComponent,
//     data: {
//       breadcrumb: {
//         title: 'Virtual Machines',
//         stepbackCount: 1
//       }
//     },
//     children: ZABBIX_AZURE_ACCOUNT_ROUTES
//   },
//   {
//     path: 'instances/:instanceId/resources/:resourceId',
//     component: UsiPublicCloudAzureResourceDataComponent,
//     data: {
//       breadcrumb: {
//         title: 'Azure',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'dashboard/:deviceid/zbx',
//     component: AzureZabbixComponent,
//     data: {
//       breadcrumb: {
//         title: 'Accounts',
//         stepbackCount: 1
//       }
//     },
//     children: ZABBIX_AZURE_ACCOUNT_ROUTES
//   },
//   {
//     path: 'dashboard/:accountId',
//     data: {
//       breadcrumb: {
//         title: 'Accounts',
//         stepbackCount: 1
//       }
//     },
//     children: [
//       {
//         path: 'resourcegroups',
//         component: AzureAccountsResourceGroupsComponent,
//         data: {
//           breadcrumb: {
//             title: 'Resources Groups'
//           }
//         }
//       },
//       {
//         path: 'resourcegroups/:groupName/overview',
//         component: AccountResourceGroupOverviewComponent,
//         data: {
//           breadcrumb: {
//             title: 'Resources Groups',
//             stepbackCount: 2
//           }
//         },
//         children: [
//           {
//             path: 'resources',
//             component: AccountsResourceGroupsResourceComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Resources'
//               }
//             }
//           },
//           {
//             path: 'vms',
//             component: AccountsResourceGroupsVmsComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Virtual Machines'
//               }
//             }
//           },
//           {
//             path: 'vms/:deviceid/zbx',
//             component: AzureZabbixComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Virtual Machines',
//                 stepbackCount: 1
//               }
//             },
//             children: ZABBIX_AZURE_ACCOUNT_ROUTES
//           },
//           {
//             path: 'containercontrollers',
//             component: AzureContainerControllerComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Controllers',
//                 stepbackCount: 0
//               }
//             }
//           },
//           {
//             path: 'containercontrollers/docker/:controllerId',
//             component: DockerTabsComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Controllers',
//                 stepbackCount: 1
//               }
//             },
//             children: [
//               {
//                 path: 'dockernodes',
//                 component: DockerNodesComponent,
//                 data: {
//                   breadcrumb: {
//                     title: 'Docker Nodes',
//                     stepbackCount: 0
//                   }
//                 }
//               },
//               {
//                 path: 'dockercontainers',
//                 component: DockerContainerComponent,
//                 data: {
//                   breadcrumb: {
//                     title: 'Docker Containers',
//                     stepbackCount: 0
//                   }
//                 }
//               }
//             ]
//           },
//           {
//             path: 'containercontrollers/kubernetes/:controllerId',
//             component: KubernetesTabsComponent,
//             data: {
//               breadcrumb: {
//                 title: 'Controllers',
//                 stepbackCount: 1
//               }
//             },
//             children: [
//               {
//                 path: 'pods',
//                 component: KubernetesPodsComponent,
//                 data: {
//                   breadcrumb: {
//                     title: 'Pods',
//                     stepbackCount: 0
//                   }
//                 }
//               },
//               {
//                 path: 'pods/:podId',
//                 data: {
//                   breadcrumb: {
//                     title: 'Pods',
//                     stepbackCount: 1
//                   }
//                 },
//                 children: [
//                   {
//                     path: 'containers',
//                     component: KubernetesContainersComponent,
//                     data: {
//                       breadcrumb: {
//                         title: 'Containers',
//                         stepbackCount: 0
//                       }
//                     }
//                   }
//                 ]
//               },
//               {
//                 path: 'nodes',
//                 component: KubernetesNodesComponent,
//                 data: {
//                   breadcrumb: {
//                     title: 'Nodes',
//                     stepbackCount: 0
//                   }
//                 }
//               },
//             ]
//           },
//         ]
//       }
//     ]
//   }
// ];