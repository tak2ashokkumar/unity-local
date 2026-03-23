import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NUTANIX_DISCOVERY_LIST } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { NutanixDeviceDataType } from 'src/app/united-cloud/shared/entities/nutanix.type';

@Injectable()
export class UsiNutanixDiscovedDevicesService {
 
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getNutanixDevices(pcId: string, criteria: SearchCriteria): Observable<NutanixDeviceDataType[]> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<NutanixDeviceDataType[]>(NUTANIX_DISCOVERY_LIST(pcId), { params: params });
  }

  convertToViewData(data: NutanixDeviceDataType[]): NutanixViewData[] {
    let viewData: NutanixViewData[] = [];
    data.map(s => {
      let a: NutanixViewData = new NutanixViewData();
      a.name = s.name ? s.name : 'NA';
      a.status = s.status ? s.status : 'NA';
      a.lastDiscovered = s.last_discovered ? s.last_discovered : 'NA';
      a.cpuUsage = s.cpu_usage ? s.cpu_usage : 'NA';
      a.deviceUuid = s.device_uuid ? s.device_uuid : 'NA';
      a.freeStoragePct = s.free_storage_pct ? s.free_storage_pct : 'NA';
      a.os = s.os ? s.os : 'NA';
      a.totalStorage = s.total_storage ? s.total_storage : 'NA';
      a.usedStorage = s.used_storage ? s.used_storage : 'NA';
      a.deviceType = s.device_type ? s.device_type : 'NA';
      a.firstDiscovered = s.first_discovered ? s.first_discovered : 'NA';
      a.ipAddress = s.ip_address ? s.ip_address : 'NA';
      a.memoryUsage = s.memory_usage ? s.memory_usage : 'NA';
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixViewData {
  constructor(){}
  status: string;
  lastDiscovered: string;
  cpuUsage: string;
  name: string;
  deviceUuid: string;
  freeStoragePct: string;
  os: string;
  totalStorage: string;
  usedStorage: string;
  deviceType: string;
  firstDiscovered: string;
  ipAddress: string;
  memoryUsage: string;
}