import { Routes } from "@angular/router";
import { UnityTopologyComponent } from "./unity-topology.component";
import { UnityTopologyViewComponent } from "./unity-topology-view/unity-topology-view.component";
import { UnityAzureTopologyViewComponent } from "./unity-azure-topology-view/unity-azure-topology-view.component";
import { UnityGcpTopologyViewComponent } from "./unity-gcp-topology-view/unity-gcp-topology-view.component";

export const NETWORK_TOPOLOGY_ROUTES: Routes = [
    {
        path: 'topology',
        component: UnityTopologyComponent,
        data: {
            breadcrumb: {
                title: 'Network Topology'
            }
        },
        children: [
            {
                path: 'infrastructure',
                component: UnityTopologyViewComponent,
                data: {
                    breadcrumb: {
                        title: 'Unity Infrastructure'
                    }
                }
            },
            {
                path: 'azure',
                component: UnityAzureTopologyViewComponent,
                data: {
                    breadcrumb: {
                        title: 'Azure'
                    }
                }
            },
            {
                path: 'gcp',
                component: UnityGcpTopologyViewComponent,
                data: {
                    breadcrumb: {
                        title: 'GCP'
                    }
                }
            },
        ]
    },
]