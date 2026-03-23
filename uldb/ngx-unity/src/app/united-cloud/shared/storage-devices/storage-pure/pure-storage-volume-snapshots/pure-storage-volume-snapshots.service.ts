import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayVolumeSnapshot, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageVolumeSnapshotsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getVolumeSnapshots(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayVolumeSnapshot>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayVolumeSnapshot>>(`customer/pure_storage/snapshots/`, criteria);
  }

  convertToViewData(data: PureStorageArrayVolumeSnapshot[]) {
    let viewData: PureStorageArrayVolumeSnapshotViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayVolumeSnapshotViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.serialNumber = d.serial_number ? d.serial_number : 'N/A';
      a.snapshotTime = d.snapshot_time ? this.utilSvc.toUnityOneDateFormat(d.snapshot_time) : 'N/A';
      a.volume = d.volume;
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayVolumeSnapshotViewData {
  id: string;
  name: string;
  serialNumber: string;
  volume: string;
  snapshotTime: string;
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
}
