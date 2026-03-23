import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayComponentArrayItem, PureStorageArrayPOD, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStoragePodsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getPODS(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayPOD>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayPOD>>(`customer/pure_storage/pods/`, criteria);
  }

  convertToViewData(data: PureStorageArrayPOD[]) {
    let viewData: PureStorageArrayPODViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayPODViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.source = d.source ? d.source : 'N/A';
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      a.arrays = d.arrays && d.arrays.length ? d.arrays : [];
      a.arrays.forEach(arr => {
        arr.statusClass = arr.status == 'online' ? 'text-success' : 'text-danger'
      })
      a.primaryArray = a.arrays.getFirst();
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayPODViewData {
  id: string;
  name: string;
  source: string;
  arrays: PureStorageArrayComponentArrayItem[];
  primaryArray: PureStorageArrayComponentArrayItem;
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}