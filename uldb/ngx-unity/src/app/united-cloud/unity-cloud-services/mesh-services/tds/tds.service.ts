import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { GET_TRAFFIC_DIRECTORS, SYNC_TRAFFIC_DIRECTORS } from 'src/app/shared/api-endpoint.const';
import { TdsType } from './tds.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable({
  providedIn: 'root'
})
export class TdsService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  syncTds(meshId: string) {
    return this.http.get<CeleryTask>(SYNC_TRAFFIC_DIRECTORS(meshId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  getTds(meshId: string) {
    return this.http.get<PaginatedResult<TdsType>>(GET_TRAFFIC_DIRECTORS(meshId));
  }

  convertToViewData(tds: TdsType[]) {
    let viewData: TdsViewData[] = [];
    tds.map(td => {
      let view: TdsViewData = new TdsViewData();
      view.name = td.name;
      view.networks = td.networks;
      view.negCount = td.neg_count.toString();
      view.regions = td.regions;
      view.associatedUrlMap = td.associated_url_map;
      view.healthyCount = td.healthy_count;
      view.health = td.healthy_count + '/' + td.neg_count;
      viewData.push(view);
    });
    return viewData;
  }
}

export class TdsViewData {
  constructor() { }
  name: string;
  networks: string;
  negCount: string;
  regions: string;
  associatedUrlMap: string;
  healthyCount: number;
  health: string;
  port: number;
}