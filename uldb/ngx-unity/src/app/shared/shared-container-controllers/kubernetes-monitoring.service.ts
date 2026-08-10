import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

// Tooltip for a monitoring chart-line icon, derived purely from the object's monitoring field
// (same rule used by SD-WAN and the container account list). No HTTP - callable inside
// convertToViewdata.
export function KUBERNETES_STATS_TOOLTIP(monitoring: DeviceMonitoringType): string {
  if (!monitoring || !monitoring.configured) {
    return 'Configure Monitoring';
  }
  if (!monitoring.enabled) {
    return 'Enable monitoring';
  }
  return 'Statistics';
}

// Shared by every Kubernetes resource list page (18 of them) so the monitoring drill-down is
// wired the same way everywhere. It stashes the device into session storage (the shared zbx
// shell reads it back) and navigates to the resource's own sibling monitoring route, so Back
// and breadcrumbs land on the originating resource list.
@Injectable({ providedIn: 'root' })
export class KubernetesMonitoringService {
  constructor(private storageService: StorageService) { }

  goToStats(router: Router, route: ActivatedRoute, deviceType: DeviceMapping, uuid: string,
    name: string, monitoring: DeviceMonitoringType) {
    this.storageService.put('device',
      { name, deviceType, configured: monitoring ? monitoring.configured : false }, StorageType.SESSIONSTORAGE);
    let leaf = (monitoring && monitoring.configured && monitoring.enabled) ? 'monitoring-graphs' : 'configure';
    router.navigate([uuid, 'zbx', leaf], { relativeTo: route });
  }
}
