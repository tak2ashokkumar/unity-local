import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult, SyncResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { StorageOntapClusterSummary } from './storage-ontap.type';

@Injectable()
export class StorageOntapService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,) { }

  getClusterSummary(clusterId: string): Observable<StorageOntapClusterSummary> {
    return this.http.get<StorageOntapClusterSummary>(`/customer/netapp_cluster/${clusterId}/cluster/summary/`);
  }

  convertToSummaryViewData(s: StorageOntapClusterSummary): ClusterSummaryViewData {
    let a: ClusterSummaryViewData = new ClusterSummaryViewData();
    if (s.nodes) {
      a.nodesCount = s.nodes.count;
      if (s.nodes.up) {
        a.nodesUp = s.nodes.up;
        a.nodesDown = s.nodes.count - s.nodes.up;
      } else if (s.nodes.degraded) {
        a.nodesDown = s.nodes.degraded;
        a.nodesUp = s.nodes.count - s.nodes.degraded;
      }
    }
    if (s.aggregates) {
      a.aggregatesCount = s.aggregates.count;
      if (s.aggregates.online) {
        a.aggregatesUp = s.aggregates.online;
        a.aggregatesDown = s.aggregates.count - s.aggregates.online;
      }
    }
    if (s.svms) {
      a.svmsCount = s.svms.count;
      if (s.svms.running) {
        a.svmsUp = s.svms.running;
        a.svmsDown = s.svms.count - s.svms.running;
      }
    }
    if (s.volumes) {
      a.volumesCount = s.volumes.count;
      if (s.volumes.online) {
        a.volumesUp = s.volumes.online;
        a.volumesDown = s.volumes.count - s.volumes.online;
      }
    }
    if (s.luns) {
      a.lunsCount = s.luns.count;
      if (s.luns.online) {
        a.lunsUp = s.luns.online;
        a.lunsDown = s.luns.count - s.luns.online;
      }
    }
    return a;
  }

  convertToSyncData(res: PaginatedResult<any>): SyncResult {
    let s: SyncResult = new SyncResult();
    s.sync = res.sync;
    s.lastSync = res.last_sync ? this.utilSvc.toUnityOneDateFormat(res.last_sync) : res.last_sync;
    s.url = res.sync_url;
    return s;
  }

  syncData(url: string) {
    return this.http.get<CeleryTask>(url)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }
}

export class ClusterSummaryViewData {
  nodesCount: number = 0;
  nodesUp: number = 0;
  nodesDown: number = 0;

  aggregatesCount: number = 0;
  aggregatesUp: number = 0;
  aggregatesDown: number = 0;

  svmsCount: number = 0;
  svmsUp: number = 0;
  svmsDown: number = 0;

  volumesCount: number = 0;
  volumesUp: number = 0;
  volumesDown: number = 0;

  lunsCount: number = 0;
  lunsUp: number = 0;
  lunsDown: number = 0;
}
