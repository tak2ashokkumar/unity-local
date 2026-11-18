import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VERGEIO_VMS } from 'src/app/shared/api-endpoint.const';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class VmsListVergeioService {

  constructor(private tableService: TableApiServiceService) { }

  getVMs(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<VergeioVmType>> {
    return this.tableService.getData<PaginatedResult<VergeioVmType>>(`${VERGEIO_VMS()}?cloud_uuid=${pcId}`, criteria);
  }

  convertToViewData(data: VergeioVmType[]): VergeioVmViewData[] {
    let viewData: VergeioVmViewData[] = [];
    data.forEach(d => {
      let a = new VergeioVmViewData();
      a.uuid = d.uuid;
      a.name = d.name ? d.name : 'NA';
      a.powerState = d.power_state ? d.power_state : 'NA';
      a.powerStateClass = this.getPowerStateClass(d.power_state);
      a.powerStatus = this.getPowerStatus(d.power_state);
      a.clusterId = d.cluster_id ? d.cluster_id : 'NA';
      a.hostId = d.host_id ? d.host_id : 'NA';
      a.cpuCores = d.data && d.data.cpu_cores != null ? d.data.cpu_cores.toString() : 'NA';
      a.ram = d.data && d.data.ram != null ? d.data.ram.toString() : 'NA';
      a.monitoring = d.monitoring;
      // Mirror the VMware VM list monitoring-icon convention: a dynamic tooltip that
      // reflects the monitoring state (Configure / Enable / VM Statistics).
      a.isStatsButtonEnabled = true;
      if (!d.monitoring || !d.monitoring.configured) {
        a.statsTooltipMessage = 'Configure Monitoring';
      } else if (!d.monitoring.enabled) {
        a.statsTooltipMessage = 'Enable monitoring';
      } else {
        a.statsTooltipMessage = 'VM Statistics';
      }
      viewData.push(a);
    });
    return viewData;
  }

  private getPowerStateClass(state: string): string {
    switch ((state || '').toLowerCase()) {
      case 'running': return 'text-success';
      case 'stopped': return 'text-danger';
      default: return 'text-muted';
    }
  }

  // Map the raw power state to the shared Up/Down/Unknown status so the Power State
  // column renders the same green/red/grey dot as the other cloud VM lists.
  private getPowerStatus(state: string): string {
    switch ((state || '').toLowerCase()) {
      case 'running': return 'Up';
      case 'stopped': return 'Down';
      default: return 'Unknown';
    }
  }
}

export interface VergeioVmType {
  uuid: string;
  name: string;
  resource_type: string;
  power_state: string;
  cluster_id: string;
  host_id: string;
  data: VergeioVmData;
  monitoring: DeviceMonitoringType;
}

export interface VergeioVmData {
  cpu_cores: number;
  ram: number;
}

export class VergeioVmViewData {
  uuid: string;
  name: string;
  powerState: string;
  powerStateClass: string;
  powerStatus: string;
  clusterId: string;
  hostId: string;
  cpuCores: string;
  ram: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean = false;
}
