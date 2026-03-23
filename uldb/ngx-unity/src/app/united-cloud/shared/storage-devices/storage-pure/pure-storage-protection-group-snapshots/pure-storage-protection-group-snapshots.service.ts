import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayProtectionGroupSnapshot, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageProtectionGroupSnapshotsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getProtectionGroupSnapshots(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayProtectionGroupSnapshot>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayProtectionGroupSnapshot>>(`customer/pure_storage/pg_group_snapshots/`, criteria);
  }

  convertToViewData(data: PureStorageArrayProtectionGroupSnapshot[]) {
    let viewData: PureStorageArrayProtectionGroupSnapshotViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayProtectionGroupSnapshotViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.snapshotTime = d.snapshot_time ? this.utilSvc.toUnityOneDateFormat(d.snapshot_time) : 'N/A';
      a.protectionGroup = d.protection_group;
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayProtectionGroupSnapshotViewData {
  id: string;
  name: string;
  snapshotTime: string;
  protectionGroup: string;
  createdAt: string;
  updatedAt: string;
}
