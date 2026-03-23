import { Routes } from '@angular/router';
import { UsiPublicCloudGcpCrudComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-gcp/usi-public-cloud-gcp-crud/usi-public-cloud-gcp-crud.component';
import { UsiPublicCloudGcpResourceDataComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-gcp/usi-public-cloud-gcp-resource-data/usi-public-cloud-gcp-resource-data.component';
import { ZABBIX_GCP_ACCOUNT_ROUTES } from '../../shared/gcp-zabbix/gcp-zabbix-routing.const';
import { GcpZabbixComponent } from '../../shared/gcp-zabbix/gcp-zabbix.component';
import { PublicCloudGcpSummaryDetailsComponent } from './public-cloud-gcp-summary/public-cloud-gcp-summary-details/public-cloud-gcp-summary-details.component';
import { PublicCloudGcpSummaryComponent } from './public-cloud-gcp-summary/public-cloud-gcp-summary.component';

export const gcp_routes: Routes = [
  {
    path: '',
    component: PublicCloudGcpSummaryComponent,
    data: {
      breadcrumb: {
        title: 'GCP',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':instanceId/edit',
    component: UsiPublicCloudGcpCrudComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services',
    component: PublicCloudGcpSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'GCP',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/resource/:resourceId',
    component: PublicCloudGcpSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'GCP',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/category/:subcategoryId',
    component: PublicCloudGcpSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'GCP',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:type/:serviceId/:instanceId/resources/:resourceId',
    component: UsiPublicCloudGcpResourceDataComponent,
    data: {
      breadcrumb: {
        title: 'GCP',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':deviceid/zbx',
    component: GcpZabbixComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 1
      }
    },
    children: ZABBIX_GCP_ACCOUNT_ROUTES
  },

]

// export const gcp_routes: Routes = [
//   {
//     path: '',
//     component: GcpDashboardComponent,
//     data: {
//       breadcrumb: {
//         title: 'GCP Dashboard',
//         stepbackCount: 0
//       }
//     }
//   },
//   {
//     path: 'overview/:accountId/:regionId',
//     component: GcpOverviewComponent,
//     children: [
//       {
//         path: 'vms',
//         component: GcpVmsComponent,
//         data: {
//           breadcrumb: {
//             title: 'Instances',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'snapshots',
//         component: GcpSnapshotsComponent,
//         data: {
//           breadcrumb: {
//             title: 'Snapshots',
//             stepbackCount: 0
//           }
//         }
//       },
//       {
//         path: 'containercontrollers',
//         component: GcpContainerControllerComponent,
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
//               path: 'dockernodes',
//               component: DockerNodesComponent,
//               data: {
//                   breadcrumb: {
//                       title: 'Docker Nodes',
//                       stepbackCount: 0
//                   }
//               }
//           },
//           {
//               path: 'dockercontainers',
//               component: DockerContainerComponent,
//               data: {
//                   breadcrumb: {
//                       title: 'Docker Containers',
//                       stepbackCount: 0
//                   }
//               }
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
//   }
// ];