import { TabData } from 'src/app/shared/tabdata';
import { ContainerResourceSection } from './container-resource-accordion/container-resource-accordion.component';

// Global (account-less) Devices -> Containers URL bases. Kubernetes and Docker each
// have their own route under devices, so accordion items carry the correct base and
// the browser URL reflects the resource type (kubernetes/... vs docker/...).
export const GLOBAL_KUBERNETES_BASE = '/unitycloud/devices/kubernetes';
export const GLOBAL_DOCKER_BASE = '/unitycloud/devices/docker';

// Kubernetes resource tabs (17), shared by every Kubernetes controller location.
export const KUBERNETES_RESOURCE_TABS: TabData[] = [
  { name: 'Nodes', url: 'nodes' },
  { name: 'Pods', url: 'pods' },
  { name: 'Namespaces', url: 'namespaces' },
  { name: 'Deployments', url: 'deployments' },
  { name: 'ReplicaSets', url: 'replicasets' },
  { name: 'DaemonSets', url: 'daemonsets' },
  { name: 'StatefulSets', url: 'statefulsets' },
  { name: 'Services', url: 'services' },
  { name: 'PersistentVolumes', url: 'persistentvolumes' },
  { name: 'PersistentVolumeClaims', url: 'persistentvolumeclaims' },
  { name: 'Events', url: 'events' },
  { name: 'ControlPlane Components', url: 'controlplane-components' },
  { name: 'StorageClasses', url: 'storageclasses' },
  { name: 'Jobs', url: 'jobs' },
  { name: 'CronJobs', url: 'cronjobs' },
  { name: 'ResourceQuotas', url: 'resourcequotas' },
  { name: 'HPAs', url: 'hpas' }
];

// Docker resource tabs (2), shared by every Docker controller location.
export const DOCKER_RESOURCE_TABS: TabData[] = [
  { name: 'Nodes', url: 'nodes' },
  { name: 'Containers', url: 'containers' }
];

// In the global Devices -> Containers view both shells render this same two-section
// accordion (Kubernetes + Docker); each shell just opens its own section by default.
export function buildGlobalContainerSections(): ContainerResourceSection[] {
  return [
    {
      heading: 'Kubernetes Resources',
      items: KUBERNETES_RESOURCE_TABS.map(t => ({ name: t.name, url: GLOBAL_KUBERNETES_BASE + '/' + t.url }))
    },
    {
      heading: 'Docker Resources',
      items: DOCKER_RESOURCE_TABS.map(t => ({ name: t.name, url: GLOBAL_DOCKER_BASE + '/' + t.url }))
    }
  ];
}
