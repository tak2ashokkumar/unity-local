import { Component, OnDestroy, OnInit } from '@angular/core';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import {
  PUBLIC_CLOUD_TICKET_PRIORITY_OPTIONS,
  PUBLIC_CLOUD_TICKET_STATE_OPTIONS,
  PUBLIC_CLOUD_TICKET_TYPE_OPTIONS
} from './public-cloud-compute-dashboard.const';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSideCard,
  PublicCloudAlertSummaryMetric,
  PublicCloudAlertTrendLegendItem,
  PublicCloudAlertTrendStackLegendItem,
  PublicCloudComputeBreakdownProvider,
  PublicCloudCriticalAlert,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDatabaseLatencyBadge,
  PublicCloudFilterOption,
  PublicCloudProviderDistributionItem,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudTagItem,
  PublicCloudTicketFilterCriteria,
  PublicCloudTicketRow,
  PublicCloudUtilizationViewRow
} from './public-cloud-compute-dashboard.type';

@Component({
  selector: 'public-cloud-compute-dashboard',
  templateUrl: './public-cloud-compute-dashboard.component.html',
  styleUrls: ['./public-cloud-compute-dashboard.component.scss'],
  providers: [PublicCloudComputeDashboardService]
})
export class PublicCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private filterFormUnsubscribe = new Subject<void>();
  private appliedTicketDateRangeKey = '';

  filterForm: FormGroup;
  ticketFilterForm: FormGroup;
  platformOptions: PublicCloudFilterOption[] = [];
  regionOptions: PublicCloudRegionOption[] = [];
  accountOptions: PublicCloudAccountOption[] = [];
  ticketStateFilterOptions: PublicCloudFilterOption[] = PUBLIC_CLOUD_TICKET_STATE_OPTIONS;
  ticketPriorityFilterOptions: PublicCloudFilterOption[] = PUBLIC_CLOUD_TICKET_PRIORITY_OPTIONS;
  ticketTypeFilterOptions: PublicCloudFilterOption[] = PUBLIC_CLOUD_TICKET_TYPE_OPTIONS;

  summaryMetrics: PublicCloudSummaryMetric[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  tags: PublicCloudTagItem[] = [];
  heatmapOptions: EChartsOption = {};
  computeBreakdown: PublicCloudComputeBreakdownProvider[] = [];
  utilizationRows: PublicCloudUtilizationViewRow[] = [];
  latencyWorkloadOptions: EChartsOption = {};
  errorRateWorkloadOptions: EChartsOption = {};
  databasePerformanceOptions: EChartsOption = {};
  databaseLatencyBadges: PublicCloudDatabaseLatencyBadge[] = [];
  alertSummaryMetrics: PublicCloudAlertSummaryMetric[] = [];
  criticalAlerts: PublicCloudCriticalAlert[] = [];
  alertTrendLegend: PublicCloudAlertTrendLegendItem[] = [];
  alertTrendPolarOptions: EChartsOption = {};
  alertTrendStackOptions: EChartsOption = {};
  alertTrendStackLegend: PublicCloudAlertTrendStackLegendItem[] = [];
  alertSideCards: PublicCloudAlertSideCard[] = [];
  ticketPriorityOptions: EChartsOption = {};
  ticketStatusOptions: EChartsOption = {};
  ticketResponseTimeOptions: EChartsOption = {};
  ticketPriorityHasData = false;
  ticketStatusHasData = false;
  ticketResponseTimeHasData = false;
  tickets: PublicCloudTicketRow[] = [];
  totalTickets = 0;
  ticketPageNo = 1;
  ticketPageSize = 10;
  ticketDatePickerScrollStrategy: ScrollStrategy;

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    summaryMetrics: 'publicCloudSummaryMetricsLoader',
    providerDistribution: 'publicCloudProviderDistributionLoader',
    tags: 'publicCloudTagsLoader',
    regionHeatmap: 'publicCloudRegionHeatmapLoader',
    computeBreakdown: 'publicCloudComputeBreakdownLoader',
    utilization: 'publicCloudUtilizationLoader',
    latencyWorkloads: 'publicCloudLatencyWorkloadsLoader',
    errorRateWorkloads: 'publicCloudErrorRateWorkloadsLoader',
    databasePerformance: 'publicCloudDatabasePerformanceLoader',
    databaseLatencyBadges: 'publicCloudDatabaseLatencyBadgesLoader',
    alertSummary: 'publicCloudAlertSummaryLoader',
    criticalAlerts: 'publicCloudCriticalAlertsLoader',
    alertTrend: 'publicCloudAlertTrendLoader',
    alertSideCards: 'publicCloudAlertSideCardsLoader',
    ticketPriority: 'publicCloudTicketPriorityLoader',
    ticketStatus: 'publicCloudTicketStatusLoader',
    ticketResponseTime: 'publicCloudTicketResponseTimeLoader',
    tickets: 'publicCloudTicketsLoader'
  };

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };

  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected'
  };

  constructor(private svc: PublicCloudComputeDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private overlay: Overlay) {
    this.ticketDatePickerScrollStrategy = this.overlay.scrollStrategies.reposition();
  }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  /** Applies the current filter form output to every widget request. */
  applyFilters() {
    this.loadData();
  }

  /** Reloads the page filters from the source sequence and then refreshes all widgets. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form only after platform, region, and account data is ready. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads platform options first, then continues the dependent filter-loading chain. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinnerService.start(this.loaderNames.filters);
    this.svc.getPlatforms().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.platformOptions = res || [];
      this.loadInitialRegions();
    }, () => {
      this.stopFilterLoader();
    });
  }

  /** Loads region options from the selected-by-default platform values during initial filter setup. */
  private loadInitialRegions() {
    const platformValues = this.getValuesFromOptions(this.platformOptions);
    this.svc.getRegions(platformValues).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regionOptions = res || [];
      this.loadInitialAccounts(platformValues);
    }, () => {
      this.regionOptions = [];
      this.accountOptions = [];
      this.stopFilterLoader();
    });
  }

  /** Loads account options from the selected-by-default platform and region values, then creates the filter form. */
  private loadInitialAccounts(platformValues: string[]) {
    const regionValues = this.getValuesFromOptions(this.regionOptions);
    this.svc.getAccounts(platformValues, regionValues).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.accountOptions = res || [];
      this.buildFilterForm();
      this.buildTicketFilterForm();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.accountOptions = [];
      this.stopFilterLoader();
    });
  }

  /** Wires dependent filter changes without reloading widgets until the filter button is clicked. */
  private watchFilterChanges() {
    this.filterForm.get('platforms').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadRegionOptionsForForm();
      });

    this.filterForm.get('regions').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadAccountOptionsForForm();
      });
  }

  /** Refreshes region options for the current platform selections and keeps still-valid region selections. */
  private loadRegionOptionsForForm() {
    this.svc.getRegions(this.getSelectedValues('platforms')).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regionOptions = res || [];
      this.patchSelectedOptions('regions', this.regionOptions);
      this.loadAccountOptionsForForm();
    }, () => {
      this.regionOptions = [];
      this.accountOptions = [];
      this.setControlValue('regions', []);
      this.setControlValue('accounts', []);
      this.stopFilterLoader();
    });
  }

  /** Refreshes account options for the current platform and region selections and keeps still-valid account selections. */
  private loadAccountOptionsForForm() {
    this.svc.getAccounts(this.getSelectedValues('platforms'), this.getSelectedValues('regions'))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.accountOptions = res || [];
        this.patchSelectedOptions('accounts', this.accountOptions);
        this.stopFilterLoader();
      }, () => {
        this.accountOptions = [];
        this.setControlValue('accounts', []);
        this.stopFilterLoader();
      });
  }

  /** Creates the filter form with all currently loaded filter options selected by default. */
  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.platformOptions, this.regionOptions, this.accountOptions);
    this.watchFilterChanges();
  }

  /** Creates the ITSM ticket filter form with the default two-week date window. */
  private buildTicketFilterForm() {
    this.ticketFilterForm = this.svc.buildTicketFilterForm();
    this.ticketPageNo = 1;
    this.ticketPageSize = 10;
    this.appliedTicketDateRangeKey = this.getTicketDateRangeKey();
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.ticketFilterForm = null;
    this.appliedTicketDateRangeKey = '';
    this.platformOptions = [];
    this.regionOptions = [];
    this.accountOptions = [];
  }

  /** Keeps current selections when still available; if none remain, dependent options default to all available options. */
  private patchSelectedOptions(controlName: string, options: PublicCloudFilterOption[]) {
    const selectedValues = this.getSelectedValues(controlName);
    let nextValue: PublicCloudFilterOption[] = [];
    if (selectedValues.length) {
      const selectedOptions = options.filter(option => selectedValues.includes(option.value));
      nextValue = selectedOptions.length ? selectedOptions : options;
    }
    this.setControlValue(controlName, nextValue);
  }

  /** Sets a filter control value without triggering dependent filter subscriptions. */
  private setControlValue(controlName: string, value: PublicCloudFilterOption[]) {
    this.filterForm.get(controlName).setValue(value, { emitEvent: false });
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<PublicCloudFilterOption | string>): string[] {
    return (options || [])
      .map((item: PublicCloudFilterOption | string) => typeof item === 'string' ? item : item?.value)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): PublicCloudDashboardFilterCriteria {
    return {
      platforms: this.getSelectedValues('platforms'),
      regions: this.getSelectedValues('regions'),
      accounts: this.getSelectedValues('accounts')
    };
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm && !!this.platformOptions.length && !!this.regionOptions.length && !!this.accountOptions.length;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  /** Builds the visible scope text from the current filter form selections. */
  get scopeText(): string {
    if (!this.filterForm) {
      return 'Loading filters';
    }
    return `${this.getSelectedLabel(this.platformOptions, this.getSelectedValues('platforms'), 'All providers', 'providers', 'No providers')} | ${this.getSelectedLabel(this.regionOptions, this.getSelectedValues('regions'), 'All regions', 'regions', 'No regions')} | ${this.getSelectedLabel(this.accountOptions, this.getSelectedValues('accounts'), 'All accounts', 'accounts', 'No accounts')}`;
  }

  /** Converts selected values into a compact filter label for the header scope text. */
  getSelectedLabel(options: PublicCloudFilterOption[], selectedValues: string[], allLabel: string, pluralLabel: string, emptyLabel: string): string {
    if (!selectedValues.length) {
      return emptyLabel;
    }
    if (options?.length && selectedValues.length === options.length) {
      return allLabel;
    }
    if (selectedValues.length === 1) {
      return options?.find(option => option.value === selectedValues[0])?.label || allLabel;
    }
    return `${selectedValues.length} ${pluralLabel}`;
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    const filterFormOutput = this.getFilterFormOutput();
    setTimeout(() => {
      this.getInventorySummary(filterFormOutput);
      // Next sprint: uncomment this call with the Regions / AZ Usage Heatmap template block.
      // this.getRegionHeatmap(filterFormOutput);
      this.getComputeBreakdown(filterFormOutput);
      // Next sprint: uncomment these calls with the Performance Hotspots and Performance / Workload Insights template blocks.
      // this.getUtilizationRows(filterFormOutput);
      // this.getLatencyWorkloads(filterFormOutput);
      // this.getErrorRateWorkloads(filterFormOutput);
      // this.getDatabasePerformance(filterFormOutput);
      // this.getDatabaseLatencyBadges(filterFormOutput);
      this.getTopCriticalAlerts(filterFormOutput);
      this.getAlertTrend(filterFormOutput);
      this.getTicketGraphData(filterFormOutput);
      this.getTickets(filterFormOutput);
    }, 0);
  }

  getInventorySummary(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.tags = [];
    this.startInventorySummaryLoaders();
    this.svc.getInventorySummary(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopInventorySummaryLoaders())
    ).subscribe(res => {
      this.summaryMetrics = this.svc.convertToSummaryMetricsViewData(res);
      this.providerDistribution = this.svc.convertToProviderDistributionViewData(res);
      this.providerDistributionOptions = this.svc.convertToProviderDistributionOptions(this.providerDistribution);
      this.tags = this.svc.convertToTagsViewData(res);
    }, () => {
      this.clearInventorySummaryViewData();
    });
  }

  private startInventorySummaryLoaders() {
    [
      this.loaderNames.summaryMetrics,
      this.loaderNames.providerDistribution,
      this.loaderNames.tags
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopInventorySummaryLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.summaryMetrics,
        this.loaderNames.providerDistribution,
        this.loaderNames.tags
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearInventorySummaryViewData() {
    this.summaryMetrics = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.tags = [];
  }

  getRegionHeatmap(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.heatmapOptions = {};
    this.loadWidget(this.loaderNames.regionHeatmap, this.svc.getRegionHeatmap(filterFormOutput), res => {
      this.heatmapOptions = this.svc.convertToRegionHeatmapOptions(res);
    }, () => {
      this.heatmapOptions = {};
    });
  }

  getComputeBreakdown(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.computeBreakdown = [];
    this.loadWidget(this.loaderNames.computeBreakdown, this.svc.getComputeBreakdown(filterFormOutput), res => {
      this.computeBreakdown = this.svc.convertToComputeBreakdownViewData(res);
    }, () => {
      this.computeBreakdown = [];
    });
  }

  getUtilizationRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.utilizationRows = [];
    this.loadWidget(this.loaderNames.utilization, this.svc.getUtilizationRows(filterFormOutput), res => {
      this.utilizationRows = this.svc.convertToUtilizationRowsViewData(res);
    }, () => {
      this.utilizationRows = [];
    });
  }

  getLatencyWorkloads(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.latencyWorkloadOptions = {};
    this.loadWidget(this.loaderNames.latencyWorkloads, this.svc.getLatencyWorkloads(filterFormOutput), res => {
      this.latencyWorkloadOptions = this.svc.convertToLatencyWorkloadOptions(res);
    }, () => {
      this.latencyWorkloadOptions = {};
    });
  }

  getErrorRateWorkloads(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.errorRateWorkloadOptions = {};
    this.loadWidget(this.loaderNames.errorRateWorkloads, this.svc.getErrorRateWorkloads(filterFormOutput), res => {
      this.errorRateWorkloadOptions = this.svc.convertToErrorRateWorkloadOptions(res);
    }, () => {
      this.errorRateWorkloadOptions = {};
    });
  }

  getDatabasePerformance(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databasePerformanceOptions = {};
    this.loadWidget(this.loaderNames.databasePerformance, this.svc.getDatabasePerformance(filterFormOutput), res => {
      this.databasePerformanceOptions = this.svc.convertToDatabasePerformanceOptions(res);
    }, () => {
      this.databasePerformanceOptions = {};
    });
  }

  getDatabaseLatencyBadges(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseLatencyBadges = [];
    this.loadWidget(this.loaderNames.databaseLatencyBadges, this.svc.getDatabaseLatencyBadges(filterFormOutput), res => {
      this.databaseLatencyBadges = this.svc.convertToDatabaseLatencyBadgesViewData(res);
    }, () => {
      this.databaseLatencyBadges = [];
    });
  }

  getTopCriticalAlerts(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.alertSummaryMetrics = [];
    this.criticalAlerts = [];
    this.startTopCriticalAlertsLoaders();
    this.svc.getTopCriticalAlerts(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopTopCriticalAlertsLoaders())
    ).subscribe(res => {
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryMetricsViewData(res);
      this.criticalAlerts = this.svc.convertToCriticalAlertsViewData(res);
    }, () => {
      this.clearTopCriticalAlertsViewData();
    });
  }

  private startTopCriticalAlertsLoaders() {
    [
      this.loaderNames.alertSummary,
      this.loaderNames.criticalAlerts
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopTopCriticalAlertsLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.alertSummary,
        this.loaderNames.criticalAlerts
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearTopCriticalAlertsViewData() {
    this.alertSummaryMetrics = [];
    this.criticalAlerts = [];
  }

  getAlertTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.alertTrendLegend = [];
    this.alertTrendPolarOptions = {};
    this.alertTrendStackOptions = {};
    this.alertTrendStackLegend = [];
    this.alertSideCards = [];
    this.startAlertTrendLoaders();
    this.svc.getAIOpsDetails(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopAlertTrendLoaders())
    ).subscribe(res => {
      const stackGroups = this.svc.convertToAlertTrendStackGroupsViewData(res);
      this.alertTrendLegend = this.svc.convertToAlertTrendLegendViewData(res);
      this.alertTrendPolarOptions = this.svc.convertToAlertTrendPolarOptions(this.alertTrendLegend);
      this.alertTrendStackOptions = this.svc.convertToAlertTrendStackOptions(stackGroups);
      this.alertTrendStackLegend = this.svc.convertToAlertTrendStackLegendViewData(stackGroups);
      this.alertSideCards = this.svc.convertToAlertSideCardsViewData(res);
    }, () => {
      this.clearAlertTrendViewData();
    });
  }

  private startAlertTrendLoaders() {
    [
      this.loaderNames.alertTrend,
      this.loaderNames.alertSideCards
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopAlertTrendLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.alertTrend,
        this.loaderNames.alertSideCards
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearAlertTrendViewData() {
    this.alertTrendLegend = [];
    this.alertTrendPolarOptions = {};
    this.alertTrendStackOptions = {};
    this.alertTrendStackLegend = [];
    this.alertSideCards = [];
  }

  getTicketGraphData(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearTicketGraphViewData();
    this.startTicketGraphLoaders();
    this.svc.getTicketGraphData(filterFormOutput, this.getTicketDateFilterFormOutput()).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopTicketGraphLoaders())
    ).subscribe(res => {
      const priorityData = this.svc.convertToTicketPriorityViewData(res);
      const statusData = this.svc.convertToTicketStatusViewData(res);
      const responseTimeData = this.svc.convertToTicketResponseTimeViewData(res);
      this.ticketPriorityHasData = this.svc.hasTicketDonutData(priorityData);
      this.ticketStatusHasData = this.svc.hasTicketDonutData(statusData);
      this.ticketResponseTimeHasData = this.svc.hasTicketDonutData(responseTimeData);
      this.ticketPriorityOptions = this.ticketPriorityHasData ? this.svc.convertToTicketPriorityOptions(priorityData) : {};
      this.ticketStatusOptions = this.ticketStatusHasData ? this.svc.convertToTicketStatusOptions(statusData) : {};
      this.ticketResponseTimeOptions = this.ticketResponseTimeHasData ? this.svc.convertToTicketResponseTimeOptions(responseTimeData) : {};
    }, () => {
      this.clearTicketGraphViewData();
    });
  }

  private startTicketGraphLoaders() {
    [
      this.loaderNames.ticketPriority,
      this.loaderNames.ticketStatus,
      this.loaderNames.ticketResponseTime
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopTicketGraphLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.ticketPriority,
        this.loaderNames.ticketStatus,
        this.loaderNames.ticketResponseTime
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearTicketGraphViewData() {
    this.ticketPriorityOptions = {};
    this.ticketStatusOptions = {};
    this.ticketResponseTimeOptions = {};
    this.ticketPriorityHasData = false;
    this.ticketStatusHasData = false;
    this.ticketResponseTimeHasData = false;
  }

  getTickets(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.tickets = [];
    this.totalTickets = 0;
    this.loadWidget(this.loaderNames.tickets, this.svc.getTickets(filterFormOutput, this.getTicketFilterFormOutput()), res => {
      this.tickets = this.svc.convertToTicketsViewData(res);
      this.totalTickets = this.svc.convertToTicketsTotal(res);
    }, () => {
      this.tickets = [];
      this.totalTickets = 0;
    });
  }

  filterTickets() {
    if (!this.hasFilterFormData() || !this.ticketFilterForm) {
      return;
    }
    this.ticketPageNo = 1;
    this.syncTicketDateRangeFields();
    this.appliedTicketDateRangeKey = this.getTicketDateRangeKey();
    const filterFormOutput = this.getFilterFormOutput();
    this.getTickets(filterFormOutput);
  }

  ticketDateRangeChange() {
    if (!this.hasFilterFormData() || !this.ticketFilterForm) {
      return;
    }
    this.syncTicketDateRangeFields();
    const nextDateRangeKey = this.getTicketDateRangeKey();
    if (!nextDateRangeKey || nextDateRangeKey === this.appliedTicketDateRangeKey) {
      return;
    }
    this.appliedTicketDateRangeKey = nextDateRangeKey;
    this.ticketPageNo = 1;
    const filterFormOutput = this.getFilterFormOutput();
    this.getTicketGraphData(filterFormOutput);
    this.getTickets(filterFormOutput);
  }

  refreshTickets() {
    if (!this.hasFilterFormData()) {
      return;
    }
    this.syncTicketDateRangeFields();
    this.appliedTicketDateRangeKey = this.getTicketDateRangeKey();
    const filterFormOutput = this.getFilterFormOutput();
    this.getTicketGraphData(filterFormOutput);
    this.getTickets(filterFormOutput);
  }

  ticketPageChange(pageNo: number) {
    if (this.ticketPageNo === pageNo) {
      return;
    }
    this.ticketPageNo = pageNo;
    this.getTickets(this.getFilterFormOutput());
  }

  ticketPageSizeChange(event: Event) {
    this.ticketPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.ticketPageNo = 1;
    this.getTickets(this.getFilterFormOutput());
  }

  private getTicketFilterFormOutput(): PublicCloudTicketFilterCriteria {
    const data = this.ticketFilterForm?.getRawValue() || {};
    const dateRangeValues = this.getTicketDateRangeValues();
    return {
      state: data.state || '',
      ticket_type: data.ticket_type || '',
      search: data.search || '',
      priority: data.priority || '',
      dateRange: '',
      start_date: dateRangeValues.startDate,
      end_date: dateRangeValues.endDate,
      page: this.ticketPageNo,
      page_size: this.ticketPageSize
    };
  }

  private getTicketDateFilterFormOutput(): PublicCloudTicketFilterCriteria {
    const dateRangeValues = this.getTicketDateRangeValues();
    return {
      state: '',
      ticket_type: '',
      search: '',
      priority: '',
      dateRange: '',
      start_date: dateRangeValues.startDate,
      end_date: dateRangeValues.endDate,
      page: 1,
      page_size: this.ticketPageSize
    };
  }

  private syncTicketDateRangeFields() {
    const dateRangeValues = this.getTicketDateRangeValues();
    if (!dateRangeValues.isComplete || !this.ticketFilterForm) {
      return;
    }
    this.ticketFilterForm.patchValue({
      start_date: dateRangeValues.startDate,
      end_date: dateRangeValues.endDate
    }, { emitEvent: false });
  }

  private getTicketDateRangeKey(): string {
    const dateRangeValues = this.getTicketDateRangeValues();
    if (!dateRangeValues.isComplete) {
      return '';
    }
    return `${dateRangeValues.startDate}|${dateRangeValues.endDate}`;
  }

  private getTicketDateRangeValues(): { startDate: string; endDate: string; isComplete: boolean } {
    const data = this.ticketFilterForm?.getRawValue() || {};
    const dateRange = Array.isArray(data.dateRange) ? data.dateRange : [];
    const hasDateRangeValue = !!dateRange.length;
    const hasPartialDateRange = hasDateRangeValue && (!dateRange[0] || !dateRange[1]);
    const startDate = this.svc.getTicketFilterDateValue(dateRange[0]) || data.start_date || '';
    const endDate = this.svc.getTicketFilterDateValue(dateRange[1]) || data.end_date || '';
    return {
      startDate,
      endDate,
      isComplete: !hasPartialDateRange && !!startDate && !!endDate
    };
  }

  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  trackByValue(index: number, option: PublicCloudFilterOption) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void) {
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => setTimeout(() => this.spinnerService.stop(loaderName), 0))
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
