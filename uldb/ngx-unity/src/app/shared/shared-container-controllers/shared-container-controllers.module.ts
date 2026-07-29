import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DockerContainerComponent } from './docker-containers/docker-container.component';
import { DockerNodesComponent } from './docker-nodes/docker-nodes.component';
import { DockerTabsComponent } from './docker-tabs/docker-tabs.component';
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
import { KubernetesPodsService } from './kubernetes-pods/kubernetes-pods.service';
import { KubernetesPersistentVolumeClaimsComponent } from './kubernetes-persistentvolumeclaims/kubernetes-persistentvolumeclaims.component';
import { KubernetesPersistentVolumesComponent } from './kubernetes-persistentvolumes/kubernetes-persistentvolumes.component';
import { KubernetesReplicasetsComponent } from './kubernetes-replicasets/kubernetes-replicasets.component';
import { KubernetesResourcequotasComponent } from './kubernetes-resourcequotas/kubernetes-resourcequotas.component';
import { KubernetesServicesComponent } from './kubernetes-services/kubernetes-services.component';
import { KubernetesStatefulsetsComponent } from './kubernetes-statefulsets/kubernetes-statefulsets.component';
import { KubernetesStorageclassesComponent } from './kubernetes-storageclasses/kubernetes-storageclasses.component';
import { KubernetesTabsComponent } from './kubernetes-tabs/kubernetes-tabs.component';
import { ContainerResourceAccordionComponent } from './container-resource-accordion/container-resource-accordion.component';
import { ContainerResourceBackBtnComponent } from './container-resource-back-btn/container-resource-back-btn.component';

// Container resource-DISPLAY components (Kubernetes/Docker detail tabs and resource lists).
// Lives under app/shared so ANY lazy feature module can render container detail pages by
// importing just this small module - without pulling in the heavy UnitedCloudSharedModule.
const COMPONENTS = [
  ContainerResourceAccordionComponent,
  ContainerResourceBackBtnComponent,
  KubernetesTabsComponent,
  KubernetesNodesComponent,
  KubernetesPodsComponent,
  KubernetesContainersComponent,
  KubernetesNamespacesComponent,
  KubernetesDeploymentsComponent,
  KubernetesReplicasetsComponent,
  KubernetesDaemonsetsComponent,
  KubernetesStatefulsetsComponent,
  KubernetesServicesComponent,
  KubernetesPersistentVolumesComponent,
  KubernetesPersistentVolumeClaimsComponent,
  KubernetesEventsComponent,
  KubernetesControlplaneComponentsComponent,
  KubernetesStorageclassesComponent,
  KubernetesJobsComponent,
  KubernetesCronjobsComponent,
  KubernetesResourcequotasComponent,
  KubernetesHpasComponent,
  DockerTabsComponent,
  DockerNodesComponent,
  DockerContainerComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [AppCoreModule, SharedModule],
  exports: [COMPONENTS],
  providers: [KubernetesPodsService]
})
export class SharedContainerControllersModule { }
