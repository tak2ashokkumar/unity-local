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
  NetworkAverageUptimeByDeviceTypeResponse,
  NetworkCpuVsMemoryPerformanceResponse,
  NetworkDashboardDatacenterOption,
  NetworkDashboardFilterCriteria,
  NetworkDeviceAvailabilityTableResponse,
  NetworkDeviceHealthDistributionResponse,
  NetworkDeviceTypeDistributionResponse,
  NetworkDevicesByLocationResponse,
  NetworkEnvironmentalHealthSummaryTableResponse,
  NetworkFanHealthByDeviceResponse,
  NetworkInterfaceHealthMetricChartResponse,
  NetworkInterfaceHealthMetricsTableResponse,
  NetworkLowestAvailabilityResponse,
  NetworkManufacturerModelBreakdownResponse,
  NetworkOpenItsmTicketsByDeviceTypeResponse,
  NetworkPerformanceInsightsTableResponse,
  NetworkPowerSupplyStatusDistributionResponse,
  NetworkTopBandwidthUsageResponse,
  NetworkTopConversationMetricResponse,
  NetworkTopConversationsTableResponse,
  NetworkTopCriticalAlertsResponse,
  NetworkTopDevicesByHotspotTemperatureResponse,
  NetworkTrafficInVsOutResponse
} from './network-dashboard.type';
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
  timeRangeOptions: string[] = [];
  appliedFilters: NetworkDashboardFilterCriteria = {
    datacenterIds: [],
    timeRange: 'last_month'
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
  performanceWorkloadInsightsViewMode: 'table' | 'chart' = 'chart';
  interfaceHealthMetricsViewMode: 'table' | 'chart' = 'chart';
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
      this.timeRangeOptions = res?.time_range || [];
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
    const emptyMetricResponse: NetworkTopConversationMetricResponse = { data: [] };
    const emptyBandwidthResponse: NetworkTopBandwidthUsageResponse = { data: [] };
    const emptyTableResponse: NetworkTopConversationsTableResponse = { data: [] };
    forkJoin({
      topBitsReceived: this.svc.getTopBitsReceived(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top Bits Receive data. Showing available Top 10 Conversations data.', emptyMetricResponse))),
      topBitsSent: this.svc.getTopBitsSent(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top Bits Sent data. Showing available Top 10 Conversations data.', emptyMetricResponse))),
      topBandwidthUsage: this.svc.getTopBandwidthUsage(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top Bandwidth Usage data. Showing available Top 10 Conversations data.', emptyBandwidthResponse))),
      tableData: this.svc.getTopConversationsTable(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Top 10 Conversations table data. Showing available Top 10 Conversations data.', emptyTableResponse)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const view = this.svc.convertToTopConversationsChartViewData(
        res.topBitsReceived,
        res.topBitsSent,
        res.topBandwidthUsage
      );
      this.topConversationsWidgetViewData = this.svc.applyTopConversationsTableData(view, res.tableData);
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
    const emptyPerformanceTable: NetworkPerformanceInsightsTableResponse = { data: [] };
    const emptyCpuVsMemory: NetworkCpuVsMemoryPerformanceResponse = { data: [] };
    const emptyTrafficInVsOut: NetworkTrafficInVsOutResponse = { data: [] };
    forkJoin({
      tableData: this.svc.getPerformanceInsightsTable(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Performance / Workload Insights table data. Showing available Performance / Workload Insights data.', emptyPerformanceTable))),
      cpuVsMemory: this.svc.getCpuVsMemoryPerformance(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load CPU Vs Memory Performance data. Showing available Performance / Workload Insights data.', emptyCpuVsMemory))),
      trafficInVsOut: this.svc.getTrafficInVsOut(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Traffic In Vs Traffic Out data. Showing available Performance / Workload Insights data.', emptyTrafficInVsOut)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const view = this.svc.convertToPerformanceWorkloadChartViewData(res.cpuVsMemory, res.trafficInVsOut);
      this.performanceWorkloadInsightsViewData = this.svc.applyPerformanceWorkloadTableData(view, res.tableData);
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
    const emptyInterfaceTable: NetworkInterfaceHealthMetricsTableResponse = { data: [] };
    const emptyInterfaceChart: NetworkInterfaceHealthMetricChartResponse = { data: [] };
    forkJoin({
      tableData: this.svc.getInterfaceHealthMetricsTable(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Interface Health & Metrics table data. Showing available Interface Health & Metrics data.', emptyInterfaceTable))),
      errorsInbound: this.svc.getInterfaceErrorsInbound(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Interface Errors (Inbound) data. Showing available Interface Health & Metrics data.', emptyInterfaceChart))),
      errorsOutbound: this.svc.getInterfaceErrorsOutbound(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Interface Errors (Outbound) data. Showing available Interface Health & Metrics data.', emptyInterfaceChart))),
      discardsInbound: this.svc.getInterfaceDiscardsInbound(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Interface Discards (Inbound) data. Showing available Interface Health & Metrics data.', emptyInterfaceChart))),
      discardsOutbound: this.svc.getInterfaceDiscardsOutbound(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Interface Discards (Outbound) data. Showing available Interface Health & Metrics data.', emptyInterfaceChart)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const view = this.svc.convertToInterfaceHealthMetricsChartViewData(
        res.errorsInbound,
        res.errorsOutbound,
        res.discardsInbound,
        res.discardsOutbound
      );
      this.interfaceHealthMetricsViewData = this.svc.applyInterfaceHealthMetricsTableData(view, res.tableData);
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
    const emptyDeviceAvailabilityTable: NetworkDeviceAvailabilityTableResponse = { data: [] };
    const emptyDeviceHealthDistribution: NetworkDeviceHealthDistributionResponse = { data: [] };
    const emptyDeviceTypeDistribution: NetworkDeviceTypeDistributionResponse = { data: [] };
    const emptyManufacturerModelBreakdown: NetworkManufacturerModelBreakdownResponse = { data: [] };
    const emptyDevicesByLocation: NetworkDevicesByLocationResponse = { data: [] };
    const emptyAverageUptime: NetworkAverageUptimeByDeviceTypeResponse = { data: [] };
    const emptyLowestAvailability: NetworkLowestAvailabilityResponse = { data: [] };
    forkJoin({
      tableData: this.svc.getNetworkDeviceAvailabilityTable(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Network Device Availability table data. Showing available Network Device Availability data.', emptyDeviceAvailabilityTable))),
      deviceHealthDistribution: this.svc.getDeviceHealthDistribution(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Device Health Distribution data. Showing available Network Device Availability data.', emptyDeviceHealthDistribution))),
      deviceTypeDistribution: this.svc.getDeviceTypeDistribution(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Device Type Distribution data. Showing available Network Device Availability data.', emptyDeviceTypeDistribution))),
      manufacturerModelBreakdown: this.svc.getManufacturerModelBreakdown(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Manufacturer & Model Breakdown data. Showing available Network Device Availability data.', emptyManufacturerModelBreakdown))),
      devicesByLocation: this.svc.getDevicesByLocation(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Devices by Location data. Showing available Network Device Availability data.', emptyDevicesByLocation))),
      averageUptimeByDeviceType: this.svc.getAverageUptimeByDeviceType(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Average Uptime by Category data. Showing available Network Device Availability data.', emptyAverageUptime))),
      lowestAvailability: this.svc.getLowestAvailability(this.appliedFilters).pipe(catchError(() => this.handleWidgetApiError('Failed to load Lowest Availability data. Showing available Network Device Availability data.', emptyLowestAvailability)))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const view = this.svc.convertToNetworkDeviceAvailabilityChartViewData(
        res.deviceHealthDistribution,
        res.deviceTypeDistribution,
        res.manufacturerModelBreakdown,
        res.devicesByLocation,
        res.averageUptimeByDeviceType,
        res.lowestAvailability
      );
      this.networkDeviceAvailabilityViewData = this.svc.applyNetworkDeviceAvailabilityTableData(view, res.tableData);
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
    this.topConversationsWidgetViewData.tableRows = this.svc.sortTopConversationRows(
      this.topConversationsWidgetViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
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
    this.performanceWorkloadInsightsViewData.tableRows = this.svc.sortPerformanceWorkloadRows(
      this.performanceWorkloadInsightsViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
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
    this.interfaceHealthMetricsViewData.tableRows = this.svc.sortInterfaceHealthMetricRows(
      this.interfaceHealthMetricsViewData.tableRows,
      event.sortColumn,
      event.sortDirection
    );
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

  private buildFilterForm() {
    const defaultTimeRange = this.timeRangeOptions.includes('last_month')
      ? 'last_month'
      : (this.timeRangeOptions[0] || 'last_month');

    this.filterForm = new FormGroup({
      datacenters: new FormControl(this.datacenterOptions.slice()),
      timeRange: new FormControl(defaultTimeRange)
    });
  }

  private getFilterFormOutput(): NetworkDashboardFilterCriteria {
    const selectedDatacenters = this.filterForm.get('datacenters')?.value || [];
    const defaultTimeRange = this.timeRangeOptions.includes('last_month')
      ? 'last_month'
      : (this.timeRangeOptions[0] || 'last_month');

    return {
      datacenterIds: (selectedDatacenters || [])
        .map(item => item?.id)
        .filter(id => typeof id === 'number'),
      timeRange: this.filterForm.get('timeRange')?.value || defaultTimeRange
    };
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
    this.timeRangeOptions = [];
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
    this.performanceWorkloadInsightsViewMode = 'chart';
    this.interfaceHealthMetricsViewMode = 'chart';
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
      this.topConversationSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.topConversationSortState = {
      sortColumn: this.topConversationsWidgetViewData.defaultSortColumn,
      sortDirection: this.topConversationsWidgetViewData.defaultSortDirection
    };
    this.topConversationsWidgetViewData.tableRows = this.svc.sortTopConversationRows(
      this.topConversationsWidgetViewData.tableRows,
      this.topConversationsWidgetViewData.defaultSortColumn,
      this.topConversationsWidgetViewData.defaultSortDirection
    );
  }

  private initializePerformanceWorkloadSortState() {
    if (!this.performanceWorkloadInsightsViewData?.tableRows?.length) {
      this.performanceWorkloadSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.performanceWorkloadSortState = {
      sortColumn: this.performanceWorkloadInsightsViewData.defaultSortColumn,
      sortDirection: this.performanceWorkloadInsightsViewData.defaultSortDirection
    };

    if (!this.performanceWorkloadInsightsViewData.defaultSortColumn || !this.performanceWorkloadInsightsViewData.defaultSortDirection) {
      this.performanceWorkloadInsightsViewData.tableRows = this.performanceWorkloadInsightsViewData.tableRows.slice();
      return;
    }

    this.performanceWorkloadInsightsViewData.tableRows = this.svc.sortPerformanceWorkloadRows(
      this.performanceWorkloadInsightsViewData.tableRows,
      this.performanceWorkloadInsightsViewData.defaultSortColumn,
      this.performanceWorkloadInsightsViewData.defaultSortDirection
    );
  }

  private initializeInterfaceHealthMetricsSortState() {
    if (!this.interfaceHealthMetricsViewData?.tableRows?.length) {
      this.interfaceHealthMetricsSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    this.interfaceHealthMetricsSortState = {
      sortColumn: this.interfaceHealthMetricsViewData.defaultSortColumn,
      sortDirection: this.interfaceHealthMetricsViewData.defaultSortDirection
    };

    if (!this.interfaceHealthMetricsViewData.defaultSortColumn || !this.interfaceHealthMetricsViewData.defaultSortDirection) {
      this.interfaceHealthMetricsViewData.tableRows = this.interfaceHealthMetricsViewData.tableRows.slice();
      return;
    }

    this.interfaceHealthMetricsViewData.tableRows = this.svc.sortInterfaceHealthMetricRows(
      this.interfaceHealthMetricsViewData.tableRows,
      this.interfaceHealthMetricsViewData.defaultSortColumn,
      this.interfaceHealthMetricsViewData.defaultSortDirection
    );
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
