import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { GET_NEG_LIST, SYNC_NEG_LIST, GET_NEG_SERVICE_STATUS } from 'src/app/shared/api-endpoint.const';
import { take, switchMap, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NEGType } from './neg.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { of, Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class NegService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  syncNegList(meshId: string, serviceName: string) {
    return this.http.get<CeleryTask>(SYNC_NEG_LIST(meshId, serviceName))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  getNegList(meshId: string, serviceName: string) {
    return this.http.get<PaginatedResult<NEGType>>(GET_NEG_LIST(meshId, serviceName));
  }

  getNEGServiceStatus(uuid: string, meshId: string, serviceName: string): Observable<Map<string, string>> {
    console.log("uuid for status:", uuid);
    return this.http.get(GET_NEG_SERVICE_STATUS(uuid, meshId, serviceName), { headers: Handle404Header })
      .pipe(
        map((res: string) => {
          return new Map<string, string>().set(uuid, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(uuid, 'N/A'));
        })
      );
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.RUNNING:
        return 'fa-circle text-success';
      case DeviceStatusMapping.FAILED:
        return 'fa-circle text-danger';
      default:
        return 'fa-exclamation-circle text-warning';
    }
  }

  convertToViewData(negs: NEGType[]) {
    let viewData: NegViewDataType[] = [];
    negs.map(neg => {
      let view: NegViewDataType = new NegViewDataType();
      view.capacity = neg.capacity + '%';
      view.name = neg.name;
      view.zone = neg.zone;
      view.uuid = neg.uuid;
      view.networkEndpointType = neg.network_endpoint_type;
      // view.health = neg.healthy_count + '/' + neg.neg_backends_count;
      view.maxRps = neg.max_rps + '';
      viewData.push(view);
    });
    return viewData;
  }
}


export class NegViewDataType {
  capacity: string;
  name: string;
  zone: string;
  networkEndpointType: string;
  health: string;
  maxRps: string;
  statusIcon: string;
  uuid: string;
}