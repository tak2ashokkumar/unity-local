import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CloudFilter, CostByCloudType, CostByCloudTypeItem, CostByServicesItem, CostBySubscription, CostSummary, TopUsageDataType, TrailingMonthDataType, TrailingTwelveMonthsDataType, } from './cost-summary.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class CostSummaryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }


  getCloudFilter(): Observable<CloudFilter> {
    return this.http.get<CloudFilter>('/customer/cloud_cost_summary/list_clouds/')
  }

  getRegionFilter(selectedCloud: string): Observable<string[]> {
    return this.http.get<string[]>(`/customer/cloud_cost_summary/list_regions/?cloud=${selectedCloud}`)
  }

  getCostSummary(criteria: SearchCriteria): Observable<CostSummary> {
    return this.tableService.getData<CostSummary>('/customer/cloud_cost_summary/clouds_monthly_cost_summary/', criteria)
  }

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

  getTrailingTwelveMonthData(cloudtype: string): Observable<TrailingTwelveMonthsDataType> {
    let params: HttpParams = new HttpParams();
    params = params.set('cloud_type', cloudtype);
    return this.http.get<TrailingTwelveMonthsDataType>('/customer/cloud_cost_summary/trailing_months_summary/', { params: params });
  }

  getCostByCloudTypeSummaryData(criteria: SearchCriteria): Observable<PaginatedResult<CostByCloudTypeItem>> {
    return this.tableService.getData<PaginatedResult<CostByCloudTypeItem>>('/customer/cloud_cost_summary/cloud_summary/', criteria)
  }

  convertToCostSummaryViewData(data: CostSummary): CostSummaryViewData {
    const viewData = new CostSummaryViewData();

    // Map overall_total data
    viewData.overallTotal = new OverallTotal();
    viewData.overallTotal.totalTtmCost = this.formatToUSCurrency(data.overall_total.total_ttm_cost);
    viewData.overallTotal.totalCurrentCost = this.formatToUSCurrency(data.overall_total.total_current_cost);
    viewData.overallTotal.estimatedChangeStatus = data.overall_total.estimated_change_status;
    viewData.overallTotal.totalEstimatedCost = this.formatToUSCurrency(data.overall_total.total_estimated_cost);
    viewData.overallTotal.totalAverageCost = this.formatToUSCurrency(data.overall_total.total_average_cost);
    viewData.overallTotal.totalPreviousMonthCost = this.formatToUSCurrency(data.overall_total.total_previous_month_cost);
    viewData.overallTotal.estimatedChangePercentage = data.overall_total.estimated_change_percentage;
    viewData.overallTotal.monthlyChangePercentage = data.overall_total.monthly_change_percentage;
    viewData.overallTotal.monthlyChangeStatus = data.overall_total.monthly_change_status;

    // Map cloud_data array
    viewData.cloudData = data.cloud_data.map(cloudItem => {
      const cloudDataItem = new CloudDataItem();
      cloudDataItem.platformType = cloudItem.platform_type;
      cloudDataItem.platformImg = this.utilSvc.getCloudLogo(cloudItem.platform_type, true);
      cloudDataItem.cost = new Cost();
      cloudDataItem.cost.totalTtmCost = this.formatToUSCurrency(cloudItem.cost.total_ttm_cost);
      cloudDataItem.cost.totalCurrentCost = this.formatToUSCurrency(cloudItem.cost.total_current_cost);
      cloudDataItem.cost.cloudCostPercentage = cloudItem.cost.cloud_cost_percentage;
      cloudDataItem.cost.estimatedChangeStatus = cloudItem.cost.estimated_change_status;
      cloudDataItem.cost.totalEstimatedCost = this.formatToUSCurrency(cloudItem.cost.total_estimated_cost);
      cloudDataItem.cost.totalAverageCost = this.formatToUSCurrency(cloudItem.cost.total_average_cost);
      cloudDataItem.cost.totalPreviousMonthCost = this.formatToUSCurrency(cloudItem.cost.total_previous_month_cost);
      cloudDataItem.cost.estimatedChangePercentage = cloudItem.cost.estimated_change_percentage;
      cloudDataItem.cost.monthlyChangePercentage = cloudItem.cost.monthly_change_percentage;
      cloudDataItem.cost.monthlyChangePercentage = cloudItem.cost.monthly_change_percentage;
      cloudDataItem.cost.monthlyChangeStatus = cloudItem.cost.monthly_change_status;
      cloudDataItem.cost.monthlyCostChangeClass = this.changeClassStatus(cloudItem.cost.monthly_change_status);
      cloudDataItem.cloudType = cloudItem.cloud_type;
      cloudDataItem.totalAccounts = cloudItem.total_accounts;

      return cloudDataItem;
    });

    return viewData;
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
    data.sort((a, b) => Number(a.value) - Number(b.value));
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
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].name = 'Cost';
    view.options.series[0].data = data;
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        return `${name}`
      },
      selectedMode: true,
      textStyle: {
        padding: [0, 0, 0, 0],
        overflow: "truncate",
        width: 100,
      },
      tooltip: {
        show: true,
        formatter: function (params) {
          return params.name;
        },
        confine: false,
      },
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params) {
        return params.percent + '%\n($' + params.value + ')'
      }
    };

    view.options.tooltip = {
      ...view.options.tooltip,
      renderMode: 'html',
      appendTo: (chartContainer) => document.body,
      confine: false,
      formatter: '{b} ${c} ({d}%)',
    }

    view.options.series[0].center = ['50%', '40%'];
    if (data.length > 9) {
      // view.options.series[0].radius = [40, 70];
      // view.options.series[0].center = ['50%', '30%'];
      view.options.legend.type = "scroll";
    }
    // else if (data.length > 6) {
    //   view.options.series[0].radius = [35, 65];
    //   view.options.series[0].center = ['50%', '35%'];
    // }
    else {
      view.options.series[0].center = ['50%', '35%'];
    }

    return view;
  }

  convertToTrailingTwelveMonthsViewData(data: TopUsageDataType): TrailingTwelveMonthsViewData {
    const viewData = new TrailingTwelveMonthsViewData();

    if (data.top_usage_by_cloud_type) {
      viewData.topUsageByCloudType = new TopUsageByCloudType();
      viewData.topUsageByCloudType.cloudType = data.top_usage_by_cloud_type.cloud_type;
      viewData.topUsageByCloudType.cloudImg = this.utilSvc.getCloudLogo(data.top_usage_by_cloud_type.cloud_type, true);
      viewData.topUsageByCloudType.accountName = data.top_usage_by_cloud_type.account_name;
      viewData.topUsageByCloudType.usagePercentage = data.top_usage_by_cloud_type.usage_percentage;
      viewData.topUsageByCloudType.totalCost = this.formatToUSCurrency(data.top_usage_by_cloud_type.total_cost);
      viewData.topUsageByCloudType.currency = data.top_usage_by_cloud_type.currency;
    }

    if (data.top_usage_by_cloud) {
      viewData.topUsageByCloudAccount = new TopUsageByCloudAccount();
      viewData.topUsageByCloudAccount.cloudType = data.top_usage_by_cloud.cloud_type;
      viewData.topUsageByCloudAccount.cloudImg = this.utilSvc.getCloudLogo(data.top_usage_by_cloud.cloud_type, true);
      viewData.topUsageByCloudAccount.accountName = data.top_usage_by_cloud.account_name;
      viewData.topUsageByCloudAccount.usagePercentage = data.top_usage_by_cloud.usage_percentage;
      viewData.topUsageByCloudAccount.totalCost = this.formatToUSCurrency(data.top_usage_by_cloud.total_cost);
      viewData.topUsageByCloudAccount.currency = data.top_usage_by_cloud.currency;
    }

    if (data.top_usage_by_service) {
      viewData.topUsageByService = new TopUsageByService();
      viewData.topUsageByService.cloudType = data.top_usage_by_service.cloud_type;
      viewData.topUsageByService.cloudImg = this.utilSvc.getCloudLogo(data.top_usage_by_service.cloud_type, true);
      viewData.topUsageByService.accountName = data.top_usage_by_service.account_name;
      viewData.topUsageByService.usagePercentage = data.top_usage_by_service.usage_percentage;
      viewData.topUsageByService.totalCost = this.formatToUSCurrency(data.top_usage_by_service.total_cost);
      viewData.topUsageByService.currency = data.top_usage_by_service.currency;
      viewData.topUsageByService.service = data.top_usage_by_service.service;
    }

    return viewData;
  }

  convertToTrailingTwelveMonthsChartData(graphData: TrailingMonthDataType[], monthOrder: string[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getStackedBarChartOption();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const barData = [];
    const legendData = [];

    graphData?.map(d => {
      legendData.push(d.cloud_type);
      const inArr = [];
      monthOrder.forEach((item) => {
        let month = item.toLowerCase();
        inArr.push(d.cost_list[month] > 0 ? d.cost_list[month] : 0);
      });
      barData.push(inArr);
    })

    const series: echarts.BarSeriesOption[] = legendData.map((name, sid) => {
      return {
        name,
        type: 'bar',
        stack: 'total',
        barMaxWidth: '60%',
        barCategoryGap: "40%",
        data: barData[sid].map((d, did) => d)
      };
    });

    view.options.tooltip = {
      ...view.options.tooltip,
      valueFormatter: (value) => '$' + value,
    }
    view.options.xAxis[0].data = monthOrder,
      view.options.series = series;

    return view;
  }

  convertToCostByCloudTypeViewData(data: CostByCloudTypeItem[]): CostByCloudTypeItemViewData[] {
    const viewData: CostByCloudTypeItemViewData[] = [];
    data.forEach(item => {
      const view = new CostByCloudTypeItemViewData();
      view.regions = item.regions ? item.regions.map(item => item) : [];
      view.region = item.regions.length ? item.regions[0] : '';
      view.regionCount = item.regions.length;
      view.extraRegions = item.regions.length > 1 ? item.regions.slice(1) : [];
      view.extraRegionsCount = view.extraRegions.length;
      view.monthToDateCost = item.month_to_date_cost.toFixed(2);
      view.cloudType = item.cloud_type;
      view.totalResources = item.total_resources;
      view.estimateCost = item.estimate_cost.toFixed(2);
      view.year = item.year;
      view.cloudImgUrl = this.utilSvc.getCloudLogo(item.cloud, true); '';
      view.accountName = item.account_name;
      view.accountUuid = item.account_uuid;
      view.cloud = item.cloud;
      viewData.push(view);
    });
    return viewData;
  }

  changeClassStatus(data: string): string {
    if (data == 'decreased') return 'text-success';
    else if (data == 'increased') return 'text-danger';
    else return 'text-black';

  }

  formatToUSCurrency(num: number): string {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

export class CostSummaryViewData {
  constructor() { }
  overallTotal: OverallTotal;
  cloudData: CloudDataItem[];
}

export class OverallTotal {
  constructor() { }
  totalTtmCost: string;
  totalCurrentCost: string;
  estimatedChangeStatus: string;
  totalEstimatedCost: string;
  totalAverageCost: string;
  totalPreviousMonthCost: string;
  estimatedChangePercentage: number;
  monthlyChangePercentage: number;
  monthlyChangeStatus: string;
}

export class CloudDataItem {
  constructor() { }
  platformType: string;
  platformImg: string;
  cost: Cost;
  cloudType: string;
  totalAccounts: number;
}

export class Cost {
  constructor() { }
  totalTtmCost: string;
  totalCurrentCost: string;
  cloudCostPercentage: number;
  estimatedChangeStatus: string;
  totalEstimatedCost: string;
  totalAverageCost: string;
  totalPreviousMonthCost: string;
  estimatedChangePercentage: number;
  monthlyChangePercentage: number;
  monthlyChangeStatus: string;
  monthlyCostChangeClass: string;

}

export class CostByCloudTypeItemViewData {
  constructor() { }
  regionCount: number;
  cloudImgUrl: string;
  regions: (null | string)[];
  region: string;
  extraRegions: string[];
  monthToDateCost: string;
  cloudType: string;
  totalResources: number;
  estimateCost: string;
  year: number;
  accountName: string;
  accountUuid: string;
  cloud: string;
  extraRegionsCount: number;

}

export class TrailingTwelveMonthsViewData {
  topUsageByCloudType: TopUsageByCloudType;
  topUsageByCloudAccount: TopUsageByCloudAccount;
  topUsageByService: TopUsageByService;

  constructor() { }
}

export class TopUsageByCloudType {
  cloudType: string;
  accountName: string;
  usagePercentage: string;
  totalCost: string;
  currency: string;
  cloudImg: string;

  constructor() { }
}

export class TopUsageByCloudAccount {
  cloudType: string;
  accountName: string;
  usagePercentage: string;
  totalCost: string;
  currency: string;
  cloudImg: string;

  constructor() { }
}

export class TopUsageByService {
  cloudType: string;
  accountName: string;
  usagePercentage: string;
  totalCost: string;
  currency: string;
  service: string;
  cloudImg: string;

  constructor() { }
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

export const months = [
  { name: "January", value: "Jan" },
  { name: "February", value: "Feb" },
  { name: "March", value: "Mar" },
  { name: "April", value: "Apr" },
  { name: "May", value: "May" },
  { name: "June", value: "Jun" },
  { name: "July", value: "Jul" },
  { name: "August", value: "Aug" },
  { name: "September", value: "Sep" },
  { name: "October", value: "Oct" },
  { name: "November", value: "Nov" },
  { name: "December", value: "Dec" }
];
