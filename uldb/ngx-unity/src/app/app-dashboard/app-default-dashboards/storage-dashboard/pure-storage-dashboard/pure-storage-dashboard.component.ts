import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ColumnSortedEvent } from 'src/app/shared/table-functionality/sortable-column/sort.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';
import { PURE_STORAGE_TONE_CLASS } from './pure-storage-dashboard.const';
import { PureStorageDashboardService } from './pure-storage-dashboard.service';
import {
  PureStorageAnyGraphResponse,
  PureStorageAnyTableResponse,
  PureStorageAutoRemediationSummaryResponse,
  PureStorageChartCardViewModel,
  PureStorageExecutiveSummaryResponse,
  PureStorageMetricViewModel,
  PureStorageSectionGraphViewModel,
  PureStorageSectionViewModel,
  PureStorageTableRowViewModel,
  PureStorageTableStateViewModel,
  PureStorageTone,
  PureStorageViewMode
} from './pure-storage-dashboard.type';

@Component({
  selector: 'pure-storage-dashboard',
  templateUrl: './pure-storage-dashboard.component.html',
  styleUrls: ['./pure-storage-dashboard.component.scss'],
  providers: [PureStorageDashboardService]
})
export class PureStorageDashboardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: StorageDashboardFilterCriteria;
  @Input() refreshToken = 0;
  @Input() filtersUnavailable = false;

  readonly executiveSummaryLoader = 'PureStorageExecutiveSummaryLoader';
  executiveSummaryResponse?: PureStorageExecutiveSummaryResponse;
  executiveMetrics: PureStorageMetricViewModel[] = [];
  executiveMetricRows: PureStorageMetricViewModel[][] = [];
  executiveNoData = false;

  arraysSection!: PureStorageSectionViewModel;
  hostsSection!: PureStorageSectionViewModel;
  hostGroupsSection!: PureStorageSectionViewModel;
  volumesSection!: PureStorageSectionViewModel;
  volumeSnapshotsSection!: PureStorageSectionViewModel;
  volumeGroupsSection!: PureStorageSectionViewModel;
  protectionReplicationSection!: PureStorageSectionViewModel;
  protectionGroupSnapshotsSection!: PureStorageSectionViewModel;
  activeClusterSection!: PureStorageSectionViewModel;
  performanceSection!: PureStorageSectionViewModel;
  performanceMetricRows: PureStorageMetricViewModel[][] = [];
  capacityPlanningSection!: PureStorageSectionViewModel;
  hardwareSection!: PureStorageSectionViewModel;
  alertsSection!: PureStorageSectionViewModel;
  readonly autoRemediationSummaryTitle = 'Auto Remediation Summary';
  readonly autoRemediationSummaryLoader = 'PureStorageAutoRemediationSummaryLoader';
  autoRemediationSummaryResponse?: PureStorageAutoRemediationSummaryResponse;
  autoRemediationMetrics: PureStorageMetricViewModel[] = [];
  autoRemediationNoData = true;
  dashboardReady = false;
  dashboardLoading = false;
  dashboardNoData = false;

  private reloadCancel = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();
  private dashboardLoadTimer?: number;
  private viewLoadTimers: number[] = [];
  private pendingDashboardLoads = 0;

  constructor(private svc: PureStorageDashboardService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.initializeSections();
    if (this.filters?.storageType === 'pure') {
      if (this.filtersUnavailable) {
        this.showDashboardNoData();
        return;
      }
      this.deferViewLoad(() => this.loadDashboard());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filtersUnavailable && this.dashboardReady && this.filtersUnavailable) {
      this.showDashboardNoData();
      return;
    }
    if ((changes.filters || changes.refreshToken || changes.filtersUnavailable)
      && this.dashboardReady && this.filters?.storageType === 'pure' && !this.filtersUnavailable) {
      this.loadDashboard();
    }
  }

  ngOnDestroy(): void {
    this.clearViewLoadTimers();
    if (this.dashboardLoadTimer) {
      window.clearTimeout(this.dashboardLoadTimer);
    }
    this.reloadCancel.next();
    this.stopAllLoaders();
    this.reloadCancel.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleArraysView(mode: PureStorageViewMode): void {
    this.setSectionView(this.arraysSection, mode, () => this.loadArraysGraph(), () => this.loadArraysTable());
  }

  loadArraysGraph(): void {
    this.loadGraphSection(this.arraysSection,
      this.svc.getArraysGraph(this.filters),
      response => this.svc.convertArraysGraph(response));
  }

  loadArraysTable(): void {
    this.loadTableSection(this.arraysSection,
      criteria => this.svc.getArraysTable(this.filters, criteria),
      response => this.svc.convertArraysTable(response),
      response => this.svc.convertArraysTableSummary(response));
  }

  onArraysSearched(searchValue: string): void {
    this.onSectionSearched(this.arraysSection, searchValue, () => this.loadArraysTable());
  }

  onArraysSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.arraysSection, event, () => this.loadArraysTable());
  }

  onArraysPageChange(pageNo: number): void {
    this.onSectionPageChange(this.arraysSection, pageNo, () => this.loadArraysTable());
  }

  toggleHostsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.hostsSection, mode, () => this.loadHostsGraph(), () => this.loadHostsTable());
  }

  loadHostsGraph(): void {
    this.loadGraphSection(this.hostsSection,
      this.svc.getHostsGraph(this.filters),
      response => this.svc.convertHostsGraph(response));
  }

  loadHostsTable(): void {
    this.loadTableSection(this.hostsSection,
      criteria => this.svc.getHostsTable(this.filters, criteria),
      response => this.svc.convertHostsTable(response),
      response => this.svc.convertHostsTableSummary(response));
  }

  onHostsSearched(searchValue: string): void {
    this.onSectionSearched(this.hostsSection, searchValue, () => this.loadHostsTable());
  }

  onHostsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.hostsSection, event, () => this.loadHostsTable());
  }

  onHostsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.hostsSection, pageNo, () => this.loadHostsTable());
  }

  toggleHostGroupsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.hostGroupsSection, mode, () => this.loadHostGroupsGraph(), () => this.loadHostGroupsTable());
  }

  loadHostGroupsGraph(): void {
    this.loadGraphSection(this.hostGroupsSection,
      this.svc.getHostGroupsGraph(this.filters),
      response => this.svc.convertHostGroupsGraph(response));
  }

  loadHostGroupsTable(): void {
    this.loadTableSection(this.hostGroupsSection,
      criteria => this.svc.getHostGroupsTable(this.filters, criteria),
      response => this.svc.convertHostGroupsTable(response));
  }

  onHostGroupsSearched(searchValue: string): void {
    this.onSectionSearched(this.hostGroupsSection, searchValue, () => this.loadHostGroupsTable());
  }

  onHostGroupsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.hostGroupsSection, event, () => this.loadHostGroupsTable());
  }

  onHostGroupsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.hostGroupsSection, pageNo, () => this.loadHostGroupsTable());
  }

  toggleVolumesView(mode: PureStorageViewMode): void {
    this.setSectionView(this.volumesSection, mode, () => this.loadVolumesGraph(), () => this.loadVolumesTable());
  }

  loadVolumesGraph(): void {
    this.loadGraphSection(this.volumesSection,
      this.svc.getVolumesGraph(this.filters),
      response => this.svc.convertVolumesGraph(response));
  }

  loadVolumesTable(): void {
    this.loadTableSection(this.volumesSection,
      criteria => this.svc.getVolumesTable(this.filters, criteria),
      response => this.svc.convertVolumesTable(response),
      response => this.svc.convertVolumesTableSummary(response));
  }

  onVolumesSearched(searchValue: string): void {
    this.onSectionSearched(this.volumesSection, searchValue, () => this.loadVolumesTable());
  }

  onVolumesSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.volumesSection, event, () => this.loadVolumesTable());
  }

  onVolumesPageChange(pageNo: number): void {
    this.onSectionPageChange(this.volumesSection, pageNo, () => this.loadVolumesTable());
  }

  toggleVolumeSnapshotsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.volumeSnapshotsSection, mode,
      () => this.loadVolumeSnapshotsGraph(), () => this.loadVolumeSnapshotsTable());
  }

  loadVolumeSnapshotsGraph(): void {
    this.loadGraphSection(this.volumeSnapshotsSection,
      this.svc.getVolumeSnapshotsGraph(this.filters),
      response => this.svc.convertVolumeSnapshotsGraph(response));
  }

  loadVolumeSnapshotsTable(): void {
    this.loadTableSection(this.volumeSnapshotsSection,
      criteria => this.svc.getVolumeSnapshotsTable(this.filters, criteria),
      response => this.svc.convertVolumeSnapshotsTable(response));
  }

  onVolumeSnapshotsSearched(searchValue: string): void {
    this.onSectionSearched(this.volumeSnapshotsSection, searchValue, () => this.loadVolumeSnapshotsTable());
  }

  onVolumeSnapshotsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.volumeSnapshotsSection, event, () => this.loadVolumeSnapshotsTable());
  }

  onVolumeSnapshotsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.volumeSnapshotsSection, pageNo, () => this.loadVolumeSnapshotsTable());
  }

  toggleVolumeGroupsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.volumeGroupsSection, mode,
      () => this.loadVolumeGroupsGraph(), () => this.loadVolumeGroupsTable());
  }

  loadVolumeGroupsGraph(): void {
    this.loadGraphSection(this.volumeGroupsSection,
      this.svc.getVolumeGroupsGraph(this.filters),
      response => this.svc.convertVolumeGroupsGraph(response));
  }

  loadVolumeGroupsTable(): void {
    this.loadTableSection(this.volumeGroupsSection,
      criteria => this.svc.getVolumeGroupsTable(this.filters, criteria),
      response => this.svc.convertVolumeGroupsTable(response));
  }

  onVolumeGroupsSearched(searchValue: string): void {
    this.onSectionSearched(this.volumeGroupsSection, searchValue, () => this.loadVolumeGroupsTable());
  }

  onVolumeGroupsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.volumeGroupsSection, event, () => this.loadVolumeGroupsTable());
  }

  onVolumeGroupsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.volumeGroupsSection, pageNo, () => this.loadVolumeGroupsTable());
  }

  toggleProtectionReplicationView(mode: PureStorageViewMode): void {
    this.setSectionView(this.protectionReplicationSection, mode,
      () => this.loadProtectionReplicationGraph(), () => this.loadProtectionReplicationTable());
  }

  loadProtectionReplicationGraph(): void {
    this.loadGraphSection(this.protectionReplicationSection,
      this.svc.getProtectionReplicationGraph(this.filters),
      response => this.svc.convertProtectionReplicationGraph(response));
  }

  loadProtectionReplicationTable(): void {
    this.loadTableSection(this.protectionReplicationSection,
      criteria => this.svc.getProtectionReplicationTable(this.filters, criteria),
      response => this.svc.convertProtectionReplicationTable(response));
  }

  onProtectionReplicationSearched(searchValue: string): void {
    this.onSectionSearched(this.protectionReplicationSection, searchValue, () => this.loadProtectionReplicationTable());
  }

  onProtectionReplicationSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.protectionReplicationSection, event, () => this.loadProtectionReplicationTable());
  }

  onProtectionReplicationPageChange(pageNo: number): void {
    this.onSectionPageChange(this.protectionReplicationSection, pageNo, () => this.loadProtectionReplicationTable());
  }

  toggleProtectionGroupSnapshotsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.protectionGroupSnapshotsSection, mode,
      () => this.loadProtectionGroupSnapshotsGraph(), () => this.loadProtectionGroupSnapshotsTable());
  }

  loadProtectionGroupSnapshotsGraph(): void {
    this.loadGraphSection(this.protectionGroupSnapshotsSection,
      this.svc.getProtectionGroupSnapshotsGraph(this.filters),
      response => this.svc.convertProtectionGroupSnapshotsGraph(response));
  }

  loadProtectionGroupSnapshotsTable(): void {
    this.loadTableSection(this.protectionGroupSnapshotsSection,
      criteria => this.svc.getProtectionGroupSnapshotsTable(this.filters, criteria),
      response => this.svc.convertProtectionGroupSnapshotsTable(response));
  }

  onProtectionGroupSnapshotsSearched(searchValue: string): void {
    this.onSectionSearched(this.protectionGroupSnapshotsSection, searchValue,
      () => this.loadProtectionGroupSnapshotsTable());
  }

  onProtectionGroupSnapshotsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.protectionGroupSnapshotsSection, event, () => this.loadProtectionGroupSnapshotsTable());
  }

  onProtectionGroupSnapshotsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.protectionGroupSnapshotsSection, pageNo,
      () => this.loadProtectionGroupSnapshotsTable());
  }

  toggleActiveClusterView(mode: PureStorageViewMode): void {
    this.setSectionView(this.activeClusterSection, mode,
      () => this.loadActiveClusterGraph(), () => this.loadActiveClusterTable());
  }

  loadActiveClusterGraph(): void {
    this.loadGraphSection(this.activeClusterSection,
      this.svc.getActiveClusterGraph(this.filters),
      response => this.svc.convertActiveClusterGraph(response));
  }

  loadActiveClusterTable(): void {
    this.loadTableSection(this.activeClusterSection,
      criteria => this.svc.getActiveClusterTable(this.filters, criteria),
      response => this.svc.convertActiveClusterTable(response),
      response => this.svc.convertActiveClusterTableSummary(response));
  }

  onActiveClusterSearched(searchValue: string): void {
    this.onSectionSearched(this.activeClusterSection, searchValue, () => this.loadActiveClusterTable());
  }

  onActiveClusterSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.activeClusterSection, event, () => this.loadActiveClusterTable());
  }

  onActiveClusterPageChange(pageNo: number): void {
    this.onSectionPageChange(this.activeClusterSection, pageNo, () => this.loadActiveClusterTable());
  }

  togglePerformanceView(mode: PureStorageViewMode): void {
    this.setSectionView(this.performanceSection, mode,
      () => this.loadPerformanceGraph(), () => this.loadPerformanceTable());
  }

  loadPerformanceGraph(): void {
    this.loadGraphSection(this.performanceSection,
      this.svc.getPerformanceGraph(this.filters),
      response => this.svc.convertPerformanceGraph(response),
      viewModel => this.setPerformanceMetricRows(viewModel.metrics));
  }

  loadPerformanceTable(): void {
    this.loadTableSection(this.performanceSection,
      criteria => this.svc.getPerformanceTable(this.filters, criteria),
      response => this.svc.convertPerformanceTable(response),
      response => this.svc.convertPerformanceTableSummary(response),
      metrics => this.setPerformanceMetricRows(metrics));
  }

  onPerformanceSearched(searchValue: string): void {
    this.onSectionSearched(this.performanceSection, searchValue, () => this.loadPerformanceTable());
  }

  onPerformanceSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.performanceSection, event, () => this.loadPerformanceTable());
  }

  onPerformancePageChange(pageNo: number): void {
    this.onSectionPageChange(this.performanceSection, pageNo, () => this.loadPerformanceTable());
  }

  toggleCapacityPlanningView(mode: PureStorageViewMode): void {
    this.setSectionView(this.capacityPlanningSection, mode,
      () => this.loadCapacityPlanningGraph(), () => this.loadCapacityPlanningTable());
  }

  loadCapacityPlanningGraph(): void {
    this.loadGraphSection(this.capacityPlanningSection,
      this.svc.getCapacityPlanningGraph(this.filters),
      response => this.svc.convertCapacityPlanningGraph(response));
  }

  loadCapacityPlanningTable(): void {
    this.loadTableSection(this.capacityPlanningSection,
      criteria => this.svc.getCapacityPlanningTable(this.filters, criteria),
      response => this.svc.convertCapacityPlanningTable(response),
      response => this.svc.convertCapacityPlanningTableSummary(response));
  }

  onCapacityPlanningSearched(searchValue: string): void {
    this.onSectionSearched(this.capacityPlanningSection, searchValue, () => this.loadCapacityPlanningTable());
  }

  onCapacityPlanningSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.capacityPlanningSection, event, () => this.loadCapacityPlanningTable());
  }

  onCapacityPlanningPageChange(pageNo: number): void {
    this.onSectionPageChange(this.capacityPlanningSection, pageNo, () => this.loadCapacityPlanningTable());
  }

  toggleHardwareView(mode: PureStorageViewMode): void {
    this.setSectionView(this.hardwareSection, mode,
      () => this.loadHardwareGraph(), () => this.loadHardwareTable());
  }

  loadHardwareGraph(): void {
    this.loadGraphSection(this.hardwareSection,
      this.svc.getHardwareGraph(this.filters),
      response => this.svc.convertHardwareGraph(response));
  }

  loadHardwareTable(): void {
    this.loadTableSection(this.hardwareSection,
      criteria => this.svc.getHardwareTable(this.filters, criteria),
      response => this.svc.convertHardwareTable(response),
      response => this.svc.convertHardwareTableSummary(response));
  }

  onHardwareSearched(searchValue: string): void {
    this.onSectionSearched(this.hardwareSection, searchValue, () => this.loadHardwareTable());
  }

  onHardwareSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.hardwareSection, event, () => this.loadHardwareTable());
  }

  onHardwarePageChange(pageNo: number): void {
    this.onSectionPageChange(this.hardwareSection, pageNo, () => this.loadHardwareTable());
  }

  toggleAlertsView(mode: PureStorageViewMode): void {
    this.setSectionView(this.alertsSection, mode, () => this.loadAlertsGraph(), () => this.loadAlertsTable());
  }

  loadAlertsGraph(): void {
    this.loadGraphSection(this.alertsSection,
      this.svc.getAlertsGraph(this.filters),
      response => this.svc.convertAlertsGraph(response));
  }

  loadAlertsTable(): void {
    this.loadTableSection(this.alertsSection,
      criteria => this.svc.getAlertsTable(this.filters, criteria),
      response => this.svc.convertAlertsTable(response),
      response => this.svc.convertAlertsTableSummary(response));
  }

  onAlertsSearched(searchValue: string): void {
    this.onSectionSearched(this.alertsSection, searchValue, () => this.loadAlertsTable());
  }

  onAlertsSorted(event: ColumnSortedEvent): void {
    this.onSectionSorted(this.alertsSection, event, () => this.loadAlertsTable());
  }

  onAlertsPageChange(pageNo: number): void {
    this.onSectionPageChange(this.alertsSection, pageNo, () => this.loadAlertsTable());
  }

  toneClass(tone?: PureStorageTone): string | null {
    return tone ? PURE_STORAGE_TONE_CLASS[tone] : null;
  }

  trackByMetric(_: number, metric: PureStorageMetricViewModel): string {
    return metric.label;
  }

  trackByRow(index: number, row: PureStorageTableRowViewModel): string {
    return `${row.resourceId || 'row'}-${index}`;
  }

  trackByChart(_: number, chart: PureStorageChartCardViewModel): string {
    return chart.key || chart.title;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private initializeSections(): void {
    this.arraysSection = this.svc.createArraysSection();
    this.hostsSection = this.svc.createHostsSection();
    this.hostGroupsSection = this.svc.createHostGroupsSection();
    this.volumesSection = this.svc.createVolumesSection();
    this.volumeSnapshotsSection = this.svc.createVolumeSnapshotsSection();
    this.volumeGroupsSection = this.svc.createVolumeGroupsSection();
    this.protectionReplicationSection = this.svc.createProtectionReplicationSection();
    this.protectionGroupSnapshotsSection = this.svc.createProtectionGroupSnapshotsSection();
    this.activeClusterSection = this.svc.createActiveClusterSection();
    this.performanceSection = this.svc.createPerformanceSection();
    this.capacityPlanningSection = this.svc.createCapacityPlanningSection();
    this.hardwareSection = this.svc.createHardwareSection();
    this.alertsSection = this.svc.createAlertsSection();
    this.dashboardReady = true;
  }

  private loadDashboard(): void {
    this.clearViewLoadTimers();
    this.reloadCancel.next();
    if (this.dashboardLoadTimer) {
      window.clearTimeout(this.dashboardLoadTimer);
      this.dashboardLoadTimer = undefined;
    }
    if (this.filtersUnavailable) {
      this.showDashboardNoData();
      return;
    }
    this.startDashboardLoader();
    this.resetAllSections();
    this.resetExecutiveSummary();
    this.resetAutoRemediationSummary();
    this.dashboardLoadTimer = window.setTimeout(() => {
      this.dashboardLoadTimer = undefined;
      this.loadExecutiveSummary();
      this.loadAutoRemediationSummary();
      this.loadAllGraphSections();
      this.loadVisibleTableSections();
      this.stopDashboardLoader();
    }, 0);
  }

  private loadExecutiveSummary(): void {
    this.resetExecutiveSummary();
    this.registerDashboardLoad();
    this.spinnerService.start(this.executiveSummaryLoader);
    this.svc.getExecutiveSummary(this.filters).pipe(
      takeUntil(this.reloadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.spinnerService.stop(this.executiveSummaryLoader);
        this.completeDashboardLoad();
      })
    ).subscribe(response => {
      this.executiveSummaryResponse = response;
      this.executiveMetrics = this.svc.convertExecutiveSummary(response);
      this.executiveMetricRows = this.getMetricRows(this.executiveMetrics, 6);
      this.executiveNoData = !this.executiveMetricRows.length;
    }, () => {
      this.executiveMetrics = [];
      this.executiveMetricRows = [];
      this.executiveNoData = true;
      this.handleDashboardLoadFailure('Executive Summary');
    });
  }

  private loadAutoRemediationSummary(): void {
    this.resetAutoRemediationSummary();
    this.autoRemediationNoData = false;
    this.registerDashboardLoad();
    this.spinnerService.start(this.autoRemediationSummaryLoader);
    this.svc.getAutoRemediationSummary(this.filters).pipe(
      takeUntil(this.reloadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.spinnerService.stop(this.autoRemediationSummaryLoader);
        this.completeDashboardLoad();
      })
    ).subscribe(response => {
      this.autoRemediationSummaryResponse = response;
      this.autoRemediationMetrics = this.svc.convertAutoRemediationSummary(response);
      this.autoRemediationNoData = !this.autoRemediationMetrics.length;
    }, () => {
      this.autoRemediationMetrics = [];
      this.autoRemediationNoData = true;
      this.handleDashboardLoadFailure(this.autoRemediationSummaryTitle);
    });
  }

  private loadGraphSection<TResponse extends PureStorageAnyGraphResponse>(section: PureStorageSectionViewModel,
    request: Observable<TResponse>,
    convert: (response: TResponse) => PureStorageSectionGraphViewModel,
    afterLoad?: (viewModel: PureStorageSectionGraphViewModel) => void): void {
    section.loading = true;
    section.chartNoData = false;
    section.hidden = false;
    this.registerDashboardLoad();
    this.markChartCardsLoading(section);
    request.pipe(
      takeUntil(this.reloadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.markChartCardsComplete(section);
        section.loading = false;
        this.completeDashboardLoad();
      })
    ).subscribe(response => {
      section.rawGraphResponse = response;
      const viewModel = convert(response);
      section.metrics = viewModel.metrics;
      // Merge API chart data into the existing widget shell so loader names, order, span, and tooltip metadata stay stable.
      section.charts = this.mergeChartCards(section.charts, viewModel.charts);
      section.showChartWidgets = section.charts.some(chart => chart.hasData);
      section.chartNoData = !section.showChartWidgets;
      this.updateSectionVisibility(section);
      if (afterLoad) {
        afterLoad(viewModel);
      }
    }, () => {
      section.charts = section.charts.map(chart => new PureStorageChartCardViewModel({
        ...chart,
        loading: false,
        hasData: false
      }));
      section.showChartWidgets = false;
      section.chartNoData = true;
      this.updateSectionVisibility(section);
      this.handleDashboardLoadFailure(`${section.title} chart`);
    });
  }

  private loadTableSection<TResponse extends PureStorageAnyTableResponse>(section: PureStorageSectionViewModel,
    requestFactory: (criteria: SearchCriteria) => Observable<TResponse>,
    convert: (response: TResponse) => PureStorageTableStateViewModel,
    convertMetrics?: (response: TResponse) => PureStorageMetricViewModel[],
    afterMetricsLoad?: (metrics: PureStorageMetricViewModel[]) => void): void {
    const criteria = { ...section.table.criteria, pageSize: 10 };
    const loader = section.table.loader;
    section.table.rows = [];
    section.table.noData = false;
    section.table.hasLoaded = false;
    section.hidden = false;
    this.registerDashboardLoad();
    this.spinnerService.start(loader);
    requestFactory(criteria).pipe(
      takeUntil(this.reloadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.spinnerService.stop(loader);
        this.completeDashboardLoad();
      })
    ).subscribe(response => {
      const table = convert(response);
      table.criteria = criteria;
      table.loader = loader;
      section.table = table;
      if (!section.metrics.length && convertMetrics) {
        section.metrics = convertMetrics(response);
        if (afterMetricsLoad) {
          afterMetricsLoad(section.metrics);
        }
      }
      if (section.table.rows.length || this.hasRenderableMetrics(section.metrics) || section.showChartWidgets) {
        section.hidden = false;
      } else {
        this.updateSectionVisibility(section);
      }
    }, () => {
      section.table = {
        ...section.table,
        criteria,
        rows: [],
        count: 0,
        currentPage: criteria.pageNo || 1,
        pageSize: criteria.pageSize || 10,
        totalPages: 0,
        hasLoaded: true,
        noData: true
      };
      this.updateSectionVisibility(section);
      this.handleDashboardLoadFailure(`${section.title} table`);
    });
  }

  private notifyLoadFailure(label: string): void {
    this.notification.error(new Notification(`Failed to load ${label} data. Try again later.`));
  }

  private handleDashboardLoadFailure(label: string): void {
    this.notifyLoadFailure(label);
    this.showDashboardNoData();
  }

  private setSectionView(section: PureStorageSectionViewModel, mode: PureStorageViewMode,
    loadGraph: () => void,
    loadTable: () => void): void {
    const previousMode = section.viewMode;
    section.viewMode = mode;
    if (mode === 'table') {
      this.deferViewLoad(() => {
        if (section.viewMode === 'table') {
          loadTable();
        }
      });
    }
    if (mode === 'chart') {
      if (!section.charts.length) {
        loadGraph();
        return;
      }
      if (previousMode !== 'chart') {
        this.deferViewLoad(() => this.startVisibleChartLoaders(section));
      }
    }
  }

  private deferViewLoad(loadFn: () => void): void {
    const timer = window.setTimeout(() => {
      this.viewLoadTimers = this.viewLoadTimers.filter(timerId => timerId !== timer);
      loadFn();
    }, 0);
    this.viewLoadTimers.push(timer);
  }

  private clearViewLoadTimers(): void {
    this.viewLoadTimers.forEach(timer => window.clearTimeout(timer));
    this.viewLoadTimers = [];
  }

  private onSectionSearched(section: PureStorageSectionViewModel, searchValue: string, loadTable: () => void): void {
    section.table.criteria.searchValue = searchValue;
    section.table.criteria.pageNo = 1;
    loadTable();
  }

  private onSectionSorted(section: PureStorageSectionViewModel, event: ColumnSortedEvent, loadTable: () => void): void {
    section.table.criteria.sortColumn = event.sortColumn;
    section.table.criteria.sortDirection = event.sortDirection === 'desc' ? 'desc' : 'asc';
    section.table.criteria.pageNo = 1;
    loadTable();
  }

  private onSectionPageChange(section: PureStorageSectionViewModel, pageNo: number, loadTable: () => void): void {
    section.table.criteria.pageNo = pageNo;
    loadTable();
  }

  private resetAllSections(): void {
    this.getAllSections().forEach(section => this.resetSection(section));
  }

  private loadAllGraphSections(): void {
    this.loadArraysGraph();
    this.loadHostsGraph();
    this.loadHostGroupsGraph();
    this.loadVolumesGraph();
    this.loadVolumeSnapshotsGraph();
    this.loadVolumeGroupsGraph();
    this.loadProtectionReplicationGraph();
    this.loadProtectionGroupSnapshotsGraph();
    this.loadActiveClusterGraph();
    this.loadPerformanceGraph();
    this.loadCapacityPlanningGraph();
    this.loadHardwareGraph();
    this.loadAlertsGraph();
  }

  private loadVisibleTableSections(): void {
    if (this.arraysSection.viewMode === 'table') {
      this.loadArraysTable();
    }
    if (this.hostsSection.viewMode === 'table') {
      this.loadHostsTable();
    }
    if (this.hostGroupsSection.viewMode === 'table') {
      this.loadHostGroupsTable();
    }
    if (this.volumesSection.viewMode === 'table') {
      this.loadVolumesTable();
    }
    if (this.volumeSnapshotsSection.viewMode === 'table') {
      this.loadVolumeSnapshotsTable();
    }
    if (this.volumeGroupsSection.viewMode === 'table') {
      this.loadVolumeGroupsTable();
    }
    if (this.protectionReplicationSection.viewMode === 'table') {
      this.loadProtectionReplicationTable();
    }
    if (this.protectionGroupSnapshotsSection.viewMode === 'table') {
      this.loadProtectionGroupSnapshotsTable();
    }
    if (this.activeClusterSection.viewMode === 'table') {
      this.loadActiveClusterTable();
    }
    if (this.performanceSection.viewMode === 'table') {
      this.loadPerformanceTable();
    }
    if (this.capacityPlanningSection.viewMode === 'table') {
      this.loadCapacityPlanningTable();
    }
    if (this.hardwareSection.viewMode === 'table') {
      this.loadHardwareTable();
    }
    if (this.alertsSection.viewMode === 'table') {
      this.loadAlertsTable();
    }
  }

  private resetExecutiveSummary(): void {
    this.executiveMetrics = [];
    this.executiveMetricRows = [];
    this.executiveSummaryResponse = undefined;
    this.executiveNoData = false;
  }

  private resetAutoRemediationSummary(): void {
    this.autoRemediationSummaryResponse = undefined;
    this.autoRemediationMetrics = [];
    this.autoRemediationNoData = false;
  }

  private resetSection(section: PureStorageSectionViewModel): void {
    const columns = section.table.columns.map(column => ({ ...column }));
    const loader = section.table.loader;
    section.metrics = [];
    section.hidden = false;
    section.loading = true;
    if (section === this.performanceSection) {
      this.performanceMetricRows = [];
    }
    section.charts = section.charts.map(chart => new PureStorageChartCardViewModel({
      ...chart,
      loading: true,
      hasData: false
    }));
    section.showChartWidgets = false;
    section.chartNoData = false;
    section.rawGraphResponse = undefined;
    section.table = {
      ...section.table,
      columns,
      loader,
      rows: [],
      count: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      hasLoaded: false,
      noData: false,
      criteria: {
        ...section.table.criteria,
        pageNo: 1,
        pageSize: 10
      }
    };
  }

  private updateSectionVisibility(section: PureStorageSectionViewModel): void {
    section.hidden = !this.hasRenderableMetrics(section.metrics) && !section.showChartWidgets && !section.table.rows.length;
    if (section.hidden) {
      // Debug aid for local troubleshooting: shows which section ended up hidden after loading.
      console.log('[Pure Storage Dashboard] Hidden section with no data:', section.key, section.title);
    }
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

  private updateDashboardNoData(): void {
    if (this.dashboardLoading) {
      return;
    }
    const hasSummaryData = this.hasRenderableMetrics(this.executiveMetrics)
      || this.hasRenderableMetrics(this.autoRemediationMetrics);
    const hasSectionData = this.getAllSections().some(section => !section.hidden);
    this.dashboardNoData = !hasSummaryData && !hasSectionData;
  }

  private showDashboardNoData(): void {
    if (this.dashboardLoadTimer) {
      window.clearTimeout(this.dashboardLoadTimer);
      this.dashboardLoadTimer = undefined;
    }
    this.reloadCancel.next();
    this.clearViewLoadTimers();
    this.stopAllLoaders();
    this.resetExecutiveSummary();
    this.executiveNoData = true;
    this.resetAutoRemediationSummary();
    this.getAllSections().forEach(section => {
      this.resetSection(section);
      section.hidden = true;
    });
    this.pendingDashboardLoads = 0;
    this.dashboardLoading = false;
    this.dashboardNoData = true;
  }

  private stopAllLoaders(): void {
    this.spinnerService.stop(this.executiveSummaryLoader);
    this.spinnerService.stop(this.autoRemediationSummaryLoader);
    this.getAllSections().forEach(section => {
      if (section.chartLoader) {
        this.spinnerService.stop(section.chartLoader);
      }
      section.charts.forEach(chart => {
        if (chart.loader) {
          this.spinnerService.stop(chart.loader);
        }
      });
      this.spinnerService.stop(section.table.loader);
    });
  }

  private getAllSections(): PureStorageSectionViewModel[] {
    return [
      this.arraysSection,
      this.hostsSection,
      this.hostGroupsSection,
      this.volumesSection,
      this.volumeSnapshotsSection,
      this.volumeGroupsSection,
      this.protectionReplicationSection,
      this.protectionGroupSnapshotsSection,
      this.activeClusterSection,
      this.performanceSection,
      this.capacityPlanningSection,
      this.hardwareSection,
      this.alertsSection
    ].filter(section => !!section);
  }

  private hasRenderableMetrics(metrics: PureStorageMetricViewModel[]): boolean {
    return (metrics || []).some(metric => metric.value !== 'N/A' && metric.value !== '--');
  }

  private getMetricRows(metrics: PureStorageMetricViewModel[], rowSize: number): PureStorageMetricViewModel[][] {
    const rows: PureStorageMetricViewModel[][] = [];
    for (let index = 0; index < metrics.length; index += rowSize) {
      rows.push(metrics.slice(index, index + rowSize));
    }
    return rows;
  }

  private setPerformanceMetricRows(metrics: PureStorageMetricViewModel[]): void {
    this.performanceMetricRows = this.getMetricRows(metrics, 5);
  }

  private markChartCardsLoading(section: PureStorageSectionViewModel): void {
    section.charts = section.charts.map(chart => {
      if (section.viewMode === 'chart' && chart.loader) {
        this.spinnerService.start(chart.loader);
      }
      return new PureStorageChartCardViewModel({
        ...chart,
        loading: true,
        hasData: false
      });
    });
  }

  private markChartCardsComplete(section: PureStorageSectionViewModel): void {
    section.charts = section.charts.map(chart => {
      if (chart.loader) {
        this.spinnerService.stop(chart.loader);
      }
      return new PureStorageChartCardViewModel({
        ...chart,
        loading: false
      });
    });
  }

  private startVisibleChartLoaders(section: PureStorageSectionViewModel): void {
    if (section.viewMode !== 'chart' || !section.loading) {
      return;
    }
    section.charts.forEach(chart => {
      if (chart.loading && chart.loader) {
        this.spinnerService.start(chart.loader);
      }
    });
  }

  private mergeChartCards(
    currentCards: PureStorageChartCardViewModel[],
    responseCards: PureStorageChartCardViewModel[]
  ): PureStorageChartCardViewModel[] {
    if (!currentCards.length) {
      return responseCards.map(card => new PureStorageChartCardViewModel({
        ...card,
        loading: false
      }));
    }
    const responseMap = new Map(responseCards.map(card => [card.key, card]));
    return currentCards.map(currentCard => {
      const responseCard = responseMap.get(currentCard.key);
      if (!responseCard) {
        return new PureStorageChartCardViewModel({
          ...currentCard,
          loading: false,
          hasData: false
        });
      }
      return new PureStorageChartCardViewModel({
        ...currentCard,
        ...responseCard,
        loader: currentCard.loader,
        loading: false
      });
    });
  }
}
