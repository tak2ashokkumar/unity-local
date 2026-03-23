import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { BudgetAnomalyWidget, BudgetDetailsByDevice, CostAlerts, CostAnomalyType, CostByApplicationWidget, CostByBusinessUnitWidget, CostByCostCenterWidget, CostByDeviceTypeWidget, CostByDeviceTypeWidgetData, CostByOSWidget, CostByVMWidget, CostUtilizationByMetrics, CostUtilizationDataByMetric, CostUtilizationDataPoints, DeviceCountWidget, FixedCostByService, IdleVMSWidget, MetricAndRateValue, MetricDistribution, MetricRateFrequency, OperationalCostByService, TotalCostWidget } from './cost-intelligence.type';

@Injectable()
export class CostIntelligenceService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,) { }

  getDateDropdownOptions(): DateDropdownOptionsData {
    let view = new DateDropdownOptionsData();
    view.options = _clone(customDateRangeOptions);
    view.defaultSelected = 'last_30_days';
    return view;
  }

  getTotalCost(frequency: string): Observable<TotalCostWidget> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<TotalCostWidget>(`/customer/finops/building-block-costs/total_cost/`, { params: params });
  }

  convertToTotalCostViewData(data: TotalCostWidget): TotalCostWidgetViewData {
    let view = new TotalCostWidgetViewData();
    view.currentCost = data.current_period.total_cost;
    view.currency = this.getCostIconByCurrencyType();
    view.percentageChange = `${data.percentage_change ? data.percentage_change : 0}%`;
    if (data.percentage_change) {
      view.percentageChangeIconClass = data.percentage_change > 0 ? 'fa-caret-up' : 'fa-caret-down';
      view.percentageChangeTextClass = data.percentage_change > 0 ? 'text-danger' : 'text-success';
    } else {
      view.percentageChangeIconClass = 'fa-caret-up';
      view.percentageChangeTextClass = 'text-success';
    }
    return view;
  }

  getDeviceCount(frequency: string): Observable<DeviceCountWidget> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<DeviceCountWidget>(`/customer/finops/building-block-costs/device_count/`, { params: params });
  }

  convertToDeviceCountViewData(data: DeviceCountWidget): DeviceCountWidgetViewData {
    let view = new DeviceCountWidgetViewData();
    view.currentCount = data.current_period.device_count;
    view.percentageChange = `${data.percentage_change ? data.percentage_change : 0}%`;
    if (data.percentage_change) {
      view.percentageChangeIconClass = data.percentage_change > 0 ? 'fa-caret-up' : 'fa-caret-down';
      view.percentageChangeTextClass = data.percentage_change > 0 ? 'text-danger' : 'text-success';
    } else {
      view.percentageChangeIconClass = 'fa-caret-up';
      view.percentageChangeTextClass = 'text-success';
    }
    return view;
  }

  getIdleVms(frequency: string): Observable<IdleVMSWidget> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<IdleVMSWidget>(`/customer/finops/building-block-costs/idle_vm/`, { params: params });
  }

  convertToIdleVmsViewData(data: IdleVMSWidget): IdleVMSWidgetViewData {
    let view = new IdleVMSWidgetViewData();
    view.currentCount = data.idle_vm_count;
    let percentageChange = this.utilSvc.getPercentageChange(data.idle_vm_count, data.previous_idle_vm_count);
    view.percentageChange = `${percentageChange}%`;
    if (percentageChange) {
      view.percentageChangeIconClass = percentageChange > 0 ? 'fa-caret-up' : 'fa-caret-down';
      view.percentageChangeTextClass = percentageChange > 0 ? 'text-danger' : 'text-success';
    } else {
      view.percentageChangeIconClass = 'fa-caret-up';
      view.percentageChangeTextClass = 'text-success';
    }
    return view;
  }

  getCostIconByCurrencyType(currencyType?: string) {
    switch (currencyType) {
      default: return '$';
    }
  }

  getCostByDeviceType(frequency: string): Observable<CostByDeviceTypeWidget> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByDeviceTypeWidget>(`/customer/finops/building-block-costs/group_by_device_type/`, { params: params });
  }

  convertToCostByDeviceTypeViewData(data: CostByDeviceTypeWidgetData[]): CostByDeviceTypeWidgetViewData[] {
    let viewdata: CostByDeviceTypeWidgetViewData[] = [];
    data.map(d => {
      let view = new CostByDeviceTypeWidgetViewData();
      view.deviceType = d.device_type;
      view.label = d.label;
      view.currentCost = `$${d.total_cost}`;
      view.potentialSavings = `$${d.potential_saving}`;
      viewdata.push(view);
    })
    return viewdata;
  }

  getCostByCostCenter(frequency: string): Observable<CostByCostCenterWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByCostCenterWidget[]>(`/customer/finops/building-block-costs/cost_by_license_cost_center/`, { params: params });
  }

  convertToCostByCostCenterViewData(data: CostByCostCenterWidget[]): CostByCostCenterWidgetViewData[] {
    let viewdata: CostByCostCenterWidgetViewData[] = [];
    data.map(d => {
      let view = new CostByCostCenterWidgetViewData();
      view.currentCost = `$${d.total_cost}`;
      view.potentialSavings = `$${d.potential_saving}`;
      view.costCenter = d.license_cost_center;
      viewdata.push(view);
    })
    return viewdata;
  }

  getCostForTop5VMs(frequency: string): Observable<CostByVMWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByVMWidget[]>(`/customer/finops/building-block-costs/top_vms_overusage_cost/`, { params: params });
  }

  convertToCostPerVMViewData(data: CostByVMWidget[]): CostPerVMViewData[] {
    let viewData: CostPerVMViewData[] = [];
    data.map(d => {
      let view: CostPerVMViewData = new CostPerVMViewData();
      view.vmName = d.device_name;
      view.allocated = d.allocated;
      view.overUsed = d.over_used;
      let total = view.allocated + view.overUsed;
      view.allocatedPercentage = Math.round((view.allocated / total) * 100);
      view.overUsedPercentage = Math.round((view.overUsed / total) * 100);
      viewData.push(view);
    })
    return viewData;
  }

  getCostByBusinessUnit(frequency: string): Observable<CostByBusinessUnitWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByBusinessUnitWidget[]>(`/customer/finops/building-block-costs/cost_by_business_unit/`, { params: params });
  }
  convertToCostByBUChartData(data: CostByBusinessUnitWidget[]): UnityChartDetails {
    if (!data || data.length == 0) return;
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Cost By Business Unit',
      left: 'center',
      top: '5%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `$${params.value}`;
      }
    };
    view.options.series[0].data = data.map(item => ({
      name: item.business_unit,
      value: item.total_cost,
    }))

    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} ${c}',
    };

    return view;
  }

  getTopApplicationsByCost(frequency: string): Observable<CostByApplicationWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByApplicationWidget[]>(`/customer/finops/building-block-costs/top_applications_by_cost/`, { params: params });
  }

  convertToCostByApplicationViewData(data: CostByApplicationWidget[]): CostByApplicationsViewData[] {
    if (!data || data.length == 0) return [];
    let viewData: CostByApplicationsViewData[] = [];
    data.map(d => {
      let view: CostByApplicationsViewData = new CostByApplicationsViewData();
      view.applicationName = d.application;
      // view.allocated = d.allocated;
      // view.overUsed = d.over_used;
      // let total = view.allocated + view.overUsed;
      // view.allocatedPercentage = Math.round((view.allocated / total) * 100);
      // view.overUsedPercentage = Math.round((view.overUsed / total) * 100);
      view.allocatedPercentage = d.allocated_percentage;
      view.overUsedPercentage = d.over_used_percentage;
      viewData.push(view);
    })
    return viewData;
  }

  getTopOSByCost(frequency: string): Observable<CostByOSWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostByOSWidget[]>(`/customer/finops/building-block-costs/top_os_cost/`, { params: params });
  }

  convertToCostByOSChartData(data: CostByOSWidget[]): UnityChartDetails {
    if (!data || data.length == 0) return;
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.series[0].data = data.map(item => ({
      name: item.os,
      value: item.total_cost,
    }))
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `$${params.value}`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} ${c}',
    };
    return view;
  }

  getOperationalCostUtilizationByService(frequency: string): Observable<OperationalCostByService[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<OperationalCostByService[]>(`/customer/finops/building-block-costs/operational_cost_by_application/`, { params: params });
  }

  convertToOperationalCostUtilizationChartData(data: OperationalCostByService[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Operational Cost By Application-Service',
      left: 'center',
      top: '5%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    let seriesData = [];
    data.forEach(item => {
      seriesData.push({ name: item.application, value: item.operational_cost })
    })
    view.options.series[0].data = seriesData;
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `$${params.value}`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b}: ${c}',
    };
    return view;
  }

  getFixedCostUtilizationByService(frequency: string): Observable<FixedCostByService[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<FixedCostByService[]>(`/customer/finops/building-block-costs/fixed_cost_by_application/`, { params: params });
  }

  convertToFixedCostUtilizationChartData(data: FixedCostByService[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Fixed Cost By Application-Service',
      left: 'center',
      top: '5%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    let seriesData = [];
    data.forEach(item => {
      seriesData.push({ name: item.application, value: item.fixed_cost })
    })
    view.options.series[0].data = seriesData;
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `$${params.value}`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b}: ${c}',
    };
    return view;
  }

  getBudgetAnamolies(frequency: string): Observable<BudgetAnomalyWidget[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<BudgetAnomalyWidget[]>(`/customer/finops/building-block-costs/budget_anomaly/`, { params: params });
  }

  convertToBudgetAnomaliesViewData(data: BudgetAnomalyWidget[]): BudgetAnomalyViewData[] {
    let viewData: BudgetAnomalyViewData[] = [];
    data.map(d => {
      let view: BudgetAnomalyViewData = new BudgetAnomalyViewData();
      view.name = d.device_name;
      view.overUsed = d.over_budget;
      view.allocated = d.total_cost - d.over_budget;
      // let total = view.allocated + view.overUsed;
      view.allocatedPercentage = Math.round((view.allocated / d.total_cost) * 100);
      view.overUsedPercentage = Math.round((view.overUsed / d.total_cost) * 100);
      viewData.push(view);
    })
    return viewData;
  }

  getCostUtilizationByMetrics(frequency: string): Observable<CostUtilizationByMetrics> {
    let params: HttpParams = new HttpParams().set('period', frequency);
    return this.http.get<CostUtilizationByMetrics>(`/customer/finops/building-block-costs/utilization_trend/`, { params: params });
  }

  convertToCostUtilizationByMetricsViewData(data: CostUtilizationDataByMetric): CostUtilizationByMetricsData {
    let viewData = new CostUtilizationByMetricsData();
    viewData.currentCost = `$${data.total_cost}`;
    viewData.averageCost = `$${data.average_cost ? data.average_cost : data.total_cost}`;
    // viewData.unit = data.unit;
    viewData.peakUtilization = `${data.peak_utilization}`;
    return viewData;
  }


  getDateTimeIntervalsByFrequency(frequency: string): string[] {
    const now = new Date();
    const intervals: string[] = [];

    const formatDate = (d: Date, withTime: boolean = false) => {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0'); // numeric month
      const year = d.getFullYear().toString(); // last 4 digits

      if (frequency === 'daily') {
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        return `${hour}:${minute}`;
      } else if (frequency === 'weekly' || frequency === 'monthly') {
        return `${year}-${month}-${day}`;
      } else {
        return d.toISOString(); // fallback
      }
    };

    switch (frequency) {
      case 'daily':
        // 24 hourly intervals from start of today
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        for (let i = 0; i < 24; i++) {
          const d = new Date(now);
          d.setHours(now.getHours() - i);
          intervals.push(formatDate(d, true));
        }
        break;

      case 'weekly':
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          intervals.push(formatDate(d));
        }
        break;

      case 'monthly':
        for (let i = 0; i < 30; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          intervals.push(formatDate(d));
        }
        break;

      default:
        return [];
    }

    return intervals.reverse();
  }

  mapMonthlyData(monthlyDates: string[], dataPoints: CostUtilizationDataPoints[]): number[] {
    // Convert dataPoints array into a lookup map for quick access
    const dataMap = new Map(
      dataPoints.map(dp => [dp.date, dp.avg_utilization])
    );
    // Map generated dates to required format with utilization
    return monthlyDates.map(label => {
      return dataMap.get(label) ?? 0;
    });
  }

  convertToCostUtilizationByMetricsChartData(data: CostUtilizationByMetrics): UnityChartDetails {
    const intervals = this.getDateTimeIntervalsByFrequency(data.frequency);
    const cpuData = this.mapMonthlyData(intervals, data.metrics.cpu.data_points);
    const memData = this.mapMonthlyData(intervals, data.metrics.memory.data_points);
    const storageData = this.mapMonthlyData(intervals, data.metrics.storage.data_points);

    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.grid = {
      left: 60,
      right: 20,
      top: 20,
      bottom: 80
    };
    view.options.tooltip = {
      trigger: 'axis',
      valueFormatter: v => `${v}`,
    }
    view.options.legend = {
      bottom: 5,
      data: ['CPU', 'Memory', 'Storage'],
    }
    view.options.xAxis = {
      type: 'category',
      boundaryGap: false,
      data: intervals,
      axisLabel: {
        rotate: 35
      }
    }
    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 'dataMax',
      axisLabel: {
        formatter: '{value}%',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted'  // dotted lines from Y-axis ✅
        }
      }
    }
    view.options.series = [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3296FF' },
        data: cpuData
      },
      {
        name: 'Memory',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#6C4EE3' },
        data: memData
      },
      {
        name: 'Storage',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#002D62' },
        data: storageData
      }
    ]
    return view;
  }

  getCostAlertsData(frequency: string): Observable<CostAlerts[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostAlerts[]>(`/customer/finops/building_blocks/cost_alerts/`);
  }

  convertToCostAlertsViewData(data: CostAlerts[]): CostAlertsViewData[] {
    let viewData: CostAlertsViewData[] = [];
    data.map(d => {
      let view: CostAlertsViewData = new CostAlertsViewData();
      view.alertId = d.alert_id;
      view.alertName = d.alert_name;
      view.scope = d.scope;
      view.thresholdType = d.threshold_type;
      view.thresholdValue = d.threshold_value;
      view.actualValue = d.actual_value;
      view.alertTime = d.alert_triggered_on ? this.utilSvc.toUnityOneDateFormat(new Date(d.alert_triggered_on).toISOString()) : 'N/A';;
      view.severity = d.severity;
      if (d.severity == 'high') {
        view.severityClass = 'text-danger';
        view.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (d.severity == 'medium') {
        view.severityClass = 'text-warning';
        view.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        view.severityClass = 'text-primary';
        view.severityIcon = 'fa-info-circle text-primary';
      }
      viewData.push(view);
    })
    return viewData;
  }

  getDeviceDetailsData(frequency: string): Observable<BudgetDetailsByDevice[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<BudgetDetailsByDevice[]>(`/customer/finops/building-block-costs/device_details/`, { params: params });
  }

  convertToBudgetDetailsByDeviceViewData(data: BudgetDetailsByDevice[]): BudgetDetailsByDeviceViewData[] {
    let viewData: BudgetDetailsByDeviceViewData[] = [];
    data.map(d => {
      let view: BudgetDetailsByDeviceViewData = new BudgetDetailsByDeviceViewData();
      view.deviceName = d.device_name;
      view.managementIP = d.management_ip;
      view.applicationOrService = d.application_service;
      view.allocationType = d.allocation_type;
      view.budgetAmount = d.budget_amount;
      view.budgetPeriod = d.budget_period;

      if (d.budget_utilization) {
        view.budgetUtilization = new BudgetUtilizationByDeviceData();
        view.budgetUtilization.used = <number><unknown>d.budget_utilization.used.split('%')[0];
        view.budgetUtilization.usedPercentage = d.budget_utilization.used;
        view.budgetUtilization.available = <number><unknown>d.budget_utilization.free.split('%')[0];
        view.budgetUtilization.availablePercentage = d.budget_utilization.free;
        view.budgetUtilization.usedBarColor = view.budgetUtilization.used < 65 ? 'bg-success' : view.budgetUtilization.used >= 65 && view.budgetUtilization.used < 85 ? 'bg-warning' : 'bg-danger';
      }
      viewData.push(view);
    })
    return viewData;
  }

  getCostAnomalyData(frequency: string): Observable<CostAnomalyType[]> {
    let params: HttpParams = new HttpParams().set('frequency', frequency);
    return this.http.get<CostAnomalyType[]>(`customer/finops/building-block-costs/cost_anomaly/`, { params: params });
  }

  convertToCostAnomalyViewData(data: CostAnomalyType[]): CostAnomalyViewData[] {
    let viewData: CostAnomalyViewData[] = [];
    data.forEach(d => {
      let view: CostAnomalyViewData = new CostAnomalyViewData();
      view.deviceName = d.device_name;
      view.managemetIp = d.management_ip;
      view.buildingBlock = d.building_block;
      view.budgetAmount = d.budget_amount;
      view.totalCost = d.total_cost;
      view.overBudget = d.over_budget;
      view.overBudgetPercent = `${d.over_budget_percent}%`;
      view.status = d.status;
      viewData.push(view);
    })
    return viewData;
  }

}

export class TotalCostWidgetViewData {
  currentCost: number = 0;
  currency?: string = '$';
  percentageChange: string;
  percentageChangeIconClass: string;
  percentageChangeTextClass: string;
}

export class DeviceCountWidgetViewData {
  currentCount: number = 0;
  percentageChange: string;
  percentageChangeIconClass: string;
  percentageChangeTextClass: string;
}

export class IdleVMSWidgetViewData {
  currentCount: number = 0;
  percentageChange: string;
  percentageChangeIconClass: string;
  percentageChangeTextClass: string;
}

export class CostByDeviceTypeWidgetViewData {
  constructor() { }
  currentCost: string;
  potentialSavings: string;
  deviceType: string;
  label: string;
}

export class CostByCostCenterWidgetViewData {
  constructor() { }
  currentCost: string;
  potentialSavings: string;
  costCenter: string;
}

export class CostPerVMViewData {
  constructor() { }
  vmName: string;
  allocated: number;
  overUsed: number;
  allocatedPercentage: number;
  overUsedPercentage: number;
}

export class CostByBUViewData {
  constructor() { }
  businessUnit: string;
  cost: number;
}

export class CostByApplicationsViewData {
  constructor() { }
  applicationName: string;
  allocated: number;
  overUsed: number;
  allocatedPercentage: number;
  overUsedPercentage: number;
}

export class CostByOSViewData {
  constructor() { }
  monthlyCost: string;
  potentialSavings: string;
  os: string;
}

export class BudgetAnomalyViewData {
  constructor() { }
  name: string;
  allocated: number;
  overUsed: number;
  allocatedPercentage: number;
  overUsedPercentage: number;
}

export class CostUtilizationByMetricsViewData {
  loader: string = 'costUtilizationByMetricsLoader';
  dropdownOptions: CustomDateRangeType[] = customDateRangeOptions;
  defaultSelected: string;
  formData: any;
  cpu: CostUtilizationByMetricsData;
  memory: CostUtilizationByMetricsData;
  storage: CostUtilizationByMetricsData;
  chartData?: UnityChartDetails;
}
export class CostUtilizationByMetricsData {
  currentCost: string;
  averageCost: string;
  unit: string;
  peakUtilization: string;
}

export class MetricsAndRateViewData {
  loader: string = 'MetricsByRateLoader';
  chartData: UnityChartDetails;
}

export class MetricDistributionsViewData {
  loader: string = 'MetricDistributionsLoader';
  chartData: UnityChartDetails;
}

export class MetricRateFrequencyViewData {
  loader: string = 'MetricRateFrequencyLoader';
  chartData: UnityChartDetails;
}

export class CostAlertsViewData {
  constructor() { }
  alertId: string;
  alertName: string;
  scope: string;
  thresholdType: string;
  thresholdValue: string;
  actualValue: string;
  alertTime: string;
  severity: string;
  severityClass: string;
  severityIcon: string;
}

export class BudgetDetailsByDeviceViewData {
  constructor() { }
  deviceName: string;
  managementIP: string;
  applicationOrService: string;
  allocationType: string;
  budgetAmount: string;
  budgetPeriod: string;
  budgetUtilization: BudgetUtilizationByDeviceData;
}
export class BudgetUtilizationByDeviceData {
  total: number = 100;
  used: number = 0;
  usedPercentage: string;
  available: number = 0;
  availablePercentage: string;
  usedBarColor: string;
}

export class CostAnomalyViewData {
  constructor() { }
  deviceName: string;
  managemetIp: string;
  buildingBlock: string;
  frequency: string;
  budgetAmount: string;
  totalCost: string;
  overBudget: string;
  overBudgetPercent: string;
  status: string;
}

export class DateDropdownOptionsData {
  options: CustomDateRangeType[] = [];
  defaultSelected: string;
  formData: any;
  frequency?: string;
}

export const customDateRangeOptions: CustomDateRangeType[] = [
  { label: 'Last 24 hours', value: 'last_24_hours', valueAsFrequency: 'daily' },
  { label: 'Last 7 days', value: 'last_7_days', valueAsFrequency: 'weekly' },
  { label: 'Last 30 days', value: 'last_30_days', valueAsFrequency: 'monthly' },
]
