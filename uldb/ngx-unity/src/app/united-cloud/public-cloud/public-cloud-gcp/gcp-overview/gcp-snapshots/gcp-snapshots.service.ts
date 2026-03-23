import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_GCP_SNAPSHOTS, SYNC_GCP_SNAPSHOTS } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class PublicCloudGCPSnapshotService {

    constructor(private http: HttpClient,
        private appService: AppLevelService,
        private tableService: TableApiServiceService) { }

    getGCPSnapshots(criteria: SearchCriteria): Observable<PaginatedResult<GCPSnapshot>> {
        return this.tableService.getData<PaginatedResult<GCPSnapshot>>(GET_GCP_SNAPSHOTS(), criteria);
    }

    convertToViewData(accounts: GCPSnapshot[]): GCPSnapshotViewData[] {
        let viewData: GCPSnapshotViewData[] = [];
        accounts.map(account => {
            let data = new GCPSnapshotViewData();
            data.name = account.name;
            data.status = account.status === 'READY' ? 'Up' : 'Down';
            data.storageBytes = account.storage_bytes;
            data.creationTimestamp = account.creation_timestamp;
            data.diskSizeGb = account.disk_size_gb + ' GB';
            data.storageLocation = account.storage_location;
            data.sourceVmDisk = account.source_vm_disk;
            viewData.push(data);
        });
        return viewData;
    }

    createTaskAndPoll(accountId: string, region: string): Observable<TaskStatus> {
        return this.http.get<CeleryTask>(SYNC_GCP_SNAPSHOTS(accountId, region))
            .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
    }
}

export class GCPSnapshotViewData {
    constructor() { }
    name: string;
    status: string;
    storageBytes: number;
    sourceVmDisk: string;
    diskSizeGb: string;
    storageLocation: string;
    powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin';
    creationTimestamp: string;
}