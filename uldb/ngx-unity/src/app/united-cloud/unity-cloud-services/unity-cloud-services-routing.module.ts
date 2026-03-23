import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationDiscoveryDataComponent } from '../unity-applications/application-discovery-data/application-discovery-data.component';
import { ApplicationDiscoveryMetadataComponent } from '../unity-applications/application-discovery-metadata/application-discovery-metadata.component';
import { AwsMeshesComponent } from './mesh-services/aws-meshes/aws-meshes.component';
import { AwsVirtualRoutersComponent } from './mesh-services/aws-meshes/aws-virtual-services/aws-virtual-routers/aws-virtual-routers.component';
import { AwsVirtualServicesComponent } from './mesh-services/aws-meshes/aws-virtual-services/aws-virtual-services.component';
import { AwsVisNetworkComponent } from './mesh-services/aws-meshes/aws-vis-network/aws-vis-network.component';
import { IstioDestinationRulesComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-destination-rules/istio-destination-rules.component';
import { IstioOverviewComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-overview.component';
import { IstioContainersComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-pods/istio-containers/istio-containers.component';
import { IstioPodsComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-pods/istio-pods.component';
import { IstioServicesComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-services.component';
import { IstioVirtualServicesComponent } from './mesh-services/istio-virtual-services/istio-virtual-services.component';
import { IstioVisNetworkComponent } from './mesh-services/istio-virtual-services/istio-vis-network/istio-vis-network.component';
import { MeshServicesComponent } from './mesh-services/mesh-services.component';
import { MeshBackendComponent } from './mesh-services/tds/neg/mesh-backend/mesh-backend.component';
import { NegComponent } from './mesh-services/tds/neg/neg.component';
import { TdsVisNetworkComponent } from './mesh-services/tds/tds-vis-network/tds-vis-network.component';
import { TdsComponent } from './mesh-services/tds/tds.component';
import { UnityCloudServicesComponent } from './unity-cloud-services.component';

const routes: Routes = [
  {
    path: 'services',
    component: UnityCloudServicesComponent,
    data: {
      breadcrumb: {
        title: 'Services',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'mesh',
        component: MeshServicesComponent,
        data: {
          breadcrumb: {
            title: 'Mesh',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'mesh/:meshId',
        data: {
          breadcrumb: {
            title: 'Mesh',
            stepbackCount: 1
          }
        },
        children: [
          {
            path: 'tds',
            component: TdsComponent,
            data: {
              breadcrumb: {
                title: 'Traffic Director',
                stepbackCount: 0
              }
            }
          },
          {
            path: 'tds/:serviceName',
            data: {
              breadcrumb: {
                title: 'Traffic Director',
                stepbackCount: 1
              }
            },
            children: [
              {
                path: 'neg',
                component: NegComponent,
                data: {
                  breadcrumb: {
                    title: 'NEG',
                    stepbackCount: 0
                  }
                }
              },
              {
                path: 'neg/:neg/:zone',
                data: {
                  breadcrumb: {
                    title: 'NEG',
                    stepbackCount: 1
                  }
                },
                children: [
                  {
                    path: 'backend',
                    component: MeshBackendComponent,
                    data: {
                      breadcrumb: {
                        title: 'Backend',
                        stepbackCount: 0
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'awsmesh/:regionId',
            component: AwsMeshesComponent,
            data: {
              breadcrumb: {
                title: 'AWS Mesh',
                stepbackCount: 0
              }
            }
          },
          {
            path: 'awsmesh/:regionId/:meshName',
            data: {
              breadcrumb: {
                title: 'AWS Mesh',
                stepbackCount: 1
              }
            },
            children: [
              {
                path: 'vservices',
                component: AwsVirtualServicesComponent,
                data: {
                  breadcrumb: {
                    title: 'Services',
                    stepbackCount: 0
                  }
                }
              },
              {
                path: 'vservices/:routerName',
                data: {
                  breadcrumb: {
                    title: 'Services',
                    stepbackCount: 1
                  }
                },
                children: [
                  {
                    path: 'vroutes',
                    component: AwsVirtualRoutersComponent,
                    data: {
                      breadcrumb: {
                        title: 'Routes',
                        stepbackCount: 0
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'istio',
            component: IstioVirtualServicesComponent,
            data: {
              breadcrumb: {
                title: 'Istio',
                stepbackCount: 0
              }
            }
          },
          {
            path: 'istio/:namespace',
            component: IstioOverviewComponent,
            data: {
              breadcrumb: {
                title: 'Istio',
                stepbackCount: 1
              }
            },
            children: [
              {
                path: 'drules',
                component: IstioDestinationRulesComponent,
                data: {
                  breadcrumb: {
                    title: 'Destination Rules',
                    stepbackCount: 0
                  }
                }
              },
              {
                path: 'iservices',
                component: IstioServicesComponent,
                data: {
                  breadcrumb: {
                    title: 'Services',
                    stepbackCount: 0
                  }
                }
              },

              {
                path: 'iservices/:serviceName',
                data: {
                  breadcrumb: {
                    title: 'Services',
                    stepbackCount: 1
                  }
                },
                children: [
                  {
                    path: 'pods',
                    component: IstioPodsComponent,
                    data: {
                      breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 0
                      }
                    }
                  },
                  {
                    path: 'pods/:podName',
                    data: {
                      breadcrumb: {
                        title: 'Pods',
                        stepbackCount: 1
                      }
                    },
                    children: [
                      {
                        path: 'containers',
                        component: IstioContainersComponent,
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
            ]
          }
        ]
      },
    ]
  },
  {
    path: 'services/mesh/:meshId/tds/:serviceName/tree',
    component: TdsVisNetworkComponent
  },
  {
    path: 'services/mesh/:meshId/awsmesh/:regionId/:meshName/tree',
    component: AwsVisNetworkComponent
  },
  {
    path: 'services/mesh/:meshId/istio/:namespace/:gateway/tree',
    component: IstioVisNetworkComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeshServicesRoutingModule { }
