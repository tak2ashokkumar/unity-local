import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { GET_ALL_CUSTOM_DASHBOARD_WIDGET, SYNC_ALL_CUSTOM_DASHBOARD_WIDGET } from 'src/app/shared/api-endpoint.const';
import { WidgetDataType } from './custom-dashboard.type';

@Injectable()
export class CustomDashboardService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  syncWidgets() {
    return this.http.get<CeleryTask>(SYNC_ALL_CUSTOM_DASHBOARD_WIDGET())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  getWidgets(duration: number): Observable<WidgetDataType[]> {
    let params = new HttpParams().set('page_size', '0').set('status', 'true');
    return this.http.get<WidgetDataType[]>(GET_ALL_CUSTOM_DASHBOARD_WIDGET(), { params: params });
  }

  buildAutoRefresh() {
    let form = this.builder.group({
      'autoRefresh': [false],
      'refreshInterval': [{ value: 1, disabled: true }]
    });
    return form;
  }
}

export class WidgetViewData {
  constructor() { };
  id: number;
  uuid: string;
  name: string;
  widgetType: string;
  cloud: string;
  groupBy: string;
  platformType: string;
  createdBy: string;
  status: boolean;
  createdAt: string;
  lastExecution: string;
  data: GraphViewData[] | NetworkTrafficViewData[];
}

export class GraphViewData {
  constructor() { };
  name: string;
  count: number | string;
  disk?: string = '';
  Up?: number = 0;
  Down?: number = 0;
  Unknown?: number = 0;
  hostName?: string;
}

export class NetworkTrafficViewData {
  constructor() { };
  receive: string;
  bandwidth: string;
  host: string;
  deviceType: string;
  transmit: string;
  interfaceName: string;
  speed: string;
  value?: string | number;
  name: string;
}

export class MetricesMappingViewData {
  constructor() { }
  name: string;
  uuid: string;
  status: string;
  isSelected: boolean = false;
  metrics: MetricViewData[] = [];
}

export class MetricViewData {
  constructor() { }
  name: string;
  value: number;
  unit: string;
}