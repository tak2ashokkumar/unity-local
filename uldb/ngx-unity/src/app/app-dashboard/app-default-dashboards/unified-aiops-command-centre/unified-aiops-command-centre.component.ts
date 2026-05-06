import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { UnifiedAiopsCommandCentreService } from './unified-aiops-command-centre.service';
import {
  UnifiedAiopsAlertRow,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsFilterOption,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsTableRow,
  UnifiedAiopsTicketRow,
  UnifiedAiopsTone
} from './unified-aiops-command-centre.type';

@Component({
  selector: 'unified-aiops-command-centre',
  templateUrl: './unified-aiops-command-centre.component.html',
  styleUrls: ['./unified-aiops-command-centre.component.scss'],
  providers: [UnifiedAiopsCommandCentreService, DatacenterService]
})
export class UnifiedAiopsCommandCentreComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  filterForm: FormGroup;
  datacenterOptions: UnifiedAiopsFilterOption[] = [];
  cloudOptions: UnifiedAiopsCloudFilterOption[] = [];

  summaryMetrics: UnifiedAiopsMetric[] = [];
  discoveryOptions: EChartsOption = {};
  alertSegregationLegend: UnifiedAiopsLegendMetric[] = [];
  alertSegregationOptions: EChartsOption = {};
  businessServices: UnifiedAiopsBusinessService[] = [];
  employeeMetrics: UnifiedAiopsMetric[] = [];
  geoHeatmapOptions: EChartsOption = {};
  privateCloudCoverage: UnifiedAiopsCoverageCard[] = [];
  publicCloudCoverage: UnifiedAiopsCoverageCard[] = [];
  privateCloudCoverageTotal = '0';
  publicCloudCoverageTotal = '0';
  datacenterInfrastructureMetrics: UnifiedAiopsMetric[] = [];
  kubernetesMetrics: UnifiedAiopsMetric[] = [];
  aiGpuMetrics: UnifiedAiopsMetric[] = [];
  applicationRows: UnifiedAiopsTableRow[] = [];
  serviceRows: UnifiedAiopsTableRow[] = [];
  databaseRows: UnifiedAiopsTableRow[] = [];
  osRows: UnifiedAiopsTableRow[] = [];
  bandwidthBarOptions: EChartsOption = {};
  bandwidthLineOptions: EChartsOption = {};
  platformPerformanceOptions: EChartsOption = {};
  performanceMetrics: UnifiedAiopsMetric[] = [];
  deviceAvailabilityOptions: EChartsOption = {};
  availabilityCategoryOptions: EChartsOption = {};
  alertTrendOptions: EChartsOption = {};
  alertReductionMetrics: UnifiedAiopsMetric[] = [];
  alertResponseMetrics: UnifiedAiopsMetric[] = [];
  alertSourceSankeyOptions: EChartsOption = {};
  alertLifecycleSankeyOptions: EChartsOption = {};
  criticalAlerts: UnifiedAiopsAlertRow[] = [];
  ticketPriorityOptions: EChartsOption = {};
  ticketStatusOptions: EChartsOption = {};
  tickets: UnifiedAiopsTicketRow[] = [];
  remediationDonutOptions: EChartsOption = {};
  remediationActionsOptions: EChartsOption = {};
  remediationSummary: UnifiedAiopsMetric[] = [];
  remediationMetrics: UnifiedAiopsRemediationMetric[] = [];

  loaderNames = {
    filters: 'unifiedAiopsFiltersLoader',
    summaryMetrics: 'unifiedAiopsSummaryMetricsLoader',
    discovery: 'unifiedAiopsDiscoveryLoader',
    alertSegregation: 'unifiedAiopsAlertSegregationLoader',
    businessServices: 'unifiedAiopsBusinessServicesLoader',
    employeeExperience: 'unifiedAiopsEmployeeExperienceLoader',
    geoDistribution: 'unifiedAiopsGeoDistributionLoader',
    privateCloudCoverage: 'unifiedAiopsPrivateCloudCoverageLoader',
    publicCloudCoverage: 'unifiedAiopsPublicCloudCoverageLoader',
    datacenterInfrastructure: 'unifiedAiopsDatacenterInfrastructureLoader',
    kubernetes: 'unifiedAiopsKubernetesLoader',
    aiGpu: 'unifiedAiopsAiGpuLoader',
    applications: 'unifiedAiopsApplicationsLoader',
    services: 'unifiedAiopsServicesLoader',
    databases: 'unifiedAiopsDatabasesLoader',
    os: 'unifiedAiopsOsLoader',
    bandwidthBar: 'unifiedAiopsBandwidthBarLoader',
    bandwidthLine: 'unifiedAiopsBandwidthLineLoader',
    platformPerformance: 'unifiedAiopsPlatformPerformanceLoader',
    performanceMetrics: 'unifiedAiopsPerformanceMetricsLoader',
    deviceAvailability: 'unifiedAiopsDeviceAvailabilityLoader',
    availabilityCategory: 'unifiedAiopsAvailabilityCategoryLoader',
    alertTrend: 'unifiedAiopsAlertTrendLoader',
    alertReduction: 'unifiedAiopsAlertReductionLoader',
    alertResponse: 'unifiedAiopsAlertResponseLoader',
    alertSourceSankey: 'unifiedAiopsAlertSourceSankeyLoader',
    alertLifecycleSankey: 'unifiedAiopsAlertLifecycleSankeyLoader',
    criticalAlerts: 'unifiedAiopsCriticalAlertsLoader',
    ticketPriority: 'unifiedAiopsTicketPriorityLoader',
    ticketStatus: 'unifiedAiopsTicketStatusLoader',
    tickets: 'unifiedAiopsTicketsLoader',
    remediationDonut: 'unifiedAiopsRemediationDonutLoader',
    remediationActions: 'unifiedAiopsRemediationActionsLoader',
    remediationSummary: 'unifiedAiopsRemediationSummaryLoader',
    remediationMetrics: 'unifiedAiopsRemediationMetricsLoader'
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

  constructor(private svc: UnifiedAiopsCommandCentreService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** Applies the current filter form output to every Unified AIOps widget request. */
  applyFilters() {
    this.loadData();
  }

  /** Reloads datacenter filter options and rebuilds the dashboard after the filter form is ready. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form only after datacenter data is ready. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads datacenter options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinnerService.start(this.loaderNames.filters);
    forkJoin({
      datacenters: this.svc.getDatacenters().pipe(catchError(() => of(this.svc.getFallbackDatacenters()))),
      clouds: this.svc.getClouds().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterOptions = res.datacenters || [];
      this.cloudOptions = res.clouds || [];
      this.buildFilterForm();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.datacenterOptions = this.svc.getFallbackDatacenters();
      this.cloudOptions = [];
      this.buildFilterForm();
      this.stopFilterLoader();
      this.loadData();
    });
  }

  /** Creates the filter form with all currently loaded datacenter options selected by default. */
  private buildFilterForm() {
    this.filterForm = this.svc.buildFilterForm(this.datacenterOptions, this.cloudOptions);
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterForm = null;
    this.datacenterOptions = [];
    this.cloudOptions = [];
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<UnifiedAiopsFilterOption | string>): string[] {
    return (options || [])
      .map((item: UnifiedAiopsFilterOption | string) => typeof item === 'string' ? item : item?.value)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): UnifiedAiopsDashboardFilterCriteria {
    return {
      datacenters: this.getSelectedValues('datacenters'),
      clouds: this.getSelectedValues('clouds')
    };
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  /** Builds the visible scope text from the current datacenter filter selections. */
  get scopeText(): string {
    if (!this.filterForm) {
      return 'Loading filters';
    }
    const datacenterScope = this.getSelectedLabel(this.datacenterOptions, this.getSelectedValues('datacenters'), 'All datacenters', 'datacenters', 'No datacenters');
    const cloudScope = this.getSelectedLabel(this.cloudOptions, this.getSelectedValues('clouds'), 'All clouds', 'clouds', 'No clouds');
    return `${datacenterScope} | ${cloudScope}`;
  }

  /** Converts selected values into a compact filter label for the header scope text. */
  getSelectedLabel(options: UnifiedAiopsFilterOption[], selectedValues: string[], allLabel: string, pluralLabel: string, emptyLabel: string): string {
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
      this.getSummaryMetrics(filterFormOutput);
      this.getDiscoveryOptions(filterFormOutput);
      this.getAlertSegregation(filterFormOutput);
      // Backlog widgets for the next sprint. Uncomment these calls with their HTML blocks when implementation resumes.
      // this.getBusinessServices(filterFormOutput);
      this.getEmployeeMetrics(filterFormOutput);
      this.getGeoDistribution(filterFormOutput);
      this.getPrivateCloudCoverage(filterFormOutput);
      this.getPublicCloudCoverage(filterFormOutput);
      this.getDatacenterInfrastructure(filterFormOutput);
      this.getKubernetesMetrics(filterFormOutput);
      this.getAiGpuMetrics(filterFormOutput);
      // this.getApplicationRows(filterFormOutput);
      // this.getServiceRows(filterFormOutput);
      this.getDatabaseRows(filterFormOutput);
      this.getOsRows(filterFormOutput);
      // this.getBandwidthBar(filterFormOutput);
      // this.getBandwidthLine(filterFormOutput);
      // this.getPlatformPerformance(filterFormOutput);
      // this.getPerformanceMetrics(filterFormOutput);
      this.getDeviceAvailability(filterFormOutput);
      this.getAvailabilityCategory(filterFormOutput);
      this.getAlertTrend(filterFormOutput);
      // this.getAlertReductionMetrics(filterFormOutput);
      // this.getAlertResponseMetrics(filterFormOutput);
      // this.getAlertSourceSankey(filterFormOutput);
      // this.getAlertLifecycleSankey(filterFormOutput);
      this.getCriticalAlerts(filterFormOutput);
      this.getTicketPriority(filterFormOutput);
      this.getTicketStatus(filterFormOutput);
      this.getTickets(filterFormOutput);
      this.getRemediationDonut(filterFormOutput);
      this.getRemediationActions(filterFormOutput);
      this.getRemediationSummary(filterFormOutput);
      this.getRemediationMetrics(filterFormOutput);
    }, 0);
  }

  getSummaryMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummaryMetrics(filterFormOutput), res => {
      this.summaryMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.summaryMetrics = [];
    });
  }

  getDiscoveryOptions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.discoveryOptions = {};
    this.loadWidget(this.loaderNames.discovery, this.svc.getDiscoveryItems(filterFormOutput), res => {
      this.discoveryOptions = this.svc.convertToDiscoveryOptions(res);
    }, () => {
      this.discoveryOptions = {};
    });
  }

  getAlertSegregation(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertSegregationLegend = [];
    this.alertSegregationOptions = {};
    this.loadWidget(this.loaderNames.alertSegregation, this.svc.getAlertSegregationLegend(filterFormOutput), res => {
      this.alertSegregationLegend = this.svc.convertToLegendMetricsViewData(res);
    }, () => {
      this.alertSegregationLegend = [];
    });
    this.loadWidget(this.loaderNames.alertSegregation, this.svc.getAlertSegregationItems(filterFormOutput), res => {
      this.alertSegregationOptions = this.svc.convertToAlertSegregationOptions(res);
    }, () => {
      this.alertSegregationOptions = {};
    });
  }

  getBusinessServices(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.businessServices = [];
    this.loadWidget(this.loaderNames.businessServices, this.svc.getBusinessServices(filterFormOutput), res => {
      this.businessServices = this.svc.convertToBusinessServicesViewData(res);
    }, () => {
      this.businessServices = [];
    });
  }

  getEmployeeMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.employeeMetrics = [];
    this.loadWidget(this.loaderNames.employeeExperience, this.svc.getEmployeeMetrics(filterFormOutput), res => {
      this.employeeMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.employeeMetrics = [];
    });
  }

  getGeoDistribution(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.geoHeatmapOptions = {};
    this.loadWidget(this.loaderNames.geoDistribution, this.svc.getGeoHeatmap(filterFormOutput), res => {
      this.geoHeatmapOptions = this.svc.convertToGeoHeatmapOptions(res);
    }, () => {
      this.geoHeatmapOptions = {};
    });
  }

  getPrivateCloudCoverage(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.privateCloudCoverage = [];
    this.privateCloudCoverageTotal = '0';
    this.loadWidget(this.loaderNames.privateCloudCoverage, this.svc.getPrivateCloudCoverage(filterFormOutput), res => {
      this.privateCloudCoverage = this.svc.convertToCoverageCardsViewData(res);
      this.privateCloudCoverageTotal = this.svc.getCoverageResourceTotal(this.privateCloudCoverage);
    }, () => {
      this.privateCloudCoverage = [];
      this.privateCloudCoverageTotal = '0';
    });
  }

  getPublicCloudCoverage(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.publicCloudCoverage = [];
    this.publicCloudCoverageTotal = '0';
    this.loadWidget(this.loaderNames.publicCloudCoverage, this.svc.getPublicCloudCoverage(filterFormOutput), res => {
      this.publicCloudCoverage = this.svc.convertToCoverageCardsViewData(res);
      this.publicCloudCoverageTotal = this.svc.getCoverageResourceTotal(this.publicCloudCoverage);
    }, () => {
      this.publicCloudCoverage = [];
      this.publicCloudCoverageTotal = '0';
    });
  }

  getDatacenterInfrastructure(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.datacenterInfrastructureMetrics = [];
    this.loadWidget(this.loaderNames.datacenterInfrastructure, this.svc.getDatacenterInfrastructureMetrics(filterFormOutput), res => {
      this.datacenterInfrastructureMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.datacenterInfrastructureMetrics = [];
    });
  }

  getKubernetesMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.kubernetesMetrics = [];
    this.loadWidget(this.loaderNames.kubernetes, this.svc.getKubernetesMetrics(filterFormOutput), res => {
      this.kubernetesMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.kubernetesMetrics = [];
    });
  }

  getAiGpuMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.aiGpuMetrics = [];
    this.loadWidget(this.loaderNames.aiGpu, this.svc.getAiGpuMetrics(filterFormOutput), res => {
      this.aiGpuMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.aiGpuMetrics = [];
    });
  }

  getApplicationRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.applicationRows = [];
    this.loadWidget(this.loaderNames.applications, this.svc.getApplicationRows(filterFormOutput), res => {
      this.applicationRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.applicationRows = [];
    });
  }

  getServiceRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.serviceRows = [];
    this.loadWidget(this.loaderNames.services, this.svc.getServiceRows(filterFormOutput), res => {
      this.serviceRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.serviceRows = [];
    });
  }

  getDatabaseRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.databaseRows = [];
    this.loadWidget(this.loaderNames.databases, this.svc.getDatabaseRows(filterFormOutput), res => {
      this.databaseRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.databaseRows = [];
    });
  }

  getOsRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.osRows = [];
    this.loadWidget(this.loaderNames.os, this.svc.getOsRows(filterFormOutput), res => {
      this.osRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.osRows = [];
    });
  }

  getBandwidthBar(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.bandwidthBarOptions = {};
    this.loadWidget(this.loaderNames.bandwidthBar, this.svc.getBandwidthBar(filterFormOutput), res => {
      this.bandwidthBarOptions = this.svc.convertToBandwidthBarOptions(res);
    }, () => {
      this.bandwidthBarOptions = {};
    });
  }

  getBandwidthLine(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.bandwidthLineOptions = {};
    this.loadWidget(this.loaderNames.bandwidthLine, this.svc.getBandwidthLine(filterFormOutput), res => {
      this.bandwidthLineOptions = this.svc.convertToBandwidthLineOptions(res);
    }, () => {
      this.bandwidthLineOptions = {};
    });
  }

  getPlatformPerformance(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.platformPerformanceOptions = {};
    this.loadWidget(this.loaderNames.platformPerformance, this.svc.getPlatformPerformance(filterFormOutput), res => {
      this.platformPerformanceOptions = this.svc.convertToPlatformPerformanceOptions(res);
    }, () => {
      this.platformPerformanceOptions = {};
    });
  }

  getPerformanceMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.performanceMetrics = [];
    this.loadWidget(this.loaderNames.performanceMetrics, this.svc.getPerformanceMetrics(filterFormOutput), res => {
      this.performanceMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.performanceMetrics = [];
    });
  }

  getDeviceAvailability(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.deviceAvailabilityOptions = {};
    this.loadWidget(this.loaderNames.deviceAvailability, this.svc.getDeviceAvailability(filterFormOutput), res => {
      this.deviceAvailabilityOptions = this.svc.convertToDeviceAvailabilityOptions(res);
    }, () => {
      this.deviceAvailabilityOptions = {};
    });
  }

  getAvailabilityCategory(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.availabilityCategoryOptions = {};
    this.loadWidget(this.loaderNames.availabilityCategory, this.svc.getAvailabilityCategory(filterFormOutput), res => {
      this.availabilityCategoryOptions = this.svc.convertToAvailabilityCategoryOptions(res);
    }, () => {
      this.availabilityCategoryOptions = {};
    });
  }

  getAlertTrend(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertTrendOptions = {};
    this.loadWidget(this.loaderNames.alertTrend, this.svc.getAlertTrend(filterFormOutput), res => {
      this.alertTrendOptions = this.svc.convertToAlertTrendOptions(res);
    }, () => {
      this.alertTrendOptions = {};
    });
  }

  getAlertReductionMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertReductionMetrics = [];
    this.loadWidget(this.loaderNames.alertReduction, this.svc.getAlertReductionMetrics(filterFormOutput), res => {
      this.alertReductionMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.alertReductionMetrics = [];
    });
  }

  getAlertResponseMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertResponseMetrics = [];
    this.loadWidget(this.loaderNames.alertResponse, this.svc.getAlertResponseMetrics(filterFormOutput), res => {
      this.alertResponseMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.alertResponseMetrics = [];
    });
  }

  getAlertSourceSankey(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertSourceSankeyOptions = {};
    this.loadWidget(this.loaderNames.alertSourceSankey, this.svc.getAlertSourceSankey(filterFormOutput), res => {
      this.alertSourceSankeyOptions = this.svc.convertToAlertSourceSankeyOptions(res);
    }, () => {
      this.alertSourceSankeyOptions = {};
    });
  }

  getAlertLifecycleSankey(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertLifecycleSankeyOptions = {};
    this.loadWidget(this.loaderNames.alertLifecycleSankey, this.svc.getAlertLifecycleSankey(filterFormOutput), res => {
      this.alertLifecycleSankeyOptions = this.svc.convertToAlertLifecycleSankeyOptions(res);
    }, () => {
      this.alertLifecycleSankeyOptions = {};
    });
  }

  getCriticalAlerts(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.criticalAlerts = [];
    this.loadWidget(this.loaderNames.criticalAlerts, this.svc.getCriticalAlerts(filterFormOutput), res => {
      this.criticalAlerts = this.svc.convertToCriticalAlertsViewData(res);
    }, () => {
      this.criticalAlerts = [];
    });
  }

  getTicketPriority(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.ticketPriorityOptions = {};
    this.loadWidget(this.loaderNames.ticketPriority, this.svc.getTicketPriority(filterFormOutput), res => {
      this.ticketPriorityOptions = this.svc.convertToTicketPriorityOptions(res);
    }, () => {
      this.ticketPriorityOptions = {};
    });
  }

  getTicketStatus(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.ticketStatusOptions = {};
    this.loadWidget(this.loaderNames.ticketStatus, this.svc.getTicketStatus(filterFormOutput), res => {
      this.ticketStatusOptions = this.svc.convertToTicketStatusOptions(res);
    }, () => {
      this.ticketStatusOptions = {};
    });
  }

  getTickets(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.tickets = [];
    this.loadWidget(this.loaderNames.tickets, this.svc.getTickets(filterFormOutput), res => {
      this.tickets = this.svc.convertToTicketsViewData(res);
    }, () => {
      this.tickets = [];
    });
  }

  getRemediationDonut(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationDonutOptions = {};
    this.loadWidget(this.loaderNames.remediationDonut, this.svc.getRemediationDonut(filterFormOutput), res => {
      this.remediationDonutOptions = this.svc.convertToRemediationDonutOptions(res);
    }, () => {
      this.remediationDonutOptions = {};
    });
  }

  getRemediationActions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationActionsOptions = {};
    this.loadWidget(this.loaderNames.remediationActions, this.svc.getRemediationActions(filterFormOutput), res => {
      this.remediationActionsOptions = this.svc.convertToRemediationActionsOptions(res);
    }, () => {
      this.remediationActionsOptions = {};
    });
  }

  getRemediationSummary(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationSummary = [];
    this.loadWidget(this.loaderNames.remediationSummary, this.svc.getRemediationSummary(filterFormOutput), res => {
      this.remediationSummary = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.remediationSummary = [];
    });
  }

  getRemediationMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationMetrics = [];
    this.loadWidget(this.loaderNames.remediationMetrics, this.svc.getRemediationMetrics(filterFormOutput), res => {
      this.remediationMetrics = this.svc.convertToRemediationMetricsViewData(res);
    }, () => {
      this.remediationMetrics = [];
    });
  }

  getToneClass(tone?: UnifiedAiopsTone): string {
    return tone ? `tone-${tone}` : 'tone-muted';
  }

  getStatusIcon(tone?: UnifiedAiopsTone): string {
    switch (tone) {
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-circle';
      case 'danger': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-minus-circle';
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByValue(_: number, option: UnifiedAiopsFilterOption): string {
    return option.value;
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
