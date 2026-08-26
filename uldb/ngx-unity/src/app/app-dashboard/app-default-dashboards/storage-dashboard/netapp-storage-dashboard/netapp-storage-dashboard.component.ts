import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';
import {
  AggregateOverviewChartViewData,
  AggregateOverviewTableViewData,
  AggregateOverviewViewData,
  AutoRemediationViewData,
  CapacityPlanningChartViewData,
  CapacityPlanningTableViewData,
  CapacityPlanningViewData,
  ClusterOverviewWidgetViewData,
  LUNOverviewChartViewData,
  LUNOverviewTableViewData,
  LUNOverviewViewData,
  NetappStorageDashboardService,
  NetappStorageSectionViewData,
  NodeInfoAndMetricsChartViewData,
  NodeInfoAndMetricsTableViewData,
  NodeInfoAndMetricsViewData,
  PerformanceMetricsChartViewData,
  PerformanceMetricsTableViewData,
  PerformanceMetricsViewData,
  PortOverviewChartViewData,
  PortOverviewTableViewData,
  PortOverviewViewData,
  RecentAlertsChartViewData,
  RecentAlertsTableViewData,
  RecentAlertsViewData,
  SVMOverviewChartViewData,
  SVMOverviewTableViewData,
  SVMOverviewViewData,
  VolumeOverviewChartViewData,
  VolumeOverviewTableViewData,
  VolumeOverviewViewData,
} from './netapp-storage-dashboard.service';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ColumnSortedEvent } from 'src/app/shared/table-functionality/sortable-column/sort.service';

interface NetappStorageWidgetLoadingState {
  clusterOverviewSummary: boolean;
  nodeInfoAndMetricsSummary: boolean;
  nodeInfoAndMetricsTable: boolean;
  cpuUsageNodeDistribution: boolean;
  memUsageNodeDistribution: boolean;
  networkThroughput: boolean;
  iopsTopNodes: boolean;
  devWriteThroughput: boolean;
  aggregateOverviewSummary: boolean;
  aggregateOverviewTable: boolean;
  aggregateCapacityDistribution: boolean;
  aggregateUtilization: boolean;
  aggregateNearlyFull: boolean;
  aggregateTop10Largest: boolean;
  aggregateGrowthTrend: boolean;
  svmOverviewSummary: boolean;
  svmOverviewTable: boolean;
  capacityBySvm: boolean;
  volumeCountBySvm: boolean;
  lunCountBySvm: boolean;
  throughputBySvm: boolean;
  top10CapacityConsumers: boolean;
  topPerformingSvms: boolean;
  volumeOverviewSummary: boolean;
  volumeOverviewTable: boolean;
  volumeUtilizationDistribution: boolean;
  volumeTop10Largest: boolean;
  volumeTop10MostUsed: boolean;
  volumeIopsTrend: boolean;
  volumeRwRatio: boolean;
  volumeLatencyTrend: boolean;
  volumeSnapshotUsage: boolean;
  lunOverviewSummary: boolean;
  lunOverviewTable: boolean;
  lunHealthDistribution: boolean;
  lunTop10ByUsage: boolean;
  lunGrowthTrend: boolean;
  lunAvailability: boolean;
  performanceMetricsSummary: boolean;
  performanceMetricsTable: boolean;
  performanceIopsRealTimeTrend: boolean;
  performanceThroughputRealTimeTrend: boolean;
  performanceLatencyTrend: boolean;
  performanceIopsActivityBreakdown: boolean;
  capacityPlanningSummary: boolean;
  capacityPlanningTable: boolean;
  capacityForecast: boolean;
  capacityVolUtilDistribution: boolean;
  capacityAggUtilDistribution: boolean;
  capacityTop5Consumers: boolean;
  capacityPlanningBySvm: boolean;
  capacityMonthlyGrowth: boolean;
  portOverviewSummary: boolean;
  portOverviewTable: boolean;
  portLinkStatusDistribution: boolean;
  portTypeAndProtocol: boolean;
  portCabledByNode: boolean;
  recentAlertsSummary: boolean;
  recentAlertsTable: boolean;
  recentAlertsSeverityDistribution: boolean;
  recentAlertsAlertTimeline: boolean;
  autoRemediationSummary: boolean;
}

@Component({
  selector: 'netapp-storage-dashboard',
  templateUrl: './netapp-storage-dashboard.component.html',
  styleUrls: ['./netapp-storage-dashboard.component.scss'],
  providers: [NetappStorageDashboardService]
})
export class NetappStorageDashboardComponent implements OnInit, OnChanges, OnDestroy {
  private reloadCancel = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();
  private initialized = false;
  dashboardReady = false;
  dashboardLoading = false;
  dashboardNoData = false;
  private pendingDashboardLoads = 0;

  @Input() filters: StorageDashboardFilterCriteria;
  @Input() refreshToken = 0;
  @Input() filtersUnavailable = false;

  widgetLoading: NetappStorageWidgetLoadingState = {
    clusterOverviewSummary: false,
    nodeInfoAndMetricsSummary: false,
    nodeInfoAndMetricsTable: false,
    cpuUsageNodeDistribution: false,
    memUsageNodeDistribution: false,
    networkThroughput: false,
    iopsTopNodes: false,
    devWriteThroughput: false,
    aggregateOverviewSummary: false,
    aggregateOverviewTable: false,
    aggregateCapacityDistribution: false,
    aggregateUtilization: false,
    aggregateNearlyFull: false,
    aggregateTop10Largest: false,
    aggregateGrowthTrend: false,
    svmOverviewSummary: false,
    svmOverviewTable: false,
    capacityBySvm: false,
    volumeCountBySvm: false,
    lunCountBySvm: false,
    throughputBySvm: false,
    top10CapacityConsumers: false,
    topPerformingSvms: false,
    volumeOverviewSummary: false,
    volumeOverviewTable: false,
    volumeUtilizationDistribution: false,
    volumeTop10Largest: false,
    volumeTop10MostUsed: false,
    volumeIopsTrend: false,
    volumeRwRatio: false,
    volumeLatencyTrend: false,
    volumeSnapshotUsage: false,
    lunOverviewSummary: false,
    lunOverviewTable: false,
    lunHealthDistribution: false,
    lunTop10ByUsage: false,
    lunGrowthTrend: false,
    lunAvailability: false,
    performanceMetricsSummary: false,
    performanceMetricsTable: false,
    performanceIopsRealTimeTrend: false,
    performanceThroughputRealTimeTrend: false,
    performanceLatencyTrend: false,
    performanceIopsActivityBreakdown: false,
    capacityPlanningSummary: false,
    capacityPlanningTable: false,
    capacityForecast: false,
    capacityVolUtilDistribution: false,
    capacityAggUtilDistribution: false,
    capacityTop5Consumers: false,
    capacityPlanningBySvm: false,
    capacityMonthlyGrowth: false,
    portOverviewSummary: false,
    portOverviewTable: false,
    portLinkStatusDistribution: false,
    portTypeAndProtocol: false,
    portCabledByNode: false,
    recentAlertsSummary: false,
    recentAlertsTable: false,
    recentAlertsSeverityDistribution: false,
    recentAlertsAlertTimeline: false,
    autoRemediationSummary: false,
  };

  loaderNames: { [key in keyof NetappStorageWidgetLoadingState]: string } = {
    clusterOverviewSummary: 'clusterOverviewSummaryLoader',
    nodeInfoAndMetricsSummary: 'nodeInfoAndMetricsSummaryLoader',
    nodeInfoAndMetricsTable: 'nodeInfoAndMetricsTableLoader',
    cpuUsageNodeDistribution: 'cpuUsageNodeDistributionLoader',
    memUsageNodeDistribution: 'memUsageNodeDistributionLoader',
    networkThroughput: 'networkThroughputLoader',
    iopsTopNodes: 'iopsTopNodesLoader',
    devWriteThroughput: 'devWriteThroughputLoader',
    aggregateOverviewSummary: 'aggregateOverviewSummaryLoader',
    aggregateOverviewTable: 'aggregateOverviewTableLoader',
    aggregateCapacityDistribution: 'aggregateCapacityDistributionLoader',
    aggregateUtilization: 'aggregateUtilizationLoader',
    aggregateNearlyFull: 'aggregateNearlyFullLoader',
    aggregateTop10Largest: 'aggregateTop10LargestLoader',
    aggregateGrowthTrend: 'aggregateGrowthTrendLoader',
    svmOverviewSummary: 'svmOverviewSummaryLoader',
    svmOverviewTable: 'svmOverviewTableLoader',
    capacityBySvm: 'capacityBySvmLoader',
    volumeCountBySvm: 'volumeCountBySvmLoader',
    lunCountBySvm: 'lunCountBySvmLoader',
    throughputBySvm: 'throughputBySvmLoader',
    top10CapacityConsumers: 'top10CapacityConsumersLoader',
    topPerformingSvms: 'topPerformingSvmsLoader',
    volumeOverviewSummary: 'volumeOverviewSummaryLoader',
    volumeOverviewTable: 'volumeOverviewTableLoader',
    volumeUtilizationDistribution: 'volumeUtilizationDistributionLoader',
    volumeTop10Largest: 'volumeTop10LargestLoader',
    volumeTop10MostUsed: 'volumeTop10MostUsedLoader',
    volumeIopsTrend: 'volumeIopsTrendLoader',
    volumeRwRatio: 'volumeRwRatioLoader',
    volumeLatencyTrend: 'volumeLatencyTrendLoader',
    volumeSnapshotUsage: 'volumeSnapshotUsageLoader',
    lunOverviewSummary: 'lunOverviewSummaryLoader',
    lunOverviewTable: 'lunOverviewTableLoader',
    lunHealthDistribution: 'lunHealthDistributionLoader',
    lunTop10ByUsage: 'lunTop10ByUsageLoader',
    lunGrowthTrend: 'lunGrowthTrendLoader',
    lunAvailability: 'lunAvailabilityLoader',
    performanceMetricsSummary: 'performanceMetricsSummaryLoader',
    performanceMetricsTable: 'performanceMetricsTableLoader',
    performanceIopsRealTimeTrend: 'performanceIopsRealTimeTrendLoader',
    performanceThroughputRealTimeTrend: 'performanceThroughputRealTimeTrendLoader',
    performanceLatencyTrend: 'performanceLatencyTrendLoader',
    performanceIopsActivityBreakdown: 'performanceIopsActivityBreakdownLoader',
    capacityPlanningSummary: 'capacityPlanningSummaryLoader',
    capacityPlanningTable: 'capacityPlanningTableLoader',
    capacityForecast: 'capacityForecastLoader',
    capacityVolUtilDistribution: 'capacityVolUtilDistributionLoader',
    capacityAggUtilDistribution: 'capacityAggUtilDistributionLoader',
    capacityTop5Consumers: 'capacityTop5ConsumersLoader',
    capacityPlanningBySvm: 'capacityPlanningBySvmLoader',
    capacityMonthlyGrowth: 'capacityMonthlyGrowthLoader',
    portOverviewSummary: 'portOverviewSummaryLoader',
    portOverviewTable: 'portOverviewTableLoader',
    portLinkStatusDistribution: 'portLinkStatusDistributionLoader',
    portTypeAndProtocol: 'portTypeAndProtocolLoader',
    portCabledByNode: 'portCabledByNodeLoader',
    recentAlertsSummary: 'recentAlertsSummaryLoader',
    recentAlertsTable: 'recentAlertsTableLoader',
    recentAlertsSeverityDistribution: 'recentAlertsSeverityDistributionLoader',
    recentAlertsAlertTimeline: 'recentAlertsAlertTimelineLoader',
    autoRemediationSummary: 'autoRemediationSummaryLoader'
  };

  nodeInfoAndMetricsTableCriteria: SearchCriteria;
  aggregateOverviewTableCriteria: SearchCriteria;
  svmOverviewTableCriteria: SearchCriteria;
  volumeOverviewTableCriteria: SearchCriteria;
  lunOverviewTableCriteria: SearchCriteria;
  performanceMetricsTableCriteria: SearchCriteria;
  capacityPlanningTableCriteria: SearchCriteria;
  portOverviewTableCriteria: SearchCriteria;
  recentAlertsTableCriteria: SearchCriteria;

  constructor(private svc: NetappStorageDashboardService,
    private spinner: AppSpinnerService) {
    this.nodeInfoAndMetricsTableCriteria = this.createSortedTableCriteria('model', 'asc');
    this.aggregateOverviewTableCriteria = this.createSortedTableCriteria('total', 'desc');
    this.svmOverviewTableCriteria = this.createSortedTableCriteria('state', 'asc');
    this.volumeOverviewTableCriteria = this.createSortedTableCriteria('name', 'asc');
    this.lunOverviewTableCriteria = this.createSortedTableCriteria('path', 'asc');
    this.performanceMetricsTableCriteria = this.createSortedTableCriteria('rx', 'asc');
    this.capacityPlanningTableCriteria = this.createSortedTableCriteria('total', 'desc');
    this.portOverviewTableCriteria = this.createSortedTableCriteria('name', 'asc');
    this.recentAlertsTableCriteria = this.createSortedTableCriteria('device', 'desc');
  }

  ngOnInit(): void {
    this.dashboardReady = true;
    if (this.isNetappSelected()) {
      if (this.filtersUnavailable) {
        this.showDashboardNoData();
        return;
      }
      this.loadDashboard();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filtersUnavailable && this.dashboardReady && this.filtersUnavailable) {
      this.showDashboardNoData();
      return;
    }
    if ((changes.filters || changes.refreshToken || changes.filtersUnavailable)
      && this.dashboardReady && this.isNetappSelected() && !this.filtersUnavailable) {
      this.loadDashboard();
    }
  }

  ngOnDestroy(): void {
    this.reloadCancel.next();
    this.reloadCancel.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTableSortDirection(criteria: SearchCriteria, columnName: string): string {
    return criteria.sortColumn === columnName ? criteria.sortDirection : '';
  }

  isTableSortedColumn(criteria: SearchCriteria, columnName: string): boolean {
    return !!this.getTableSortDirection(criteria, columnName);
  }

  isWidgetDataAvailable(widgetData: unknown): boolean {
    if (Array.isArray(widgetData)) {
      return widgetData.length > 0;
    }
    return !!widgetData;
  }

  getChartBodyClass(widgetData: unknown): string {
    return this.isWidgetDataAvailable(widgetData) ? '' : 'd-flex align-items-center justify-content-center';
  }

  private updateDashboardNoData(): void {
    if (!this.dashboardReady || this.dashboardLoading) {
      return;
    }

    const hasSummaryData = this.clusterOverviewWidgetViewData.hasSummaryData
      || this.autoRemediationViewData.hasSummaryData;

    const hasSectionData = [
      this.nodeInfoAndMetricsViewData,
      this.aggregateOverviewViewData,
      this.svmOverviewViewData,
      this.volumeOverviewViewData,
      this.lunOvervieViewData,
      this.performanceMetricsViewData,
      this.capacityPlanningViewData,
      this.portOverviewViewData,
      this.recentAlertsViewData
    ].some(section => !section.hidden);

    this.dashboardNoData = !hasSummaryData && !hasSectionData;
  }

  private startDashboardLoader(): void {
    this.dashboardLoading = true;
    this.dashboardNoData = false;
    this.pendingDashboardLoads = 0;
  }

  private stopDashboardLoader(): void {
    this.dashboardLoading = false;
    if (this.pendingDashboardLoads === 0) {
      this.updateDashboardNoData();
    }
  }

  private stopAllLoaders(): void {
    Object.values(this.loaderNames).forEach(loaderName => this.spinner.stop(loaderName));
  }

  private registerDashboardLoad(): void {
    this.pendingDashboardLoads += 1;
  }

  private completeDashboardLoad(): void {
    if (this.pendingDashboardLoads > 0) {
      this.pendingDashboardLoads -= 1;
    }
    if (this.pendingDashboardLoads === 0) {
      this.updateDashboardNoData();
    }
  }

  private hasMeaningfulData(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();
      return !!normalizedValue && !['n/a', 'N/A', 'na', '-', '--', null, undefined].includes(normalizedValue);
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.some(item => this.hasMeaningfulData(item));
    }
    if (typeof value === 'object') {
      return Object.keys(value as object).some(key => {
        const fieldValue = (value as { [key: string]: unknown })[key];
        return this.hasMeaningfulData(fieldValue);
      });
    }
    return false;
  }

  private updateSectionDataAvailability(
    section: NetappStorageSectionViewData & {
      summaryViewData?: unknown;
      chartViewData?: { hasData?: boolean };
      tableViewData?: unknown[];
    }
  ): void {
    section.hasSummaryData = this.hasMeaningfulData(section.summaryViewData);
    section.hasChartData = section.chartViewData?.hasData ?? false;
    section.chartLoaded = true;
    this.updateSectionVisibility(section);
  }

  private updateSectionVisibility(
    section: NetappStorageSectionViewData & { tableViewData?: unknown[] }
  ): void {
    const hasTableData = !!section.tableViewData?.length;
    section.hidden = section.chartLoaded
      && !section.hasSummaryData
      && !section.hasChartData
      && !hasTableData;
  }

  private updateSummaryOnlySectionDataAvailability(
    section: {
      hidden: boolean;
      hasSummaryData: boolean;
      summaryViewData?: unknown;
    }
  ): void {
    section.hasSummaryData = this.hasMeaningfulData(section.summaryViewData);
    section.hidden = !section.hasSummaryData;
  }

  private resetSectionVisibility(
    section: NetappStorageSectionViewData & { tableCount?: number, tableViewData?: unknown[] }
  ): void {
    section.hidden = false;
    section.chartLoaded = false;
    section.hasSummaryData = false;
    section.hasChartData = false;
    if (section.tableViewData?.length) {
      section.tableCount = 0;
      section.tableViewData = [];
    }
  }

  private resetSummaryOnlySectionVisibility(
    section: {
      hidden: boolean;
      hasSummaryData: boolean;
      summaryViewData?: unknown;
    }
  ): void {
    section.hidden = false;
    section.hasSummaryData = false;
    section.summaryViewData = null;
  }

  private createSortedTableCriteria(sortColumn: string, sortDirection: 'asc' | 'desc'): SearchCriteria {
    return {
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      searchValue: '',
      sortColumn,
      sortDirection
    };
  }

  private loadDashboard(): void {
    this.reloadCancel.next();
    if (this.filtersUnavailable) {
      this.showDashboardNoData();
      return;
    }
    this.startDashboardLoader();
    this.resetAllTablePages();
    this.deferViewLoad(() => this.getClusterOverviewData());
    this.deferViewLoad(() => this.getNodeInfoAndMetricsChartData());
    this.deferViewLoad(() => this.getAggregateOverviewChartData());
    this.deferViewLoad(() => this.getSvmOverviewChartData());
    this.deferViewLoad(() => this.getVolumeOverviewChartData());
    this.deferViewLoad(() => this.getLunOverviewChartData());
    this.deferViewLoad(() => this.getPerformanceMetricsChartData());
    this.deferViewLoad(() => this.getCapacityPlanningChartData());
    this.deferViewLoad(() => this.getPortOverviewChartData());
    this.deferViewLoad(() => this.getRecentAlertsChartData());
    this.deferViewLoad(() => this.getAutoRemediationSummaryData());

    if (this.nodeInfoAndMetricsViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getNodeInfoAndMetricsTableData());
    }
    if (this.aggregateOverviewViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getAggregateOverviewTableData());
    }
    if (this.svmOverviewViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getSvmOverviewTableData());
    }
    if (this.volumeOverviewViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getVolumeOverviewTableData());
    }
    if (this.lunOvervieViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getLunOverviewTableData());
    }
    if (this.performanceMetricsViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getPerformanceMetricsTableData());
    }
    if (this.capacityPlanningViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getCapacityPlanningTableData());
    }
    if (this.portOverviewViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getPortOverviewTableData());
    }
    if (this.recentAlertsViewData.viewType === 'table') {
      this.deferViewLoad(() => this.getRecentAlertsTableData());
    }
    this.deferViewLoad(() => this.stopDashboardLoader());
  }

  private isNetappSelected(): boolean {
    return this.filters?.storageType === 'netapp';
  }

  private getAllChartTableSections(): NetappStorageSectionViewData[] {
    return [
      this.nodeInfoAndMetricsViewData,
      this.aggregateOverviewViewData,
      this.svmOverviewViewData,
      this.volumeOverviewViewData,
      this.lunOvervieViewData,
      this.performanceMetricsViewData,
      this.capacityPlanningViewData,
      this.portOverviewViewData,
      this.recentAlertsViewData
    ];
  }

  private showDashboardNoData(): void {
    this.reloadCancel.next();
    this.stopAllLoaders();
    this.startDashboardLoader();
    this.resetSummaryOnlySectionVisibility(this.clusterOverviewWidgetViewData);
    this.clusterOverviewWidgetViewData.hidden = true;
    this.resetSummaryOnlySectionVisibility(this.autoRemediationViewData);
    this.autoRemediationViewData.hidden = true;
    this.getAllChartTableSections().forEach(section => {
      this.resetSectionVisibility(section);
      section.hidden = true;
    });
    this.pendingDashboardLoads = 0;
    this.dashboardLoading = false;
    this.dashboardNoData = true;
  }

  private resetAllTablePages(): void {
    const tableCriteriaList: SearchCriteria[] = [
      this.nodeInfoAndMetricsTableCriteria,
      this.aggregateOverviewTableCriteria,
      this.svmOverviewTableCriteria,
      this.volumeOverviewTableCriteria,
      this.lunOverviewTableCriteria,
      this.performanceMetricsTableCriteria,
      this.capacityPlanningTableCriteria,
      this.portOverviewTableCriteria,
      this.recentAlertsTableCriteria
    ];
    tableCriteriaList.forEach(criteria => {
      criteria.pageNo = 1;
      criteria.searchValue = ''
    });
  }

  private updateTableSearch(criteria: SearchCriteria, searchValue: string): void {
    criteria.searchValue = searchValue;
    criteria.pageNo = 1;
  }

  private updateTableSort(criteria: SearchCriteria, event: ColumnSortedEvent): void {
    criteria.sortColumn = event.sortColumn;
    criteria.sortDirection = event.sortDirection === 'desc' ? 'desc' : 'asc';
    criteria.pageNo = 1;
  }

  clusterOverviewWidgetViewData: ClusterOverviewWidgetViewData = new ClusterOverviewWidgetViewData();
  getClusterOverviewData() {
    this.loadWidget(
      'clusterOverviewSummary',
      this.svc.getClusterOverviewData(this.filters),
      res => {
        this.clusterOverviewWidgetViewData.summaryViewData = this.svc.convertToClusterOverviewViewData(res.summary);
        this.updateSummaryOnlySectionDataAvailability(this.clusterOverviewWidgetViewData);
      },
      () => {
        this.clusterOverviewWidgetViewData.summaryViewData = null;
        this.updateSummaryOnlySectionDataAvailability(this.clusterOverviewWidgetViewData);
      },
      () => {
        this.resetSummaryOnlySectionVisibility(this.clusterOverviewWidgetViewData);
      }
    );
  }

  nodeInfoAndMetricsViewData: NodeInfoAndMetricsViewData = new NodeInfoAndMetricsViewData();

  private deferViewLoad(loadFn: () => void): void {
    setTimeout(() => loadFn(), 0);
  }

  setNodeInfoAndMetricsViewType(viewType: 'table' | 'chart'): void {
    this.nodeInfoAndMetricsViewData.viewType = viewType;
    if (viewType == 'table') {
      this.deferViewLoad(() => this.getNodeInfoAndMetricsTableData());
    } else if (viewType == 'chart' && !this.nodeInfoAndMetricsViewData.chartLoaded) {
      this.deferViewLoad(() => this.getNodeInfoAndMetricsChartData());
    }
  }

  getNodeInfoAndMetricsTableData(): void {
    this.loadWidget(
      'nodeInfoAndMetricsTable',
      this.svc.getNodeInfoAndMetricsTableData(this.nodeInfoAndMetricsTableCriteria, this.filters),
      res => {
        this.nodeInfoAndMetricsViewData.tableCount = res?.count || 0;
        this.nodeInfoAndMetricsViewData.tableViewData =
          this.svc.convertToNodeInfoAndMetricsTableViewData(res?.results || []);
        this.updateSectionVisibility(this.nodeInfoAndMetricsViewData);
      },
      () => {
        this.nodeInfoAndMetricsViewData.tableCount = 0;
        this.nodeInfoAndMetricsViewData.tableViewData = [];
        this.updateSectionVisibility(this.nodeInfoAndMetricsViewData);
      },
      () => {
        this.nodeInfoAndMetricsViewData.hidden = false;
        this.nodeInfoAndMetricsViewData.tableCount = 0;
        this.nodeInfoAndMetricsViewData.tableViewData = [];
      }
    );
  }

  onNodeInfoAndMetricsSearched(value: string): void {
    this.updateTableSearch(this.nodeInfoAndMetricsTableCriteria, value);
    this.getNodeInfoAndMetricsTableData();
  }

  onNodeInfoAndMetricsPageChange(pageNo: number): void {
    if (this.nodeInfoAndMetricsTableCriteria.pageNo !== pageNo) {
      this.nodeInfoAndMetricsTableCriteria.pageNo = pageNo;
      this.getNodeInfoAndMetricsTableData();
    }
  }

  onNodeInfoAndMetricsSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.nodeInfoAndMetricsTableCriteria, event);
    this.getNodeInfoAndMetricsTableData();
  }

  trackByNodeInfoAndMetricsRow(_index: number, row: NodeInfoAndMetricsTableViewData): string {
    return `${row.cluster}-${row.name}`;
  }


  getNodeInfoAndMetricsChartData(): void {
    this.loadWidget(
      ['nodeInfoAndMetricsSummary', 'cpuUsageNodeDistribution', 'memUsageNodeDistribution', 'networkThroughput', 'iopsTopNodes', 'devWriteThroughput'],
      this.svc.getNodeInfoAndMetricsChartViewData(this.filters),
      res => {
        this.nodeInfoAndMetricsViewData.summaryViewData = this.svc.convertToNodeInfoAndMetricsSummaryViewData(res?.summary);
        this.nodeInfoAndMetricsViewData.chartViewData = this.svc.convertToNodeInfoAndMetricsChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.nodeInfoAndMetricsViewData);
      },
      () => {
        this.nodeInfoAndMetricsViewData.summaryViewData = null;
        this.nodeInfoAndMetricsViewData.chartViewData = new NodeInfoAndMetricsChartViewData();
        this.updateSectionDataAvailability(this.nodeInfoAndMetricsViewData);
      },
      () => {
        this.resetSectionVisibility(this.nodeInfoAndMetricsViewData);
        this.nodeInfoAndMetricsViewData.summaryViewData = null;
        this.nodeInfoAndMetricsViewData.chartViewData = new NodeInfoAndMetricsChartViewData();
      }
    );
  }

  aggregateOverviewViewData: AggregateOverviewViewData = new AggregateOverviewViewData();

  setAggregateOverviewViewType(viewType: 'table' | 'chart'): void {
    this.aggregateOverviewViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getAggregateOverviewTableData());
    } else if (viewType === 'chart' && !this.aggregateOverviewViewData.chartLoaded) {
      this.deferViewLoad(() => this.getAggregateOverviewChartData());
    }
  }

  getAggregateOverviewTableData(): void {
    this.loadWidget(
      'aggregateOverviewTable',
      this.svc.getAggregateOverviewTableData(this.aggregateOverviewTableCriteria, this.filters),
      response => {
        this.aggregateOverviewViewData.tableViewData =
          this.svc.convertToAggregateOverviewTableViewData(response?.results || []);
        this.aggregateOverviewViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.aggregateOverviewViewData);
      },
      () => {
        this.aggregateOverviewViewData.tableViewData = [];
        this.aggregateOverviewViewData.tableCount = 0;
        this.updateSectionVisibility(this.aggregateOverviewViewData);
      },
      () => {
        this.aggregateOverviewViewData.hidden = false;
        this.aggregateOverviewViewData.tableViewData = [];
        this.aggregateOverviewViewData.tableCount = 0;
      }
    );
  }

  onAggregateOverviewSearched(value: string): void {
    this.updateTableSearch(this.aggregateOverviewTableCriteria, value);
    this.getAggregateOverviewTableData();
  }

  onAggregateOverviewPageChange(pageNo: number): void {
    if (this.aggregateOverviewTableCriteria.pageNo !== pageNo) {
      this.aggregateOverviewTableCriteria.pageNo = pageNo;
      this.getAggregateOverviewTableData();
    }
  }

  onAggregateOverviewSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.aggregateOverviewTableCriteria, event);
    this.getAggregateOverviewTableData();
  }

  trackByAggregateOverviewRow(_index: number, row: AggregateOverviewTableViewData): string {
    return `${row.cluster}-${row.name}`;
  }

  getAggregateOverviewChartData() {
    this.loadWidget(
      ['aggregateOverviewSummary', 'aggregateCapacityDistribution', 'aggregateUtilization', 'aggregateNearlyFull', 'aggregateTop10Largest', 'aggregateGrowthTrend'],
      this.svc.getAggregateOverviewChartData(this.filters),
      res => {
        this.aggregateOverviewViewData.summaryViewData = this.svc.convertToAggregateOverviewViewData(res.summary);
        this.aggregateOverviewViewData.chartViewData = this.svc.convertToAggregateOverviewChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.aggregateOverviewViewData);
      },
      () => {
        this.aggregateOverviewViewData.summaryViewData = null;
        this.aggregateOverviewViewData.chartViewData = new AggregateOverviewChartViewData();
        this.updateSectionDataAvailability(this.aggregateOverviewViewData);
      },
      () => {
        this.resetSectionVisibility(this.aggregateOverviewViewData);
        this.aggregateOverviewViewData.summaryViewData = null;
        this.aggregateOverviewViewData.chartViewData = new AggregateOverviewChartViewData();
      }
    );
  }

  svmOverviewViewData: SVMOverviewViewData = new SVMOverviewViewData();

  setSvmOverviewViewType(viewType: 'table' | 'chart'): void {
    this.svmOverviewViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getSvmOverviewTableData());
    } else if (viewType === 'chart' && !this.svmOverviewViewData.chartLoaded) {
      this.deferViewLoad(() => this.getSvmOverviewChartData());
    }
  }

  getSvmOverviewTableData(): void {
    this.loadWidget(
      'svmOverviewTable',
      this.svc.getSvmOverviewTableData(this.svmOverviewTableCriteria, this.filters),
      response => {
        this.svmOverviewViewData.tableViewData =
          this.svc.convertToSvmOverviewTableViewData(response?.results || []);
        this.svmOverviewViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.svmOverviewViewData);
      },
      () => {
        this.svmOverviewViewData.tableViewData = [];
        this.svmOverviewViewData.tableCount = 0;
        this.updateSectionVisibility(this.svmOverviewViewData);
      },
      () => {
        this.svmOverviewViewData.hidden = false;
        this.svmOverviewViewData.tableViewData = [];
        this.svmOverviewViewData.tableCount = 0;
      }
    );
  }

  onSvmOverviewSearched(value: string): void {
    this.updateTableSearch(this.svmOverviewTableCriteria, value);
    this.getSvmOverviewTableData();
  }

  onSvmOverviewPageChange(pageNo: number): void {
    if (this.svmOverviewTableCriteria.pageNo !== pageNo) {
      this.svmOverviewTableCriteria.pageNo = pageNo;
      this.getSvmOverviewTableData();
    }
  }

  onSvmOverviewSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.svmOverviewTableCriteria, event);
    this.getSvmOverviewTableData();
  }

  trackBySvmOverviewRow(_index: number, row: SVMOverviewTableViewData): string {
    return `${row.cluster}-${row.name}`;
  }

  getSvmOverviewChartData() {
    this.loadWidget(
      ['svmOverviewSummary', 'capacityBySvm', 'volumeCountBySvm', 'lunCountBySvm', 'throughputBySvm', 'top10CapacityConsumers', 'topPerformingSvms'],
      this.svc.getSvmOverviewChartData(this.filters),
      res => {
        this.svmOverviewViewData.summaryViewData = this.svc.convertToSvmOverviewSummaryViewData(res?.summary);
        this.svmOverviewViewData.chartViewData = this.svc.convertToSvmOverviewChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.svmOverviewViewData);
      },
      () => {
        this.svmOverviewViewData.summaryViewData = null;
        this.svmOverviewViewData.chartViewData = new SVMOverviewChartViewData();
        this.updateSectionDataAvailability(this.svmOverviewViewData);
      },
      () => {
        this.resetSectionVisibility(this.svmOverviewViewData);
        this.svmOverviewViewData.summaryViewData = null;
        this.svmOverviewViewData.chartViewData = new SVMOverviewChartViewData();
      }
    );
  }

  volumeOverviewViewData: VolumeOverviewViewData = new VolumeOverviewViewData();

  setVolumeOverviewViewType(viewType: 'table' | 'chart'): void {
    this.volumeOverviewViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getVolumeOverviewTableData());
    } else if (viewType === 'chart' && !this.volumeOverviewViewData.chartLoaded) {
      this.deferViewLoad(() => this.getVolumeOverviewChartData());
    }
  }

  getVolumeOverviewTableData(): void {
    this.loadWidget(
      'volumeOverviewTable',
      this.svc.getVolumeOverviewTableData(this.volumeOverviewTableCriteria, this.filters),
      response => {
        this.volumeOverviewViewData.tableViewData =
          this.svc.convertToVolumeOverviewTableViewData(response?.results || []);
        this.volumeOverviewViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.volumeOverviewViewData);
      },
      () => {
        this.volumeOverviewViewData.tableViewData = [];
        this.volumeOverviewViewData.tableCount = 0;
        this.updateSectionVisibility(this.volumeOverviewViewData);
      },
      () => {
        this.volumeOverviewViewData.hidden = false;
        this.volumeOverviewViewData.tableViewData = [];
        this.volumeOverviewViewData.tableCount = 0;
      }
    );
  }

  onVolumeOverviewSearched(value: string): void {
    this.updateTableSearch(this.volumeOverviewTableCriteria, value);
    this.getVolumeOverviewTableData();
  }

  onVolumeOverviewPageChange(pageNo: number): void {
    if (this.volumeOverviewTableCriteria.pageNo !== pageNo) {
      this.volumeOverviewTableCriteria.pageNo = pageNo;
      this.getVolumeOverviewTableData();
    }
  }

  onVolumeOverviewSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.volumeOverviewTableCriteria, event);
    this.getVolumeOverviewTableData();
  }

  trackByVolumeOverviewRow(_index: number, row: VolumeOverviewTableViewData): string {
    return `${row.cluster}-${row.name}`;
  }

  getVolumeOverviewChartData() {
    this.loadWidget(
      ['volumeOverviewSummary', 'volumeUtilizationDistribution', 'volumeTop10Largest', 'volumeTop10MostUsed', 'volumeIopsTrend', 'volumeRwRatio', 'volumeLatencyTrend', 'volumeSnapshotUsage'],
      this.svc.getVolumeOverviewChartData(this.filters),
      res => {
        this.volumeOverviewViewData.summaryViewData = this.svc.convertToVolumeOverviewSummaryViewData(res.summary);
        this.volumeOverviewViewData.chartViewData = this.svc.convertToVolumeOverviewChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.volumeOverviewViewData);
      },
      () => {
        this.volumeOverviewViewData.summaryViewData = null;
        this.volumeOverviewViewData.chartViewData = new VolumeOverviewChartViewData();
        this.updateSectionDataAvailability(this.volumeOverviewViewData);
      },
      () => {
        this.resetSectionVisibility(this.volumeOverviewViewData);
        this.volumeOverviewViewData.summaryViewData = null;
        this.volumeOverviewViewData.chartViewData = new VolumeOverviewChartViewData();
      }
    );
  }

  lunOvervieViewData: LUNOverviewViewData = new LUNOverviewViewData();

  setLunOverviewViewType(viewType: 'table' | 'chart'): void {
    this.lunOvervieViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getLunOverviewTableData());
    } else if (viewType === 'chart' && !this.lunOvervieViewData.chartLoaded) {
      this.deferViewLoad(() => this.getLunOverviewChartData());
    }
  }

  getLunOverviewTableData(): void {
    this.loadWidget(
      'lunOverviewTable',
      this.svc.getLunOverviewTableData(this.lunOverviewTableCriteria, this.filters),
      response => {
        this.lunOvervieViewData.tableViewData =
          this.svc.convertToLunOverviewTableViewData(response?.results || []);
        this.lunOvervieViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.lunOvervieViewData);
      },
      () => {
        this.lunOvervieViewData.tableViewData = [];
        this.lunOvervieViewData.tableCount = 0;
        this.updateSectionVisibility(this.lunOvervieViewData);
      },
      () => {
        this.lunOvervieViewData.hidden = false;
        this.lunOvervieViewData.tableViewData = [];
        this.lunOvervieViewData.tableCount = 0;
      }
    );
  }

  onLunOverviewSearched(value: string): void {
    this.updateTableSearch(this.lunOverviewTableCriteria, value);
    this.getLunOverviewTableData();
  }

  onLunOverviewPageChange(pageNo: number): void {
    if (this.lunOverviewTableCriteria.pageNo !== pageNo) {
      this.lunOverviewTableCriteria.pageNo = pageNo;
      this.getLunOverviewTableData();
    }
  }

  onLunOverviewSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.lunOverviewTableCriteria, event);
    this.getLunOverviewTableData();
  }

  trackByLunOverviewRow(_index: number, row: LUNOverviewTableViewData): string {
    return `${row.cluster}-${row.name}`;
  }

  getLunOverviewChartData() {
    this.loadWidget(
      ['lunOverviewSummary', 'lunHealthDistribution', 'lunTop10ByUsage', 'lunGrowthTrend', 'lunAvailability'],
      this.svc.getLunOverviewChartData(this.filters),
      res => {
        this.lunOvervieViewData.summaryViewData = this.svc.convertToLunOverviewViewData(res.summary);
        this.lunOvervieViewData.chartViewData = this.svc.convertToLunOverviewChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.lunOvervieViewData);
      },
      () => {
        this.lunOvervieViewData.summaryViewData = null;
        this.lunOvervieViewData.chartViewData = new LUNOverviewChartViewData();
        this.updateSectionDataAvailability(this.lunOvervieViewData);
      },
      () => {
        this.resetSectionVisibility(this.lunOvervieViewData);
        this.lunOvervieViewData.summaryViewData = null;
        this.lunOvervieViewData.chartViewData = new LUNOverviewChartViewData();
      }
    );
  }

  performanceMetricsViewData: PerformanceMetricsViewData = new PerformanceMetricsViewData();

  setPerformanceMetricsViewType(viewType: 'table' | 'chart'): void {
    this.performanceMetricsViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getPerformanceMetricsTableData());
    } else if (viewType === 'chart' && !this.performanceMetricsViewData.chartLoaded) {
      this.deferViewLoad(() => this.getPerformanceMetricsChartData());
    }
  }

  getPerformanceMetricsTableData(): void {
    this.loadWidget(
      'performanceMetricsTable',
      this.svc.getPerformanceMetricsTableData(this.performanceMetricsTableCriteria, this.filters),
      response => {
        this.performanceMetricsViewData.tableViewData =
          this.svc.convertToPerformanceMetricsTableViewData(response?.results || []);
        this.performanceMetricsViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.performanceMetricsViewData);
      },
      () => {
        this.performanceMetricsViewData.tableViewData = [];
        this.performanceMetricsViewData.tableCount = 0;
        this.updateSectionVisibility(this.performanceMetricsViewData);
      },
      () => {
        this.performanceMetricsViewData.hidden = false;
        this.performanceMetricsViewData.tableViewData = [];
        this.performanceMetricsViewData.tableCount = 0;
      }
    );
  }

  onPerformanceMetricsSearched(value: string): void {
    this.updateTableSearch(this.performanceMetricsTableCriteria, value);
    this.getPerformanceMetricsTableData();
  }

  onPerformanceMetricsPageChange(pageNo: number): void {
    if (this.performanceMetricsTableCriteria.pageNo !== pageNo) {
      this.performanceMetricsTableCriteria.pageNo = pageNo;
      this.getPerformanceMetricsTableData();
    }
  }

  onPerformanceMetricsSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.performanceMetricsTableCriteria, event);
    this.getPerformanceMetricsTableData();
  }

  trackByPerformanceMetricsRow(_index: number, row: PerformanceMetricsTableViewData): string {
    return row.time;
  }

  getPerformanceMetricsChartData() {
    this.loadWidget(
      ['performanceMetricsSummary', 'performanceIopsRealTimeTrend', 'performanceThroughputRealTimeTrend', 'performanceLatencyTrend', 'performanceIopsActivityBreakdown'],
      this.svc.getPerformanceMetricsChartData(this.filters),
      res => {
        this.performanceMetricsViewData.summaryViewData = this.svc.convertToPerformanceMetricsSummaryViewData(res.summary);
        this.performanceMetricsViewData.chartViewData = this.svc.convertToPerformanceMetricsChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.performanceMetricsViewData);
      },
      () => {
        this.performanceMetricsViewData.summaryViewData = null;
        this.performanceMetricsViewData.chartViewData = new PerformanceMetricsChartViewData();
        this.updateSectionDataAvailability(this.performanceMetricsViewData);
      },
      () => {
        this.resetSectionVisibility(this.performanceMetricsViewData);
        this.performanceMetricsViewData.summaryViewData = null;
        this.performanceMetricsViewData.chartViewData = new PerformanceMetricsChartViewData();
      }
    );
  }

  capacityPlanningViewData: CapacityPlanningViewData = new CapacityPlanningViewData();

  setCapacityPlanningViewType(viewType: 'table' | 'chart'): void {
    this.capacityPlanningViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getCapacityPlanningTableData());
    } else if (viewType === 'chart' && !this.capacityPlanningViewData.chartLoaded) {
      this.deferViewLoad(() => this.getCapacityPlanningChartData());
    }
  }

  getCapacityPlanningTableData(): void {
    this.loadWidget(
      'capacityPlanningTable',
      this.svc.getCapacityPlanningTableData(this.capacityPlanningTableCriteria, this.filters),
      response => {
        this.capacityPlanningViewData.tableViewData =
          this.svc.convertToCapacityPlanningTableViewData(response?.results || []);
        this.capacityPlanningViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.capacityPlanningViewData);
      },
      () => {
        this.capacityPlanningViewData.tableViewData = [];
        this.capacityPlanningViewData.tableCount = 0;
        this.updateSectionVisibility(this.capacityPlanningViewData);
      },
      () => {
        this.capacityPlanningViewData.hidden = false;
        this.capacityPlanningViewData.tableViewData = [];
        this.capacityPlanningViewData.tableCount = 0;
      }
    );
  }

  onCapacityPlanningSearched(value: string): void {
    this.updateTableSearch(this.capacityPlanningTableCriteria, value);
    this.getCapacityPlanningTableData();
  }

  onCapacityPlanningPageChange(pageNo: number): void {
    if (this.capacityPlanningTableCriteria.pageNo !== pageNo) {
      this.capacityPlanningTableCriteria.pageNo = pageNo;
      this.getCapacityPlanningTableData();
    }
  }

  onCapacityPlanningSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.capacityPlanningTableCriteria, event);
    this.getCapacityPlanningTableData();
  }

  trackByCapacityPlanningRow(_index: number, row: CapacityPlanningTableViewData): string {
    return row.cluster;
  }

  getCapacityPlanningChartData() {
    this.loadWidget(
      ['capacityPlanningSummary', 'capacityForecast', 'capacityVolUtilDistribution', 'capacityAggUtilDistribution', 'capacityTop5Consumers', 'capacityPlanningBySvm', 'capacityMonthlyGrowth'],
      this.svc.getCapacityPlanningChartData(this.filters),
      res => {
        this.capacityPlanningViewData.summaryViewData = this.svc.convertToCapacityPlanningSummaryViewData(res.summary);
        this.capacityPlanningViewData.chartViewData = this.svc.convertToCapacityPlanningChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.capacityPlanningViewData);
      },
      () => {
        this.capacityPlanningViewData.summaryViewData = null;
        this.capacityPlanningViewData.chartViewData = new CapacityPlanningChartViewData();
        this.updateSectionDataAvailability(this.capacityPlanningViewData);
      },
      () => {
        this.resetSectionVisibility(this.capacityPlanningViewData);
        this.capacityPlanningViewData.summaryViewData = null;
        this.capacityPlanningViewData.chartViewData = new CapacityPlanningChartViewData();
      }
    );
  }

  portOverviewViewData: PortOverviewViewData = new PortOverviewViewData();

  setPortOverviewViewType(viewType: 'table' | 'chart'): void {
    this.portOverviewViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getPortOverviewTableData());
    } else if (viewType === 'chart' && !this.portOverviewViewData.chartLoaded) {
      this.deferViewLoad(() => this.getPortOverviewChartData());
    }
  }

  getPortOverviewTableData(): void {
    this.loadWidget(
      'portOverviewTable',
      this.svc.getPortOverviewTableData(this.portOverviewTableCriteria, this.filters),
      response => {
        this.portOverviewViewData.tableViewData =
          this.svc.convertToPortOverviewTableViewData(response?.results || []);
        this.portOverviewViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.portOverviewViewData);
      },
      () => {
        this.portOverviewViewData.tableViewData = [];
        this.portOverviewViewData.tableCount = 0;
        this.updateSectionVisibility(this.portOverviewViewData);
      },
      () => {
        this.portOverviewViewData.hidden = false;
        this.portOverviewViewData.tableViewData = [];
        this.portOverviewViewData.tableCount = 0;
      }
    );
  }

  onPortOverviewSearched(value: string): void {
    this.updateTableSearch(this.portOverviewTableCriteria, value);
    this.getPortOverviewTableData();
  }

  onPortOverviewPageChange(pageNo: number): void {
    if (this.portOverviewTableCriteria.pageNo !== pageNo) {
      this.portOverviewTableCriteria.pageNo = pageNo;
      this.getPortOverviewTableData();
    }
  }

  onPortOverviewSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.portOverviewTableCriteria, event);
    this.getPortOverviewTableData();
  }

  trackByPortOverviewRow(_index: number, row: PortOverviewTableViewData): string {
    return `${row.cluster}-${row.node}-${row.name}`;
  }

  getPortOverviewChartData() {
    this.loadWidget(
      ['portOverviewSummary', 'portLinkStatusDistribution', 'portTypeAndProtocol', 'portCabledByNode'],
      this.svc.getPortOverviewChartData(this.filters),
      res => {
        this.portOverviewViewData.summaryViewData = this.svc.convertToPortOverviewSummaryViewData(res?.summary);
        this.portOverviewViewData.chartViewData = this.svc.convertToPortOverviewChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.portOverviewViewData);
      },
      () => {
        this.portOverviewViewData.summaryViewData = null;
        this.portOverviewViewData.chartViewData = new PortOverviewChartViewData();
        this.updateSectionDataAvailability(this.portOverviewViewData);
      },
      () => {
        this.resetSectionVisibility(this.portOverviewViewData);
        this.portOverviewViewData.summaryViewData = null;
        this.portOverviewViewData.chartViewData = new PortOverviewChartViewData();
      }
    );
  }

  recentAlertsViewData: RecentAlertsViewData = new RecentAlertsViewData();

  setRecentAlertsViewType(viewType: 'table' | 'chart'): void {
    this.recentAlertsViewData.viewType = viewType;
    if (viewType === 'table') {
      this.deferViewLoad(() => this.getRecentAlertsTableData());
    } else if (viewType === 'chart' && !this.recentAlertsViewData.chartLoaded) {
      this.deferViewLoad(() => this.getRecentAlertsChartData());
    }
  }

  getRecentAlertsTableData(): void {
    this.loadWidget(
      'recentAlertsTable',
      this.svc.getRecentAlertsTableData(this.recentAlertsTableCriteria, this.filters),
      response => {
        this.recentAlertsViewData.tableViewData =
          this.svc.convertToRecentAlertsTableViewData(response?.results || []);
        this.recentAlertsViewData.tableCount = response?.count || 0;
        this.updateSectionVisibility(this.recentAlertsViewData);
      },
      () => {
        this.recentAlertsViewData.tableViewData = [];
        this.recentAlertsViewData.tableCount = 0;
        this.updateSectionVisibility(this.recentAlertsViewData);
      },
      () => {
        this.recentAlertsViewData.hidden = false;
        this.recentAlertsViewData.tableViewData = [];
        this.recentAlertsViewData.tableCount = 0;
      }
    );
  }

  onRecentAlertsSearched(value: string): void {
    this.updateTableSearch(this.recentAlertsTableCriteria, value);
    this.getRecentAlertsTableData();
  }

  onRecentAlertsPageChange(pageNo: number): void {
    if (this.recentAlertsTableCriteria.pageNo !== pageNo) {
      this.recentAlertsTableCriteria.pageNo = pageNo;
      this.getRecentAlertsTableData();
    }
  }

  onRecentAlertsSorted(event: ColumnSortedEvent): void {
    this.updateTableSort(this.recentAlertsTableCriteria, event);
    this.getRecentAlertsTableData();
  }

  trackByRecentAlertsRow(_index: number, row: RecentAlertsTableViewData): number {
    return row.id;
  }

  getRecentAlertsChartData() {
    this.loadWidget(
      ['recentAlertsSummary', 'recentAlertsSeverityDistribution', 'recentAlertsAlertTimeline'],
      this.svc.getRecentAlertsChartData(this.filters),
      res => {
        this.recentAlertsViewData.summaryViewData = this.svc.convertToRecentAlertsSummaryViewData(res?.summary);
        this.recentAlertsViewData.chartViewData = this.svc.convertToRecentAlertsChartViewData(res?.charts);
        this.updateSectionDataAvailability(this.recentAlertsViewData);
      },
      () => {
        this.recentAlertsViewData.summaryViewData = null;
        this.recentAlertsViewData.chartViewData = new RecentAlertsChartViewData();
        this.updateSectionDataAvailability(this.recentAlertsViewData);
      },
      () => {
        this.resetSectionVisibility(this.recentAlertsViewData);
        this.recentAlertsViewData.summaryViewData = null;
        this.recentAlertsViewData.chartViewData = new RecentAlertsChartViewData();
      }
    );
  }

  autoRemediationViewData: AutoRemediationViewData = new AutoRemediationViewData();
  getAutoRemediationSummaryData() {
    this.loadWidget(
      'autoRemediationSummary',
      this.svc.getAutoRemediationSummaryData(this.filters),
      res => {
        this.autoRemediationViewData.summaryViewData =
          this.svc.convertToAutoRemediationSummaryViewData(res?.summary);
        this.updateSummaryOnlySectionDataAvailability(this.autoRemediationViewData);
      },
      () => {
        this.autoRemediationViewData.summaryViewData = null;
        this.updateSummaryOnlySectionDataAvailability(this.autoRemediationViewData);
      },
      () => {
        this.resetSummaryOnlySectionVisibility(this.autoRemediationViewData);
      }
    );
  }

  private loadWidget<T>(
    loadingKeys: keyof NetappStorageWidgetLoadingState | Array<keyof NetappStorageWidgetLoadingState>,
    request: Observable<T>,
    onSuccess: (res: T) => void,
    onError: () => void,
    onBeforeLoad?: () => void
  ) {
    this.registerDashboardLoad();
    const keys = Array.isArray(loadingKeys) ? loadingKeys : [loadingKeys];
    keys.forEach(key => {
      this.widgetLoading[key] = true;
      setTimeout(() => {
        this.spinner.start(this.loaderNames[key]);
      }, 0);
    });
    if (onBeforeLoad) {
      onBeforeLoad();
    }
    request.pipe(
      takeUntil(this.reloadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        keys.forEach(key => {
          this.widgetLoading[key] = false;
          setTimeout(() => this.spinner.stop(this.loaderNames[key]), 0);
        });
        this.completeDashboardLoad();
      })
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
