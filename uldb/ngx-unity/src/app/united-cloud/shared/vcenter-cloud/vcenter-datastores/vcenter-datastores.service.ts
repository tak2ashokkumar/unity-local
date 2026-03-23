import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DatastoreType } from './vcenter-datastores.type';

@Injectable()
export class VcenterDatastoresService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getDatastores(criteria: SearchCriteria, cloudId: string, clusterId: string): Observable<PaginatedResult<DatastoreType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('cloud_uuid', cloudId);
    if (clusterId) {
      params = params.append('cluster_uuid', clusterId);
    }
    return this.http.get<PaginatedResult<DatastoreType>>(`/rest/vmware/datastores/`, { params: params });
  }

  convertToViewData(data: DatastoreType[]): DatastoreViewdata[] {
    let viewData: DatastoreViewdata[] = [];
    data.map(d => {
      let view: DatastoreViewdata = new DatastoreViewdata();
      view.name = d.name;
      view.status = d.datastore_status;
      view.type = d.datastore_type;
      view.host = d.host_count;
      view.vm = d.vm_count;

      view.totalStorageValue = d.storage_usage?.capacity?.value > 0 ? Number(d.storage_usage.capacity.value.toFixed(2)) : 0;
      view.totalStorageUnit = d.storage_usage?.capacity?.unit ? d.storage_usage.capacity.unit : 'bytes';
      view.storageAvailableValue = d.storage_usage?.freespace?.value > 0 ? Number(d.storage_usage.freespace.value.toFixed(2)) : 0;
      view.storageAvailableUnit = d.storage_usage?.freespace?.unit ? d.storage_usage.freespace.unit : 'bytes';
      view.storageUsedValue = d.storage_usage?.provisioned?.value > 0 ? Number(d.storage_usage.provisioned.value.toFixed(2)) : 0;
      view.storageUsedUnit = d.storage_usage?.provisioned?.unit ? d.storage_usage.provisioned.unit : 'bytes';
      view.storageUsedPercentageValue = d.storage_usage?.provisioned_percentage?.value > 0 ? Number(d.storage_usage.provisioned_percentage.value.toFixed(2)) : 0;

      view.totalVsanValue = d.vsan?.capacity?.value > 0 ? Number(d.vsan.capacity.value.toFixed(2)) : 0;
      view.totalVsanUnit = d.vsan?.capacity?.unit ? d.vsan.capacity.unit : 'bytes';
      view.vsanAvailableValue = d.vsan?.freespace?.value > 0 ? Number(d.vsan.freespace.value.toFixed(2)) : 0;
      view.vsanAvailableUnit = d.vsan?.freespace?.unit ? d.vsan.freespace.unit : 'bytes';
      view.vsanUsedValue = d.vsan?.provisioned?.value > 0 ? Number(d.vsan.provisioned.value.toFixed(2)) : 0;
      view.vsanUsedUnit = d.vsan?.provisioned?.unit ? d.vsan.provisioned.unit : 'bytes';
      view.vsanUsedPercentageValue = d.vsan?.provisioned_percentage?.value > 0 ? Number(d.vsan.provisioned_percentage.value.toFixed(2)) : 0;

      viewData.push(view);
    })
    return viewData;
  }

}

export class DatastoreViewdata {
  constructor() { }
  name: string;
  status: string;
  type: string;
  host: number;
  vm: number;
  totalStorageValue: number;
  totalStorageUnit: string;
  storageAvailableValue: number;
  storageAvailableUnit: string;
  storageUsedValue: number;
  storageUsedUnit: string;
  storageUsedPercentageValue: number;
  totalVsanValue: number;
  totalVsanUnit: string;
  vsanAvailableValue: number;
  vsanAvailableUnit: string;
  vsanUsedValue: number;
  vsanUsedUnit: string;
  vsanUsedPercentageValue: number;
}