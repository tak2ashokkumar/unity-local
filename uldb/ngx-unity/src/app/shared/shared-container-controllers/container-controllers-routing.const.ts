import { Routes } from '@angular/router';
import { DockerContainerComponent } from './docker-containers/docker-container.component';
import { DockerNodesComponent } from './docker-nodes/docker-nodes.component';
import { KubernetesControlplaneComponentsComponent } from './kubernetes-controlplane-components/kubernetes-controlplane-components.component';
import { KubernetesCronjobsComponent } from './kubernetes-cronjobs/kubernetes-cronjobs.component';
import { KubernetesDaemonsetsComponent } from './kubernetes-daemonsets/kubernetes-daemonsets.component';
import { KubernetesDeploymentsComponent } from './kubernetes-deployments/kubernetes-deployments.component';
import { KubernetesEventsComponent } from './kubernetes-events/kubernetes-events.component';
import { KubernetesHpasComponent } from './kubernetes-hpas/kubernetes-hpas.component';
import { KubernetesJobsComponent } from './kubernetes-jobs/kubernetes-jobs.component';
import { KubernetesNamespacesComponent } from './kubernetes-namespaces/kubernetes-namespaces.component';
import { KubernetesNodesComponent } from './kubernetes-nodes/kubernetes-nodes.component';
import { KubernetesContainersComponent } from './kubernetes-pods/kubernetes-containers/kubernetes-containers.component';
import { KubernetesPodsComponent } from './kubernetes-pods/kubernetes-pods.component';
import { KubernetesPersistentVolumeClaimsComponent } from './kubernetes-persistentvolumeclaims/kubernetes-persistentvolumeclaims.component';
import { KubernetesPersistentVolumesComponent } from './kubernetes-persistentvolumes/kubernetes-persistentvolumes.component';
import { KubernetesReplicasetsComponent } from './kubernetes-replicasets/kubernetes-replicasets.component';
import { KubernetesResourcequotasComponent } from './kubernetes-resourcequotas/kubernetes-resourcequotas.component';
import { KubernetesServicesComponent } from './kubernetes-services/kubernetes-services.component';
import { KubernetesStatefulsetsComponent } from './kubernetes-statefulsets/kubernetes-statefulsets.component';
import { KubernetesStorageclassesComponent } from './kubernetes-storageclasses/kubernetes-storageclasses.component';

// Children of the Docker controller details page (DockerTabsComponent). Shared by Private Cloud,
// Datacenter -> Private Cloud and Unity Setup -> Integration. Docker container-level monitoring
// (zabbix) is NOT included here; united-cloud adds it on top of these children where needed.
export const DOCKER_TABS_CHILDREN: Routes = [
    { path: 'dockernodes', component: DockerNodesComponent, data: { breadcrumb: { title: 'Docker Nodes', stepbackCount: 0 } } },
    { path: 'dockercontainers', component: DockerContainerComponent, data: { breadcrumb: { title: 'Docker Containers', stepbackCount: 0 } } }
];

// Children of the Kubernetes controller details page (KubernetesTabsComponent). The 17 resource
// tabs are defined once here and reused across all three container locations.
export const KUBERNETES_TABS_CHILDREN: Routes = [
    { path: 'dockernodes', component: DockerNodesComponent, data: { breadcrumb: { title: 'Docker Nodes', stepbackCount: 0 } } },
    { path: 'dockercontainers', component: DockerContainerComponent, data: { breadcrumb: { title: 'Docker Containers', stepbackCount: 0 } } },
    { path: 'pods', component: KubernetesPodsComponent, data: { breadcrumb: { title: 'Pods', stepbackCount: 0 } } },
    {
        path: 'pods/:podId', data: { breadcrumb: { title: 'Pods', stepbackCount: 1 } },
        children: [{ path: 'containers', component: KubernetesContainersComponent, data: { breadcrumb: { title: 'Containers', stepbackCount: 0 } } }]
    },
    { path: 'nodes', component: KubernetesNodesComponent, data: { breadcrumb: { title: 'Nodes', stepbackCount: 0 } } },
    { path: 'namespaces', component: KubernetesNamespacesComponent, data: { breadcrumb: { title: 'Namespaces', stepbackCount: 0 } } },
    { path: 'deployments', component: KubernetesDeploymentsComponent, data: { breadcrumb: { title: 'Deployments', stepbackCount: 0 } } },
    { path: 'replicasets', component: KubernetesReplicasetsComponent, data: { breadcrumb: { title: 'ReplicaSets', stepbackCount: 0 } } },
    { path: 'daemonsets', component: KubernetesDaemonsetsComponent, data: { breadcrumb: { title: 'DaemonSets', stepbackCount: 0 } } },
    { path: 'statefulsets', component: KubernetesStatefulsetsComponent, data: { breadcrumb: { title: 'StatefulSets', stepbackCount: 0 } } },
    { path: 'services', component: KubernetesServicesComponent, data: { breadcrumb: { title: 'Services', stepbackCount: 0 } } },
    { path: 'persistentvolumes', component: KubernetesPersistentVolumesComponent, data: { breadcrumb: { title: 'Persistent Volumes', stepbackCount: 0 } } },
    { path: 'persistentvolumeclaims', component: KubernetesPersistentVolumeClaimsComponent, data: { breadcrumb: { title: 'Persistent Volume Claims', stepbackCount: 0 } } },
    { path: 'events', component: KubernetesEventsComponent, data: { breadcrumb: { title: 'Events', stepbackCount: 0 } } },
    { path: 'controlplane-components', component: KubernetesControlplaneComponentsComponent, data: { breadcrumb: { title: 'ControlPlane Components', stepbackCount: 0 } } },
    { path: 'storageclasses', component: KubernetesStorageclassesComponent, data: { breadcrumb: { title: 'Storage Classes', stepbackCount: 0 } } },
    { path: 'jobs', component: KubernetesJobsComponent, data: { breadcrumb: { title: 'Jobs', stepbackCount: 0 } } },
    { path: 'cronjobs', component: KubernetesCronjobsComponent, data: { breadcrumb: { title: 'CronJobs', stepbackCount: 0 } } },
    { path: 'resourcequotas', component: KubernetesResourcequotasComponent, data: { breadcrumb: { title: 'Resource Quotas', stepbackCount: 0 } } },
    { path: 'hpas', component: KubernetesHpasComponent, data: { breadcrumb: { title: 'HPAs', stepbackCount: 0 } } }
];
