import { TabData } from 'src/app/shared/tabdata';

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
