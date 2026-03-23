import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { NutanixVMType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { GET_VM_LIST_BY_PLATFORM, NUTANIX_VIRTUAL_MACHINES } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class VmsListNutanixService {
  
  constructor(private tableService: TableApiServiceService,    
    private builder: FormBuilder) { }

  getVMs(pcId:string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixVMType>> {
    return this.tableService.getData<PaginatedResult<NutanixVMType>>(NUTANIX_VIRTUAL_MACHINES(pcId), criteria);
  }

  getAllNutanixVms(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<NutanixVMType>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.NUTANIX), criteria);
  }

  converToViewData(data: NutanixVMType[]): NutanixVMViewData[] {
    let viewData: NutanixVMViewData[] = [];
    data.map(d => {
      let a = new NutanixVMViewData();
      a.id = d.id;
      a.uuid = d.uuid;
      a.name = d.name;
      a.hostName = d.host_name;
      a.ipAddress = d.ip_address ? d.ip_address[0]: 'NA';
      a.cores = d.cores ? d.cores.toString() : 'NA';
      a.totalStorage = d.total_storage ? d.total_storage : 'NA';
      a.usedStorage = d.used_storage ? d.used_storage : 'NA';
      a.freeStoragePct = d.free_storage_pct ? d.free_storage_pct : 'NA';
      a.cpuUsage = d.cpu_usage ? d.cpu_usage : 'NA';
      a.memoryUsage = d.memory_usage ? d.memory_usage : 'NA';
      viewData.push(a);
    });
    return viewData;
  }
  
  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}

export class NutanixVMViewData {
  constructor(){}
  name: string;
  id: string;
  uuid: string;
  cluster: string;
  powerState: string;
  hostName: string;
  hostUUID: string;
  ipAddress: string;
  cores: string;
  memoryCapacity: string;
  totalStorage: string;
  usedStorage: string;
  cpuUsage: string;
  memoryUsage: string;
  controllerReadIops: string;
  controllerWriteIops: string;
  controllerBandwidth: string;
  controllerAvgLatency: string;
  flashMode: boolean;
  freeStoragePct: string;
  status?: string;
  monitoring?: DeviceMonitoringType;
}