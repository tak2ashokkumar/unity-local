import { Routes } from "@angular/router";
import { UnityServiceTopologyComponent } from "./unity-service-topology.component";

export const UNITY_SERVICE_TOPOLOGY_ROUTES: Routes = [
    {
        path: 'service-topology',
        component: UnityServiceTopologyComponent,
        data: {
            breadcrumb: {
                title: 'Service Topology'
            }
        },
    }
];