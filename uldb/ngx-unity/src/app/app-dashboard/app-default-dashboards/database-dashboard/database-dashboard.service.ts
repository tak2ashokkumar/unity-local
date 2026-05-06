import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DatabaseServersService } from 'src/app/united-cloud/shared/database-servers/database-servers.service';
import { DatabaseServer } from 'src/app/united-cloud/shared/entities/database-servers.type';
import {
  DATABASE_DASHBOARD_ACTIVE_SESSIONS,
  DATABASE_DASHBOARD_ALERT_SUMMARY,
  DATABASE_DASHBOARD_ALL_SELECTED_VALUE,
  DATABASE_DASHBOARD_CACHE_HIT_RATIO,
  DATABASE_DASHBOARD_CAPACITY_METRICS,
  DATABASE_DASHBOARD_CLOUD_TYPE_DISTRIBUTION,
  DATABASE_DASHBOARD_CRITICAL_ALERTS,
  DATABASE_DASHBOARD_DATABASE_OPTIONS,
  DATABASE_DASHBOARD_DB_SIZE_BY_SERVER,
  DATABASE_DASHBOARD_DISK_UTILIZATION,
  DATABASE_DASHBOARD_ENVIRONMENT_COUNTS,
  DATABASE_DASHBOARD_ERROR_RATE,
  DATABASE_DASHBOARD_HEALTH_GROUPS,
  DATABASE_DASHBOARD_LOG_GROWTH_RATE,
  DATABASE_DASHBOARD_LOG_SIZE_BY_SERVER,
  DATABASE_DASHBOARD_PLATFORM_COUNTS,
  DATABASE_DASHBOARD_QUERY_LATENCY,
  DATABASE_DASHBOARD_QUERY_RESPONSE,
  DATABASE_DASHBOARD_STORAGE_ROWS,
  DATABASE_DASHBOARD_SUMMARY_METRICS,
  DATABASE_DASHBOARD_TABLESPACE_USAGE,
  DATABASE_DASHBOARD_TAGS,
  DATABASE_DASHBOARD_UTILIZATION_ROWS,
  DATABASE_DASHBOARD_VERSIONS
} from './database-dashboard.const';
import {
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardBarItem,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlert,
  DatabaseDashboardDonutItem,
  DatabaseDashboardFilterCriteria,
  DatabaseDashboardFilterOption,
  DatabaseDashboardHealthGroup,
  DatabaseDashboardMetric,
  DatabaseDashboardStorageRow,
  DatabaseDashboardTagItem,
  DatabaseDashboardUtilizationRow,
  DatabaseDashboardUtilizationViewRow,
  DatabaseDashboardVersionItem
} from './database-dashboard.type';

@Injectable()
export class DatabaseDashboardService {

  constructor(private builder: FormBuilder,
    private databaseServersService: DatabaseServersService) { }

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(databases: DatabaseDashboardFilterOption[]): FormGroup {
    return this.builder.group({
      databases: [databases || []]
    });
  }

  getDatabases(): Observable<DatabaseDashboardFilterOption[]> {
    const criteria: SearchCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.ZERO
    };

    return this.databaseServersService.getAllDBServers(criteria).pipe(
      map(databases => this.getDatabaseFilterOptions(databases))
    );
  }

  getFallbackDatabases(): DatabaseDashboardFilterOption[] {
    return this.getDatabaseFilterOptions([]);
  }

  private getDatabaseFilterOptions(servers: DatabaseServer[] | { results?: DatabaseServer[] }): DatabaseDashboardFilterOption[] {
    const options = new Map<string, DatabaseDashboardFilterOption>();
    const databaseServers = Array.isArray(servers) ? servers : servers?.results || [];

    databaseServers.forEach((server, index) => {
      const value = server.uuid || server.id?.toString() || `database-${index}`;
      const label = server.db_instance_name
        || server.database_name
        || server.device_object?.name
        || server.db_type?.name
        || value;

      if (value && label && !options.has(value)) {
        options.set(value, { value, label });
      }
    });

    return options.size
      ? Array.from(options.values())
      : DATABASE_DASHBOARD_DATABASE_OPTIONS.filter(option => option.value !== DATABASE_DASHBOARD_ALL_SELECTED_VALUE);
  }
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Database Estate / Inventory Overview Widget Related -------------------
   */
  getSummaryMetrics(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardMetric[]> {
    return of(DATABASE_DASHBOARD_SUMMARY_METRICS);
  }

  convertToMetricsViewData(data: DatabaseDashboardMetric[]): DatabaseDashboardMetric[] {
    return data || [];
  }

  getCloudTypeDistribution(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardDonutItem[]> {
    return of(DATABASE_DASHBOARD_CLOUD_TYPE_DISTRIBUTION);
  }

  convertToCloudTypeDistributionViewData(data: DatabaseDashboardDonutItem[]): DatabaseDashboardDonutItem[] {
    return data || [];
  }

  convertToCloudTypeDistributionOptions(data: DatabaseDashboardDonutItem[]): EChartsOption {
    return this.getCloudTypeDistributionOptions(data || []);
  }

  private getCloudTypeDistributionOptions(items: DatabaseDashboardDonutItem[]): EChartsOption {
    return {
      animation: false,
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%'
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '50%'],
          label: { show: false },
          labelLine: { show: false },
          data: items.map(item => ({
            name: `${item.name} ${item.value}%`,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  getPlatformCounts(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_PLATFORM_COUNTS);
  }

  convertToPlatformCountOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getPlatformCountOptions(data || []);
  }

  private getPlatformCountOptions(items: DatabaseDashboardBarItem[]): EChartsOption {
    return {
      animation: false,
      grid: { top: 12, right: 8, bottom: 38, left: 42 },
      xAxis: {
        type: 'category',
        data: items.map(item => item.name),
        axisTick: { show: false },
        axisLabel: { color: '#596675', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        max: 3800,
        interval: 950,
        splitLine: { lineStyle: { color: '#edf0f2' } },
        axisLabel: { color: '#9aa5af', fontSize: 9 }
      },
      series: [
        {
          type: 'bar',
          barWidth: 38,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.value)
        }
      ]
    };
  }

  getEnvironmentCounts(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_ENVIRONMENT_COUNTS);
  }

  convertToEnvironmentOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getEnvironmentOptions(data || []);
  }

  private getEnvironmentOptions(items: DatabaseDashboardBarItem[]): EChartsOption {
    return {
      animation: false,
      grid: { top: 8, right: 36, bottom: 12, left: 86 },
      xAxis: { type: 'value', show: false, max: 3000 },
      yAxis: {
        type: 'category',
        inverse: true,
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
          data: items.map(() => 3000)
        },
        {
          type: 'bar',
          barWidth: 9,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => items[params.dataIndex].label,
            color: '#44515f',
            fontSize: 10
          },
          itemStyle: {
            borderRadius: 4,
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.value)
        }
      ]
    };
  }

  getTags(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardTagItem[]> {
    return of(DATABASE_DASHBOARD_TAGS);
  }

  convertToTagsViewData(data: DatabaseDashboardTagItem[]): DatabaseDashboardTagItem[] {
    return data || [];
  }

  getDatabaseVersions(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardVersionItem[]> {
    return of(DATABASE_DASHBOARD_VERSIONS);
  }

  convertToDatabaseVersionsViewData(data: DatabaseDashboardVersionItem[]): DatabaseDashboardVersionItem[] {
    return data || [];
  }
  /*
   * ******End ****** Database Estate / Inventory Overview Widget Related ********************
   */

  /*
   * -----Start----- Performance / Workload Insights Widget Related -------------------
   */
  getUtilizationRows(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardUtilizationRow[]> {
    return of(DATABASE_DASHBOARD_UTILIZATION_ROWS);
  }

  convertToUtilizationRowsViewData(data: DatabaseDashboardUtilizationRow[]): DatabaseDashboardUtilizationViewRow[] {
    return (data || []).map(row => this.convertToUtilizationViewRow(row));
  }

  private convertToUtilizationViewRow(row: DatabaseDashboardUtilizationRow): DatabaseDashboardUtilizationViewRow {
    return {
      ...row,
      cpuChartOptions: this.getSparklineOptions(row.cpuSeries, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      memoryChartOptions: this.getSparklineOptions(row.memorySeries, '#6aa544', 'rgba(106, 165, 68, 0.28)')
    };
  }

  private getSparklineOptions(data: number[], lineColor: string, areaColor: string): EChartsOption {
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
          data: data,
          symbol: 'none',
          smooth: false,
          lineStyle: { width: 1.5, color: lineColor },
          areaStyle: { color: areaColor }
        }
      ]
    };
  }

  getQueryResponse(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_QUERY_RESPONSE);
  }

  convertToQueryResponseOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 100, 100);
  }

  getQueryLatency(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_QUERY_LATENCY);
  }

  convertToQueryLatencyOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 300, 116);
  }

  getActiveSessions(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_ACTIVE_SESSIONS);
  }

  convertToActiveSessionsOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 44, 132);
  }

  getErrorRate(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_ERROR_RATE);
  }

  convertToErrorRateOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 1300, 100);
  }

  getTransactionThroughput(_criteria?: DatabaseDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getTransactionThroughputOptions());
  }

  convertToTransactionThroughputOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  getCacheHitRatio(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_CACHE_HIT_RATIO);
  }

  convertToCacheHitRatioOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 100, 104, 10);
  }
  /*
   * ******End ****** Performance / Workload Insights Widget Related ********************
   */

  /*
   * -----Start----- Capacity / Growth Insights Widget Related -------------------
   */
  getCapacityMetrics(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardCapacityMetric[]> {
    return of(DATABASE_DASHBOARD_CAPACITY_METRICS);
  }

  convertToCapacityMetricsViewData(data: DatabaseDashboardCapacityMetric[]): DatabaseDashboardCapacityMetric[] {
    return data || [];
  }

  getStorageRows(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardStorageRow[]> {
    return of(DATABASE_DASHBOARD_STORAGE_ROWS);
  }

  convertToStorageRowsViewData(data: DatabaseDashboardStorageRow[]): DatabaseDashboardStorageRow[] {
    return data || [];
  }

  getTablespaceUsage(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_TABLESPACE_USAGE);
  }

  convertToTablespaceUsageOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 9, 130, 10);
  }

  getStorageGrowth(_criteria?: DatabaseDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getStorageGrowthOptions());
  }

  convertToStorageGrowthOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  getArchiveLogGrowth(_criteria?: DatabaseDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getArchiveLogGrowthOptions());
  }

  convertToArchiveLogGrowthOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  getLogGrowthRate(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_LOG_GROWTH_RATE);
  }

  convertToLogGrowthRateOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getSimpleHorizontalBarOptions(data || [], 80, '#7b3ff2');
  }

  getDbSizeByServer(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_DB_SIZE_BY_SERVER);
  }

  convertToDbSizeByServerOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getSimpleHorizontalBarOptions(data || [], 100, '#3d8df3');
  }

  getLogSizeByServer(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_LOG_SIZE_BY_SERVER);
  }

  convertToLogSizeByServerOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getSimpleHorizontalBarOptions(data || [], 55, '#e84a4a');
  }

  getDiskUtilization(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardBarItem[]> {
    return of(DATABASE_DASHBOARD_DISK_UTILIZATION);
  }

  convertToDiskUtilizationOptions(data: DatabaseDashboardBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 100, 92);
  }
  /*
   * ******End ****** Capacity / Growth Insights Widget Related ********************
   */

  /*
   * -----Start----- Availability / Health Overview Widget Related -------------------
   */
  getHealthGroups(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardHealthGroup[]> {
    return of(DATABASE_DASHBOARD_HEALTH_GROUPS);
  }

  convertToHealthGroupsViewData(data: DatabaseDashboardHealthGroup[]): DatabaseDashboardHealthGroup[] {
    return data || [];
  }
  /*
   * ******End ****** Availability / Health Overview Widget Related ********************
   */

  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */
  getAlertSummaryMetrics(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardAlertSummaryMetric[]> {
    return of(DATABASE_DASHBOARD_ALERT_SUMMARY);
  }

  convertToAlertSummaryMetricsViewData(data: DatabaseDashboardAlertSummaryMetric[]): DatabaseDashboardAlertSummaryMetric[] {
    return data || [];
  }

  getCriticalAlerts(_criteria?: DatabaseDashboardFilterCriteria): Observable<DatabaseDashboardCriticalAlert[]> {
    return of(DATABASE_DASHBOARD_CRITICAL_ALERTS);
  }

  convertToCriticalAlertsViewData(data: DatabaseDashboardCriticalAlert[]): DatabaseDashboardCriticalAlert[] {
    return data || [];
  }
  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  private getHorizontalBarOptions(items: DatabaseDashboardBarItem[], max: number, labelWidth: number, barWidth: number = 8): EChartsOption {
    return {
      animation: false,
      grid: { top: 4, right: 34, bottom: 4, left: labelWidth },
      xAxis: { type: 'value', show: false, max: max },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#4f5b68', fontSize: 9 },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: barWidth,
          barGap: '-100%',
          silent: true,
          itemStyle: { color: '#eef1f3', borderRadius: 4 },
          data: items.map(() => max)
        },
        {
          type: 'bar',
          barWidth: barWidth,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => String(items[params.dataIndex].label || items[params.dataIndex].value),
            color: '#2e3338',
            fontSize: 9
          },
          itemStyle: {
            borderRadius: 4,
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.value)
        }
      ]
    };
  }

  private getSimpleHorizontalBarOptions(items: DatabaseDashboardBarItem[], max: number, color: string): EChartsOption {
    return {
      animation: false,
      grid: { top: 4, right: 10, bottom: 20, left: 70 },
      xAxis: {
        type: 'value',
        max: max,
        splitLine: { lineStyle: { color: '#edf0f2' } },
        axisLabel: { color: '#a0a9b2', fontSize: 8 }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7b8794', fontSize: 8 },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 7,
          itemStyle: { color: color, borderRadius: 2 },
          data: items.map(item => item.value)
        }
      ]
    };
  }

  private getTransactionThroughputOptions(): EChartsOption {
    return {
      animation: false,
      grid: { top: 16, right: 12, bottom: 24, left: 42 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10'],
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 11000,
        max: 14000,
        axisLabel: {
          color: '#7a8794',
          fontSize: 10,
          formatter: (value: number) => `${value / 1000}k`
        },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [12900, 12400, 13750, 11300, 12750, 12100, 13250],
          lineStyle: { color: '#4d9eea', width: 3 },
          areaStyle: { color: 'rgba(77, 158, 234, 0.12)' }
        }
      ]
    };
  }

  private getStorageGrowthOptions(): EChartsOption {
    return {
      animation: false,
      grid: { top: 14, right: 8, bottom: 22, left: 34 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        axisTick: { show: false },
        axisLabel: { color: '#8b96a2', fontSize: 8 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#edf0f2' } },
        axisLabel: { color: '#8b96a2', fontSize: 8 }
      },
      series: [
        this.getGrowthLine('DB-SRV-01', '#3d8df3', [118, 123, 129, 133, 140, 146, 151, 158, 164, 172]),
        this.getGrowthLine('DB-SRV-02', '#56b45a', [92, 96, 99, 105, 109, 114, 119, 126, 132, 139]),
        this.getGrowthLine('DB-SRV-03', '#e94a4a', [80, 83, 87, 91, 97, 103, 110, 118, 129, 148])
      ]
    };
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

  private getArchiveLogGrowthOptions(): EChartsOption {
    return {
      animation: false,
      grid: { top: 12, right: 10, bottom: 26, left: 44 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10'],
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 120,
        max: 160,
        axisLabel: { color: '#7a8794', fontSize: 10, formatter: '{value}GB' },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [122, 136, 121, 148, 131, 139, 155],
          lineStyle: { color: '#ff9b21', width: 3 },
          areaStyle: { color: 'rgba(255, 155, 33, 0.14)' }
        }
      ]
    };
  }
}
