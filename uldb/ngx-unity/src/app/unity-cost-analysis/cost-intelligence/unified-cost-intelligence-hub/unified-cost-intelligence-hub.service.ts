import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CostByCloudType, CostByServicesItem, CostBySubscription } from './unified-cost-intelligence-hub.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class UnifiedCostIntelligenceHubService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }

  getCostBycloudTypeChartData(criteria: SearchCriteria): Observable<CostByCloudType[]> {
    return this.tableService.getData<CostByCloudType[]>('/customer/cloud_cost_summary/cost_by_cloud_type/', criteria)
  }

  getCostBySubscriptionChartData(criteria: SearchCriteria): Observable<CostBySubscription[]> {
    return this.tableService.getData<CostBySubscription[]>('/customer/cloud_cost_summary/cost_by_subscription/', criteria);
  }

  getCostByService(cloudtype: string): Observable<CostByServicesItem[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('cloud_type', cloudtype);
    return this.http.get<CostByServicesItem[]>('/customer/cloud_cost_summary/cost_by_services/', { params: params });
  }

  convertToCostByServicesViewData(data: CostByServicesItem[]): CostByServicesItemViewData[] {
    const viewData: CostByServicesItemViewData[] = [];

    data.forEach(item => {
      const view = new CostByServicesItemViewData();

      view.totalCost = item.total_cost;
      view.currency = item.currency;
      view.service = item.service;
      view.cloud = item.cloud;
      view.deviceListCount = item.account_list.length;
      view.cloudImg = item.cloud_image && item.cloud_image != '' ? `${environment.assetsUrl}${item.cloud_image}` : null;

      // Map deviceList
      view.deviceList = item.account_list.map(device => {
        const deviceView = new DeviceListItem();
        deviceView.currency = device.currency;
        deviceView.currencyUnit = device.currency_unit;
        deviceView.cost = this.formatToUSCurrency(device.cost);
        // deviceView.uuid = device.uuid;
        deviceView.deviceName = device.account_name;
        return deviceView;
      });

      viewData.push(view);
    });

    return viewData;
  }

  convertToCostBycloudChartData(graphData: CostByCloudType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.map(d => {
      if (d.total_cost > 0) {
        data.push({ name: d.cloud_type, value: d.total_cost });
      }
    });
    view.options.series[0].name = 'Cost';
    view.options.series[0].data = data;
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        // let val = data.filter(i => i.name == name);
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params) {
        return params.percent + '%\n($' + params.value + ')'
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} ${c} ({d}%)',
    };

    return view;
  }

  convertToCostBySubscriptionChartData(graphData: CostBySubscription[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.map(d => {
      if (d.cost > 0) {
        data.push({ name: d.account_name, value: d.cost });
      }
    })
    view.options.series[0].name = 'Cost';
    view.options.series[0].data = data;
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        // let val = data.filter(i => i.name == name);
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params) {
        return params.percent + '%\n($' + params.value + ')'
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} ${c} ({d}%)',
    };

    return view;
  }

  formatToUSCurrency(num: number): string {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}


export class CostByServicesItemViewData {
  totalCost: string;
  currency: string;
  deviceList: DeviceListItem[];
  deviceListCount: number;
  cloudImg: string
  cloud: string
  service: string;
  isOpen: boolean = false;

  constructor() { }
}

export class DeviceListItem {
  currency: string;
  currencyUnit: string;
  cost: string;
  uuid: string;
  deviceName: string;

  constructor() { }
}