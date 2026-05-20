import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSummaryMetric,
  PublicCloudComputeBreakdownProvider,
  PublicCloudComputeBreakdownStat,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudIdleDeviceRow,
  PublicCloudIdleDurationItem,
  PublicCloudInventorySummaryKey,
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudProviderDistributionKey,
  PublicCloudProviderDistributionItem,
  PublicCloudRecentAlert,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudTagItem
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
  private allAccountOptions: PublicCloudAccountOption[] = [];
  private readonly linkRoutes = {
    publicCloud: ['/unitycloud/publiccloud'],
    devices: ['/unitycloud/devices'],
    vmAll: ['/unitycloud/devices/vms/allvms'],
    kubernetes: ['/unitycloud/devices/kubernetes'],
    alerts: ['/services/aiml-event-mgmt/alerts'],
    gpu: ['/services/ai-observability/gpu'],
    storage: ['/unitycloud/devices/storagedevices'],
    bmservers: ['/unitycloud/devices/bmservers'],
    provider: {
      aws: ['/unitycloud/publiccloud/aws'],
      azure: ['/unitycloud/publiccloud/azure'],
      gcp: ['/unitycloud/publiccloud/gcp'],
      oci: ['/unitycloud/publiccloud/oracle'],
      oracle: ['/unitycloud/publiccloud/oracle']
    },
    providerVm: {
      aws: ['/unitycloud/devices/vms/aws'],
      azure: ['/unitycloud/devices/vms/azure'],
      gcp: ['/unitycloud/devices/vms/gcp'],
      oracle: ['/unitycloud/devices/vms/oracle']
    }
  };

  filterForm: FormGroup;
  platformOptions: PublicCloudFilterOption[] = [];
  regionOptions: PublicCloudRegionOption[] = [];
  accountOptions: PublicCloudAccountOption[] = [];
  filtersUnavailable = false;

  summaryMetrics: PublicCloudSummaryMetric[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  tags: PublicCloudTagItem[] = [];
  computeBreakdown: PublicCloudComputeBreakdownProvider[] = [];
  orphanedDevices: PublicCloudOrphanedDeviceRow[] = [];
  orphanedDevicesTotal = 0;
  orphanedDevicesPageNo = 1;
  orphanedDevicesPageSize = 10;
  orphanedByCategory: PublicCloudOrphanedCategoryItem[] = [];
  orphanedByCategoryOptions: EChartsOption = {};
  orphanedByCategoryHasData = false;
  idleDevices: PublicCloudIdleDeviceRow[] = [];
  idleDevicesTotal = 0;
  idleDevicesPageNo = 1;
  idleDevicesPageSize = 10;
  idleDurationRows: PublicCloudIdleDurationItem[] = [];
  idleDurationOptions: EChartsOption = {};
  idleDurationHasData = false;
  recentAlertSummaryMetrics: PublicCloudAlertSummaryMetric[] = [];
  recentAlerts: PublicCloudRecentAlert[] = [];

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    summaryMetrics: 'publicCloudSummaryMetricsLoader',
    providerDistribution: 'publicCloudProviderDistributionLoader',
    tags: 'publicCloudTagsLoader',
    computeBreakdown: 'publicCloudComputeBreakdownLoader',
    orphanedDevices: 'publicCloudOrphanedDevicesLoader',
    orphanedDevicesByCategory: 'publicCloudOrphanedDevicesByCategoryLoader',
    idleDevices: 'publicCloudIdleDevicesLoader',
    idleDuration: 'publicCloudIdleDurationLoader',
    recentAlertSummary: 'publicCloudRecentAlertSummaryLoader',
    recentAlerts: 'publicCloudRecentAlertsLoader'
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
    private location: Location,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private alertDetailSvc: AimlAlertDetailsService) { }

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
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.loadData();
  }

  /** Reloads the page filters from the source sequence and then refreshes all widgets. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form before widgets are refreshed. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads filter options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinnerService.start(this.loaderNames.filters);
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applyFilterOptionsAndDashboard(res);
    }, () => {
      this.showDashboardNoDataState();
    });
  }

  /** Applies loaded filter options, creates default selections, and starts dashboard loading. */
  private applyFilterOptionsAndDashboard(filterOptions: PublicCloudDashboardFilterOptions) {
    if (!this.hasUsableFilterOptions(filterOptions)) {
      this.showDashboardNoDataState();
      return;
    }
    this.platformOptions = filterOptions?.platforms || [];
    this.regionOptions = filterOptions?.regions || [];
    this.allAccountOptions = filterOptions?.accounts || [];
    this.accountOptions = this.svc.filterAccountsForSelection(
      this.allAccountOptions,
      this.getValuesFromOptions(this.platformOptions),
      this.getValuesFromOptions(this.regionOptions)
    );
    this.buildFilterForm();
    this.stopFilterLoader();
    this.loadData();
  }

  /** Confirms the filter API returned enough option data to drive widget requests. */
  private hasUsableFilterOptions(filterOptions: PublicCloudDashboardFilterOptions): boolean {
    return !!filterOptions?.platforms?.length && !!filterOptions?.regions?.length;
  }

  /** Shows the dashboard-level empty state when filters cannot be loaded from the API. */
  private showDashboardNoDataState() {
    this.filtersUnavailable = true;
    this.filterForm = null;
    this.clearDashboardViewData();
    this.stopFilterLoader();
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
    this.patchSelectedOptions('regions', this.regionOptions);
    this.loadAccountOptionsForForm();
  }

  /** Refreshes account options for the current platform and region selections and keeps still-valid account selections. */
  private loadAccountOptionsForForm() {
    this.accountOptions = this.svc.filterAccountsForSelection(this.allAccountOptions, this.getSelectedValues('platforms'), this.getSelectedValues('regions'));
    this.patchSelectedOptions('accounts', this.accountOptions);
    this.stopFilterLoader();
  }

  /** Creates the filter form with all currently loaded filter options selected by default. */
  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.platformOptions, this.regionOptions, this.accountOptions);
    this.watchFilterChanges();
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.platformOptions = [];
    this.regionOptions = [];
    this.accountOptions = [];
    this.allAccountOptions = [];
    this.filtersUnavailable = false;
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
    return !!this.filterForm;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  /** Builds the visible scope text from the current filter form selections. */
  get scopeText(): string {
    if (!this.filterForm) {
      if (this.filtersUnavailable) {
        return 'No data available';
      }
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
      this.getComputeBreakdown(filterFormOutput);
      this.getOrphanedDevices(filterFormOutput);
      this.getOrphanedDevicesByCategory(filterFormOutput);
      this.getIdleDevices(filterFormOutput);
      this.getIdleDevicesByDuration(filterFormOutput);
      this.getRecentAlerts(filterFormOutput);
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

  getComputeBreakdown(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.computeBreakdown = [];
    this.loadWidget(this.loaderNames.computeBreakdown, this.svc.getComputeBreakdown(filterFormOutput), res => {
      this.computeBreakdown = this.svc.convertToComputeBreakdownViewData(res, filterFormOutput);
    }, () => {
      this.computeBreakdown = [];
    });
  }

  getOrphanedDevices(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.orphanedDevices = [];
    this.orphanedDevicesTotal = 0;
    this.loadWidget(this.loaderNames.orphanedDevices, this.svc.getOrphanedDevices(filterFormOutput, this.orphanedDevicesPageNo, this.orphanedDevicesPageSize), res => {
      this.orphanedDevices = this.svc.convertToOrphanedDevicesViewData(res);
      this.orphanedDevicesTotal = this.svc.convertToOrphanedDevicesTotal(res);
    }, () => {
      this.orphanedDevices = [];
      this.orphanedDevicesTotal = 0;
    });
  }

  getOrphanedDevicesByCategory(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.loadWidget(this.loaderNames.orphanedDevicesByCategory, this.svc.getOrphanedDevicesByCategory(filterFormOutput), res => {
      this.orphanedByCategory = this.svc.convertToOrphanedByCategoryViewData(res);
      this.orphanedByCategoryOptions = this.svc.convertToOrphanedByCategoryOptions(this.orphanedByCategory);
      this.orphanedByCategoryHasData = this.svc.hasOrphanedByCategoryData(this.orphanedByCategory);
    }, () => {
      this.orphanedByCategory = [];
      this.orphanedByCategoryOptions = {};
      this.orphanedByCategoryHasData = false;
    });
  }

  orphanedDevicesPageChange(pageNo: number) {
    if (this.orphanedDevicesPageNo === pageNo) {
      return;
    }
    this.orphanedDevicesPageNo = pageNo;
    this.getOrphanedDevices(this.getFilterFormOutput());
  }

  orphanedDevicesPageSizeChange(event: Event) {
    this.orphanedDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.orphanedDevicesPageNo = 1;
    this.getOrphanedDevices(this.getFilterFormOutput());
  }

  getIdleDevices(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.idleDevices = [];
    this.idleDevicesTotal = 0;
    this.loadWidget(this.loaderNames.idleDevices, this.svc.getIdleDevices(filterFormOutput, this.idleDevicesPageNo, this.idleDevicesPageSize), res => {
      this.idleDevices = this.svc.convertToIdleDevicesViewData(res);
      this.idleDevicesTotal = this.svc.convertToIdleDevicesTotal(res);
    }, () => {
      this.idleDevices = [];
      this.idleDevicesTotal = 0;
    });
  }

  getIdleDevicesByDuration(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.idleDurationRows = [];
    this.idleDurationOptions = {};
    this.idleDurationHasData = false;
    this.loadWidget(this.loaderNames.idleDuration, this.svc.getIdleDevicesByDuration(filterFormOutput), res => {
      this.idleDurationRows = this.svc.convertToIdleDurationViewData(res);
      this.idleDurationHasData = this.svc.hasIdleDurationData(this.idleDurationRows);
      this.idleDurationOptions = this.idleDurationHasData ? this.svc.convertToIdleDurationOptions(this.idleDurationRows) : {};
    }, () => {
      this.idleDurationRows = [];
      this.idleDurationOptions = {};
      this.idleDurationHasData = false;
    });
  }

  idleDevicesPageChange(pageNo: number) {
    if (this.idleDevicesPageNo === pageNo) {
      return;
    }
    this.idleDevicesPageNo = pageNo;
    this.getIdleDevices(this.getFilterFormOutput());
  }

  idleDevicesPageSizeChange(event: Event) {
    this.idleDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.idleDevicesPageNo = 1;
    this.getIdleDevices(this.getFilterFormOutput());
  }

  getRecentAlerts(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.recentAlertSummaryMetrics = [];
    this.recentAlerts = [];
    this.startRecentAlertsLoaders();
    this.svc.getRecentAlerts(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopRecentAlertsLoaders())
    ).subscribe(res => {
      this.recentAlertSummaryMetrics = this.svc.convertToRecentAlertSummaryMetricsViewData(res);
      this.recentAlerts = this.svc.convertToRecentAlertsViewData(res);
    }, () => {
      this.clearRecentAlertsViewData();
    });
  }

  private startRecentAlertsLoaders() {
    [
      this.loaderNames.recentAlertSummary,
      this.loaderNames.recentAlerts
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopRecentAlertsLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.recentAlertSummary,
        this.loaderNames.recentAlerts
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearRecentAlertsViewData() {
    this.recentAlertSummaryMetrics = [];
    this.recentAlerts = [];
  }

  private clearDashboardViewData() {
    this.clearInventorySummaryViewData();
    this.computeBreakdown = [];
    this.orphanedDevices = [];
    this.orphanedDevicesTotal = 0;
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.idleDevices = [];
    this.idleDevicesTotal = 0;
    this.idleDurationRows = [];
    this.idleDurationOptions = {};
    this.idleDurationHasData = false;
    this.clearRecentAlertsViewData();
  }

  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  getOrphanedStatusIconClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'success':
      case 'healthy':
      case 'ok':
      case 'up':
        return 'fas fa-check-circle text-success font-xs-sm';
      case 'warning':
      case 'warn':
      case 'unknown':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';
      case 'error':
      case 'critical':
      case 'down':
      case 'failed':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';
      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  trackByValue(index: number, option: PublicCloudFilterOption) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  openSummaryMetric(metric: PublicCloudSummaryMetric) {
    const routes: Record<PublicCloudInventorySummaryKey, any[]> = {
      cloud_accounts: this.linkRoutes.publicCloud,
      active_regions: this.linkRoutes.publicCloud,
      vms: this.linkRoutes.vmAll,
      services: this.linkRoutes.publicCloud,
      running_resources: this.linkRoutes.publicCloud,
      stopped_resources: this.linkRoutes.publicCloud
    };
    this.openRouteInNewTab(routes[metric.key] || this.linkRoutes.publicCloud);
  }

  openProviderDistribution(provider: PublicCloudProviderDistributionItem) {
    this.openProviderRoute(provider.key);
  }

  onProviderDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openProviderRoute(this.getProviderDistributionKey(params?.data?.key || params?.name));
    });
  }

  openComputeProvider(provider: PublicCloudComputeBreakdownProvider) {
    this.openRouteInNewTab(this.getProviderRoute(provider.name));
  }

  openComputeStat(provider: PublicCloudComputeBreakdownProvider, stat: PublicCloudComputeBreakdownStat) {
    if (stat.key === 'virtual_machine') {
      this.openRouteInNewTab(this.getProviderVmRoute(provider.name));
      return;
    }
    this.openRouteInNewTab(this.linkRoutes.kubernetes);
  }

  openOrphanedDevices() {
    this.openRouteInNewTab(this.linkRoutes.devices);
  }

  openOrphanedCategory(item: PublicCloudOrphanedCategoryItem) {
    this.openRouteInNewTab(this.getOrphanedCategoryRoute(item.category));
  }

  onOrphanedCategoryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(this.getOrphanedCategoryRoute(params?.data?.category || params?.name));
    });
  }

  openIdleDevice(device: PublicCloudIdleDeviceRow) {
    this.openRouteInNewTab(this.getIdleDeviceRoute(device));
  }

  openRecentAlerts() {
    this.openRouteInNewTab(this.linkRoutes.alerts);
  }

  showAlertDetails(alert: PublicCloudRecentAlert) {
    const alertId = alert?.uuid || alert?.id;
    if (alertId) {
      this.alertDetailSvc.showAlertDetails(alertId);
    }
  }

  private openRouteInNewTab(commands: any[]) {
    const routeUrl = this.router.serializeUrl(this.router.createUrlTree(commands));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private bindChartClick(chartInstance: any, handler: (params: any) => void) {
    if (!chartInstance?.on) {
      return;
    }
    if (chartInstance.off) {
      chartInstance.off('click');
    }
    chartInstance.on('click', handler);
  }

  private openProviderRoute(key: string) {
    this.openRouteInNewTab(this.getProviderRoute(key));
  }

  private getProviderRoute(value: string): any[] {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.provider.aws;
      case 'azure':
        return this.linkRoutes.provider.azure;
      case 'gcp':
        return this.linkRoutes.provider.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.provider.oracle;
      default:
        return this.linkRoutes.publicCloud;
    }
  }

  private getProviderVmRoute(value: string): any[] {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.providerVm.aws;
      case 'azure':
        return this.linkRoutes.providerVm.azure;
      case 'gcp':
        return this.linkRoutes.providerVm.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.providerVm.oracle;
      default:
        return this.linkRoutes.vmAll;
    }
  }

  private getProviderDistributionKey(value: string): PublicCloudProviderDistributionKey {
    const provider = this.getProviderKey(value);
    return provider === 'oracle' ? 'oci' : provider as PublicCloudProviderDistributionKey;
  }

  private getProviderKey(value: string): string {
    const normalizedValue = this.normalizeLinkText(value);
    if (normalizedValue.includes('aws') || normalizedValue.includes('amazon')) {
      return 'aws';
    }
    if (normalizedValue.includes('azure') || normalizedValue.includes('microsoft')) {
      return 'azure';
    }
    if (normalizedValue.includes('gcp') || normalizedValue.includes('google')) {
      return 'gcp';
    }
    if (normalizedValue.includes('oci') || normalizedValue.includes('oracle')) {
      return 'oracle';
    }
    if (normalizedValue.includes('custom')) {
      return 'custom';
    }
    return normalizedValue;
  }

  private getOrphanedCategoryRoute(category: string): any[] {
    const normalizedCategory = this.normalizeLinkText(category);
    if (normalizedCategory.includes('vm') || normalizedCategory.includes('virtual_machine')) {
      return this.linkRoutes.vmAll;
    }
    if (normalizedCategory.includes('bare_metal') || normalizedCategory.includes('baremetal')) {
      return this.linkRoutes.bmservers;
    }
    if (normalizedCategory.includes('gpu')) {
      return this.linkRoutes.gpu;
    }
    if (normalizedCategory.includes('storage') || normalizedCategory.includes('volume')) {
      return this.linkRoutes.storage;
    }
    return this.linkRoutes.devices;
  }

  private getIdleDeviceRoute(device: PublicCloudIdleDeviceRow): any[] {
    const resourceType = this.normalizeLinkText(device?.resourceType);
    if (this.isStorageResource(resourceType)) {
      return this.getStorageDetailRoute(device) || this.linkRoutes.storage;
    }
    if (this.isGpuResource(resourceType)) {
      return this.linkRoutes.gpu;
    }
    if (this.isVmResource(resourceType)) {
      return this.getVmDetailRoute(device) || this.getProviderVmRoute(this.getIdleDeviceProvider(device));
    }
    return this.linkRoutes.devices;
  }

  private getStorageDetailRoute(device: PublicCloudIdleDeviceRow): any[] | null {
    const deviceId = this.getIdleDeviceId(device);
    const monitoringRoute = this.getMonitoringRouteSegment(device);
    if (!deviceId || !monitoringRoute) {
      return null;
    }
    return monitoringRoute === 'zbx' ?
      ['/unitycloud/devices/storagedevices', deviceId, 'zbx', 'details'] :
      ['/unitycloud/devices/storagedevices', deviceId, 'obs', 'overview'];
  }

  private getVmDetailRoute(device: PublicCloudIdleDeviceRow): any[] | null {
    const provider = this.getIdleDeviceProvider(device);
    const deviceId = this.getIdleDeviceId(device);
    const monitoringRoute = this.getMonitoringRouteSegment(device);
    if (!deviceId || !monitoringRoute || provider !== 'custom') {
      return null;
    }
    return monitoringRoute === 'zbx' ?
      ['/unitycloud/devices/vms/custom', deviceId, 'zbx', 'details'] :
      ['/unitycloud/devices/vms/custom', deviceId, 'obs', 'overview'];
  }

  private getIdleDeviceId(device: PublicCloudIdleDeviceRow): string {
    return device?.deviceId || device?.resourceId || device?.uuid || device?.id || '';
  }

  private getIdleDeviceProvider(device: PublicCloudIdleDeviceRow): string {
    return this.getProviderKey([device?.provider, device?.cloudType, device?.resourceType].filter(value => !!value).join(' '));
  }

  private getMonitoringRouteSegment(device: PublicCloudIdleDeviceRow): 'obs' | 'zbx' | null {
    const monitoringType = this.normalizeLinkText(device?.monitoringType);
    if (device?.monitoring?.zabbix || monitoringType.includes('zabbix') || monitoringType.includes('zbx')) {
      return 'zbx';
    }
    if (device?.monitoring?.observium || monitoringType.includes('observium') || monitoringType.includes('obs')) {
      return 'obs';
    }
    return null;
  }

  private isVmResource(value: string): boolean {
    return value.includes('vm') || value.includes('virtual_machine') || value.includes('instance');
  }

  private isStorageResource(value: string): boolean {
    return value.includes('storage') || value.includes('volume') || value.includes('disk');
  }

  private isGpuResource(value: string): boolean {
    return value.includes('gpu');
  }

  private normalizeLinkText(value: string): string {
    return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
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
