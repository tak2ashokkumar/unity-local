/// <reference types="google.maps" />

import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DashboardMapWidgetService, WorldMapWidgetDCMap, WorldMapWidgetViewdata } from 'src/app/app-home/dashboard-map-widget/dashboard-map-widget.service';
import { WorldMapWidgetDatacenterLocation } from 'src/app/app-home/dashboard-map-widget/map-widget.type';
import { MapService } from 'src/app/map.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { environment } from 'src/environments/environment';
import { UnifiedAiopsCommandCentreService } from './unified-aiops-command-centre.service';
import {
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsFilterOption,
  UnifiedAiopsIdleDeviceRow,
  UnifiedAiopsIdleDurationItem,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsOrphanedCategoryItem,
  UnifiedAiopsOrphanedDeviceRow,
  UnifiedAiopsRecentAlert,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsTableRow,
  UnifiedAiopsTone
} from './unified-aiops-command-centre.type';

@Component({
  selector: 'unified-aiops-command-centre',
  templateUrl: './unified-aiops-command-centre.component.html',
  styleUrls: ['./unified-aiops-command-centre.component.scss'],
  providers: [UnifiedAiopsCommandCentreService, DatacenterService, DashboardMapWidgetService]
})
export class UnifiedAiopsCommandCentreComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private isDestroyed = false;
  private datacenterGeographyMapElementRef: ElementRef<HTMLElement> | null = null;
  private datacenterGeographyMap: google.maps.Map | null = null;
  private datacenterGeographyCluster: MarkerClusterer | null = null;
  private datacenterGeographyClusterInfoWindow: google.maps.InfoWindow | null = null;
  private datacenterGeographyClusterListeners: google.maps.MapsEventListener[] = [];
  private datacenterGeographyInfoWindowListeners: google.maps.MapsEventListener[] = [];
  private datacenterGeographyInfoWindows: google.maps.InfoWindow[] = [];
  private datacenterGeographyTilesLoaded: google.maps.MapsEventListener | null = null;
  private datacenterGeographyMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private datacenterGeographyZIndexMap: { [key: string]: number } = {};
  private datacenterGeographyOldZIndex: number | null = null;
  private datacenterGeographyAllLocations: WorldMapWidgetViewdata[] = [];
  private datacenterGeographiesLoaded = false;
  private readonly datacenterGeographyInitialZoom = 2.2;
  private readonly datacenterGeographyInitialCenter = { lat: 25.738611, lng: 0 };

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
  datacenterGeographiesMapAvailable = false;
  datacenterGeographyViewData: WorldMapWidgetViewdata[] = [];
  datacenterGeographyDcMap: WorldMapWidgetDCMap = {};
  datacenterInfrastructureMetrics: UnifiedAiopsMetric[] = [];
  kubernetesMetrics: UnifiedAiopsMetric[] = [];
  aiGpuMetrics: UnifiedAiopsMetric[] = [];
  applicationRows: UnifiedAiopsTableRow[] = [];
  serviceApplicationOptions: UnifiedAiopsFilterOption[] = [];
  selectedServiceApplicationId = '';
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
  orphanedDevices: UnifiedAiopsOrphanedDeviceRow[] = [];
  orphanedDevicesTotal = 0;
  orphanedDevicesPageNo = 1;
  orphanedDevicesPageSize = 10;
  orphanedByCategory: UnifiedAiopsOrphanedCategoryItem[] = [];
  orphanedByCategoryOptions: EChartsOption = {};
  orphanedByCategoryHasData = false;
  idleDevices: UnifiedAiopsIdleDeviceRow[] = [];
  idleDevicesTotal = 0;
  idleDevicesPageNo = 1;
  idleDevicesPageSize = 10;
  idleDurationRows: UnifiedAiopsIdleDurationItem[] = [];
  idleDurationOptions: EChartsOption = {};
  idleDurationHasData = false;
  recentAlertSummaryMetrics: UnifiedAiopsMetric[] = [];
  recentAlerts: UnifiedAiopsRecentAlert[] = [];
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
    datacenterGeographies: 'unifiedAiopsDatacenterGeographiesLoader',
    datacenterInfrastructure: 'unifiedAiopsDatacenterInfrastructureLoader',
    kubernetes: 'unifiedAiopsKubernetesLoader',
    aiGpu: 'unifiedAiopsAiGpuLoader',
    applications: 'unifiedAiopsApplicationsLoader',
    serviceApplications: 'unifiedAiopsServiceApplicationsLoader',
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
    orphanedDevices: 'unifiedAiopsOrphanedDevicesLoader',
    orphanedDevicesByCategory: 'unifiedAiopsOrphanedDevicesByCategoryLoader',
    idleDevices: 'unifiedAiopsIdleDevicesLoader',
    idleDuration: 'unifiedAiopsIdleDurationLoader',
    recentAlertSummary: 'unifiedAiopsRecentAlertSummaryLoader',
    recentAlerts: 'unifiedAiopsRecentAlertsLoader',
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
    private dashboardMapWidgetService: DashboardMapWidgetService,
    public mapSvc: MapService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private spinnerService: AppSpinnerService) { }

  @ViewChild('datacenterGeographyMap')
  set datacenterGeographyMapElement(element: ElementRef<HTMLElement> | undefined) {
    this.datacenterGeographyMapElementRef = element || null;
    if (element) {
      this.initializeDatacenterGeographyMap().then(() => this.addDatacenterGeographyMarkers());
    }
  }

  ngOnInit(): void {
    this.mapSvc.mapVisibilityChanged$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(showMaps => {
        this.datacenterGeographiesLoaded = false;
        if (showMaps && this.hasFilterFormData()) {
          this.getDatacenterGeographies(this.getFilterFormOutput());
        } else {
          this.datacenterGeographiesMapAvailable = false;
          this.datacenterGeographyAllLocations = [];
          this.datacenterGeographyViewData = [];
          this.datacenterGeographyDcMap = {};
          this.cleanupDatacenterGeographyMap();
        }
      });
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanupDatacenterGeographyMap();
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
    this.datacenterGeographiesLoaded = false;
    this.datacenterGeographiesMapAvailable = false;
    this.datacenterGeographyAllLocations = [];
    this.datacenterGeographyViewData = [];
    this.datacenterGeographyDcMap = {};
    this.cleanupDatacenterGeographyMap();
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
      this.getBusinessServices(filterFormOutput);
      this.getEmployeeMetrics(filterFormOutput);
      this.getGeoDistribution(filterFormOutput);
      this.getPrivateCloudCoverage(filterFormOutput);
      this.getPublicCloudCoverage(filterFormOutput);
      this.getDatacenterGeographies(filterFormOutput);
      this.getDatacenterInfrastructure(filterFormOutput);
      this.getKubernetesMetrics(filterFormOutput);
      this.getAiGpuMetrics(filterFormOutput);
      this.getApplicationRows(filterFormOutput);
      this.getServiceApplicationOptions(filterFormOutput);
      this.getDatabaseRows(filterFormOutput);
      this.getOsRows(filterFormOutput);
      this.getBandwidthBar(filterFormOutput);
      this.getBandwidthLine(filterFormOutput);
      this.getPlatformPerformance(filterFormOutput);
      this.getPerformanceMetrics(filterFormOutput);
      this.getDeviceAvailability(filterFormOutput);
      this.getAvailabilityCategory(filterFormOutput);
      this.getAlertTrend(filterFormOutput);
      this.getAlertReductionMetrics(filterFormOutput);
      this.getAlertResponseMetrics(filterFormOutput);
      this.getAlertSourceSankey(filterFormOutput);
      this.getAlertLifecycleSankey(filterFormOutput);
      this.getOrphanedDevices(filterFormOutput);
      this.getOrphanedDevicesByCategory(filterFormOutput);
      this.getIdleDevices(filterFormOutput);
      this.getIdleDevicesByDuration(filterFormOutput);
      this.getRecentAlertSummaryMetrics(filterFormOutput);
      this.getRecentAlerts(filterFormOutput);
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

  getDatacenterGeographies(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    if (!this.mapSvc.shouldShowMapWidgets()) {
      this.datacenterGeographiesLoaded = false;
      this.datacenterGeographiesMapAvailable = false;
      this.datacenterGeographyAllLocations = [];
      this.datacenterGeographyViewData = [];
      this.datacenterGeographyDcMap = {};
      this.cleanupDatacenterGeographyMap();
      return;
    }

    if (this.datacenterGeographiesLoaded) {
      this.applyDatacenterGeographyFilter(filterFormOutput);
      return;
    }

    this.datacenterGeographyViewData = [];
    this.datacenterGeographyDcMap = {};
    this.clearDatacenterGeographyMarkers();
    this.spinnerService.start(this.loaderNames.datacenterGeographies);

    this.mapSvc.loadMap().then(() => {
      if (this.isDestroyed) {
        this.spinnerService.stop(this.loaderNames.datacenterGeographies);
        return;
      }

      this.datacenterGeographiesMapAvailable = this.mapSvc.isAvailable();
      if (!this.datacenterGeographiesMapAvailable) {
        this.datacenterGeographiesLoaded = true;
        this.spinnerService.stop(this.loaderNames.datacenterGeographies);
        return;
      }

      this.dashboardMapWidgetService.getDatacenterSatus().pipe(
        takeUntil(this.ngUnsubscribe),
        tap(res => this.setDatacenterGeographyData(res, filterFormOutput)),
        switchMap(initialRes => this.dashboardMapWidgetService.syncDatacenterSatus().pipe(
          switchMap(() => this.dashboardMapWidgetService.getDatacenterSatus()),
          catchError(() => of(initialRes))
        )),
        finalize(() => setTimeout(() => this.spinnerService.stop(this.loaderNames.datacenterGeographies), 0))
      ).subscribe(res => {
        this.setDatacenterGeographyData(res, filterFormOutput);
      }, () => {
        this.datacenterGeographiesLoaded = true;
        this.datacenterGeographyAllLocations = [];
        this.applyDatacenterGeographyFilter(filterFormOutput);
      });
    });
  }

  private setDatacenterGeographyData(res: WorldMapWidgetDatacenterLocation[], filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.datacenterGeographiesLoaded = true;
    this.datacenterGeographyAllLocations = this.dashboardMapWidgetService.convertToViewdata(res || []);
    this.applyDatacenterGeographyFilter(filterFormOutput);
  }

  private applyDatacenterGeographyFilter(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    const selectedDatacenterIds = filterFormOutput?.datacenters || [];
    const selectedSet = new Set(selectedDatacenterIds);
    const showAllDatacenters = this.isAllDatacenterFilterSelected(selectedDatacenterIds);
    const hasFilterMatches = this.hasDatacenterGeographyFilterMatches(selectedSet);

    if (!selectedDatacenterIds.length) {
      this.datacenterGeographyViewData = [];
    } else if (showAllDatacenters || (this.datacenterGeographyAllLocations.length && !hasFilterMatches)) {
      this.datacenterGeographyViewData = this.datacenterGeographyAllLocations;
    } else {
      this.datacenterGeographyViewData = (this.datacenterGeographyAllLocations || [])
        .map(location => {
          const datacenters = (location.datacenters || []).filter(dc => selectedSet.has(dc.uuid));
          return { ...location, datacenters } as WorldMapWidgetViewdata;
        })
        .filter(location => !!location.datacenters.length);
    }

    this.datacenterGeographyDcMap = this.datacenterGeographyViewData.reduce((result: WorldMapWidgetDCMap, location) => {
      result[this.getDatacenterGeographyLocationKey(location)] = (location.datacenters || []).map(dc => dc.name);
      return result;
    }, {});

    if (this.datacenterGeographyViewData.length) {
      this.initializeDatacenterGeographyMap().then(() => this.addDatacenterGeographyMarkers());
    } else {
      this.cleanupDatacenterGeographyMap();
    }
  }

  private isAllDatacenterFilterSelected(selectedDatacenterIds: string[]): boolean {
    const availableDatacenterIds = (this.datacenterOptions || [])
      .map(option => option?.value)
      .filter((value: string | undefined) => !!value) as string[];

    return !!availableDatacenterIds.length
      && availableDatacenterIds.every(value => selectedDatacenterIds.includes(value));
  }

  private hasDatacenterGeographyFilterMatches(selectedSet: Set<string>): boolean {
    return (this.datacenterGeographyAllLocations || []).some(location =>
      (location.datacenters || []).some(dc => selectedSet.has(dc.uuid))
    );
  }

  private async initializeDatacenterGeographyMap() {
    if (this.datacenterGeographyMap || !this.datacenterGeographyMapElementRef || !this.datacenterGeographiesMapAvailable) {
      return;
    }

    const mapsLibrary = await this.mapSvc.importMapsLibrary();
    if (!mapsLibrary) {
      this.datacenterGeographiesMapAvailable = false;
      return;
    }
    const { Map } = mapsLibrary;
    if (this.isDestroyed || !this.datacenterGeographyMapElementRef) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const map = new Map(this.datacenterGeographyMapElementRef.nativeElement, {
        center: this.datacenterGeographyInitialCenter,
        zoom: this.datacenterGeographyInitialZoom,
        minZoom: 2.2,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        mapId: environment.gmId
      });
      this.datacenterGeographyMap = map;
      this.datacenterGeographyClusterInfoWindow = new google.maps.InfoWindow();
      this.datacenterGeographyTilesLoaded = map.addListener('tilesloaded', () => {
        this.addDatacenterGeographyMarkers();
        this.datacenterGeographyTilesLoaded?.remove();
        this.datacenterGeographyTilesLoaded = null;
      });
    });
  }

  private async addDatacenterGeographyMarkers() {
    if (!this.datacenterGeographyMap || !this.datacenterGeographyViewData.length) {
      return;
    }

    this.clearDatacenterGeographyMarkers();
    const markerLibrary = await this.mapSvc.importMarkerLibrary();
    if (!markerLibrary) return;
    const { AdvancedMarkerElement } = markerLibrary;
    if (this.isDestroyed || !this.datacenterGeographyMap) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const map = this.datacenterGeographyMap;
      if (!map) {
        return;
      }

      this.datacenterGeographyViewData.forEach(location => {
        const position = this.getDatacenterGeographyPosition(location);
        if (!position) {
          return;
        }

        const marker = new AdvancedMarkerElement({
          position,
          map,
          title: location.location,
          content: this.mapSvc.createMarkerContent(location)
        });
        (marker as any).unityLocationKey = this.getDatacenterGeographyLocationKey(location);

        const infoWindow = new google.maps.InfoWindow({
          content: this.dashboardMapWidgetService.createInfoWindowContent(location),
          position
        });
        infoWindow.open({
          map,
          anchor: marker
        });

        this.datacenterGeographyInfoWindows.push(infoWindow);
        this.datacenterGeographyMarkers.push(marker);
        this.datacenterGeographyInfoWindowListeners.push(infoWindow.addListener('domready', () => this.bindDatacenterGeographyPopover(infoWindow)));
      });

      this.datacenterGeographyCluster = new MarkerClusterer({
        map,
        markers: this.datacenterGeographyMarkers as any
      });

      this.datacenterGeographyClusterListeners.push(
        this.datacenterGeographyCluster.addListener('mouseover', (cluster: any) => this.openDatacenterGeographyClusterPopover(cluster)),
        this.datacenterGeographyCluster.addListener('mouseout', () => this.datacenterGeographyClusterInfoWindow?.close()),
        this.datacenterGeographyCluster.addListener('click', () => this.datacenterGeographyClusterInfoWindow?.close())
      );
    });
  }

  private openDatacenterGeographyClusterPopover(cluster: any) {
    if (!this.datacenterGeographyClusterInfoWindow || !this.datacenterGeographyMap) {
      return;
    }

    let content = '<div style="font-weight:500;">Available Datacenters</div><br>';
    (cluster.markers || []).forEach((marker: any) => {
      const datacenters = this.datacenterGeographyDcMap[marker.unityLocationKey] || [];
      datacenters.forEach(datacenter => {
        content = `${content}<span>${datacenter}</span><br>`;
      });
    });

    this.datacenterGeographyClusterInfoWindow.setContent(content);
    this.datacenterGeographyClusterInfoWindow.setPosition(cluster.position || cluster.getCenter?.());
    this.datacenterGeographyClusterInfoWindow.open(this.datacenterGeographyMap);
  }

  private bindDatacenterGeographyPopover(infoWindow: google.maps.InfoWindow) {
    const position = infoWindow.getPosition();
    if (!position) {
      return;
    }

    const id = `${position.lat()}_${position.lng()}`;
    const contentElement = document.getElementById(id);
    const infoWindowShell = contentElement?.closest('.gm-style-iw-a')?.parentElement as HTMLElement;
    if (infoWindowShell) {
      this.datacenterGeographyZIndexMap[id] = Number.parseInt(infoWindowShell.style.getPropertyValue('z-index'), 10) || 0;
    }

    contentElement?.addEventListener('mouseover', () => {
      const high = Math.max(...Object.keys(this.datacenterGeographyZIndexMap).map(key => this.datacenterGeographyZIndexMap[key]), 0);
      this.datacenterGeographyOldZIndex = this.datacenterGeographyZIndexMap[id] || 0;
      infoWindow.setZIndex(high + 1);
    });

    contentElement?.addEventListener('mouseout', () => {
      infoWindow.setZIndex(this.datacenterGeographyOldZIndex || 0);
      this.datacenterGeographyOldZIndex = null;
    });
  }

  private getDatacenterGeographyPosition(location: WorldMapWidgetViewdata): google.maps.LatLngLiteral | null {
    const lat = Number(location.lat);
    const lng = Number(location.long);
    if (!isFinite(lat) || !isFinite(lng)) {
      return null;
    }
    return { lat, lng };
  }

  private getDatacenterGeographyLocationKey(location: WorldMapWidgetViewdata): string {
    return `${location.lat}_${location.long}`;
  }

  private clearDatacenterGeographyMarkers() {
    this.datacenterGeographyClusterListeners.forEach(listener => listener.remove());
    this.datacenterGeographyClusterListeners = [];
    this.datacenterGeographyInfoWindowListeners.forEach(listener => listener.remove());
    this.datacenterGeographyInfoWindowListeners = [];
    this.datacenterGeographyInfoWindows.forEach(infoWindow => infoWindow.close());
    this.datacenterGeographyInfoWindows = [];
    this.datacenterGeographyMarkers.forEach(marker => marker.map = null);
    this.datacenterGeographyMarkers = [];
    this.datacenterGeographyZIndexMap = {};
    this.datacenterGeographyCluster?.clearMarkers();
    this.datacenterGeographyCluster = null;
    this.datacenterGeographyClusterInfoWindow?.close();
  }

  private cleanupDatacenterGeographyMap() {
    this.clearDatacenterGeographyMarkers();
    this.datacenterGeographyTilesLoaded?.remove();
    this.datacenterGeographyTilesLoaded = null;
    this.datacenterGeographyMapElementRef = null;
    this.datacenterGeographyMap = null;
    this.datacenterGeographyClusterInfoWindow = null;
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

  getServiceApplicationOptions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.loadWidget(this.loaderNames.serviceApplications, this.svc.getServiceApplicationOptions(), res => {
      this.serviceApplicationOptions = res || [];
      if (!this.serviceApplicationOptions.some(option => option.value === this.selectedServiceApplicationId)) {
        this.selectedServiceApplicationId = this.serviceApplicationOptions[0]?.value || '';
      }
      this.getServiceRows(filterFormOutput);
    }, () => {
      this.serviceApplicationOptions = [];
      this.selectedServiceApplicationId = '';
      this.serviceRows = [];
    });
  }

  onServiceApplicationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedServiceApplicationId = target?.value || '';
    this.getServiceRows(this.getFilterFormOutput());
  }

  getServiceRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.serviceRows = [];
    if (!this.selectedServiceApplicationId) {
      return;
    }
    this.loadWidget(this.loaderNames.services, this.svc.getServiceRows(filterFormOutput, this.selectedServiceApplicationId), res => {
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

  getOrphanedDevices(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
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

  getOrphanedDevicesByCategory(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.loadWidget(this.loaderNames.orphanedDevicesByCategory, this.svc.getOrphanedDevicesByCategory(filterFormOutput), res => {
      this.orphanedByCategory = this.svc.convertToOrphanedByCategoryViewData(res);
      this.orphanedByCategoryHasData = this.svc.hasOrphanedByCategoryData(this.orphanedByCategory);
      this.orphanedByCategoryOptions = this.orphanedByCategoryHasData ? this.svc.convertToOrphanedByCategoryOptions(this.orphanedByCategory) : {};
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

  getIdleDevices(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
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

  getIdleDevicesByDuration(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
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

  getRecentAlertSummaryMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.recentAlertSummaryMetrics = [];
    this.loadWidget(this.loaderNames.recentAlertSummary, this.svc.getRecentAlertSummaryMetrics(filterFormOutput), res => {
      this.recentAlertSummaryMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.recentAlertSummaryMetrics = [];
    });
  }

  getRecentAlerts(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.recentAlerts = [];
    this.loadWidget(this.loaderNames.recentAlerts, this.svc.getRecentAlerts(filterFormOutput), res => {
      this.recentAlerts = this.svc.convertToRecentAlertsViewData(res);
    }, () => {
      this.recentAlerts = [];
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

  getRecentAlertSeverityTone(severity: string): UnifiedAiopsTone {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'muted';
    }
  }

  getIdleStatusIconClass(status: string): string {
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

  hasChartData(options: EChartsOption): boolean {
    const chartOptions = options as any;
    if (!chartOptions || !Object.keys(chartOptions).length) {
      return false;
    }

    if (this.hasSeriesData(chartOptions.series)) {
      return true;
    }

    const graphic = chartOptions.graphic;
    if (Array.isArray(graphic)) {
      return !!graphic.length;
    }
    return !!graphic && !!Object.keys(graphic).length;
  }

  private hasSeriesData(series: any): boolean {
    const seriesItems = Array.isArray(series) ? series : series ? [series] : [];
    return seriesItems.some(item => {
      if (!item) {
        return false;
      }
      const data = item.data;
      if (Array.isArray(data)) {
        return !!data.length;
      }
      return !!data && typeof data === 'object' && !!Object.keys(data).length;
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByValue(_: number, option: UnifiedAiopsFilterOption): string {
    return option.value;
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
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
