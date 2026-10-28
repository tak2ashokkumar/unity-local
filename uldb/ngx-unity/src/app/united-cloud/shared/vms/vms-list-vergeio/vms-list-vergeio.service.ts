import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { VERGEIO_VIRTUAL_MACHINES } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class VmsListVergeioService {

  constructor(private tableService: TableApiServiceService) { }

  getVMs(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<VergeioVmType>> {
    return this.tableService.getData<PaginatedResult<VergeioVmType>>(`${VERGEIO_VIRTUAL_MACHINES()}?cloud_id=${pcId}`, criteria);
  }

  convertToViewData(data: VergeioVmType[]): VergeioVmViewData[] {
    let viewData: VergeioVmViewData[] = [];
    data.forEach(d => {
      let a = new VergeioVmViewData();
      a.uuid = d.uuid;
      a.name = d.name ? d.name : 'NA';
      a.powerState = d.power_state ? d.power_state : 'NA';
      a.powerStateClass = this.getPowerStateClass(d.power_state);
      a.clusterId = d.cluster_id ? d.cluster_id : 'NA';
      a.hostId = d.host_id ? d.host_id : 'NA';
      a.cpuCores = d.data && d.data.cpu_cores != null ? d.data.cpu_cores.toString() : 'NA';
      a.ram = d.data && d.data.ram != null ? d.data.ram.toString() : 'NA';
      a.monitoring = d.monitoring;
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
  clusterId: string;
  hostId: string;
  cpuCores: string;
  ram: string;
  monitoring: DeviceMonitoringType;
}
