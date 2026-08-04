import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { DatabaseServersService } from 'src/app/united-cloud/shared/database-servers/database-servers.service';
import {
  ALERTS_RESP,
  CAPACITY_GROWTH_INSIGHT_SUMMARY_RESP,
  CAPACITY_GROWTH_INSIGHT_TABLE_RESP,
  CAPACITY_RESP,
  DATABASE_DASHBOARD_ALERT_SUMMARY_CONFIG,
  DATABASE_DASHBOARD_CUSTOM_TIMELINE_VALUE,
  DATABASE_DASHBOARD_DATABASES_RESP,
  DATABASE_DASHBOARD_HEADER_INFO_RESP,
  DATABASE_DASHBOARD_TIME_RANGE_OPTIONS,
  DBDASHBOARDCOLORS,
  HEALTHGROWTH_RESP,
  INVENTORY_RESP,
  TOPQUERY_RESP,
  TOPUTIL_RESP
} from './database-dashboard.const';
import {
  DatabaseDashboardTopCriticalAlertsResponse,
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardBarItem,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlert,
  DatabaseDashboardDonutItem,
  DatabaseDashboardFilterCriteria,
  DatabaseDashboardFilterOption,
  DatabaseDashboardMetric,
  DatabaseDashboardSelectOption,
  DatabaseDashboardTagItem,
  DatabaseDashboardVersionItem,
  InventoryWidgetType,
  DatabaseDashboardTopCriticalAlertsSummary,
  DatabaseDashboardCriticalAlertViewData,
  DbDashboardHealthGroupType,
  DbDashboardSummary,
  DbDashboardSummaryViewData,
  DbDashboardReplicationSyncSummaryData,
  DbDashboardReplicationSync,
  InventoryWidgetByPlatformType,
  InventoryWidgetByCategoryType,
  DatabaseDashboardStackedBarItem,
  InventoryWidgetByEnvironment,
  InventoryWidgetByTags,
  InventoryWidgetByVersion,
  DatabaseDashboardTop10Utilization,
  DatabaseDashboardTop10UtilizationViewData,
  DatabaseDashboardTopQueryType,
  DBDashboardTopResponseTimeType,
  DBDashboardTopLatencyType,
  DBDashboardTopConnectionsType,
  DBDashboardTopErrorsDeadlocksType,
  DBDashboardTopCacheHitRatioType,
  DBDashboardTopThroughputType,
  DBDashboardTopThroughputTrendType,
  DBDashboardCapacityGrowthType,
  DBDashboardSummaryStats,
  DBDashboardTopServersViewData,
  DBDashboardTopServersType,
  DBDashboardTopTableSpaceUsageType,
  DBDashboardDiskUtilizationType,
  DBDashboardLogSizeByServerType,
  DBDashboardDbSizeByServerType,
  DBDashboardLogGrowthRateType,
  DBDashboardArchiveLogGrowthTrendType,
  DBDashboardStroageGrowthTrendType,
  DatabaseDashboardHeaderInfoResponse,
  top10UtilizationTrendItem,
  DBDashboardEfficiencyGaugeType,
  DBDashboardEfficiencyGaugeViewData,
  DBDashboardTemporaryTablePerformanceType,
  DBDashboardTemporaryTablePerformanceViewData,
  DBDashboardEfficiencyStatViewData,
  DBDashboardEfficiencyServerType,
  DBDashboardEfficiencyServerViewData,
  DatabaseDashboardTone
} from './database-dashboard.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import moment from 'moment';

@Injectable()
export class DatabaseDashboardService {

  constructor(private builder: FormBuilder,
    private databaseServersService: DatabaseServersService,
    private http: HttpClient) { }


  /*
   * -----Start----- Sub header Related -------------------
   */
  getHeaderInfo(): Observable<DatabaseDashboardHeaderInfoResponse> {
    // return of(DATABASE_DASHBOARD_HEADER_INFO_RESP);
    return this.http.get<DatabaseDashboardHeaderInfoResponse>('/customer/persona/database-dashboard/refresh-time/');
  }
  /*
   * ******End ****** Sub header Related ********************
   */

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(databases?: DatabaseDashboardFilterOption[]): FormGroup {
    const customDurationRange = this.getDefaultCustomDurationRange();
    return this.builder.group({
      databases: [databases || []],
      duration: [this.getDefaultOptionValue(DATABASE_DASHBOARD_TIME_RANGE_OPTIONS, 'last_30_days')],
      durationFrom: [{ value: customDurationRange.from, disabled: true }, [Validators.required]],
      durationTo: [{ value: customDurationRange.to, disabled: true }, [Validators.required]]
    }, { validators: this.customDurationRangeValidator });
  }

  getDatabases(): Observable<DatabaseDashboardFilterOption[]> {
    // const criteria: SearchCriteria = {
    //   sortColumn: '',
    //   sortDirection: '',
    //   searchValue: '',
    //   pageNo: 1,
    //   pageSize: PAGE_SIZES.ZERO
    // };

    // return this.databaseServersService.getAllDBServers(criteria).pipe(
    //   map(databases => this.getDatabaseFilterOptions(databases))
    // );
    
    // return of(DATABASE_DASHBOARD_DATABASES_RESP);
    return this.http.get<DatabaseDashboardFilterOption[]>('/customer/database_servers_fast/');
  }

  // getFallbackDatabases(): DatabaseDashboardFilterOption[] {
  //   return this.getDatabaseFilterOptions([]);
  // }

  // private getDatabaseFilterOptions(servers: DatabaseServer[] | { results?: DatabaseServer[] }): DatabaseDashboardFilterOption[] {
  //   const options = new Map<string, DatabaseDashboardFilterOption>();
  //   const databaseServers = Array.isArray(servers) ? servers : servers?.results || [];

  //   databaseServers.forEach((server, index) => {
  //     const value = server.uuid;
  //     const label = server.db_instance_name || server.database_name

  //     if (value && label && !options.has(value)) {
  //       options.set(value, { value, label });
  //     }
  //   });

  //   console.log("database options, ", JSON.parse(JSON.stringify(options)));

  //   return options.size ? Array.from(options.values()) : []
  //     // : DATABASE_DASHBOARD_DATABASE_OPTIONS.filter(option => option.value !== DATABASE_DASHBOARD_ALL_SELECTED_VALUE);
  // }

  private convertFiltersToApiParams(criteria?: DatabaseDashboardFilterCriteria, sortColumn?: string, sortDirection?: string, pageNo?: number , pageSize?: number): HttpParams {
    // console.log("criteria", JSON.parse(JSON.stringify(criteria)), sortColumn, sortDirection);
    let params: HttpParams = new HttpParams();
    params = this.appendMultiValueParam(params, 'database', criteria?.databases);
    params = this.appendParam(params, 'duration', criteria?.duration);
    if (criteria?.duration === DATABASE_DASHBOARD_CUSTOM_TIMELINE_VALUE) {
      params = this.appendDateParam(params, 'start_datetime', criteria?.durationFrom);
      params = this.appendDateParam(params, 'end_datetime', criteria?.durationTo);
    }
    if (sortColumn) {
      params = params.append('sort_by', sortColumn);
    }
    if (sortDirection) {
      params = params.append('sort_order', sortDirection);
    }
    if (pageNo) {
      params = params.append('page', pageNo);
    }
    if (pageSize) {
      params = params.append('page_size', pageSize);
    }
    // console.log("params", JSON.parse(JSON.stringify(params)));
    return params;
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      if (value) {
        params = params.append(key, value);
      }
    });
    return params;
  }

  private appendParam(params: HttpParams, key: string, value?: string): HttpParams {
    if (value == null || value === '') {
      return params;
    }
    return params.append(key, value);
  }

  private appendDateParam(params: HttpParams, key: string, value?: Date | string): HttpParams {
    const formattedDate = this.formatApiDate(value);
    if (!formattedDate) {
      return params;
    }
    return params.append(key, formattedDate);
  }

  private formatApiDate(value?: Date | string): string | undefined {
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
  }

  private getDefaultOptionValue(options: DatabaseDashboardSelectOption[], preferredValue?: string): string {
    const availableOptions = options || [];
    const preferredOption = availableOptions.find(option => option.value === preferredValue);
    return preferredOption?.value || availableOptions[0]?.value || '';
  }

  private getDefaultCustomDurationRange(): { from: Date; to: Date } {
    return {
      from: moment().subtract(24, 'hours').toDate(),
      to: moment().toDate()
    };
  }

  private customDurationRangeValidator(control: AbstractControl): ValidationErrors | null {
    const duration = control.get('duration')?.value;
    const isDurationInvalid = duration === DATABASE_DASHBOARD_CUSTOM_TIMELINE_VALUE &&
      DatabaseDashboardService.isSameOrAfterRange(control.get('durationFrom')?.value, control.get('durationTo')?.value);

    return isDurationInvalid ? { durationFromSameAsOrAfterTo: true } : null;
  }

  private static isSameOrAfterRange(from?: Date | string, to?: Date | string): boolean {
    if (!from || !to) {
      return false;
    }
    return moment(from).isSameOrAfter(moment(to));
  }
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Database Estate / Inventory Overview Widget Related -------------------
   */
  getInventoryOverviewWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<InventoryWidgetType> {
    // return of(INVENTORY_RESP);
    return this.http.get<InventoryWidgetType>('/customer/persona/database-dashboard/inventory-overview/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToSummaryViewData(data: InventoryWidgetType): DatabaseDashboardMetric[] {
    return [
      {
        label: 'Total DB instances',
        value: data?.total_databases ? data.total_databases.toLocaleString() : '0',
        key: 'total_databases',
        link: true
      },
      {
        label: 'Active databases',
        value: data?.status?.active ? data.status.active.toLocaleString() : '0',
        key: 'active_databases',
        link: false,
      },
      {
        label: 'Inactive / Dormant',
        value: data?.status?.inactive ? data.status.inactive.toLocaleString() : '0',
        key: 'inactive_databases',
        link: false
      },
      // { 
      //   label: 'Primary Instances', 
      //   value: data?.primary_instance ? data.primary_instance.toLocaleString() : '0',
      //   key: 'primary_instances',
      //   link: false
      // }
    ];
  }

  convertToCloudTypeDistributionOptions(data: InventoryWidgetByCategoryType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.cloud_type,
      value: d.count,
      percentage: this.roundDecimalValueAsString(d.percentage)
    }));
    return this.getCloudTypeDistributionOptions(graphData || []);
  }

  private getCloudTypeDistributionOptions(items: DatabaseDashboardDonutItem[]): EChartsOption {
    return {
      animation: false,
      color: DBDASHBOARDCOLORS,
      tooltip: {
        trigger: 'item',
        // formatter: '{b}: {d}%',
        formatter: (params: any) => {
          const item = items.find((x: any) => x.name === params.name);
          return `${params.name}: ${params.value} (${item.percentage}%)`;
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 5,
        textStyle: {
          color: '#999',
          fontSize: 10,
          padding: 1
        },
        selectedMode: false,
        formatter: (name: string) => {
          const item = items.find((x: any) => x.name === name);
          return item ? `${name} ${item.percentage}%` : name;
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['50%', '40%'],
          label: { show: false },
          labelLine: { show: false },
          data: items.map(item => ({
            name: `${item.name}`,
            value: item.value,
            // itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  convertToPlatformCountOptions(data: InventoryWidgetByPlatformType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.db_type,
      active: d.active,
      inactive: d.inactive,
      percentage: this.roundDecimalValueAsString(d.percentage)
    }));
    return this.getPlatformCountOptions(graphData || []);
  }

  private getPlatformCountOptions(items: DatabaseDashboardStackedBarItem[]): EChartsOption {
    const xAxisData = items.map((item: DatabaseDashboardStackedBarItem) => item.name);
    const onCounts = items.map((item: DatabaseDashboardStackedBarItem) => item.active);
    const offCounts = items.map((item: DatabaseDashboardStackedBarItem) => item.inactive);
    return {
      animation: false,
      // grid: { top: '5%', right: '5%', bottom: '5%', left: '10%', containLabel: true },
      grid: { left: 20, right: 20, top: 20, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let tooltip = `${params[0].axisValue}<br/>`;
          params.forEach((item: any) => {
            tooltip += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 5,
        textStyle: {
          color: '#888',
          fontSize: 10
        },
        selectedMode: false,
        data: ['On / Active', 'Off / Idle']
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#888',
          fontSize: 10
        },
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
        axisTick: {
          show: true,
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#888',
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: 'On / Active',
          type: 'bar',
          stack: 'DB_Status',
          itemStyle: {
            color: '#17be73',
            // borderRadius: [5, 5, 0, 0]
          },
          data: onCounts
        },
        {
          name: 'Off / Idle',
          type: 'bar',
          stack: 'DB_Status',
          itemStyle: {
            color: '#e54b4b',
            // borderRadius: [5, 5, 0, 0]
          },
          data: offCounts
        }
      ]
    };
  }

  convertToEnvironmentOptions(data: InventoryWidgetByEnvironment[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.environment,
      value: d.count,
      label: this.roundDecimalValueAsString(d.percentage),
      color: this.getProgressBarColor(this.roundDecimalValue(d.percentage))
    }));
    return this.getEnvironmentOptions(graphData || []);
  }

  private getEnvironmentOptions(items: DatabaseDashboardBarItem[]): EChartsOption {
    const maxValue = 100;
    const barData = items.map(item => ({
      value: item.label,
      itemStyle: {
        color: item.color,
        borderRadius: 4
      }
    }));
    return {
      animation: false,
      grid: { top: 8, right: 35, bottom: 12, left: 85 },
      tooltip: {
        trigger: 'item',
        // formatter: '{b}: {d}%',
        formatter: (params: any) => {
          const item = items.find((x: any) => x.name === params.name);
          return `${params.name}: ${params.value} (${item.label}%)`;
        }
      },
      xAxis: { type: 'value', show: false, max: maxValue },
      yAxis: {
        type: 'category',
        // inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#596675', fontSize: 10 },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 9,
          barGap: '-100%',
          silent: true,
          itemStyle: { color: '#edf1f4', borderRadius: 4 },
          data: items.map(() => maxValue)
        },
        {
          type: 'bar',
          barWidth: 9,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => items[params.dataIndex].value.toString(),
            color: '#44515f',
            fontSize: 10
          },
          itemStyle: {
            borderRadius: 4
          },
          data: barData
        }
      ]
    };
  }

  private getLightBackgroundColor(hex: string, opacity: number = 0.15): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  convertToTagsViewData(data: InventoryWidgetByTags[]): DatabaseDashboardTagItem[] {
    if (!data || data?.length == 0) { return; }
    let colors = DBDASHBOARDCOLORS;
    let viewData = data.map((d, index) => ({
      name: d.tag,
      count: d.count,
      textColor: colors[index],
      backgroundColor: this.getLightBackgroundColor(colors[index]),
    }));
    return viewData || [];
  }

  convertToDatabaseVersionsViewData(data: InventoryWidgetByVersion[]): DatabaseDashboardVersionItem[] {
    if (!data || data?.length == 0) { return; }
    let tableData = data.map(d => ({
      name: d.version,
      count: d.count,
    }));
    return tableData || [];
  }

  /*
   * ******End ****** Database Estate / Inventory Overview Widget Related ********************
   */

  /*
   * -----Start----- Performance / Workload Insights Widget Related -------------------
   */

  getWorkloadInsightsTop10UtilizationViewData(criteria?: DatabaseDashboardFilterCriteria, sortColumn?: string, sortDirection?: string): Observable<DatabaseDashboardTop10Utilization[]> {
    // return of(TOPUTIL_RESP);
    return this.http.get<DatabaseDashboardTop10Utilization[]>('/customer/persona/database-dashboard/workload-insights/', {
      params: this.convertFiltersToApiParams(criteria, sortColumn, sortDirection)
    });
  }

  convertToUtilizationRowsViewData(data: DatabaseDashboardTop10Utilization[]): DatabaseDashboardTop10UtilizationViewData[] {
    if (!data || data?.length == 0) { return; }
    let viewData: DatabaseDashboardTop10UtilizationViewData[] = [];

    data.forEach(row => {
      let view = new DatabaseDashboardTop10UtilizationViewData();
      view.hostUUID = row.host_uuid ? row.host_uuid : null;
      view.dbUUID = row.db_uuid ? row.db_uuid : null;
      view.name = row.name ? row.name : "N/A";

      view.cpuChartOptions = this.getSparklineOptions(row.cpu_trend ? row.cpu_trend : [], '#5d8df5', 'rgba(93, 141, 245, 0.28)');
      view.cpuUtilizationPercent = this.roundDecimalValue(row.cpu_usage_system_percent);
      view.cpuTone = this.getToneType(view.cpuUtilizationPercent);

      view.memoryChartOptions = this.getSparklineOptions(row.memory_trend ? row.memory_trend : [], '#6aa544', 'rgba(106, 165, 68, 0.28)');
      view.memoryUtilizationPercent = this.roundDecimalValue(row.memory_used_percent);
      view.memoryTone = this.getToneType(view.memoryUtilizationPercent);

      view.diskCapacityGB = this.roundDecimalValue(row.disk_capacity_gb);
      view.diskUsedGB = this.roundDecimalValue(row.disk_used_gb);
      view.diskUsedPercent = this.roundDecimalValue(row.disk_utilization_percent);
      view.diskFreePercent = this.roundDecimalValue(100 - view.diskUsedPercent);
      view.diskTone = this.getToneType(view.diskUsedPercent);

      // view.diskRops = Number(row.disk_read_ops_per_sec ? row.disk_read_ops_per_sec : 0);
      // view.diskWops = Number(row.disk_write_ops_per_sec ? row.disk_write_ops_per_sec : 0);
      // const diskIops = view.diskRops + view.diskWops;
      const diskIops = Number(row.disk_iops ?? 0);
      view.diskIops = this.roundDecimalValue(diskIops);
      const diskIopsMax = this.roundDecimalValue(row.disk_iops_max ?? 0);
      view.diskIopsPercent = (diskIops > 0 && diskIopsMax > 0) ? this.roundDecimalValue((diskIops / diskIopsMax) * 100, 2) : 0;
      view.diskIopsTone = this.getToneType(view.diskIopsPercent);
      view.uptime = this.formatSeconds(row.system_uptime_seconds);

      viewData.push(view);
    });
    return (viewData);
  }

  private getSparklineOptions(data: top10UtilizationTrendItem[], lineColor: string, areaColor: string): EChartsOption {
    // const xAxisData = data?.map((item: top10UtilizationTrendItem) => item.ts) || [];
    const yAxisBounds = this.getSparklineAxisBounds(data);
    return {
      animation: false,
      grid: { top: 2, right: 1, bottom: 2, left: 1 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((_, index) => index)
      },
      yAxis: {
        type: 'value',
        show: false,
        min: yAxisBounds.min,
        max: yAxisBounds.max
      },
      series: [
        {
          type: 'line',
          data: data.map(item => this.roundDecimalValue(item.value)),
          symbol: 'none',
          smooth: false,
          lineStyle: { width: 1.5, color: lineColor },
          areaStyle: { color: areaColor }
        }
      ]
    };
  }

  private getSparklineAxisBounds(data: top10UtilizationTrendItem[]): { min: number; max: number } {
    const values = (data || [])
      .map(item => Number(item.value || 0))
      .filter(value => Number.isFinite(value));

    if (!values.length) {
      return { min: 0, max: 100 };
    }

    return this.getDecimalAxisBounds(values, { min: 0, max: 100 });
  }

  private getDecimalAxisBounds(values: number[], limits?: { min?: number; max?: number }): { min: number; max: number } {
    const numericValues = (values || [])
      .map(value => Number(value || 0))
      .filter(value => Number.isFinite(value));

    if (!numericValues.length) {
      return {
        min: limits?.min != null ? limits.min : 0,
        max: limits?.max != null ? limits.max : 100
      };
    }

    const minValue = Math.min(...numericValues);
    const maxValue = Math.max(...numericValues);
    const range = maxValue - minValue;
    const padding = range > 0 ? Math.max(range * 0.1, 0.01) : Math.max(Math.abs(maxValue) * 0.01, 0.01);
    let min = this.roundDecimalValue(minValue - padding);
    let max = this.roundDecimalValue(maxValue + padding);

    if (limits?.min != null) {
      min = Math.max(limits.min, min);
    }
    if (limits?.max != null) {
      max = Math.min(limits.max, max);
    }
    if (min >= max) {
      const offset = Math.max(padding, 0.01);
      if (limits?.max != null && max >= limits.max) {
        min = this.roundDecimalValue(max - offset);
      } else {
        max = this.roundDecimalValue(min + offset);
      }
    }

    return { min, max };
  }

  getWorkloadInsightsTop10QueryWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardTopQueryType> {
    // return of(TOPQUERY_RESP);
    return this.http.get<DatabaseDashboardTopQueryType>('/customer/persona/database-dashboard/top-query-performance/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToQueryResponseOptions(data: DBDashboardTopResponseTimeType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.response_time_ms),
      label: `${this.roundDecimalValueAsString(d.response_time_ms)}ms`,
      color: this.getQueryResponseStatusColor(d.status, d.response_time_ms),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToQueryLatencyOptions(data: DBDashboardTopLatencyType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    const getLatencyValue = (item: DBDashboardTopLatencyType) => item.response_time_ms;
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(getLatencyValue(d)),
      label: `${this.roundDecimalValueAsString(getLatencyValue(d))}ms`,
      color: this.getQueryLatencyStatusColor(d.status, getLatencyValue(d)),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToActiveSessionsOptions(data: DBDashboardTopConnectionsType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.active_connections),
      label: this.roundDecimalValueAsString(d.active_connections),
      color: this.getActiveSessionsStatusColor( d.status, d.active_connections),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToErrorRateOptions(data: DBDashboardTopErrorsDeadlocksType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.deadlock_count),
      label: this.roundDecimalValueAsString(d.deadlock_count),
      color: this.getErrorRateStatusColor( d.status, d.deadlock_count),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToTransactionThroughputOptions(data: DBDashboardTopThroughputType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    return this.getTransactionThroughputOptions(data || []);
  }

  convertToCacheHitRatioOptions(data: DBDashboardTopCacheHitRatioType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.hit_ratio_pct),
      label: `${this.roundDecimalValueAsString(d.hit_ratio_pct)}%`,
      color: this.getCacheHitRatioStatusColor(d.status, d.hit_ratio_pct),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || [], true);
  }

  /*
   * ******End ****** Performance / Workload Insights Widget Related ********************
   */

  /*
   * -----Start----- Capacity / Growth Insights Widget Related -------------------
   */

  getCapacityGrowthInsightsWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DBDashboardCapacityGrowthType> {
    // return of(CAPACITY_RESP);
    return this.http.get<DBDashboardCapacityGrowthType>('/customer/persona/database-dashboard/growth-insights/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToCapacityMetricsViewData(data: DBDashboardSummaryStats): DatabaseDashboardCapacityMetric[] {
    return [
      { label: 'Total DB Size', value: `${this.roundDecimalValueAsString(data?.total_db_size_gb)} GB`, helper: 'Database Storage' },
      { label: 'Total Free Space', value: `${this.roundDecimalValueAsString(data?.total_free_space_gb)} GB`, helper: 'Combined Free Capacity' },
      { label: 'Avg Storage Used', value: `${this.roundDecimalValueAsString(data?.avg_used_percentage)}%`, helper: 'Across 10 Servers' }
    ];
  }

  convertToStorageRowsViewData(data: DBDashboardTopServersType[]): DBDashboardTopServersViewData[] {
    if (!data || data?.length == 0) { return; }
    const viewData: DBDashboardTopServersViewData[] = []
    data.forEach(d => {
      const view = new DBDashboardTopServersViewData();
      view.server = d.name;
      view.dbUUID = d.db_uuid;
      view.used = this.roundDecimalValue(d.used_percentage);
      view.free = this.roundDecimalValue(d.free_gb);
      view.dbSize = this.roundDecimalValue(d.db_size_gb);
      view.logSize = this.roundDecimalValue(d.log_size_gb);
      view.logGrowth = this.roundDecimalValue(d.log_growth_gb_per_day);
      viewData.push(view);
    });
    return viewData || [];
  }

  convertToTablespaceUsageOptions(data: DBDashboardTopTableSpaceUsageType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.disk_used_pct),
      percentage: this.roundDecimalValueAsString(d.disk_used_pct),
      db_uuid: d.db_uuid ? d.db_uuid : null
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToStorageGrowthOptions(data: any[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    return this.getStorageGrowthOptions(data);
  }

  convertToArchiveLogGrowthOptions(data: DBDashboardArchiveLogGrowthTrendType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    return this.getArchiveLogGrowthOptions(data || []);
  }

  convertToLogGrowthRateOptions(data: DBDashboardLogGrowthRateType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    const max = this.getMaxValueForAxis(data, 'log_growth_gb_per_day')
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.log_growth_gb_per_day),
      // color: '#7b3ff2'
      db_uuid: d.db_uuid
    }));
    return this.getSimpleHorizontalBarOptions(graphData || [], max, '#7b3ff2');
  }

  convertToDbSizeByServerOptions(data: DBDashboardDbSizeByServerType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    const max = this.getMaxValueForAxis(data, 'db_size_gb')
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.db_size_gb),
      // color: '#3d8df3'
      db_uuid: d.db_uuid
    }));
    return this.getSimpleHorizontalBarOptions(graphData || [], max, '#3d8df3');
  }

  convertToLogSizeByServerOptions(data: DBDashboardLogSizeByServerType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    const max = this.getMaxValueForAxis(data, 'log_size_gb')
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.log_size_gb),
      // color: '#e84a4a'
      db_uuid: d.db_uuid
    }));
    return this.getSimpleHorizontalBarOptions(graphData || [], max, '#e84a4a');
  }

  convertToDiskUtilizationOptions(data: DBDashboardDiskUtilizationType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: this.roundDecimalValue(d.disk_used_pct),
      percentage: this.roundDecimalValueAsString(d.disk_used_pct),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  getDatabaseEfficiencyWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DBDashboardCapacityGrowthType> {
    // return of(CAPACITY_GROWTH_INSIGHT_SUMMARY_RESP);
    return this.http.get<DBDashboardCapacityGrowthType>('/customer/persona/database-dashboard/capacity-growth-insight-summary/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToBufferCacheEfficiencyViewData(data: DBDashboardEfficiencyGaugeType): DBDashboardEfficiencyGaugeViewData {
    return this.convertToEfficiencyGaugeViewData(data, true, 'buffer-cache');
  }

  convertToDatabaseObjectUtilizationViewData(data: DBDashboardEfficiencyGaugeType): DBDashboardEfficiencyGaugeViewData {
    return this.convertToEfficiencyGaugeViewData(data, false, 'database-object');
  }

  convertToTemporaryTablePerformanceViewData(data: DBDashboardTemporaryTablePerformanceType): DBDashboardTemporaryTablePerformanceViewData {
    if (!data || !data.chart) { return; }
    const view = new DBDashboardTemporaryTablePerformanceViewData();
    view.title = data.title || 'Temporary Table Performance';
    view.subtitle = data.subtitle || 'Temporary Tables Created (per sec)';
    view.stats = this.convertToTemporaryTableStatsViewData(data);
    view.chartOptions = this.convertToTemporaryTablePerformanceOptions(data);
    return view;
  }

  getDatabaseEfficiencyTableData(criteria?: DatabaseDashboardFilterCriteria, sortColumn?: string, sortDirection?: string): Observable<DBDashboardCapacityGrowthType> {
    // return of(CAPACITY_GROWTH_INSIGHT_TABLE_RESP);
    return this.http.get<DBDashboardCapacityGrowthType>('/customer/persona/database-dashboard/capacity-growth-insight-table/', {
      params: this.convertFiltersToApiParams(criteria, sortColumn, sortDirection, 1, 10)
    });
  }

  convertToDatabaseEfficiencyRowsViewData(data: DBDashboardEfficiencyServerType[]): DBDashboardEfficiencyServerViewData[] {
    if (!data || data?.length == 0) { return []; }
    return data.map(row => {
      const view = new DBDashboardEfficiencyServerViewData();
      view.rank = row.rank;
      view.hostId = row.host_id;
      view.hostUUID = row.host_uuid;
      view.name = row.name || 'N/A';
      view.dbType = row.db_type || 'N/A';
      view.bufferPoolEfficiency = this.formatNumberValueWithMetrics(row.buffer_pool_efficiency, '%');
      view.bufferPoolEfficiencyClass = this.getTextStatusClass(row.buffer_pool_efficiency_status || 'unknown');
      view.openTables = this.formatThousandsToKvalue(row.open_tables);
      view.openTablesClass = this.getTextStatusClass(row.open_tables_status || 'unknown');
      view.tempTablesInMemoryPerSec = this.formatNumberValueWithMetrics(row.temp_tables_in_memory_per_sec, '');
      view.tempTablesInMemoryPerSecClass = this.getTextStatusClass(row.temp_tables_in_memory_status || 'unknown');
      view.tempTablesOnDiskPerSec = this.formatNumberValueWithMetrics(row.temp_tables_on_disk_per_sec, '');
      view.tempTablesOnDiskPerSecClass = this.getTextStatusClass(row.temp_tables_on_disk_status || 'unknown');
      view.status = row.status || 'Unknown';
      view.statusIcon = this.getDatabaseEfficiencyStatusIcon(view.status);
      view.statusClass = this.getTextStatusClass(view.status);
      return view;
    });
  }

  private convertToEfficiencyGaugeViewData(data: DBDashboardEfficiencyGaugeType, invertRange: boolean, metricType?: string): DBDashboardEfficiencyGaugeViewData {
    if (!data || !data.gauge) { return; }
    const view = new DBDashboardEfficiencyGaugeViewData();
    view.title = data.title || '';
    view.subtitle = data.subtitle || '';
    view.stats = this.convertToEfficiencyGaugeStatsViewData(data, invertRange, metricType);
    view.chartOptions = this.convertToEfficiencyGaugeOptions(data, invertRange, metricType);
    return view;
  }

  private convertToEfficiencyGaugeStatsViewData(data: DBDashboardEfficiencyGaugeType, invertRange: boolean, metricType?: string): DBDashboardEfficiencyStatViewData[] {
    const min = data.stats?.min || 0;
    const avg = data.stats?.avg || 0;
    const max = data.stats?.max || 0;
    return [
      {
        label: 'Minimum',
        value: this.formatNumberValueWithMetrics(min, data.unit, data.stats?.display_min),
        tone: this.getEfficiencyMetricTone(min, data.gauge?.min, data.gauge?.max, invertRange, metricType)
      },
      {
        label: 'Average',
        value: this.formatNumberValueWithMetrics(avg, data.unit, data.stats?.display_avg),
        tone: this.getEfficiencyMetricTone(avg, data.gauge?.min, data.gauge?.max, invertRange, metricType)
      },
      {
        label: 'Maximum',
        value: this.formatNumberValueWithMetrics(max, data.unit, data.stats?.display_max),
        tone: this.getEfficiencyMetricTone(max, data.gauge?.min, data.gauge?.max, invertRange, metricType)
      }
    ];
  }

  private convertToTemporaryTableStatsViewData(data: DBDashboardTemporaryTablePerformanceType): DBDashboardEfficiencyStatViewData[] {
    const memoryClass = this.getTextStatusClass(data.status_memory || this.getInMemoryTempTablesStatus(data.stats?.avg?.memory));
    const diskClass = this.getTextStatusClass(data.status_disk || this.getDiskTempTablesStatus(data.stats?.avg?.disk));
    return [
      {
        label: 'Minimum',
        memory: this.formatNumberValueWithMetrics(data.stats?.min?.memory, ''),
        disk: this.formatNumberValueWithMetrics(data.stats?.min?.disk, ''),
        memoryClass: memoryClass,
        diskClass: diskClass
      },
      {
        label: 'Average',
        memory: this.formatNumberValueWithMetrics(data.stats?.avg?.memory, ''),
        disk: this.formatNumberValueWithMetrics(data.stats?.avg?.disk, ''),
        memoryClass: memoryClass,
        diskClass: diskClass
      },
      {
        label: 'Maximum',
        memory: this.formatNumberValueWithMetrics(data.stats?.max?.memory, ''),
        disk: this.formatNumberValueWithMetrics(data.stats?.max?.disk, ''),
        memoryClass: memoryClass,
        diskClass: diskClass
      }
    ];
  }

  private convertToEfficiencyGaugeOptions(data: DBDashboardEfficiencyGaugeType, invertRange: boolean, metricType?: string): EChartsOption {
    const min = Number(data.gauge?.min || 0);
    const max = Number(data.gauge?.max || 100);
    const value = Number(data.value || 0);
    const valueText = this.formatNumberValueWithMetrics(value, data.unit, data.display_value);
    const tone = data.status?.trim() ? this.getToneFromStatus(data.status) : this.getEfficiencyMetricTone(value, min, max, invertRange, metricType);
    const color = this.getEfficiencyToneColor(tone);

    return {
      animation: false,
      series: [
        {
          type: 'gauge',
          min: min,
          max: max,
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '78%'],
          radius: '110%',
          // splitNumber: 4,
          axisLine: {
            // roundCap: true,
            lineStyle: {
              width: 11,
              color: this.getEfficiencyGaugeAxisColors(metricType, invertRange)
            }
          },
          pointer: {
            show: true,
            length: '15%',
            width: 2,
            offsetCenter: [0, '-85%'],
            itemStyle: {
              color: '#1f2937'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            distance: -50,
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 500,
            formatter: (axisValue: number) => {
              if (axisValue === min) {
                return this.formatGaugeAxisValue(min);
              }
              if (axisValue === max) {
                return this.formatGaugeAxisValue(max);
              }
              return '';
            }
          },
          detail: {
            // formatter: `{value}%`,
            color: color,
            fontSize: 42,
            fontWeight: 500,
            valueAnimation: true,
            offsetCenter: [0, '-10%'],
            formatter: () => valueText,
          },
          title: {
            offsetCenter: [0, '20%'],
            color: '#6b7280',
            fontSize: 14,
            fontWeight: 500
          },
          data: [
            {
              value: value,
              name: 'Average'
            }
          ]
        }
      ]
    };
  }

  convertToTemporaryTablePerformanceOptions(data: DBDashboardTemporaryTablePerformanceType): EChartsOption {
    if (!data?.chart?.labels?.length || !data.chart.datasets?.length) { return; }
    const colors = data.chart.datasets.map((dataset, index) => {
      const datasetName = (dataset.label || '').toLowerCase();
      if (datasetName.includes('disk')) {
        return this.getStatusColor(data.status_disk || this.getDiskTempTablesStatus(data.stats?.avg?.disk));
      }
      if (datasetName.includes('memory')) {
        return this.getStatusColor(data.status_memory || this.getInMemoryTempTablesStatus(data.stats?.avg?.memory));
      }
      return [this.getStatusColor('healthy'), this.getStatusColor('critical')][index % 2];
    });
    return {
      animation: false,
      color: colors,
      legend: {
        top: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#26313b',
          fontSize: 11,
          fontWeight: 600
        }
      },
      grid: {
        top: 36,
        right: 12,
        bottom: 24,
        left: 34,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: data.chart.labels,
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#d5dbe1'
          }
        },
        axisLabel: {
          color: '#566270',
          fontSize: 11,
          fontWeight: 600
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#566270',
          fontSize: 11,
          formatter: (value: number) => this.roundDecimalValueAsString(value)
        },
        splitLine: {
          lineStyle: {
            color: '#e4e9ee'
          }
        }
      },
      series: data.chart.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: colors[index % colors.length],
          borderRadius: [2, 2, 0, 0]
        },
        data: (dataset.data || []).map(value => this.roundDecimalValue(value))
      }))
    };
  }

  /*
   * ******End ****** Capacity / Growth Insights Widget Related ********************
   */

  /*
   * -----Start----- Availability / Health Overview Widget Related -------------------
   */

  getHealthOverviewWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DbDashboardHealthGroupType> {
    // return of(HEALTHGROWTH_RESP);
    return this.http.get<DbDashboardHealthGroupType>('/customer/persona/database-dashboard/health-overview/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertTodatabaseAvailabilityStatus(data: DbDashboardSummary): DbDashboardSummaryViewData {
    if (!data || !Object.keys(data).length) {
      return;
    }
    let obj = new DbDashboardSummaryViewData();
    obj.online = data.online;
    obj.degraded = data.degraded;
    obj.unreachable = data.unreachable;
    obj.maintenance = data.maintenance;
    obj.inactive = data.inactive;
    obj.total = data.total;
    return obj;
  }

  convertToReplicationSync(data: DbDashboardReplicationSync): DbDashboardReplicationSyncSummaryData {
    if (!data?.summary || !Object.keys(data.summary).length) {
      return;
    }
    let syncData = data.summary
    let obj = new DbDashboardReplicationSyncSummaryData();
    obj.syncHealthy = syncData.sync_healthy;
    obj.lagOver30s = syncData.lag_over_30s;
    obj.deadlocks = syncData.deadlocks;
    obj.errorsPerSecond = syncData.errors_per_second;
    obj.connectionErrors = syncData.connection_errors;
    obj.noReplication = syncData.no_replication;
    return obj;
  }

  /*
   * ******End ****** Availability / Health Overview Widget Related ********************
   */

  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */

  getAlertsOverviewWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardTopCriticalAlertsResponse> {
    // return of(ALERTS_RESP);
    return this.http.get<DatabaseDashboardTopCriticalAlertsResponse>('/customer/persona/database-dashboard/alerts-overview/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToAlertSummaryViewData(data: DatabaseDashboardTopCriticalAlertsSummary): DatabaseDashboardAlertSummaryMetric[] {
    const summary = (data || {}) as Record<string, number | string>;
    return DATABASE_DASHBOARD_ALERT_SUMMARY_CONFIG.map(item => ({
      label: item.label,
      key: item.key,
      value: this.formatAlertSummaryValue(summary[item.key], item.suffix),
      tone: item.tone,
      link: item.link,
    }));
  }

  convertToCriticalAlertsTableData(data: DatabaseDashboardCriticalAlert[]): DatabaseDashboardCriticalAlertViewData[] {
    return (data || []).map(alert => ({
      uuid: alert.uuid,
      id: alert.id,
      deviceName: alert.device_name,
      severity: alert.severity === 'Critical' ? 'Critical' : 'Warning',
      severityClass: alert.severity == 'Critical' ? 'text-danger' : alert.severity == 'Warning' ? 'text-warning' : 'text-primary',
      severityIcon: alert.severity == 'Critical' ? 'fa-exclamation-circle text-danger' : alert.severity == 'Warning' ? 'fa-exclamation-circle text-warning' : 'fa-info-circle text-primary',
      description: alert.description,
      source: alert.source,
      acknowledged: alert.acknowledged ? 'Yes' : 'No',
      duration: alert.age
    }));
  }

  private formatAlertSummaryValue(value: number | string, suffix?: string): string {
    if (value == null) { return 'N/A' }
    const numericValue = Number(value);
    const formattedValue = Number.isFinite(numericValue) ? this.formatNumber(numericValue) : String(value || '0');
    return suffix && !formattedValue.endsWith(suffix) ? `${formattedValue}${suffix}` : formattedValue;
  }

  private formatNumber(value: number | string): string {
    const numericValue = Number(value || 0);
    return Number.isFinite(numericValue) ? this.roundDecimalValue(numericValue).toLocaleString('en-US') : '0';
  }

  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  private getMaxValueForAxis(data: any[], key: string) {
    if (!data || data?.length === 0 || !key) { return; }
    const values = data
      .map((item: any) => Number(item?.[key] || 0))
      .filter(value => Number.isFinite(value));
    const maxVal = values.length ? Math.max(...values) : 0;
    return this.roundDecimalValue(maxVal + ((maxVal * 10) / 100));
  }

  private getColorByMaxValue(value: number, max: number, inverse?: boolean) {
    const percent = ((value / max) * 100);
    return inverse ? this.getProgressBarInverseColor(percent) : this.getProgressBarColor(percent);
  }

  private getStatusColor(status?: string): string {
    const normalizedStatus = (status || '').trim().toLowerCase();
    if (!normalizedStatus) {
      return '#6c7580';
    }
    if (normalizedStatus.includes('critical') || normalizedStatus.includes('down')) {
      return '#DC3545';
    }
    if (normalizedStatus.includes('warning') || normalizedStatus.includes('degraded')) {
      return '#F39C12';
    }
    if (normalizedStatus.includes('healthy') || normalizedStatus.includes('success')) {
      return '#28A745';
    }
    return '#6c7580';
  }

  private getToneFromStatus(status?: string): DatabaseDashboardTone {
    const normalizedStatus = (status || '').trim().toLowerCase();
    if (!normalizedStatus) {
      return 'unknown';
    }
    if (normalizedStatus.includes('critical') || normalizedStatus.includes('down')) {
      return 'danger';
    }
    if (normalizedStatus.includes('warning') || normalizedStatus.includes('degraded')) {
      return 'warning';
    }
    if (normalizedStatus.includes('healthy') ||normalizedStatus.includes('normal')) {
      return 'success';
    }
    return 'unknown';
  }

  private getQueryResponseStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getQueryLatencyStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getActiveSessionsStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getErrorRateStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getTransactionThroughputStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getCacheHitRatioStatusColor(status: string | undefined, _value: number = 0): string {
    return this.getStatusColor(status);
  }

  private getInMemoryTempTablesStatus(value?: number | null): string {
    if (!value) {
      return 'unknown';
    }
    const numericValue = Number(value);
    return numericValue > 0.8 ? 'healthy' : numericValue >= 0.6 ? 'warning' : 'critical';
  }

  private getDiskTempTablesStatus(value?: number | null): string {
    if (!value) {
      return 'unknown';
    }
    const numericValue = Number(value);
    return numericValue < 0.1 ? 'healthy' : numericValue <= 0.15 ? 'warning' : 'critical';
  }

  private getProgressBarColor(value: number): string {
    return value < 20 ? '#639922' : value > 20 && value < 50 ? '#378ADD' : value > 50 && value < 80 ? '#EF9F27' : '#E24B4A';
  }

  private getProgressBarInverseColor(value: number): string {
    return value < 20 ? '#E24B4A' : value > 20 && value < 50 ? '#EF9F27' : value > 50 && value < 80 ? '#378ADD' : '#639922';
  }

  private getToneType(value: number): DatabaseDashboardTone {
    return value < 50 ? 'success' : value > 50 && value < 80 ? 'warning' : 'danger';
  }

  private getEfficiencyTone(value: number = 0, min: number = 0, max: number = 100, invertRange: boolean = false): DatabaseDashboardTone {
    const safeMin = Number(min || 0);
    const safeMax = Number(max || 100);
    const percent = safeMax === safeMin ? 0 : ((Number(value || 0) - safeMin) / (safeMax - safeMin)) * 100;
    if (invertRange) {
      return percent >= 80 ? 'success' : percent >= 50 ? 'warning' : 'danger';
    }
    return percent >= 75 ? 'danger' : percent >= 50 ? 'warning' : 'success';
  }

  private getEfficiencyMetricTone(value: number = 0, min: number = 0, max: number = 100, invertRange: boolean = false, metricType?: string): DatabaseDashboardTone {
    if (metricType === 'buffer-cache') {
      return value >= 95 ? 'success' : value >= 90 ? 'warning' : 'danger';
    }
    if (metricType === 'database-object') {
      const safeMin = Number(min || 0);
      const safeMax = Number(max || 100);
      const percent = safeMax === safeMin ? 0 : ((Number(value || 0) - safeMin) / (safeMax - safeMin)) * 100;
      return percent < 70 ? 'success' : percent <= 85 ? 'warning' : 'danger';
    }
    return this.getEfficiencyTone(value, min, max, invertRange);
  }

  private getEfficiencyGaugeAxisColors(metricType: string | undefined, invertRange: boolean): [number, string][] {
    if (metricType === 'buffer-cache') {
      return [[0.9, '#DC3545'], [0.95, '#F39C12'], [1, '#28A745']];
    }
    if (metricType === 'database-object') {
      return [[0.7, '#28A745'], [0.85, '#F39C12'], [1, '#DC3545']];
    }
    return invertRange
      ? [[0.5, '#DC3545'], [0.8, '#F39C12'], [1, '#28A745']]
      : [[0.5, '#28A745'], [0.8, '#F39C12'], [1, '#DC3545']];
  }

  private getEfficiencyToneColor(tone: DatabaseDashboardTone): string {
    const colors: Record<DatabaseDashboardTone, string> = {
      primary: '#2588df',
      success: '#28A745',
      warning: '#F39C12',
      danger: '#DC3545',
      muted: '#6c7580',
      unknown: '#6c7580'
    };
    return colors[tone] || colors.muted;
  }

  private formatGaugeAxisValue(value: number): string {
    return value >= 1000 ? `${this.roundDecimalValueAsString(value / 1000, 1)} K` : this.roundDecimalValueAsString(value);
  }

  private roundDecimalValue(value?: number | null, decimals: number = 2): number {
    const numericValue = Number(value || 0);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }
    const factor = Math.pow(10, decimals);
    return Math.round((numericValue + Number.EPSILON) * factor) / factor;
  }

  private roundDecimalValueAsString(value?: number | null, decimals: number = 2): string {
    return this.roundDecimalValue(value, decimals).toString();
  }

  private formatNumberValueWithMetrics(value?: number | null, unit?: string, displayValue?: string, decimals: number = 2,): string {
    const numericValue = Number(value);
    if (displayValue) {
      return displayValue;
    }
    let formattedValue = this.roundDecimalValueAsString(value, decimals)
    const formattedUnit = (unit || '').trim();
    if(unit == 'tables'){
      if (numericValue > 1000) {
        formattedValue = this.roundDecimalValueAsString(value / 1000, decimals);
        return `${formattedValue}K`;
      }
      return `${formattedValue}`;
    }
    return `${formattedValue}${formattedUnit}`;
  }

  private formatThousandsToKvalue(value?: number | null): string {
    const numericValue = Number(value);
    if (value == null || !Number.isFinite(numericValue)) {
      return 'N/A';
    }
    if (numericValue > 1000) {
      return this.formatNumberValueWithMetrics(numericValue / 1000, 'K');
    }
    return this.formatNumberValueWithMetrics(numericValue);
  }

  private getDatabaseEfficiencyStatusIcon(status?: string): string {
    const normalizedStatus = (status || '').trim().toLowerCase();
    if (!normalizedStatus) {
      return 'fa-question-circle';
    }
    if (normalizedStatus.includes('critical') || normalizedStatus.includes('down')) {
      return 'fa-exclamation-triangle';
    }
    if (normalizedStatus.includes('warning') || normalizedStatus.includes('degraded')) {
      return 'fa-exclamation-circle';
    }
    if (normalizedStatus.includes('healthy') || normalizedStatus.includes('normal')) {
      return 'fa-check-circle';
    }
    return 'fa-question-circle';
  }

  private getTextStatusClass(status?: string): string {
    const normalizedStatus = (status || '').trim().toLowerCase();
    if (!normalizedStatus) {
      return 'text-muted';
    }
    if (normalizedStatus.includes('critical') || normalizedStatus.includes('down')) {
      return 'text-danger';
    }
    if (normalizedStatus.includes('warning') || normalizedStatus.includes('degraded')) {
      return 'text-warning';
    }
    if (normalizedStatus.includes('healthy') || normalizedStatus.includes('normal')) {
      return 'text-success';
    }
    return 'text-muted';
  }

  private getHorizontalProgressBarOptions(items: DatabaseDashboardBarItem[], reverseColors: boolean = false): EChartsOption {
    const sortedData: any = [...items].sort((a: any, b: any) => b.value - a.value);
    const maxVal = Math.max(...items.map((item: any) => item.value));
    const max = maxVal ? maxVal + ((maxVal * 10) / 100) : 100;
    const getItemColor = (index: number) => sortedData[index]?.color || this.getColorByMaxValue(sortedData[index].value, max, reverseColors);
    const barData = sortedData.map((item: any, index: number) => ({
      ...item,
      itemStyle: {
        color: getItemColor(index),
        borderRadius: 4
      },
      label: {
        color: getItemColor(index)
      }
    }));
    // const labelWidth = Math.max(...items.map((item: any) => item.name.length));
    // console.log("maxVal-", maxVal, " max calc-", max);
    return {
      animation: false,
      // grid: { top: '5%', right: '10%', bottom: '5%', left: '15%', containLabel: true },
      grid: { left: 20, right: 20, top: 20, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'none'
        },
        // formatter: (params: any) => {
        //   console.log("params",params)
        //   const item = sortedData[params[0].dataIndex];
        //   return `${item.name} - ${item.value}`;
        // }
      },
      xAxis: { type: 'value', show: false, min: 0, max: max },
      yAxis: {
        type: 'category',
        // inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#4f5b68',
          fontSize: 10,
          // width: this.getLablelLength(sortedData) - 15,
          // overflow: 'truncate',
          // formatter: (value: string) => {
          //   return this.truncateLabel(value, 14);
          // }
        },
        // tooltip: { show: true },
        data: sortedData.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          barGap: '-100%',
          barCategoryGap: 10,
          silent: true,
          itemStyle: { color: '#eef1f3', borderRadius: 4 },
          data: sortedData.map(() => max)
        },
        {
          type: 'bar',
          barWidth: 8,
          barCategoryGap: 10,
          label: {
            show: true,
            position: 'right',
            distance: 5,
            formatter: (params: any) => String(sortedData[params.dataIndex].label || sortedData[params.dataIndex].value),
            fontSize: 9
          },
          itemStyle: {
            borderRadius: 4
          },
          emphasis: {
            disabled: true
          },
          // data: sortedData.map(item => item.value)
          data: barData
        }
      ]
    };
  }

  private getSimpleHorizontalBarOptions(items: DatabaseDashboardBarItem[], max: number, color: string): EChartsOption {
    const sortedData: any = [...items].sort((a: any, b: any) => b.value - a.value);
    return {
      animation: false,
      // grid: { top: 10, right: 10, bottom: 20, left: 90, containLabel:true },
      grid: { left: 20, right: 20, top: 20, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'none'
        },
        // formatter: (params: any) => {
        //   console.log("params",params)
        //   const item = sortedData[params[0].dataIndex];
        //   return `${item.name} - ${item.value}`;
        // }
      },
      xAxis: {
        type: 'value',
        min: 0,
        // max: max,
        axisLine: { show: true },
        axisLabel: { color: '#a0a9b2', fontSize: 9, margin: 5 },
        axisTick: { show: true, lineStyle: { color: '#a0a9b2' } },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        // inverse: true,
        axisLine: { show: true },
        axisLabel: { color: '#7b8794', fontSize: 9, margin: 5 },
        axisTick: { show: true, lineStyle: { color: '#a0a9b2' }, alignWithLabel: true },
        splitLine: { show: false },
        data: sortedData.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 10,
          itemStyle: { color: color, borderRadius: 2 },
          // data: sortedData.map(item => item.value)
          data: sortedData
        }
      ]
    };
  }

  private getTransactionThroughputOptions(items: DBDashboardTopThroughputType[]): EChartsOption {
    const xAxisData = items?.[0]?.trend?.map((item: any) => this.formatDateLabel(item.date)) || [];
    return {
      animation: false,
      legend: {
        show: false
      },
      grid: { left: 10, right: 10, top: 20, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#d8d8d8',
          }
        },
        // formatter: (params: any) => {
        //   let tooltip = `${params[0].axisValue}<br/>`;
        //   params.forEach((item: any) => {
        //     tooltip += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
        //   });
        //   return tooltip;
        // }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#7a8794',
          fontSize: 10,
          // formatter: (value: number) => `${value / 1000}k`
          formatter: (value: number) => `${this.roundDecimalValueAsString(value)}k`
        },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      // series: [
      //   {
      //     type: 'line',
      //     smooth: true,
      //     symbol: 'none',
      //     data: [12900, 12400, 13750, 11300, 12750, 12100, 13250],
      //   }
      // ],
      series: items.map((host: DBDashboardTopThroughputType) => {
        const maxTps = Math.max(...(host.trend || []).map((item: DBDashboardTopThroughputTrendType) => Number(item.transactions_per_sec || 0)));
        const lineColor = this.getTransactionThroughputStatusColor(host.status , maxTps);
        return {
          name: host.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          // showSymbol: false,
          lineStyle: {
            width: 3,
            color: lineColor
          },
          itemStyle: {
            color: lineColor
          },
          areaStyle: {
            color: this.getLineAreaGradient(lineColor)
          },
          // data: host.trend.map((item: any) => item)          
          data: host.trend.map(item => ({
            value: this.roundDecimalValue(item.transactions_per_sec),
            ...item,
            db_uuid: host.db_uuid,
            db_name: host.name
          })),
        };
      })
    };
  }

  private getStorageGrowthOptions(items: DBDashboardStroageGrowthTrendType[]): EChartsOption {
    const allValues = items.flatMap(db => db.trend.map(t => Number(t.db_size_gb || 0)));
    const yAxisBounds = this.getDecimalAxisBounds(allValues);
    const colors = ['#2F8BD7', '#f5a623', '#5B9E29', '#D03533', '#26A69A', '#9B59B6', '#B7D99A', '#FFD099', '#9BC9F0', '#F5A3A3']
    return {

      animation: false,
      legend: {
        bottom: 0,
        left: 0,
        data: items.map(db => db.name),
        icon: 'rect',
        itemWidth: 6,
        itemHeight: 6,
      },

      grid: { left: 10, right: 10, top: 20, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'axis',

        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#d8d8d8',
          }
        },
        formatter: (params: any) => {
          return params.map((p: any) => {
            const d = p.data;
            return ` ${p.marker} ${p.seriesName}: ${this.roundDecimalValueAsString(d.db_size_gb)} GB `;
          }).join('<br/>');
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: items[0].trend.map(item =>
          new Date(item.ts * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      },

      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `${this.roundDecimalValueAsString(value)} GB`
        },
        min: yAxisBounds.min,
        max: yAxisBounds.max
      },

      series: items.map((db, index) => ({
        name: db.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: colors[index % colors.length]
        },
        itemStyle: {
          color: colors[index % colors.length]
        },
        areaStyle: {
          color: this.getLineAreaGradient(colors[index % colors.length])
        },
        data: db.trend.map(item => ({
          value: this.roundDecimalValue(item.db_size_gb),
          ...item,
          db_uuid: db.db_uuid,
          db_name: db.name
        })),
      }))
    }
  }

  private getGrowthLine(name: string, color: string, data: number[]): any {
    return {
      name: name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: data,
      lineStyle: { color: color, width: 1.6 }
    };
  }

  private getArchiveLogGrowthOptions(items: DBDashboardArchiveLogGrowthTrendType[]): EChartsOption {
    const xAxisData = items?.[0]?.trend?.map((item: any) => this.formatDateLabel(item.date)) || [];
    const colors = DBDASHBOARDCOLORS;
    return {
      animation: false,
      grid: { top: 12, right: 10, bottom: 26, left: 44 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#d8d8d8',
          }
        },
        // formatter: (params: any) => {
        //   let tooltip = `${params[0].axisValue}<br/>`;
        //   params.forEach((item: any) => {
        //     tooltip += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
        //   });
        //   return tooltip;
        // }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        // splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 10, formatter: (value: number) => `${this.roundDecimalValueAsString(value)}GB` },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      // series: [
      //   {
      //     type: 'line',
      //     smooth: true,
      //     symbol: 'none',
      //     data: [122, 136, 121, 148, 131, 139, 155],
      //     lineStyle: { color: '#ff9b21', width: 3 },
      //     areaStyle: { color: 'rgba(255, 155, 33, 0.14)' }
      //   }
      // ]
      series: items.map((host: any, index: number) => {
        return {
          name: host.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          // showSymbol: false,
          lineStyle: {
            width: 3,
            color: colors[index % colors.length]
          },
          itemStyle: {
            color: colors[index % colors.length]
          },
          areaStyle: {
            color: this.getLineAreaGradient(colors[index % colors.length])
          },
          data: host.trend.map((item: any) => this.roundDecimalValue(item.log_growth_gb))
        };
      })
    };
  }

  private getLineAreaGradient(color: string): any {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: this.hexToRgba(color, 0.22)
        },
        {
          offset: 1,
          color: this.hexToRgba(color, 0.04)
        }
      ]
    };
  }

  private hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  private formatDateLabel(date: string): string {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `${month} ${day}`;
  }

  private formatSeconds(seconds: number): string {
    const totalSeconds = Math.floor(Number(seconds || 0));
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const secs = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (secs > 0) {
      parts.push(`${secs}s`);
    }
    return parts.length > 0 ? parts.slice(0, 2).join(" ") : "0s";
  }

}
