import { Routes } from '@angular/router';
import { ContainerControllersZabbixComponent } from './container-controllers-zabbix/container-controllers-zabbix.component';
import { ZABBIX_CONTAINER_CONTROLLER_ROUTES } from './container-controllers-zabbix/container-controllers-zabbix-routing.const';

// Per-resource monitoring routes for Kubernetes resource instances (united-cloud only). Each is a
// sibling of its resource list under the Kubernetes tabs, sharing that resource's own path segment,
// so the reused zbx shell's Back (hard-coded '../../') and the breadcrumb (stepbackCount 2) both land
// on the originating resource list. The device type comes from session storage (set by
// KubernetesMonitoringService.goToStats), so one shell serves every resource type.
// Spread into the two united-cloud Kubernetes-tabs routes as
//   children: [...KUBERNETES_TABS_CHILDREN, ...KUBERNETES_MONITORING_CHILDREN]
// Integration deliberately omits it, so no monitoring route exists there.
const zbxRoute = (path: string, title: string) => ({
  path,
  component: ContainerControllersZabbixComponent,
  data: { breadcrumb: { title, stepbackCount: 2 } },
  children: ZABBIX_CONTAINER_CONTROLLER_ROUTES
});

export const KUBERNETES_MONITORING_CHILDREN: Routes = [
  zbxRoute('nodes/:deviceid/zbx', 'Nodes'),
  zbxRoute('pods/:deviceid/zbx', 'Pods'),
  zbxRoute('pods/:podId/containers/:deviceid/zbx', 'Containers'),
  zbxRoute('namespaces/:deviceid/zbx', 'Namespaces'),
  zbxRoute('deployments/:deviceid/zbx', 'Deployments'),
  zbxRoute('replicasets/:deviceid/zbx', 'ReplicaSets'),
  zbxRoute('daemonsets/:deviceid/zbx', 'DaemonSets'),
  zbxRoute('statefulsets/:deviceid/zbx', 'StatefulSets'),
  zbxRoute('services/:deviceid/zbx', 'Services'),
  zbxRoute('persistentvolumes/:deviceid/zbx', 'PersistentVolumes'),
  zbxRoute('persistentvolumeclaims/:deviceid/zbx', 'PersistentVolumeClaims'),
  zbxRoute('events/:deviceid/zbx', 'Events'),
  zbxRoute('controlplane-components/:deviceid/zbx', 'ControlPlane Components'),
  zbxRoute('storageclasses/:deviceid/zbx', 'StorageClasses'),
  zbxRoute('jobs/:deviceid/zbx', 'Jobs'),
  zbxRoute('cronjobs/:deviceid/zbx', 'CronJobs'),
  zbxRoute('resourcequotas/:deviceid/zbx', 'ResourceQuotas'),
  zbxRoute('hpas/:deviceid/zbx', 'HPAs')
];
