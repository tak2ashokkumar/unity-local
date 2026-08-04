import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AimlEventDetailsService } from 'src/app/shared/aiml-event-details/aiml-event-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ColumnSortedEvent } from 'src/app/shared/table-functionality/sortable-column/sort.service';
import { MapService } from 'src/app/map.service';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import {
  NetworkAlertEventsSummaryResponse,
  NetworkAlertStatsResponse,
  NetworkAlertsByDeviceTypeResponse,
  NetworkAlertsBySeverityResponse,
  NetworkAverageTemperatureBySensorTypeResponse,
  NetworkDashboardDatacenterOption,
  NetworkDashboardFilterCriteria,
  NetworkEnvironmentalHealthSummaryTableResponse,
  NetworkFanHealthByDeviceResponse,
  NetworkOpenItsmTicketsByDeviceTypeResponse,
  NetworkPowerSupplyStatusDistributionResponse,
  NetworkTopCriticalAlertsResponse,
  NetworkTopDevicesByHotspotTemperatureResponse
} from './network-dashboard.type';
import {
  NETWORK_DASHBOARD_TIME_RANGE_DEFAULT,
  NETWORK_DASHBOARD_TIME_RANGE_OPTIONS
} from './network-dashboard.const';
import {
  AlertEventsChartViewData,
  AlertEventsViewWidgetViewData,
  AutoRemediationSummaryWidgetViewData,
  EnvironmentalHealthChartViewData,
  EnvironmentalHealthSummaryWidgetViewData,
  InterfaceHealthMetricChartViewData,
  InterfaceHealthMetricsWidgetViewData,
  NetworkDeviceAvailabilityCardViewData,
  NetworkDeviceAvailabilityWidgetViewData,
  NetworkDashboardService,
  NetworkOverviewViewData,
  PerformanceWorkloadChartViewData,
  PerformanceWorkloadInsightsWidgetViewData,
  TopConversationsCardViewData,
  TopConversationsWidgetViewData
} from './network-dashboard.service';

@Component({
  selector: 'network-dashboard',
  templateUrl: './network-dashboard.component.html',
  styleUrls: ['./network-dashboard.component.scss'],
  providers: [NetworkDashboardService]
})
export class NetworkDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  filterForm: FormGroup;
  filterLoadFailed = false;
  datacenterOptions: NetworkDashboardDatacenterOption[] = [];
  readonly timeRangeOptions = NETWORK_DASHBOARD_TIME_RANGE_OPTIONS;
  selectedTimeRange: string = NETWORK_DASHBOARD_TIME_RANGE_DEFAULT;
  private selectedTimeRangeDates: { from: string; to: string } | null = null;
  appliedFilters: NetworkDashboardFilterCriteria = {
    datacenterIds: [],
    timeRange: NETWORK_DASHBOARD_TIME_RANGE_DEFAULT,
    startDate: '',
    endDate: ''
  };
  loaderNames = {
    filters: 'networkDashboardFiltersLoader',
    networkOverview: 'networkOverviewLoader',
    topConversations: 'networkTopConversationsLoader',
    performanceWorkload: 'networkPerformanceWorkloadLoader',
    interfaceHealthMetrics: 'networkInterfaceHealthMetricsLoader',
    networkDeviceAvailability: 'networkDeviceAvailabilityLoader',
    environmentalHealthSummary: 'networkEnvironmentalHealthSummaryLoader',
    alertEvents: 'networkAlertEventsLoader',
    autoRemediationSummary: 'networkAutoRemediationSummaryLoader'
  };
  isNetworkOverviewLoading = false;
  isTopConversationsLoading = false;
  isPerformanceWorkloadLoading = false;
  isInterfaceHealthMetricsLoading = false;
  isNetworkDeviceAvailabilityLoading = false;
  isEnvironmentalHealthSummaryLoading = false;
  isAlertEventsLoading = false;
  isAutoRemediationSummaryLoading = false;
  networkOverviewViewData: NetworkOverviewViewData;
  topConversationsWidgetViewData: TopConversationsWidgetViewData;
  performanceWorkloadInsightsViewData: PerformanceWorkloadInsightsWidgetViewData;
  interfaceHealthMetricsViewData: InterfaceHealthMetricsWidgetViewData;
  networkDeviceAvailabilityViewData: NetworkDeviceAvailabilityWidgetViewData;
  environmentalHealthSummaryViewData: EnvironmentalHealthSummaryWidgetViewData;
  alertEventsViewData: AlertEventsViewWidgetViewData;
  autoRemediationSummaryViewData: AutoRemediationSummaryWidgetViewData;
  topConversationsViewMode: 'table' | 'chart' = 'chart';
  topConversationsSearch: string = '';
  performanceWorkloadInsightsViewMode: 'table' | 'chart' = 'chart';
  performanceWorkloadSearch: string = '';
  interfaceHealthMetricsViewMode: 'table' | 'chart' = 'chart';
  interfaceHealthMetricsSearch: string = '';
  networkDeviceAvailabilityViewMode: 'table' | 'chart' = 'chart';
  environmentalHealthSummaryViewMode: 'table' | 'chart' = 'chart';
  manufacturerModelLegendPage = 0;
  deviceTypeLegendPage = 0;
  readonly manufacturerModelLegendItemsPerPage = 5;
  readonly deviceTypeLegendItemsPerPage = 5;
  topConversationSortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  performanceWorkloadSortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  interfaceHealthMetricsSortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  networkDeviceAvailabilitySortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  environmentalHealthSummarySortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  alertEventsSortState: { sortColumn: string; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  datacenterMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };
  datacenterMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'All Datacenter',
    allSelected: 'All Datacenter'
  };

  constructor(
    private svc: NetworkDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private alertDetailSvc: AimlEventDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    public mapSvc: MapService
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.startLoader(this.loaderNames.filters);
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterOptions = res?.datacenters || [];
      this.appliedFilters.timeRange = this.getDefaultTimeRangeSelection();
      this.selectedTimeRange = this.appliedFilters.timeRange;
      this.selectedTimeRangeDates = null;
      this.buildFilterForm();
      this.applyFilters();
      this.stopLoader(this.loaderNames.filters);
      this.loadData();
    }, () => {
      this.filterLoadFailed = true;
      this.notification.error(new Notification('Failed to load network dashboard filters. Try again later.'));
      this.stopLoader(this.loaderNames.filters);
    });
  }

  private hasFilterFormData(): boolean {
    return !!this.datacenterOptions.length || !!this.timeRangeOptions.length;
  }

  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    setTimeout(() => {
      this.getNetworkOverview();
      this.getTopConversations();
      this.getPerformanceWorkloadInsights();
      this.getInterfaceHealthMetrics();
      this.getNetworkDeviceAvailability();
      // Environmental Health Summary is intentionally disabled for now.
      // this.getEnvironmentalHealthSummary();
      this.getAlertEventsView();
      this.getAutoRemediationSummary();
    }, 0);
  }

  getNetworkOverview() {
    this.isNetworkOverviewLoading = true;
    this.networkOverviewViewData = this.networkOverviewViewData || new NetworkOverviewViewData();
    this.startLoader(this.loaderNames.networkOverview);
    this.svc.getNetworkOverview(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.networkOverviewViewData = this.svc.convertToNetworkOverviewViewData(res);
      this.isNetworkOverviewLoading = false;
      this.stopLoader(this.loaderNames.networkOverview);
    }, (_err: HttpErrorResponse) => {
      this.isNetworkOverviewLoading = false;
      this.stopLoader(this.loaderNames.networkOverview);
      this.notification.error(new Notification('Failed to load Network Overview widget data. Try again later.'));
    });
  }

  getTopConversations() {
    this.isTopConversationsLoading = true;
    this.topConversationsWidgetViewData = this.topConversationsWidgetViewData || new TopConversationsWidgetViewData();
    this.startLoader(this.loaderNames.topConversations);
    this.svc.getTopConversationsTable(
      this.appliedFilters,
      this.getTopConversationOrdering(),
      this.topConversationsSearch
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.topConversationsWidgetViewData = this.svc.convertToTopConversationsViewDataFromTable(res);
      this.initializeTopConversationSortState();
      this.isTopConversationsLoading = false;
      this.stopLoader(this.loaderNames.topConversations);
    }, (_err: HttpErrorResponse) => {
      this.isTopConversationsLoading = false;
      this.stopLoader(this.loaderNames.topConversations);
      this.notification.error(new Notification('Failed to load Top 10 Conversations widget data. Try again later.'));
    });
  }

  getPerformanceWorkloadInsights() {
    this.isPerformanceWorkloadLoading = true;
    this.performanceWorkloadInsightsViewData = this.performanceWorkloadInsightsViewData || new PerformanceWorkloadInsightsWidgetViewData();
    this.startLoader(this.loaderNames.performanceWorkload);
    this.svc.getPerformanceInsightsTable(
      this.appliedFilters,
      this.getPerformanceWorkloadOrdering(),
      this.performanceWorkloadSearch
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.performanceWorkloadInsightsViewData = this.svc.convertToPerformanceWorkloadViewDataFromTable(res);
      this.initializePerformanceWorkloadSortState();
      this.isPerformanceWorkloadLoading = false;
      this.stopLoader(this.loaderNames.performanceWorkload);
    }, (_err: HttpErrorResponse) => {
      this.isPerformanceWorkloadLoading = false;
      this.stopLoader(this.loaderNames.performanceWorkload);
      this.notification.error(new Notification('Failed to load Performance / Workload Insights widget data. Try again later.'));
    });
  }

  getInterfaceHealthMetrics() {
    this.isInterfaceHealthMetricsLoading = true;
    this.interfaceHealthMetricsViewData = this.interfaceHealthMetricsViewData || new InterfaceHealthMetricsWidgetViewData();
    this.startLoader(this.loaderNames.interfaceHealthMetrics);
    this.svc.getInterfaceHealthMetricsTable(
      this.appliedFilters,
      this.getInterfaceHealthMetricsOrdering(),
      this.interfaceHealthMetricsSearch
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.interfaceHealthMetricsViewData = this.svc.convertToInterfaceHealthMetricsViewDataFromTable(res);
      this.initializeInterfaceHealthMetricsSortState();
      this.isInterfaceHealthMetricsLoading = false;
      this.stopLoader(this.loaderNames.interfaceHealthMetrics);
    }, (_err: HttpErrorResponse) => {
      this.isInterfaceHealthMetricsLoading = false;
      this.stopLoader(this.loaderNames.interfaceHealthMetrics);
      this.notification.error(new Notification('Failed to load Interface Health & Metrics widget data. Try again later.'));
    });
  }

  getNetworkDeviceAvailability() {
    this.isNetworkDeviceAvailabilityLoading = true;
    this.networkDeviceAvailabilityViewData = this.networkDeviceAvailabilityViewData || new NetworkDeviceAvailabilityWidgetViewData();
    this.startLoader(this.loaderNames.networkDeviceAvailability);
    this.svc.getNetworkDeviceAvailabilityTable(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.networkDeviceAvailabilityViewData = this.svc.convertToNetworkDeviceAvailabilityViewDataFromTable(res);
      this.manufacturerModelLegendPage = 0;
      this.deviceTypeLegendPage = 0;
      this.initializeNetworkDeviceAvailabilitySortState();
      this.isNetworkDeviceAvailabilityLoading = false;
      this.stopLoader(this.loaderNames.networkDeviceAvailability);
    }, (_err: HttpErrorResponse) => {
      this.isNetworkDeviceAvailabilityLoading = false;
      this.stopLoader(this.loaderNames.networkDeviceAvailability);
      this.notification.error(new Notification('Failed to load Network Device Availability widget data. Try again later.'));
    });
  }

  getEnvironmentalHealthSummary() {
    this.isEnvironmentalHealthSummaryLoading = true;
    this.environmentalHealthSummaryViewData = this.environmentalHealthSummaryViewData || new EnvironmentalHealthSummaryWidgetViewData();
    this.startLoader(this.loaderNames.environmentalHealthSummary);
    const emptyEnvironmentalTable: NetworkEnvironmentalHealthSummaryTableResponse = { data: [] };
    const emptyHotSpotTemperature: NetworkTopDevicesByHotspotTemperatureResponse = { data: [] };
    const emptyAverageTemperature: NetworkAverageTemperatureBySensorTypeResponse = { data: [] };
    const emptyPowerSupplyDistribution: NetworkPowerSupplyStatusDistributionResponse = { data: [] };
    const emptyFanHealth: NetworkFanHealthByDeviceResponse = { data: [] };
    forkJoin({
      tableData: this.svc.getEnvironmentalHealthSummaryTable(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Environmental Health Summary table data. Showing available Environmental Health Summary data.', emptyEnvironmentalTable))),
      hotSpotTemperature: this.svc.getTopDevicesByHotspotTemperature(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top 10 Devices by HotSpot Temperature data. Showing available Environmental Health Summary data.', emptyHotSpotTemperature))),
      averageTemperature: this.svc.getAverageTemperatureBySensorType(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Average Temperature by Sensor Type data. Showing available Environmental Health Summary data.', emptyAverageTemperature))),
      powerSupplyStatusDistribution: this.svc.getPowerSupplyStatusDistribution(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Power Supply Status Distribution data. Showing available Environmental Health Summary data.', emptyPowerSupplyDistribution))),
      fanHealthByDevice: this.svc.getFanHealthByDevice(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Fan Health by Device data. Showing available Environmental Health Summary data.', emptyFanHealth)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const view = this.svc.convertToEnvironmentalHealthSummaryChartViewData(
        res.hotSpotTemperature,
        res.averageTemperature,
        res.powerSupplyStatusDistribution,
        res.fanHealthByDevice
      );
      this.environmentalHealthSummaryViewData = this.svc.applyEnvironmentalHealthSummaryTableData(view, res.tableData);
      this.initializeEnvironmentalHealthSummarySortState();
      this.isEnvironmentalHealthSummaryLoading = false;
      this.stopLoader(this.loaderNames.environmentalHealthSummary);
    }, (_err: HttpErrorResponse) => {
      this.isEnvironmentalHealthSummaryLoading = false;
      this.stopLoader(this.loaderNames.environmentalHealthSummary);
      this.notification.error(new Notification('Failed to load Environmental Health Summary widget data. Try again later.'));
    });
  }

  getAlertEventsView() {
    this.isAlertEventsLoading = true;
    this.alertEventsViewData = this.alertEventsViewData || new AlertEventsViewWidgetViewData();
    this.startLoader(this.loaderNames.alertEvents);
    const emptySummary: NetworkAlertEventsSummaryResponse = {};
    const emptyAlertsBySeverity: NetworkAlertsBySeverityResponse = { data: [] };
    const emptyAlertsByDeviceType: NetworkAlertsByDeviceTypeResponse = { data: [] };
    const emptyOpenItsmTickets: NetworkOpenItsmTicketsByDeviceTypeResponse = { data: [] };
    const emptyAlertStats: NetworkAlertStatsResponse = {};
    const emptyTopCriticalAlerts: NetworkTopCriticalAlertsResponse = { data: [] };
    forkJoin({
      summary: this.svc.getAlertEventsSummary(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Alert & Events summary data. Showing available Alert & Events data.', emptySummary))),
      alertsBySeverity: this.svc.getAlertsBySeverity(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Alerts by Severity data. Showing available Alert & Events data.', emptyAlertsBySeverity))),
      alertsByDeviceType: this.svc.getAlertsByDeviceType(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Alerts by Device Type data. Showing available Alert & Events data.', emptyAlertsByDeviceType))),
      openItsmTickets: this.svc.getOpenItsmTicketsByDeviceType(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Open ITSM Tickets by Device Type data. Showing available Alert & Events data.', emptyOpenItsmTickets))),
      alertStats: this.svc.getAlertStats(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Alert Stats data. Showing available Alert & Events data.', emptyAlertStats))),
      topCriticalAlerts: this.svc.getTopCriticalAlerts(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top 10 Critical Alerts data. Showing available Alert & Events data.', emptyTopCriticalAlerts)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertEventsViewData = this.svc.convertToAlertEventsViewData(
        res.summary,
        res.alertsBySeverity,
        res.alertsByDeviceType,
        res.openItsmTickets,
        res.alertStats,
        res.topCriticalAlerts
      );
      this.initializeAlertEventsSortState();
      this.isAlertEventsLoading = false;
      this.stopLoader(this.loaderNames.alertEvents);
    }, (_err: HttpErrorResponse) => {
      this.isAlertEventsLoading = false;
      this.stopLoader(this.loaderNames.alertEvents);
      this.notification.error(new Notification('Failed to load Alert & Events View widget data. Try again later.'));
    });
  }

  getAutoRemediationSummary() {
    this.isAutoRemediationSummaryLoading = true;
    this.autoRemediationSummaryViewData = this.autoRemediationSummaryViewData || new AutoRemediationSummaryWidgetViewData();
    this.startLoader(this.loaderNames.autoRemediationSummary);
    this.svc.getAutoRemediationSummary(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.autoRemediationSummaryViewData = this.svc.convertToAutoRemediationSummaryViewData(res);
      this.isAutoRemediationSummaryLoading = false;
      this.stopLoader(this.loaderNames.autoRemediationSummary);
    }, (_err: HttpErrorResponse) => {
      this.isAutoRemediationSummaryLoading = false;
      this.stopLoader(this.loaderNames.autoRemediationSummary);
      this.notification.error(new Notification('Failed to load Auto-Remediation Summary widget data. Try again later.'));
    });
  }

  applyFilters() {
    if (!this.filterForm) {
      return;
    }
    this.appliedFilters = this.getFilterFormOutput();
  }

  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  setTopConversationsViewMode(mode: 'table' | 'chart') {
    this.topConversationsViewMode = mode;
  }

  setPerformanceWorkloadInsightsViewMode(mode: 'table' | 'chart') {
    this.performanceWorkloadInsightsViewMode = mode;
  }

  setInterfaceHealthMetricsViewMode(mode: 'table' | 'chart') {
    this.interfaceHealthMetricsViewMode = mode;
  }

  setNetworkDeviceAvailabilityViewMode(mode: 'table' | 'chart') {
    this.networkDeviceAvailabilityViewMode = mode;
  }

  setEnvironmentalHealthSummaryViewMode(mode: 'table' | 'chart') {
    this.environmentalHealthSummaryViewMode = mode;
  }

  onTopConversationTableSorted(event: ColumnSortedEvent) {
    if (!this.topConversationsWidgetViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.topConversationSortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.getTopConversations();
  }

  onTopConversationsSearched(value: string) {
    this.topConversationsSearch = value || '';
    this.getTopConversations();
  }

  getVisibleTopConversationRows() {
    return this.topConversationsWidgetViewData?.tableRows || [];
  }

  getTopConversationSortDirection(sortColumn: string): string {
    if (this.topConversationSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.topConversationSortState.sortDirection;
  }

  getTopConversationHeaderClass(sortColumn: string): string {
    return this.topConversationSortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  onPerformanceWorkloadTableSorted(event: ColumnSortedEvent) {
    if (!this.performanceWorkloadInsightsViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.performanceWorkloadSortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.getPerformanceWorkloadInsights();
  }

  onPerformanceWorkloadSearched(value: string) {
    this.performanceWorkloadSearch = value || '';
    this.getPerformanceWorkloadInsights();
  }

  getVisiblePerformanceWorkloadRows() {
    return this.performanceWorkloadInsightsViewData?.tableRows || [];
  }

  getPerformanceWorkloadSortDirection(sortColumn: string): string {
    if (this.performanceWorkloadSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.performanceWorkloadSortState.sortDirection;
  }

  getPerformanceWorkloadHeaderClass(sortColumn: string): string {
    return this.performanceWorkloadSortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  onInterfaceHealthMetricsTableSorted(event: ColumnSortedEvent) {
    if (!this.interfaceHealthMetricsViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.interfaceHealthMetricsSortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.getInterfaceHealthMetrics();
  }

  onInterfaceHealthMetricsSearched(value: string) {
    this.interfaceHealthMetricsSearch = value || '';
    this.getInterfaceHealthMetrics();
  }

  getVisibleInterfaceHealthMetricsRows() {
    return this.interfaceHealthMetricsViewData?.tableRows || [];
  }

  getInterfaceHealthMetricsSortDirection(sortColumn: string): string {
    if (this.interfaceHealthMetricsSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.interfaceHealthMetricsSortState.sortDirection;
  }

  getInterfaceHealthMetricsHeaderClass(sortColumn: string): string {
    return this.interfaceHealthMetricsSortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  onNetworkDeviceAvailabilityTableSorted(event: ColumnSortedEvent) {
    if (!this.networkDeviceAvailabilityViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.networkDeviceAvailabilitySortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.networkDeviceAvailabilityViewData.tableRows = this.svc.sortNetworkDeviceAvailabilityRows(
      this.networkDeviceAvailabilityViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
  }

  getNetworkDeviceAvailabilitySortDirection(sortColumn: string): string {
    if (this.networkDeviceAvailabilitySortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.networkDeviceAvailabilitySortState.sortDirection;
  }

  getNetworkDeviceAvailabilityHeaderClass(sortColumn: string): string {
    return this.networkDeviceAvailabilitySortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  onEnvironmentalHealthSummaryTableSorted(event: ColumnSortedEvent) {
    if (!this.environmentalHealthSummaryViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.environmentalHealthSummarySortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.environmentalHealthSummaryViewData.tableRows = this.svc.sortEnvironmentalHealthSummaryRows(
      this.environmentalHealthSummaryViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
  }

  getEnvironmentalHealthSummarySortDirection(sortColumn: string): string {
    if (this.environmentalHealthSummarySortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.environmentalHealthSummarySortState.sortDirection;
  }

  getEnvironmentalHealthSummaryHeaderClass(sortColumn: string): string {
    return this.environmentalHealthSummarySortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  onAlertEventsTableSorted(event: ColumnSortedEvent) {
    if (!this.alertEventsViewData || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    this.alertEventsSortState = {
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection
    };
    this.alertEventsViewData.tableRows = this.svc.sortAlertEventsRows(
      this.alertEventsViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
  }

  getAlertEventsSortDirection(sortColumn: string): string {
    if (this.alertEventsSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.alertEventsSortState.sortDirection;
  }

  getAlertEventsHeaderClass(sortColumn: string): string {
    return this.alertEventsSortState.sortColumn === sortColumn
      ? 'network-dashboard-conversation-table-head-cell--active'
      : '';
  }

  trackByTopConversationCard(_index: number, card: TopConversationsCardViewData): string {
    return card.key;
  }

  trackByTopConversationRow(_index: number, row: { name: string }): string {
    return row.name;
  }

  trackByPerformanceWorkloadChart(_index: number, chart: PerformanceWorkloadChartViewData): string {
    return chart.key;
  }

  trackByPerformanceWorkloadRow(_index: number, row: { deviceName: string }): string {
    return row.deviceName;
  }

  trackByInterfaceHealthMetricChart(_index: number, chart: InterfaceHealthMetricChartViewData): string {
    return chart.key;
  }

  trackByInterfaceHealthMetricRow(_index: number, row: { interfaceName: string }): string {
    return row.interfaceName;
  }

  trackByNetworkDeviceAvailabilityCard(_index: number, card: NetworkDeviceAvailabilityCardViewData): string {
    return card.key;
  }

  trackByNetworkDeviceAvailabilityRow(_index: number, row: { name: string }): string {
    return row.name;
  }

  getVisibleManufacturerModelLegendItems() {
    const legendItems = this.getManufacturerModelLegendItems();
    const startIndex = this.manufacturerModelLegendPage * this.manufacturerModelLegendItemsPerPage;
    return legendItems.slice(startIndex, startIndex + this.manufacturerModelLegendItemsPerPage);
  }

  getManufacturerModelLegendPageCount(): number {
    return Math.ceil(this.getManufacturerModelLegendItems().length / this.manufacturerModelLegendItemsPerPage);
  }

  previousManufacturerModelLegendPage() {
    if (this.manufacturerModelLegendPage <= 0) {
      return;
    }
    this.manufacturerModelLegendPage -= 1;
  }

  nextManufacturerModelLegendPage() {
    if (this.manufacturerModelLegendPage >= this.getManufacturerModelLegendPageCount() - 1) {
      return;
    }
    this.manufacturerModelLegendPage += 1;
  }

  getVisibleDeviceTypeLegendItems() {
    const legendItems = this.getDeviceTypeLegendItems();
    const startIndex = this.deviceTypeLegendPage * this.deviceTypeLegendItemsPerPage;
    return legendItems.slice(startIndex, startIndex + this.deviceTypeLegendItemsPerPage);
  }

  getDeviceTypeLegendPageCount(): number {
    return Math.ceil(this.getDeviceTypeLegendItems().length / this.deviceTypeLegendItemsPerPage);
  }

  previousDeviceTypeLegendPage() {
    if (this.deviceTypeLegendPage <= 0) {
      return;
    }
    this.deviceTypeLegendPage -= 1;
  }

  nextDeviceTypeLegendPage() {
    if (this.deviceTypeLegendPage >= this.getDeviceTypeLegendPageCount() - 1) {
      return;
    }
    this.deviceTypeLegendPage += 1;
  }

  trackByEnvironmentalHealthChart(_index: number, chart: EnvironmentalHealthChartViewData): string {
    return chart.key;
  }

  trackByEnvironmentalHealthRow(_index: number, row: { deviceName: string }): string {
    return row.deviceName;
  }

  trackByAlertEventsChart(_index: number, chart: AlertEventsChartViewData): string {
    return chart.key;
  }

  trackByAlertEventsRow(_index: number, row: { id: string }): string {
    return row.id;
  }

  viewAlertEventDetails(uuid: string) {
    if (!uuid) {
      return;
    }
    this.alertDetailSvc.showEventDetails(uuid);
  }

  private handleWidgetApiError<T>(message: string, fallback: T) {
    this.notification.error(new Notification(message));
    return of(fallback);
  }

  getTimeRangeLabel(value: string): string {
    switch (value) {
      case 'last_24_hours':
        return '24 Hours';
      case 'last_week':
        return '7 Days';
      case 'last_month':
        return '30 Days';
      case 'last_60_days':
        return '60 Days';
      case 'last_90_days':
        return '90 Days';
      case 'last_year':
        return '1 Year';
      default:
        return value;
    }
  }

  getTimeRangeDropdownLabel(value: string): string {
    switch (value) {
      case 'last_24_hours':
        return 'Last 24 Hours';
      case 'last_week':
        return 'Last 7 Days';
      case 'last_month':
        return 'Last 30 Days';
      case 'last_60_days':
        return 'Last 60 Days';
      case 'last_90_days':
        return 'Last 90 Days';
      case 'last_year':
        return 'Last 1 Year';
      default:
        return this.getTimeRangeLabel(value);
    }
  }

  private buildFilterForm() {
    const defaultTimeRange = this.getDefaultTimeRangeSelection();
    this.selectedTimeRange = this.appliedFilters.timeRange || defaultTimeRange;

    this.filterForm = new FormGroup({
      datacenters: new FormControl(this.datacenterOptions.slice()),
      timeRange: new FormControl(this.selectedTimeRange),
      startDate: new FormControl(this.appliedFilters.startDate || ''),
      endDate: new FormControl(this.appliedFilters.endDate || '')
    });
    this.onTimeRangeChange({ period: this.selectedTimeRange });
  }

  private getFilterFormOutput(): NetworkDashboardFilterCriteria {
    const selectedDatacenters = this.filterForm.get('datacenters')?.value || [];
    const defaultTimeRange = this.getDefaultTimeRangeSelection();

    return {
      datacenterIds: (selectedDatacenters || [])
        .map(item => item?.id)
        .filter(id => typeof id === 'number'),
      timeRange: this.filterForm.get('timeRange')?.value || defaultTimeRange,
      startDate: this.filterForm.get('timeRange')?.value === 'custom' ? (this.filterForm.get('startDate')?.value || '') : '',
      endDate: this.filterForm.get('timeRange')?.value === 'custom' ? (this.filterForm.get('endDate')?.value || '') : ''
    };
  }

  private getDefaultTimeRangeSelection(): string {
    const preferredOption = this.timeRangeOptions.find(option => option?.value === NETWORK_DASHBOARD_TIME_RANGE_DEFAULT);
    return preferredOption?.value || this.timeRangeOptions[0]?.value || NETWORK_DASHBOARD_TIME_RANGE_DEFAULT;
  }

  onTimeRangeChange(event: { period?: string; from?: string | Date; to?: string | Date }) {
    this.selectedTimeRange = event?.period || this.selectedTimeRange;
    this.selectedTimeRangeDates = event?.period === 'custom'
      ? { from: this.formatTimeRangeDate(event?.from, false), to: this.formatTimeRangeDate(event?.to, true) }
      : null;
    this.filterForm?.patchValue({
      timeRange: this.selectedTimeRange,
      startDate: this.selectedTimeRange === 'custom' ? (this.selectedTimeRangeDates?.from || '') : '',
      endDate: this.selectedTimeRange === 'custom' ? (this.selectedTimeRangeDates?.to || '') : ''
    }, { emitEvent: false });
  }

  private formatTimeRangeDate(value: string | Date | undefined, isEnd: boolean): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${isEnd ? '23:59:59' : '00:00:00'}Z`;
  }

  private stopLoader(loaderName: string) {
    setTimeout(() => this.spinner.stop(loaderName), 4);
  }

  private startLoader(loaderName: string) {
    setTimeout(() => this.spinner.start(loaderName), 4);
  }

  private resetFilterState() {
    this.filterForm = null;
    this.filterLoadFailed = false;
    this.datacenterOptions = [];
    this.selectedTimeRange = NETWORK_DASHBOARD_TIME_RANGE_DEFAULT;
    this.selectedTimeRangeDates = null;
    this.isNetworkOverviewLoading = false;
    this.isTopConversationsLoading = false;
    this.isPerformanceWorkloadLoading = false;
    this.isInterfaceHealthMetricsLoading = false;
    this.isNetworkDeviceAvailabilityLoading = false;
    this.isEnvironmentalHealthSummaryLoading = false;
    this.isAlertEventsLoading = false;
    this.isAutoRemediationSummaryLoading = false;
    this.networkOverviewViewData = null;
    this.topConversationsWidgetViewData = null;
    this.performanceWorkloadInsightsViewData = null;
    this.interfaceHealthMetricsViewData = null;
    this.networkDeviceAvailabilityViewData = null;
    this.environmentalHealthSummaryViewData = null;
    this.alertEventsViewData = null;
    this.autoRemediationSummaryViewData = null;
    this.topConversationsViewMode = 'chart';
    this.topConversationsSearch = '';
    this.performanceWorkloadInsightsViewMode = 'chart';
    this.performanceWorkloadSearch = '';
    this.interfaceHealthMetricsViewMode = 'chart';
    this.interfaceHealthMetricsSearch = '';
    this.networkDeviceAvailabilityViewMode = 'chart';
    this.manufacturerModelLegendPage = 0;
    this.deviceTypeLegendPage = 0;
    this.environmentalHealthSummaryViewMode = 'chart';
    this.topConversationSortState = { sortColumn: '', sortDirection: '' };
    this.performanceWorkloadSortState = { sortColumn: '', sortDirection: '' };
    this.interfaceHealthMetricsSortState = { sortColumn: '', sortDirection: '' };
    this.networkDeviceAvailabilitySortState = { sortColumn: '', sortDirection: '' };
    this.environmentalHealthSummarySortState = { sortColumn: '', sortDirection: '' };
    this.alertEventsSortState = { sortColumn: '', sortDirection: '' };
  }

  private initializeTopConversationSortState() {
    if (!this.topConversationsWidgetViewData?.tableRows?.length) {
      if (!this.topConversationSortState.sortColumn || !this.topConversationSortState.sortDirection) {
        this.topConversationSortState = {
          sortColumn: this.topConversationsWidgetViewData?.defaultSortColumn || 'bitsReceiveValue',
          sortDirection: this.topConversationsWidgetViewData?.defaultSortDirection || 'desc'
        };
      }
      return;
    }

    if (!this.topConversationSortState.sortColumn || !this.topConversationSortState.sortDirection) {
      this.topConversationSortState = {
        sortColumn: this.topConversationsWidgetViewData.defaultSortColumn,
        sortDirection: this.topConversationsWidgetViewData.defaultSortDirection
      };
    }
  }

  private getTopConversationOrdering(): string {
    const sortColumn = this.topConversationSortState.sortColumn || 'bitsReceiveValue';
    const sortDirection = this.topConversationSortState.sortDirection || 'desc';
    const orderingKeyMap: { [key: string]: string } = {
      name: 'name',
      bitsReceiveValue: 'bits_received',
      bitsSentValue: 'bits_sent',
      interfaceType: 'interface_type',
      operationalStatus: 'operational_status',
      speedValue: 'speed',
      bandwidthUsagePercent: 'bandwidth_usage'
    };
    const orderingKey = orderingKeyMap[sortColumn] || 'bits_received';
    return sortDirection === 'desc' ? `-${orderingKey}` : orderingKey;
  }

  private initializePerformanceWorkloadSortState() {
    if (!this.performanceWorkloadInsightsViewData?.tableRows?.length) {
      if (!this.performanceWorkloadSortState.sortColumn || !this.performanceWorkloadSortState.sortDirection) {
        this.performanceWorkloadSortState = {
          sortColumn: this.performanceWorkloadInsightsViewData?.defaultSortColumn || 'cpuPercent',
          sortDirection: this.performanceWorkloadInsightsViewData?.defaultSortDirection || 'desc'
        };
      }
      return;
    }

    if (!this.performanceWorkloadSortState.sortColumn || !this.performanceWorkloadSortState.sortDirection) {
      this.performanceWorkloadSortState = {
        sortColumn: this.performanceWorkloadInsightsViewData.defaultSortColumn,
        sortDirection: this.performanceWorkloadInsightsViewData.defaultSortDirection
      };
    }
  }

  private getPerformanceWorkloadOrdering(): string {
    const sortColumn = this.performanceWorkloadSortState.sortColumn || 'cpuPercent';
    const sortDirection = this.performanceWorkloadSortState.sortDirection || 'desc';
    const orderingKeyMap: { [key: string]: string } = {
      cpuPercent: 'cpu_utilization',
      memoryPercent: 'memory_utilization',
      interfaceTrafficInMbps: 'traffic_in',
      interfaceTrafficOutMbps: 'traffic_out'
    };
    const orderingKey = orderingKeyMap[sortColumn] || 'cpu_utilization';
    return sortDirection === 'desc' ? `-${orderingKey}` : orderingKey;
  }

  private initializeInterfaceHealthMetricsSortState() {
    if (!this.interfaceHealthMetricsViewData?.tableRows?.length) {
      if (!this.interfaceHealthMetricsSortState.sortColumn || !this.interfaceHealthMetricsSortState.sortDirection) {
        this.interfaceHealthMetricsSortState = {
          sortColumn: this.interfaceHealthMetricsViewData?.defaultSortColumn || 'errorsInValue',
          sortDirection: this.interfaceHealthMetricsViewData?.defaultSortDirection || 'desc'
        };
      }
      return;
    }

    if (!this.interfaceHealthMetricsSortState.sortColumn || !this.interfaceHealthMetricsSortState.sortDirection) {
      this.interfaceHealthMetricsSortState = {
        sortColumn: this.interfaceHealthMetricsViewData.defaultSortColumn,
        sortDirection: this.interfaceHealthMetricsViewData.defaultSortDirection
      };
    }
  }

  private getInterfaceHealthMetricsOrdering(): string {
    const sortColumn = this.interfaceHealthMetricsSortState.sortColumn || 'errorsInValue';
    const sortDirection = this.interfaceHealthMetricsSortState.sortDirection || 'desc';
    const orderingKeyMap: { [key: string]: string } = {
      errorsInValue: 'errors_inbound',
      errorsOutValue: 'errors_outbound',
      discardsInValue: 'discards_inbound',
      discardsOutValue: 'discards_outbound'
    };
    const orderingKey = orderingKeyMap[sortColumn] || '';
    return orderingKey ? (sortDirection === 'desc' ? `-${orderingKey}` : orderingKey) : '';
  }

  private initializeNetworkDeviceAvailabilitySortState() {
    if (!this.networkDeviceAvailabilityViewData?.tableRows?.length) {
      this.networkDeviceAvailabilitySortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.networkDeviceAvailabilitySortState = {
      sortColumn: this.networkDeviceAvailabilityViewData.defaultSortColumn,
      sortDirection: this.networkDeviceAvailabilityViewData.defaultSortDirection
    };

    if (!this.networkDeviceAvailabilityViewData.defaultSortColumn || !this.networkDeviceAvailabilityViewData.defaultSortDirection) {
      this.networkDeviceAvailabilityViewData.tableRows = this.networkDeviceAvailabilityViewData.tableRows.slice();
      return;
    }

    this.networkDeviceAvailabilityViewData.tableRows = this.svc.sortNetworkDeviceAvailabilityRows(
      this.networkDeviceAvailabilityViewData.tableRows,
      this.networkDeviceAvailabilityViewData.defaultSortColumn,
      this.networkDeviceAvailabilityViewData.defaultSortDirection
    );
  }

  private getManufacturerModelLegendItems() {
    const card = this.networkDeviceAvailabilityViewData?.cards?.find(item => item.key === 'manufacturer-model-breakdown');
    return card?.legendItems || [];
  }

  private getDeviceTypeLegendItems() {
    const card = this.networkDeviceAvailabilityViewData?.cards?.find(item => item.key === 'device-type-distribution');
    return card?.legendItems || [];
  }

  private initializeEnvironmentalHealthSummarySortState() {
    if (!this.environmentalHealthSummaryViewData?.tableRows?.length) {
      this.environmentalHealthSummarySortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.environmentalHealthSummarySortState = {
      sortColumn: this.environmentalHealthSummaryViewData.defaultSortColumn,
      sortDirection: this.environmentalHealthSummaryViewData.defaultSortDirection
    };

    if (!this.environmentalHealthSummaryViewData.defaultSortColumn || !this.environmentalHealthSummaryViewData.defaultSortDirection) {
      this.environmentalHealthSummaryViewData.tableRows = this.environmentalHealthSummaryViewData.tableRows.slice();
      return;
    }

    this.environmentalHealthSummaryViewData.tableRows = this.svc.sortEnvironmentalHealthSummaryRows(
      this.environmentalHealthSummaryViewData.tableRows,
      this.environmentalHealthSummaryViewData.defaultSortColumn,
      this.environmentalHealthSummaryViewData.defaultSortDirection
    );
  }

  private initializeAlertEventsSortState() {
    if (!this.alertEventsViewData?.tableRows?.length) {
      this.alertEventsSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.alertEventsSortState = {
      sortColumn: this.alertEventsViewData.defaultSortColumn,
      sortDirection: this.alertEventsViewData.defaultSortDirection
    };

    if (!this.alertEventsViewData.defaultSortColumn || !this.alertEventsViewData.defaultSortDirection) {
      this.alertEventsViewData.tableRows = this.alertEventsViewData.tableRows.slice();
      return;
    }

    this.alertEventsViewData.tableRows = this.svc.sortAlertEventsRows(
      this.alertEventsViewData.tableRows,
      this.alertEventsViewData.defaultSortColumn,
      this.alertEventsViewData.defaultSortDirection
    );
  }

}
