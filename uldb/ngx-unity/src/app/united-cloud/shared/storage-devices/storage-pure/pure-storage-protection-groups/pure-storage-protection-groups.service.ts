import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PureStorageArrayProtectionGroup, PureStorageArrayProtectionGroupReplicationSchedule, PureStorageArrayProtectionGroupSnapshotSchedule, PureStorageGraphDataAttr, PureStorageSpaceAttr } from 'src/app/shared/SharedEntityTypes/storage-pure.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PureStorageProtectionGroupsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getProtectionGroups(criteria: SearchCriteria): Observable<PaginatedResult<PureStorageArrayProtectionGroup>> {
    return this.tableService.getData<PaginatedResult<PureStorageArrayProtectionGroup>>(`customer/pure_storage/pg_group/`, criteria);
  }

  convertToViewData(data: PureStorageArrayProtectionGroup[]) {
    let viewData: PureStorageArrayProtectionGroupViewData[] = [];
    data.map(d => {
      let a = new PureStorageArrayProtectionGroupViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.connectedHosts = d.hosts;
      a.connectedHostGroups = d.host_groups;
      a.connectedVolumes = d.volumes;
      a.connectedSnapshots = d.pg_group_snapshots.map(dps => dps.name);
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.space = d.space;
      a.graphData = d.graph_data;
      a.snapshotSchedule = d.snapshot_schedule;
      a.replicationSchedule = d.replication_schedule;
      viewData.push(a);
    })
    return viewData;
  }
}

export class PureStorageArrayProtectionGroupViewData {
  id: string;
  name: string;
  connectedHosts: string[];
  connectedHostGroups: string[];
  connectedVolumes: string[];
  connectedSnapshots: string[];
  createdAt: string;
  updatedAt: string;
  space: PureStorageSpaceAttr;
  graphData: PureStorageGraphDataAttr;
  snapshotSchedule: PureStorageArrayProtectionGroupSnapshotSchedule;
  replicationSchedule: PureStorageArrayProtectionGroupReplicationSchedule;
}
