import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { DatabaseServersService } from 'src/app/united-cloud/shared/database-servers/database-servers.service';
import {
  DATABASE_DASHBOARD_ALERT_SUMMARY_CONFIG,
  DBDASHBOARDCOLORS,
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
  top10UtilizationTrendItem
} from './database-dashboard.type';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class DatabaseDashboardService {

  constructor(private builder: FormBuilder,
    private databaseServersService: DatabaseServersService,
    private http: HttpClient) { }


  /*
   * -----Start----- Sub header Related -------------------
   */
  getHeaderInfo(): Observable<DatabaseDashboardHeaderInfoResponse> {
    return this.http.get<DatabaseDashboardHeaderInfoResponse>('/customer/persona/database-dashboard/refresh-time/');
  }
  /*
   * ******End ****** Sub header Related ********************
   */

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(databases?: DatabaseDashboardFilterOption[]): FormGroup {
    return this.builder.group({
      databases: [databases || []]
    });
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
    return this.http.get<any>('/customer/database_servers_fast/');
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

  private convertFiltersToApiParams(criteria?: DatabaseDashboardFilterCriteria, sortColumn?: string, sortDirection?: string): HttpParams {
    console.log("criteria", JSON.parse(JSON.stringify(criteria)), sortColumn, sortDirection);
    let params: HttpParams = new HttpParams();
    params = this.appendMultiValueParam(params, 'database', criteria?.databases);
    if (sortColumn) {
      params = params.append('sort_by', sortColumn);
    }
    if (sortDirection) {
      params = params.append('sort_order', sortDirection);
    }
    console.log("params", JSON.parse(JSON.stringify(params)));
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
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Database Estate / Inventory Overview Widget Related -------------------
   */
  getInventoryOverviewWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<InventoryWidgetType> {
    // return of(INVENTORY_RESP)
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
      percentage: d.percentage.toFixed(0)
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
      percentage: d.percentage.toFixed(0)
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
      label: d.percentage.toFixed(0),
      color: this.getProgressBarColor(Number(d.percentage.toFixed(0)))
    }));
    return this.getEnvironmentOptions(graphData || []);
  }

  private getEnvironmentOptions(items: DatabaseDashboardBarItem[]): EChartsOption {
    const maxValue = 100;
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
            borderRadius: 4,
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.label)
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
    // return of(TOPUTIL_RESP)
    return this.http.get<DatabaseDashboardTop10Utilization[]>('/customer/persona/database-dashboard/workload-insights/', {
      params: this.convertFiltersToApiParams(criteria, sortColumn, sortDirection)
    });
  }

  convertToUtilizationRowsViewData(data: DatabaseDashboardTop10Utilization[]): DatabaseDashboardTop10UtilizationViewData[] {
    if (!data || data?.length == 0) { return; }
    let viewData: DatabaseDashboardTop10UtilizationViewData[] = [];
    const diskIopsValues = data.map(row => Number(row.disk_read_ops || 0) + Number(row.disk_write_ops || 0));
    const diskIopsTotal = Math.max(...diskIopsValues);

    data.forEach(row => {
      let view = new DatabaseDashboardTop10UtilizationViewData();
      view.hostUUID = row.host_uuid ? row.host_uuid : null;
      view.dbUUID = row.db_uuid ? row.db_uuid : null;
      view.name = row.name;

      view.cpuChartOptions = this.getSparklineOptions(row.cpu_trend, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      view.cpuUtilizationPercent = Number(row.cpu_usage_system_percent.toFixed(0));
      view.cpuTone = this.getToneType(row.cpu_usage_system_percent);

      view.memoryChartOptions = this.getSparklineOptions(row.memory_trend, '#6aa544', 'rgba(106, 165, 68, 0.28)'),
      view.memoryUtilizationPercent = Number(row.memory_used_percent.toFixed(0));
      view.memoryTone = this.getToneType(row.memory_used_percent);

      view.diskCapacityGB = row.disk_capacity;
      view.diskUsedGB = row.disk_used;
      view.diskFreePercent = Number(row.disk_usage_percent.toFixed(0));
      view.diskUsedPercent = Math.ceil(100 - row.disk_usage_percent);
      view.diskTone = this.getToneType(view.diskUsedPercent);

      view.diskRops = Number(row.disk_read_ops.toFixed(0));
      view.diskWops = Number(row.disk_read_ops.toFixed(0));
      const diskIops = view.diskRops + view.diskWops;
      view.diskIops = Number(diskIops.toFixed(0));
      view.diskIopsPercent = diskIopsTotal ? Math.round((diskIops / diskIopsTotal) * 100) : 0;
      view.diskIopsTone = this.getToneType(view.diskIopsPercent);

      view.uptime = this.formatSeconds(row.system_uptime_seconds);

      viewData.push(view)
    });
    return (viewData);
  }

  private getSparklineOptions(data: top10UtilizationTrendItem[], lineColor: string, areaColor: string): EChartsOption {
    // const xAxisData = data?.map((item: top10UtilizationTrendItem) => item.ts) || [];
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
        min: 0,
        max: 100
      },
      series: [
        {
          type: 'line',        
          data: data.map(item => item.value),
          symbol: 'none',
          smooth: false,
          lineStyle: { width: 1.5, color: lineColor },
          areaStyle: { color: areaColor }
        }
      ]
    };
  }

  getWorkloadInsightsTop10QueryWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardTopQueryType> {
    // return of(TOPQUERY_RESP)
    return this.http.get<DatabaseDashboardTopQueryType>('/customer/persona/database-dashboard/top-query-performance/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToQueryResponseOptions(data: DBDashboardTopResponseTimeType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.response_time_ms.toFixed(0)),
      label: `${d.response_time_ms}k`,
      // color: this.getProgressBarColor(d.response_time_ms)
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToQueryLatencyOptions(data: DBDashboardTopLatencyType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.response_time_ms.toFixed(0)),
      label: `${d.response_time_ms}ms`,
      // color: this.getProgressBarColor(d.response_time_ms)
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToActiveSessionsOptions(data: DBDashboardTopConnectionsType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.active_connections.toFixed(0)),
      label: `${d.active_connections}min`,
      // color: this.getProgressBarColor(d.active_connections)
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }

  convertToErrorRateOptions(data: DBDashboardTopErrorsDeadlocksType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.deadlock_count.toFixed(0)),
      label: `${d.deadlock_count}`,
      // color: this.getProgressBarColor(d.deadlock_count)
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
      value: Number(d.hit_ratio_pct.toFixed(0)),
      label: `${d.hit_ratio_pct}%`,
      // color: this.getCacheHitProgressBarColor(d.hit_ratio_pct)
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
    // return of(CAPACITY_RESP)
    return this.http.get<DBDashboardCapacityGrowthType>('/customer/persona/database-dashboard/growth-insights/', {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToCapacityMetricsViewData(data: DBDashboardSummaryStats): DatabaseDashboardCapacityMetric[] {
    return [
      { label: 'Total DB Size', value: `${data?.total_db_size_gb ? data.total_db_size_gb : 0} GB`, helper: 'Database Storage' },
      { label: 'Total Free Space', value: `${data?.total_free_space_gb ? data.total_free_space_gb : 0} GB`, helper: 'Combined Free Capacity' },
      { label: 'Avg Storage Used', value: `${data?.avg_used_percentage ? data.avg_used_percentage : 0}%`, helper: 'Across 10 Servers' }
    ];
  }

  convertToStorageRowsViewData(data: DBDashboardTopServersType[]): DBDashboardTopServersViewData[] {
    if (!data || data?.length == 0) { return; }
    const viewData: DBDashboardTopServersViewData[] = []
    data.forEach(d => {
      const view = new DBDashboardTopServersViewData();
      view.server = d.name;
      view.dbUUID = d.db_uuid;
      view.used = Number(d.used_percentage.toFixed(0));
      view.free = Number(d.free_gb.toFixed(0));
      view.dbSize = Number(d.db_size_gb.toFixed(0));
      view.logSize = Number(d.log_size_gb.toFixed(0));
      view.logGrowth = Number(d.log_growth_gb_per_day.toFixed(0))
      viewData.push(view);
    });
    return viewData || [];
  }

  convertToTablespaceUsageOptions(data: DBDashboardTopTableSpaceUsageType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.disk_used_pct.toFixed(0)),
      percentage: d.disk_used_pct.toFixed(0),
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
      value: Number(d.log_growth_gb_per_day.toFixed(2)),
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
      value: Number(d.db_size_gb.toFixed(2)),
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
      value: Number(d.log_size_gb.toFixed(2)),
      // color: '#e84a4a'
      db_uuid: d.db_uuid
    }));
    return this.getSimpleHorizontalBarOptions(graphData || [], max, '#e84a4a');
  }

  convertToDiskUtilizationOptions(data: DBDashboardDiskUtilizationType[]): EChartsOption {
    if (!data || data?.length == 0) { return; }
    let graphData = data.map(d => ({
      name: d.name,
      value: Number(d.disk_used_pct.toFixed(0)),
      percentage: d.disk_used_pct.toFixed(0),
      db_uuid: d.db_uuid
    }));
    return this.getHorizontalProgressBarOptions(graphData || []);
  }
  /*
   * ******End ****** Capacity / Growth Insights Widget Related ********************
   */

  /*
   * -----Start----- Availability / Health Overview Widget Related -------------------
   */

  getHealthOverviewWidgetData(criteria?: DatabaseDashboardFilterCriteria): Observable<DbDashboardHealthGroupType> {
    // return of(HEALTHGROWTH_RESP)
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
    // return of(ALERTS_RESP)
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
    const formattedValue = typeof value === 'number' ? this.formatNumber(value) : String(value || '0');
    return suffix && !formattedValue.endsWith(suffix) ? `${formattedValue}${suffix}` : formattedValue;
  }

  private formatNumber(value: number | string): string {
    const numericValue = Number(value || 0);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('en-US');
  }

  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  private getMaxValueForAxis(data: any[], key: string) {
    if (!data || data?.length === 0 || !key) { return; }
    const maxVal = Math.max(...data.map((item: any) => item[key] ? item[key] : 100));
    const max = maxVal + ((maxVal * 10) / 100);
    return max;
  }

  private getColorByMaxValue(value: number, max: number, inverse?: boolean) {
    const percent = ((value / max) * 100);
    return inverse ? this.getProgressBarInverseColor(percent) : this.getProgressBarColor(percent);
  }

  private getProgressBarColor(value: number): string {
    return value < 30 ? '#639922' : value >= 30 && value < 55 ? '#378ADD' : value >= 55 && value < 85 ? '#EF9F27' : '#E24B4A';
  }

  private getProgressBarInverseColor(value: number): string {
    return value < 20 ? '#E24B4A' : value >= 20 && value < 50 ? '#EF9F27' : value >= 50 && value < 85 ? '#378ADD' : '#639922';
  }

  private getToneType(value: number): string {
    return value < 65 ? 'success' : value >= 65 && value < 85 ? 'warning' : 'danger';
  }

  private getHorizontalProgressBarOptions(items: DatabaseDashboardBarItem[], reverseColors: boolean = false): EChartsOption {
    const sortedData: any = [...items].sort((a: any, b: any) => b.value - a.value);
    const maxVal = Math.max(...items.map((item: any) => item.value));
    const max = maxVal + ((maxVal * 10) / 100);
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
            color: '#2e3338',
            fontSize: 9
          },
          itemStyle: {
            borderRadius: 4,
            color: (params: any) => this.getColorByMaxValue(sortedData[params.dataIndex].value, max, reverseColors)
          },
          emphasis: {
            disabled: true
          },
          // data: sortedData.map(item => item.value)
          data: sortedData
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
    const colors = ['#2F8BD7', '#f5a623', '#5B9E29', '#D03533', '#26A69A', '#9B59B6', '#B7D99A', '#FFD099', '#9BC9F0', '#F5A3A3']
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
        // min: (value: any) => {
        //   return Math.floor(value.min * 10) / 10;
        // },
        // max: (value: any) => {
        //   return Math.ceil(value.max * 10) / 10;
        // },
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
          formatter: (value: number) => `${value}k`
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
      series: items.map((host: any, index: number) => {
        return {
          name: host.name,
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
          // data: host.trend.map((item: any) => item)          
          data: host.trend.map(item => ({
            value: item.transactions_per_sec,
            ...item,
            db_uuid: host.db_uuid,
            db_name: host.name
          })),
        };
      })
    };
  }

  private getStorageGrowthOptions(items: DBDashboardStroageGrowthTrendType[]): EChartsOption {
    const allValues = items.flatMap(db => db.trend.map(t => t.db_size_gb));
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
            return ` ${p.marker} ${p.seriesName}: ${d.db_size_gb.toFixed(2)} GB `;
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
          formatter: '{value} GB'
        },
        min: Math.floor(Math.min(...allValues)),
        max: Math.ceil(Math.max(...allValues))
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
          value: item.db_size_gb,
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
        axisLabel: { color: '#7a8794', fontSize: 10, formatter: '{value}GB' },
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
          data: host.trend.map((item: any) => item.log_growth_gb)
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
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

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
    // If all are zero, return "0s" as a fallback
    return parts.length > 0 ? parts.join(" ") : "0s";
  }

}
