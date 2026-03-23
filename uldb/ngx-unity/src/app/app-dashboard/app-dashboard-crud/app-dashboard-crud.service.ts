import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEVICES_LIST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppDashboardListType, AppDashboardWidgetType } from '../app-dashboard.type';
import { DashboardDevice } from './app-dashboard-crud.type';

@Injectable()
export class AppDashboardCrudService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private builder: FormBuilder,
    private utilService: AppUtilityService) { }

  getViewDetails(viewId: string) {
    return this.http.get<any>(`/customer/persona/dashboards/${viewId}/`);
  }

  getDevicesByDeviceType(deviceType: string, metricesMapping?: boolean, criteria?: SearchCriteria): Observable<DashboardDevice[] | PaginatedResult<DashboardDevice>> {
    const deviceMapping = this.utilService.getDeviceMappingByDeviceType(deviceType);
    if (deviceMapping) {
      if (metricesMapping) {
        return this.tableSvc.getData<PaginatedResult<DashboardDevice>>(DEVICES_LIST_BY_DEVICE_TYPE(deviceMapping), criteria);
      } else {
        return this.http.get<DashboardDevice[]>(DEVICES_LIST_BY_DEVICE_TYPE(deviceMapping), { params: new HttpParams().set('page_size', 0) });
      }
    }
  }

  getMetricesByDevice(deviceType: string, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    criteria.params[0].device_type = deviceType;
    criteria.params[0].device_uuid = deviceId;
    return this.tableSvc.getData<PaginatedResult<any>>(`rest/zabbix/device_items/`, criteria);
  }

  buildDetailsForm(data?: AppDashboardListType): FormGroup {
    if (data) {
      let form = this.builder.group({
        name: [data && data.name && data.name != '' ? data.name : '', [Validators.required, NoWhitespaceValidator]],
        description: [data && data.description && data.description != '' ? data.description : ''],
        type: [data && data.type && data.type != '' ? data.type : 'crafted', [Validators.required, NoWhitespaceValidator]],
        status: [data && data.status && data.status != '' ? data.status : 'draft', [Validators.required, NoWhitespaceValidator]],
        refresh: [data.refresh ? data.refresh : false, [Validators.required, NoWhitespaceValidator]],
        timeframe: [data.timeframe ? data.timeframe : '', [Validators.required, NoWhitespaceValidator]],
      })
      if (data.refresh) {
        form.addControl('refresh_interval_in_sec', new FormControl(data.refresh_interval_in_sec ? data.refresh_interval_in_sec : null, [Validators.required, NoWhitespaceValidator]));
      }
      return form;
    } else {
      return this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        description: [''],
        type: ['crafted', [Validators.required, NoWhitespaceValidator]],
        status: ['draft', [Validators.required, NoWhitespaceValidator]],
        is_default: [false, [Validators.required]],
        refresh: [false, [Validators.required, NoWhitespaceValidator]],
        timeframe: ['', [Validators.required, NoWhitespaceValidator]],
      })
    }
  }

  resetDetailsFormErrors(): any {
    let formErrors = {
      name: '',
      timeframe: '',
      refresh_interval: '',
    };
    return formErrors;
  }

  detailsFormValidationMessages = {
    name: {
      required: 'Name is required',
    },
    timeframe: {
      required: 'Data Timeframe is required',
    },
    refresh_interval: {
      required: 'Refresh Interval is required',
    },
  }

  buildFilterForm(data?: AppDashboardListType): FormGroup {
    if (data) {
      let form = this.builder.group({
        refresh: [data.refresh ? data.refresh : false, [Validators.required, NoWhitespaceValidator]],
        timeframe: [data.timeframe ? data.timeframe : '', [Validators.required, NoWhitespaceValidator]],
      })
      if (data.refresh) {
        form.addControl('refresh_interval_in_sec', new FormControl(data.refresh_interval_in_sec ? data.refresh_interval_in_sec : null, [Validators.required, NoWhitespaceValidator]));
      }
      return form;
    } else {
      return this.builder.group({
        refresh: [false, [Validators.required, NoWhitespaceValidator]],
        timeframe: ['', [Validators.required, NoWhitespaceValidator]],
      })
    }
  }

  resetFilterFormErrors(): any {
    let formErrors = {
      timeframe: '',
      refresh_interval: '',
    };
    return formErrors;
  }

  filterFormValidationMessages = {
    timeframe: {
      required: 'Data Timeframe is required',
    },
    refresh_interval: {
      required: 'Refresh Interval is required',
    },
  }

  saveDashboardData(data: any, dashboardId?: string): Observable<any> {
    if (dashboardId) {
      return this.http.patch<AppDashboardListType>(`/customer/persona/dashboards/${dashboardId}/`, data);
    } else {
      return this.http.post<AppDashboardListType>(`/customer/persona/dashboards/`, data);
    }
  }

  getDashboardWidgets(viewId: string, criteria: SearchCriteria): Observable<AppDashboardWidgetType[]> {
    let params: HttpParams = this.tableSvc.getWithParam(criteria);
    return this.http.get<AppDashboardWidgetType[]>(`/customer/persona/dashboards/${viewId}/widgets/`, { params: params }).pipe(
      map((res: AppDashboardWidgetType[]) => {
        return res.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      })
    );;
  }

  buildWidgetForm(widget?: any): FormGroup {
    if (widget) {
      let form = this.builder.group({
        name: [widget ? widget.name : '', [Validators.required, NoWhitespaceValidator]],
        status: [widget ? widget.status : 'draft', [Validators.required, NoWhitespaceValidator]],
        widget_type: [widget ? widget.widget_type : '', [Validators.required, NoWhitespaceValidator]],
      })
      if (widget?.widget_type != 'monitoring') {
        if (widget.widget_type) {
          form.addControl('group_by', new FormControl(widget.group_by ? widget.group_by : '', [Validators.required, NoWhitespaceValidator]));
        }
        if (widget.group_by) {
          form.addControl('group_by_filter', new FormControl(widget.group_by_filter ? widget.group_by_filter : [], [Validators.required]));
        }
      }
      return form;
    } else {
      return this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        status: ['draft', [Validators.required, NoWhitespaceValidator]],
        widget_type: ['', [Validators.required, NoWhitespaceValidator]],
      })
    }
  }

  resetWidgetFormErrors(): any {
    let formErrors = {
      name: '',
      category: '',
      widget_type: '',
      group_by: '',
      group_by_filter: '',
    };
    return formErrors;
  }

  widgetFormValidationMessages = {
    name: {
      required: 'Name is required',
    },
    category: {
      required: 'Category is required',
    },
    widget_type: {
      required: 'Widget Type is required',
    },
    group_by: {
      required: 'Groupby is required',
    },
    group_by_filter: {
      required: 'Filter Selection is required',
    },
  }

  buildMetricesMappingform(): FormGroup {
    return this.builder.group({
      'device_type': [''],
      'device_key': [''],
      'metrices_key': [''],
      'selected_metrices_key': ['']
    });
  }

  getSupportedPrivateCloudTypes(): Observable<string[]> {
    return this.http.get<{ 'private_cloud_data': string[], 'public_cloud_data': string[] }>('/customer/custom_widget/widget/get_cloud_details/').pipe(
      map((res: { 'private_cloud_data': string[], 'public_cloud_data': string[] }) => {
        return res.private_cloud_data;
      })
    );
  }

  getSupportedPublicCloudTypes(): Observable<any> {
    return this.http.get<{ 'private_cloud_data': string[], 'public_cloud_data': string[] }>('/customer/custom_widget/widget/get_cloud_details/').pipe(
      map((res: { 'private_cloud_data': string[], 'public_cloud_data': string[] }) => {
        return res.public_cloud_data;
      })
    );
  }

  getWidgetGroupByFilterOptions(widget_name: string, group_by_selector: string, filterCloud?: string[]): Observable<string[]> {
    let params: HttpParams = new HttpParams().set('widget_name', widget_name).set('group_by_selector', group_by_selector);
    if (filterCloud && filterCloud.length > 0) {
      filterCloud.forEach(cloud => {
        params = params.append('filter_cloud', cloud);
      });
    }
    return this.http.get<string[]>(`/customer/custom_widget/widget/group_by_selector/`, { params: params });
  }

  createDashboardWidget(data: any, dashboardId: string): Observable<any> {
    return this.http.post<AppDashboardListType>(`/customer/persona/dashboards/${dashboardId}/widgets/`, data);
  }

  updateDashboardWidget(data: any, widgetId: string): Observable<any> {
    return this.http.put<AppDashboardListType>(`/customer/persona/widgets/${widgetId}/`, data);
  }

  deleteDashboardWidget(widgetId: string): Observable<any> {
    return this.http.delete<AppDashboardListType>(`/customer/persona/widgets/${widgetId}/`);
  }
}

export class AppDashboardWidgetCategoryOptions {
  label: string;
  value: string;
  dataurl?: string
  group_by?: AppDashboardWidgetCategoryOptions[];
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