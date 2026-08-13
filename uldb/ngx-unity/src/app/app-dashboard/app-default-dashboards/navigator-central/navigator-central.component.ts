/// <reference types="google.maps" />

import { Location } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import * as moment from 'moment';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DashboardMapWidgetService, WorldMapWidgetDCMap, WorldMapWidgetViewdata } from 'src/app/app-home/dashboard-map-widget/dashboard-map-widget.service';
import { WorldMapWidgetDatacenterLocation } from 'src/app/app-home/dashboard-map-widget/map-widget.type';
import { MapService } from 'src/app/map.service';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { environment } from 'src/environments/environment';
import { NavigatorCentralService } from './navigator-central.service';
import {
  UNIFIED_AIOPS_ALERT_DEFAULT_VIEW_BY,
  UNIFIED_AIOPS_ALERT_DEVICE_TYPE_OPTIONS,
  UNIFIED_AIOPS_ALERT_SEVERITY_TYPE_OPTIONS,
  UNIFIED_AIOPS_ALERT_VIEW_BY_OPTIONS,
  UNIFIED_AIOPS_ALL_SELECTED_VALUE,
  UNIFIED_AIOPS_BUSINESS_SERVICE_STATUS_LEGEND,
  UNIFIED_AIOPS_EMPLOYEE_EXPERIENCE_EXTERNAL_URL,
  UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_COLORS,
  UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_OPTIONS,
  UNIFIED_AIOPS_NEW_VM_CLOUD_OPTIONS,
  UNIFIED_AIOPS_NEW_VM_STATUS_OPTIONS,
  UNIFIED_AIOPS_NEW_VM_STATE_OPTIONS,
  UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STAGE_OPTIONS,
  UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STATUS_OPTIONS,
  UNIFIED_AIOPS_TIME_RANGE_DEFAULT,
  UNIFIED_AIOPS_TIME_RANGE_OPTIONS
} from './navigator-central.const';
import {
  UnifiedAiopsAvailabilityCategoryRow,
  UnifiedAiopsAvailabilityCategorySummary,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsAlertsDateRange,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsCoverageGroup,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsDeviceTypeOption,
  UnifiedAiopsDiscoveryCoverageRow,
  UnifiedAiopsDiscoverySummary,
  UnifiedAiopsExecutiveView,
  UnifiedAiopsPrivateCloudGeoSite,
  UnifiedAiopsPrivateCloudGeoView,
  UnifiedAiopsNewVmRow,
  UnifiedAiopsNewVmsFilter,
  UnifiedAiopsFilterOption,
  UnifiedAiopsViewByOption,
  UnifiedAiopsIdleDeviceRow,
  UnifiedAiopsIdleDurationItem,
  UnifiedAiopsAlertSegregationSummary,
  UnifiedAiopsMetric,
  UnifiedAiopsOrphanedCategoryItem,
  UnifiedAiopsOrphanedDeviceRow,
  UnifiedAiopsRecentAlert,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsStackItem,
  UnifiedAiopsTableRow,
  UnifiedAiopsTone
} from './navigator-central.type';

interface UnifiedAiopsFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

interface UnifiedAiopsWidgetLoadingState {
  summaryMetrics: boolean;
  discovery: boolean;
  alertSegregation: boolean;
  businessServices: boolean;
  geoDistribution: boolean;
  privateCloudCoverage: boolean;
  publicCloudCoverage: boolean;
  datacenterGeographies: boolean;
  privateCloudGeo: boolean;
  newVms: boolean;
  applications: boolean;
  serviceApplications: boolean;
  services: boolean;
  databases: boolean;
  os: boolean;
  bandwidthBar: boolean;
  bandwidthLine: boolean;
  platformPerformance: boolean;
  performanceMetrics: boolean;
  deviceAvailability: boolean;
  availabilityCategory: boolean;
  alertTrend: boolean;
  alertReduction: boolean;
  alertResponse: boolean;
  alertSourceSankey: boolean;
  alertLifecycleSankey: boolean;
  orphanedDevices: boolean;
  orphanedByCategory: boolean;
  idleDevices: boolean;
  idleDuration: boolean;
  recentAlertSummary: boolean;
  recentAlerts: boolean;
  remediationDonut: boolean;
  remediationActions: boolean;
  remediationSummary: boolean;
  remediationMetrics: boolean;
}

@Component({
  selector: 'navigator-central',
  templateUrl: './navigator-central.component.html',
  styleUrls: ['./navigator-central.component.scss'],
  providers: [NavigatorCentralService, DatacenterService, DashboardMapWidgetService]
})
export class NavigatorCentralComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private isDestroyed = false;
  private readonly recentAlertsDisplayLimit = 10;
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
  private privateCloudGeoMapElementRef: ElementRef<HTMLElement> | null = null;
  private privateCloudGeoMap: google.maps.Map | null = null;
  private privateCloudGeoCluster: MarkerClusterer | null = null;
  private privateCloudGeoClusterInfoWindow: google.maps.InfoWindow | null = null;
  private privateCloudGeoHoverInfoWindow: google.maps.InfoWindow | null = null;
  private privateCloudGeoClusterListeners: google.maps.MapsEventListener[] = [];
  private privateCloudGeoInfoWindowListeners: google.maps.MapsEventListener[] = [];
  private privateCloudGeoInfoWindows: google.maps.InfoWindow[] = [];
  private privateCloudGeoTilesLoaded: google.maps.MapsEventListener | null = null;
  private privateCloudGeoMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private privateCloudGeoZIndexMap: { [key: string]: number } = {};
  private privateCloudGeoOldZIndex: number | null = null;
  private privateCloudGeoAllSites: UnifiedAiopsPrivateCloudGeoSite[] = [];
  private privateCloudGeoLoaded = false;
  private privateCloudGeoNameMap: { [key: string]: string[] } = {};
  private readonly privateCloudGeoInitialZoom = 2.2;
  private readonly privateCloudGeoInitialCenter = { lat: 25.738611, lng: 0 };
  private readonly widgetLoadingKeys: Array<keyof UnifiedAiopsWidgetLoadingState> = [
    'summaryMetrics',
    'discovery',
    'alertSegregation',
    'businessServices',
    'geoDistribution',
    'privateCloudCoverage',
    'publicCloudCoverage',
    'datacenterGeographies',
    'privateCloudGeo',
    'newVms',
    'applications',
    'serviceApplications',
    'services',
    'databases',
    'os',
    'bandwidthBar',
    'bandwidthLine',
    'platformPerformance',
    'performanceMetrics',
    'deviceAvailability',
    'availabilityCategory',
    'alertTrend',
    'alertReduction',
    'alertResponse',
    'alertSourceSankey',
    'alertLifecycleSankey',
    'orphanedDevices',
    'orphanedByCategory',
    'idleDevices',
    'idleDuration',
    'recentAlertSummary',
    'recentAlerts',
    'remediationDonut',
    'remediationActions',
    'remediationSummary',
    'remediationMetrics'
  ];
  private readonly linkRoutes = {
    devices: ['/unitycloud/devices'],
    vmAll: ['/unitycloud/devices/vms/allvms'],
    vmProvider: {
      aws: ['/unitycloud/devices/vms/aws'],
      azure: ['/unitycloud/devices/vms/azure'],
      gcp: ['/unitycloud/devices/vms/gcp'],
      oracle: ['/unitycloud/devices/vms/oracle']
    },
    hypervisors: ['/unitycloud/devices/hypervisors'],
    kubernetes: ['/unitycloud/devices/containers'],
    bmservers: ['/unitycloud/devices/bmservers'],
    storage: ['/unitycloud/devices/storagedevices'],
    databases: ['/unitycloud/devices/databases'],
    switches: ['/unitycloud/devices/switches'],
    firewalls: ['/unitycloud/devices/firewalls'],
    loadbalancers: ['/unitycloud/devices/loadbalancers'],
    otherDevices: ['/unitycloud/devices/otherdevices'],
    networkControllers: ['/unitycloud/devices/network-controllers'],
    datacenter: ['/unitycloud/datacenter'],
    pccloud: ['/unitycloud/pccloud'],
    publicCloudProvider: {
      aws: ['/unitycloud/publiccloud/aws'],
      azure: ['/unitycloud/publiccloud/azure'],
      gcp: ['/unitycloud/publiccloud/gcp'],
      oracle: ['/unitycloud/publiccloud/oracle']
    },
    publicCloud: ['/unitycloud/publiccloud'],
    businessService: ['/unitycloud/business-service'],
    applications: ['/unitycloud/applications'],
    alerts: ['/services/aiml-event-mgmt/alerts'],
    aiObservability: ['/services/ai-observability'],
    gpu: ['/services/ai-observability/gpu/summary'],
    llm: ['/services/ai-observability/llm/summary'],
    vectorDb: ['/services/ai-observability/vector-db/summary'],
    autoRemediation: ['/setup/monitoring/auto-remediation']
  };

  filterForm: FormGroup;
  alertsFilterForm: FormGroup;
  readonly alertsDeviceTypeOptions: UnifiedAiopsDeviceTypeOption[] = UNIFIED_AIOPS_ALERT_DEVICE_TYPE_OPTIONS;
  readonly alertsViewByOptions: UnifiedAiopsViewByOption[] = UNIFIED_AIOPS_ALERT_VIEW_BY_OPTIONS;
  readonly alertsSeverityTypeOptions: UnifiedAiopsFilterOption[] = UNIFIED_AIOPS_ALERT_SEVERITY_TYPE_OPTIONS;
  alertsSourceTypeOptions: UnifiedAiopsFilterOption[] = [];
  private alertsSourceTypesSeeded = false;
  private alertsFilterSnapshot = '';
  private alertsLoadedCriteriaKey = '';
  readonly alertsDefaultViewBy = UNIFIED_AIOPS_ALERT_DEFAULT_VIEW_BY;
  // Shared Time Range options drive both the global (page-level) filter and the Alerts local filter.
  readonly timeRangeOptions = UNIFIED_AIOPS_TIME_RANGE_OPTIONS;
  readonly timeRangeDefault = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
  // Global Time Range live selection (applied to every widget only on Apply).
  selectedTimeRange: string = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
  private selectedTimeRangeDates: UnifiedAiopsAlertsDateRange | null = null;
  // Event & Alert Analytics local Time Range (re-synced from the global on Apply, then overridable).
  alertsTimeRange: string = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
  alertsTimeRangeDefault: string | DateRangeOption = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
  alertsTimeRangeReady = true;
  private alertsTimeRangeDates: UnifiedAiopsAlertsDateRange | null = null;
  datacenterOptions: UnifiedAiopsFilterOption[] = [];
  cloudOptions: UnifiedAiopsCloudFilterOption[] = [];
  refreshedText = '';
  appliedFilterCriteria: UnifiedAiopsDashboardFilterCriteria = {
    datacenters: [],
    clouds: [],
    timeRange: UNIFIED_AIOPS_TIME_RANGE_DEFAULT
  };

  executiveView: UnifiedAiopsExecutiveView | null = null;
  discoveryRows: UnifiedAiopsDiscoveryCoverageRow[] = [];
  discoveryDisplayRows: UnifiedAiopsDiscoveryCoverageRow[] = [];
  discoverySummary: UnifiedAiopsDiscoverySummary = { discovered: '0', monitored: '0', coverage: 'NA' };
  discoveryOptions: EChartsOption = {};
  // Dropdown options come from the default (All) response; value = raw API slug, label = Title-cased name.
  // Selecting one re-fetches that category's sub-levels via the device_category param.
  discoveryCategoryOptions: UnifiedAiopsFilterOption[] = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
  selectedDiscoveryCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  alertSegregationItems: UnifiedAiopsStackItem[] = [];
  alertSegregationDisplayItems: UnifiedAiopsStackItem[] = [];
  alertSegregationOptions: EChartsOption = {};
  alertSegregationSummary: UnifiedAiopsAlertSegregationSummary = { critical: '0', warning: '0', info: '0' };
  alertSegregationCategoryOptions: UnifiedAiopsFilterOption[] = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
  selectedAlertSegregationCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  businessServices: UnifiedAiopsBusinessService[] = [];
  readonly businessServiceLegend = UNIFIED_AIOPS_BUSINESS_SERVICE_STATUS_LEGEND;
  geoHeatmapOptions: EChartsOption = {};
  privateCloudCoverage: UnifiedAiopsCoverageCard[] = [];
  publicCloudCoverageGroups: UnifiedAiopsCoverageGroup[] = [];
  privateCloudCoverageTotal = '0';
  publicCloudCoverageTotal = '0';
  datacenterGeographiesMapAvailable = false;
  datacenterGeographyViewData: WorldMapWidgetViewdata[] = [];
  datacenterGeographyDcMap: WorldMapWidgetDCMap = {};
  privateCloudGeoMapAvailable = false;
  privateCloudGeoSites: UnifiedAiopsPrivateCloudGeoSite[] = [];
  privateCloudGeoView: UnifiedAiopsPrivateCloudGeoView | null = null;
  readonly privateCloudGeoPlatformOptions = UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_OPTIONS;
  selectedPrivateCloudPlatform: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  newVms: UnifiedAiopsNewVmRow[] = [];
  newVmsTotal = 0;
  newVmsPageNo = 1;
  newVmsPageSize = 10;
  newVmsLoaded = false;
  newVmsSearch = '';
  selectedNewVmCloud: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  selectedNewVmStatus: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  selectedNewVmState: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  selectedNewVmStage: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  selectedNewVmStageStatus: string = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  readonly newVmCloudOptions = UNIFIED_AIOPS_NEW_VM_CLOUD_OPTIONS;
  readonly newVmStatusOptions = UNIFIED_AIOPS_NEW_VM_STATUS_OPTIONS;
  readonly newVmStateOptions = UNIFIED_AIOPS_NEW_VM_STATE_OPTIONS;
  readonly newVmLifecycleStageOptions = UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STAGE_OPTIONS;
  readonly newVmLifecycleStatusOptions = UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STATUS_OPTIONS;
  private newVmsSearchTimer: any = null;
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
  availabilityCategorySummary: UnifiedAiopsAvailabilityCategorySummary = {
    up: 'NA',
    down: 'NA',
    unknown: 'NA'
  };
  availabilityCategoryRows: UnifiedAiopsAvailabilityCategoryRow[] = [];
  availabilityCategoryDisplayRows: UnifiedAiopsAvailabilityCategoryRow[] = [];
  // Dropdown options come from the default (All) response; value = raw API slug, label = Title-cased name.
  availabilityCategoryFilterOptions: UnifiedAiopsFilterOption[] = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
  selectedAvailabilityCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
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
  recentAlertSummaryMetrics: UnifiedAiopsMetric[] = [
    { label: 'Critical Alerts', value: '0', tone: 'danger', hasData: false },
    { label: 'Warning Alerts', value: '0', tone: 'warning', hasData: false },
    { label: 'Info Alerts', value: '0', tone: 'info', hasData: false }
  ];
  recentAlerts: UnifiedAiopsRecentAlert[] = [];
  remediationDonutOptions: EChartsOption = {};
  remediationActionsOptions: EChartsOption = {};
  remediationSummary: UnifiedAiopsMetric[] = [];
  remediationMetrics: UnifiedAiopsRemediationMetric[] = [];
  widgetLoading: UnifiedAiopsWidgetLoadingState = {
    summaryMetrics: false,
    discovery: false,
    alertSegregation: false,
    businessServices: false,
    geoDistribution: false,
    privateCloudCoverage: false,
    publicCloudCoverage: false,
    datacenterGeographies: false,
    privateCloudGeo: false,
    newVms: false,
    applications: false,
    serviceApplications: false,
    services: false,
    databases: false,
    os: false,
    bandwidthBar: false,
    bandwidthLine: false,
    platformPerformance: false,
    performanceMetrics: false,
    deviceAvailability: false,
    availabilityCategory: false,
    alertTrend: false,
    alertReduction: false,
    alertResponse: false,
    alertSourceSankey: false,
    alertLifecycleSankey: false,
    orphanedDevices: false,
    orphanedByCategory: false,
    idleDevices: false,
    idleDuration: false,
    recentAlertSummary: false,
    recentAlerts: false,
    remediationDonut: false,
    remediationActions: false,
    remediationSummary: false,
    remediationMetrics: false
  };

  loaderNames = {
    filters: 'unifiedAiopsFiltersLoader',
    summaryMetrics: 'unifiedAiopsSummaryMetricsLoader',
    discovery: 'unifiedAiopsDiscoveryLoader',
    alertSegregation: 'unifiedAiopsAlertSegregationLoader',
    businessServices: 'unifiedAiopsBusinessServicesLoader',
    geoDistribution: 'unifiedAiopsGeoDistributionLoader',
    privateCloudCoverage: 'unifiedAiopsPrivateCloudCoverageLoader',
    publicCloudCoverage: 'unifiedAiopsPublicCloudCoverageLoader',
    datacenterGeographies: 'unifiedAiopsDatacenterGeographiesLoader',
    privateCloudGeo: 'unifiedAiopsPrivateCloudGeoLoader',
    newVms: 'unifiedAiopsNewVmsLoader',
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

  alertsDeviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'type',
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    maxHeight: '240px'
  };

  // Per-filter "All X" summary text for the Alerts widget multiselects (matches the design).
  alertsSourceTypeTexts: IMultiSelectTexts = { ...this.multiselectTexts, defaultTitle: 'All Source', allSelected: 'All Source' };
  alertsSeverityTypeTexts: IMultiSelectTexts = { ...this.multiselectTexts, defaultTitle: 'All Severity', allSelected: 'All Severity' };
  alertsDatacenterTexts: IMultiSelectTexts = { ...this.multiselectTexts, defaultTitle: 'All Datacenter', allSelected: 'All Datacenter' };
  alertsCloudTexts: IMultiSelectTexts = { ...this.multiselectTexts, defaultTitle: 'All Cloud', allSelected: 'All Cloud' };
  alertsDeviceTexts: IMultiSelectTexts = { ...this.multiselectTexts, defaultTitle: 'All Devices', allSelected: 'All Devices' };

  constructor(private svc: NavigatorCentralService,
    private dashboardMapWidgetService: DashboardMapWidgetService,
    public mapSvc: MapService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private spinnerService: AppSpinnerService,
    private userInfoService: UserInfoService,
    private alertDetailSvc: AimlAlertDetailsService) { }

  @ViewChild('datacenterGeographyMap')
  set datacenterGeographyMapElement(element: ElementRef<HTMLElement> | undefined) {
    this.datacenterGeographyMapElementRef = element || null;
    if (element) {
      this.initializeDatacenterGeographyMap().then(() => this.addDatacenterGeographyMarkers());
    }
  }

  @ViewChild('privateCloudGeoMap')
  set privateCloudGeoMapElement(element: ElementRef<HTMLElement> | undefined) {
    this.privateCloudGeoMapElementRef = element || null;
    if (element) {
      this.initializePrivateCloudGeoMap().then(() => this.addPrivateCloudGeoMarkers());
    }
  }

  ngOnInit(): void {
    this.mapSvc.mapVisibilityChanged$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(showMaps => {
        this.datacenterGeographiesLoaded = false;
        this.privateCloudGeoLoaded = false;
        if (showMaps && this.hasFilterFormData()) {
          this.getDatacenterGeographies(this.appliedFilterCriteria);
          this.getPrivateCloudGeo(this.appliedFilterCriteria);
        } else {
          this.datacenterGeographiesMapAvailable = false;
          this.datacenterGeographyAllLocations = [];
          this.datacenterGeographyViewData = [];
          this.datacenterGeographyDcMap = {};
          this.cleanupDatacenterGeographyMap();
          this.privateCloudGeoMapAvailable = false;
          this.privateCloudGeoAllSites = [];
          this.privateCloudGeoSites = [];
          this.privateCloudGeoNameMap = {};
          this.cleanupPrivateCloudGeoMap();
        }
      });
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanupDatacenterGeographyMap();
    this.cleanupPrivateCloudGeoMap();
    if (this.newVmsSearchTimer) {
      clearTimeout(this.newVmsSearchTimer);
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** Applies the current filter form output to every Unified AIOps widget request. */
  applyFilters() {
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.newVmsPageNo = 1;
    this.updateAppliedFilterCriteria();
    this.loadData();
  }

  /** Captures the global Time Range selection (named period or custom range). Applied to widgets only on Apply. */
  onTimeRangeChange(event: { period?: string; from?: string | Date; to?: string | Date }) {
    this.selectedTimeRange = event?.period || this.selectedTimeRange;
    this.selectedTimeRangeDates = event?.period === 'custom'
      ? { from: this.formatTimeRangeDate(event?.from, false), to: this.formatTimeRangeDate(event?.to, true) }
      : null;
  }

  /** Reloads all filter options and recreates the filter form only after datacenter data is ready. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads datacenter options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.refreshedText = this.getCurrentRefreshedText();
    this.spinnerService.start(this.loaderNames.filters);
    forkJoin({
      datacenters: this.svc.getDatacenters().pipe(catchError(() => of(this.svc.getFallbackDatacenters()))),
      clouds: this.svc.getClouds().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterOptions = res.datacenters || [];
      this.cloudOptions = res.clouds || [];
      this.buildFilterForm();
      this.updateAppliedFilterCriteria();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.datacenterOptions = this.svc.getFallbackDatacenters();
      this.cloudOptions = [];
      this.buildFilterForm();
      this.updateAppliedFilterCriteria();
      this.stopFilterLoader();
      this.loadData();
    });
  }

  /** Creates the filter form with all currently loaded datacenter options selected by default. */
  private buildFilterForm() {
    this.filterForm = this.svc.buildFilterForm(this.datacenterOptions, this.cloudOptions);
    this.onTimeRangeChange({ period: this.selectedTimeRange });
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterForm = null;
    this.alertsFilterForm = null;
    this.alertsTimeRangeDates = null;
    this.alertsTimeRange = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
    this.alertsTimeRangeDefault = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
    this.alertsTimeRangeReady = true;
    this.selectedTimeRange = UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
    this.selectedTimeRangeDates = null;
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.datacenterOptions = [];
    this.cloudOptions = [];
    this.appliedFilterCriteria = {
      datacenters: [],
      clouds: [],
      timeRange: UNIFIED_AIOPS_TIME_RANGE_DEFAULT
    };
    this.datacenterGeographiesLoaded = false;
    this.datacenterGeographiesMapAvailable = false;
    this.datacenterGeographyAllLocations = [];
    this.datacenterGeographyViewData = [];
    this.datacenterGeographyDcMap = {};
    this.cleanupDatacenterGeographyMap();
    this.privateCloudGeoLoaded = false;
    this.privateCloudGeoMapAvailable = false;
    this.privateCloudGeoAllSites = [];
    this.privateCloudGeoSites = [];
    this.privateCloudGeoView = null;
    this.privateCloudGeoNameMap = {};
    this.selectedPrivateCloudPlatform = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.cleanupPrivateCloudGeoMap();
    this.newVms = [];
    this.newVmsTotal = 0;
    this.newVmsPageNo = 1;
    this.newVmsLoaded = false;
    this.newVmsSearch = '';
    this.selectedNewVmCloud = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.selectedNewVmStatus = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.selectedNewVmState = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.selectedNewVmStage = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.selectedNewVmStageStatus = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
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
    const isCustom = this.selectedTimeRange === 'custom';
    return {
      datacenters: this.getSelectedValues('datacenters'),
      clouds: this.getSelectedValues('clouds'),
      timeRange: this.selectedTimeRange,
      startDate: isCustom ? (this.selectedTimeRangeDates?.from || '') : '',
      endDate: isCustom ? (this.selectedTimeRangeDates?.to || '') : ''
    };
  }

  /** Stores the filter set currently driving the rendered widget data. */
  private updateAppliedFilterCriteria() {
    this.appliedFilterCriteria = this.getFilterFormOutput();
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm;
  }

  onAvailabilityCategoryChange(event: Event) {
    this.selectedAvailabilityCategory = String((event.target as HTMLSelectElement)?.value || UNIFIED_AIOPS_ALL_SELECTED_VALUE);
    this.loadAvailabilityCategoryRows(this.appliedFilterCriteria, false);
  }

  get isAvailabilityCategoryFiltered(): boolean {
    return this.selectedAvailabilityCategory !== UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  }

  /** Builds (first load) or re-syncs (on global apply) the Alerts widget's local filters from the page-level scope. */
  private setupAlertsFilters() {
    const datacenters = this.clonePageSelection('datacenters');
    const clouds = this.clonePageSelection('clouds');
    // Severity Type defaults to every severity selected so the "All Severity" label matches the checked options.
    const severityTypes = [...this.alertsSeverityTypeOptions];
    // Re-sync the Alerts local Time Range from the applied global Time Range (the user can override it afterwards).
    this.syncAlertsTimeRangeFromGlobal();
    if (!this.alertsFilterForm) {
      this.alertsFilterForm = this.svc.buildAlertsFilterForm(datacenters, clouds, [], this.alertsDefaultViewBy);
      this.alertsFilterForm.get('severityTypes')?.setValue(severityTypes, { emitEvent: false });
    } else {
      this.alertsFilterForm.patchValue({
        datacenters,
        clouds,
        deviceTypes: [],
        viewBy: this.alertsDefaultViewBy,
        sourceTypes: [],
        severityTypes
      });
      // The shared custom-date-dropdown only reads its default at init, so recreate it to show the re-synced value.
      this.recreateAlertsTimeRangeDropdown();
    }
    // Source Type options load from the API; pre-select them all once they arrive (see getAlertSourceTypeOptions).
    this.alertsSourceTypesSeeded = false;
    // The Alerts widget reloads only when a multiselect closes or View By/Duration changes
    // (NOT on every option toggle), so trigger the initial / re-synced load explicitly here. Clearing the
    // loaded-criteria key first guarantees a global Apply/refresh always refetches, even when unchanged.
    this.alertsLoadedCriteriaKey = '';
    this.reloadAlerts();
  }

  /** Copies the applied global Time Range (named period or custom range) onto the Alerts local filter. */
  private syncAlertsTimeRangeFromGlobal() {
    this.alertsTimeRange = this.appliedFilterCriteria.timeRange || UNIFIED_AIOPS_TIME_RANGE_DEFAULT;
    this.alertsTimeRangeDates = this.alertsTimeRange === 'custom'
      ? { from: this.appliedFilterCriteria.startDate || '', to: this.appliedFilterCriteria.endDate || '' }
      : null;
    this.alertsTimeRangeDefault = this.getAlertsTimeRangeDefault();
  }

  /** Builds the [default] input for the Alerts time-range dropdown: a DateRangeOption for custom, else the period string. */
  private getAlertsTimeRangeDefault(): string | DateRangeOption {
    if (this.alertsTimeRange === 'custom' && this.alertsTimeRangeDates) {
      return Object.assign(new DateRangeOption(), {
        value: 'custom',
        // Strip the trailing Z so the dropdown parses these as local dates - keeps the calendar date stable
        // through the re-sync round-trip (onAlertsTimeRangeChange re-formats it back to UTC ISO on submit).
        from: (this.alertsTimeRangeDates.from || '').replace('Z', ''),
        to: (this.alertsTimeRangeDates.to || '').replace('Z', '')
      });
    }
    return this.alertsTimeRange;
  }

  /** Forces the Alerts time-range dropdown to re-create so it re-reads its default after a global re-sync. */
  private recreateAlertsTimeRangeDropdown() {
    this.alertsTimeRangeReady = false;
    setTimeout(() => {
      this.alertsTimeRangeReady = true;
    }, 0);
  }

  /** Reloads only the Alerts widget APIs using the widget-local filter selections. Called on multiselect close / View By / Time Range change. */
  reloadAlerts() {
    if (!this.hasFilterFormData() || !this.alertsFilterForm) {
      return;
    }
    const alertsCriteria = this.getAlertsCriteria();
    // Skip when the criteria did not actually change - e.g. the Duration dropdown re-emits its default
    // selection on init/recreation, which would otherwise fire a duplicate alerts request.
    const criteriaKey = this.getAlertsCriteriaKey(alertsCriteria);
    if (criteriaKey === this.alertsLoadedCriteriaKey) {
      return;
    }
    this.alertsLoadedCriteriaKey = criteriaKey;
    if (this.alertsSelectedViewBy === 'source') {
      this.getAlertSourceTypeOptions(alertsCriteria);
    }
    this.getAlertReductionMetrics(alertsCriteria);
    this.getAlertResponseMetrics(alertsCriteria);
    this.getAlertSourceSankey(alertsCriteria);
    this.getAlertLifecycleSankey(alertsCriteria);
  }

  /** Snapshots the Alerts filter selection when a multiselect opens, so a real change can be detected on close. */
  onAlertsFilterOpen() {
    this.alertsFilterSnapshot = this.getAlertsCriteriaKey(this.getAlertsCriteria());
  }

  /** Reloads the Alerts widget only when the selection actually changed while the multiselect was open. */
  onAlertsFilterClose() {
    if (this.getAlertsCriteriaKey(this.getAlertsCriteria()) !== this.alertsFilterSnapshot) {
      this.reloadAlerts();
    }
  }

  /** Loads the Source Type multiselect options from the alerts response (full source list, ignoring any source/severity selection). */
  private getAlertSourceTypeOptions(criteria: UnifiedAiopsDashboardFilterCriteria) {
    const optionsCriteria: UnifiedAiopsDashboardFilterCriteria = { ...criteria, sourceTypes: [], severityTypes: [] };
    this.svc.getAlertSourceOptions(optionsCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(options => {
        const sourceOptions = options || [];
        // The multiselect matches selection by object reference, and these options are re-created on
        // every load. Seed every source on first load, then remap the existing selection (by value)
        // onto the new option objects so the checked state stays in sync with the live options.
        const selectedValues = this.alertsSourceTypesSeeded
          ? this.getValuesFromOptions(this.alertsFilterForm?.get('sourceTypes')?.value || [])
          : sourceOptions.map(option => option.value);
        this.alertsSourceTypesSeeded = true;
        this.alertsSourceTypeOptions = sourceOptions;
        this.alertsFilterForm?.get('sourceTypes')?.setValue(
          sourceOptions.filter(option => selectedValues.indexOf(option.value) > -1),
          { emitEvent: false }
        );
      }, () => {
        this.alertsSourceTypeOptions = [];
      });
  }

  /** Reads the Alerts widget-local filter form into the criteria sent to the Alerts APIs. */
  private getAlertsCriteria(): UnifiedAiopsDashboardFilterCriteria {
    const datacenters = this.getValuesFromOptions(this.alertsFilterForm?.get('datacenters')?.value || []);
    const clouds = this.getValuesFromOptions(this.alertsFilterForm?.get('clouds')?.value || []);
    const deviceTypes = ((this.alertsFilterForm?.get('deviceTypes')?.value as string[]) || []).filter(value => !!value);
    const viewBy = this.alertsSelectedViewBy;
    const criteria: UnifiedAiopsDashboardFilterCriteria = {
      datacenters,
      clouds,
      deviceTypes,
      viewBy,
      timeRange: this.alertsTimeRange,
      startDate: this.alertsTimeRange === 'custom' ? (this.alertsTimeRangeDates?.from || '') : '',
      endDate: this.alertsTimeRange === 'custom' ? (this.alertsTimeRangeDates?.to || '') : ''
    };
    if (viewBy === 'source') {
      criteria.sourceTypes = this.getValuesFromOptions(this.alertsFilterForm?.get('sourceTypes')?.value || []);
    } else if (viewBy === 'severity') {
      criteria.severityTypes = this.getValuesFromOptions(this.alertsFilterForm?.get('severityTypes')?.value || []);
    }
    return criteria;
  }

  /** Builds an order-independent key for the Alerts criteria so a reload can be skipped when nothing changed. */
  private getAlertsCriteriaKey(criteria: UnifiedAiopsDashboardFilterCriteria): string {
    const sortedCsv = (values?: string[]) => [...(values || [])].sort().join(',');
    return [
      sortedCsv(criteria.datacenters),
      sortedCsv(criteria.clouds),
      sortedCsv(criteria.deviceTypes),
      sortedCsv(criteria.sourceTypes),
      sortedCsv(criteria.severityTypes),
      criteria.viewBy || '',
      criteria.timeRange || '',
      criteria.startDate || '',
      criteria.endDate || ''
    ].join('|');
  }

  get alertsSelectedViewBy(): string {
    return this.alertsFilterForm?.get('viewBy')?.value || this.alertsDefaultViewBy;
  }

  /** Handles the Alerts Time Range dropdown selection (named period or custom range) and reloads the Alerts widget. */
  onAlertsTimeRangeChange(event: { period?: string; from?: string | Date; to?: string | Date }) {
    this.alertsTimeRange = event?.period || this.alertsTimeRange;
    // Named periods are resolved server-side from `time_range`; explicit dates are sent only for a custom
    // range. (The dropdown also emits computed dates for named periods, including once on init.)
    this.alertsTimeRangeDates = event?.period === 'custom'
      ? { from: this.formatTimeRangeDate(event?.from, false), to: this.formatTimeRangeDate(event?.to, true) }
      : null;
    this.reloadAlerts();
  }

  /** Formats a custom-range boundary as UTC ISO-8601 (e.g. 2026-07-01T00:00:00Z) for start_datetime / end_datetime. */
  private formatTimeRangeDate(value: string | Date | undefined, isEnd: boolean): string {
    if (!value) {
      return '';
    }
    const date = moment(value);
    if (!date.isValid()) {
      return '';
    }
    return `${date.format('YYYY-MM-DD')}T${isEnd ? '23:59:59' : '00:00:00'}Z`;
  }

  private clonePageSelection(controlName: string): UnifiedAiopsFilterOption[] {
    return [...((this.filterForm?.get(controlName)?.value as UnifiedAiopsFilterOption[]) || [])];
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  get datacenterScopeSummary(): UnifiedAiopsFilterScopeSummary {
    return this.getScopeSummary(this.datacenterOptions, this.appliedFilterCriteria.datacenters, 'No datacenters');
  }

  get cloudScopeSummary(): UnifiedAiopsFilterScopeSummary {
    return this.getScopeSummary(this.cloudOptions, this.appliedFilterCriteria.clouds, 'No clouds');
  }

  private getScopeSummary(options: UnifiedAiopsFilterOption[], selectedValues: string[], emptyLabel: string): UnifiedAiopsFilterScopeSummary {
    const labels = (selectedValues || [])
      .map(value => options?.find(option => option.value === value)?.label || value)
      .filter(label => !!label);
    if (!labels.length) {
      return {
        primaryLabel: emptyLabel,
        remainingLabels: []
      };
    }
    return {
      primaryLabel: labels[0],
      remainingLabels: labels.slice(1)
    };
  }

  private getCurrentRefreshedText(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeZoneLabel = this.getBrowserTimeZoneLabel(now);
    return `Today ${hours}:${minutes}${timeZoneLabel ? ` ${timeZoneLabel}` : ''}`;
  }

  /** Resolves the viewer's local time-zone abbreviation (e.g. IST, PST, GMT+9) so the refreshed label is correct in any region. */
  private getBrowserTimeZoneLabel(date: Date): string {
    try {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(date);
      return parts.find(part => part.type === 'timeZoneName')?.value || '';
    } catch {
      return '';
    }
  }

  get showEmployeeExperienceWidget(): boolean {
    return this.userInfoService.isWiproOrg;
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    const filterFormOutput = this.appliedFilterCriteria;
    this.startWidgetLoadingState();
    this.setupAlertsFilters();
    setTimeout(() => {
      this.getSummaryMetrics(filterFormOutput);
      this.getDiscoveryOptions(filterFormOutput);
      this.getAlertSegregation(filterFormOutput);
      this.getBusinessServices(filterFormOutput);
      this.getGeoDistribution(filterFormOutput);
      this.getPrivateCloudCoverage(filterFormOutput);
      this.getPublicCloudCoverage(filterFormOutput);
      this.getDatacenterGeographies(filterFormOutput);
      this.getPrivateCloudGeo(filterFormOutput);
      this.getNewVms();
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
    this.executiveView = null;
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummaryMetrics(filterFormOutput), res => {
      this.executiveView = this.svc.convertToExecutiveSummaryViewData(res);
    }, () => {
      this.executiveView = null;
    }, 'summaryMetrics');
  }

  getDiscoveryOptions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.selectedDiscoveryCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.loadDiscoveryRows(filterFormOutput, true);
  }

  onDiscoveryCategoryChange(event: Event) {
    this.selectedDiscoveryCategory = String((event.target as HTMLSelectElement)?.value || UNIFIED_AIOPS_ALL_SELECTED_VALUE);
    this.loadDiscoveryRows(this.appliedFilterCriteria, false);
  }

  /**
   * Loads discovery rows for the current selection. All Category fetches the high-level categories (and, on a
   * global load, rebuilds the dropdown); a specific category re-fetches its sub-levels server-side via the
   * device_category param (the selected raw slug) and keeps the existing high-level dropdown options.
   */
  private loadDiscoveryRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria, rebuildCategoryOptions: boolean) {
    const criteria = this.selectedDiscoveryCategory === UNIFIED_AIOPS_ALL_SELECTED_VALUE
      ? filterFormOutput
      : { ...filterFormOutput, deviceCategory: this.selectedDiscoveryCategory };
    this.resetDiscoveryData(rebuildCategoryOptions);
    this.loadWidget(this.loaderNames.discovery, this.svc.getDiscoveryRows(criteria), res => {
      this.discoveryRows = res || [];
      if (rebuildCategoryOptions) {
        this.discoveryCategoryOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' },
          ...this.discoveryRows.map(row => ({ value: row.key || '', label: row.category }))];
      }
      this.discoveryDisplayRows = this.discoveryRows;
      this.discoverySummary = this.svc.convertToDiscoverySummary(this.discoveryRows);
      this.discoveryOptions = this.svc.convertToDiscoveryOptions(this.discoveryRows);
    }, () => {
      this.resetDiscoveryData(rebuildCategoryOptions);
    }, 'discovery');
  }

  get isDiscoveryFiltered(): boolean {
    return this.selectedDiscoveryCategory !== UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  }

  private resetDiscoveryData(resetCategoryOptions: boolean) {
    this.discoveryRows = [];
    this.discoveryDisplayRows = [];
    this.discoveryOptions = {};
    this.discoverySummary = { discovered: '0', monitored: '0', coverage: 'NA' };
    if (resetCategoryOptions) {
      this.discoveryCategoryOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
      this.selectedDiscoveryCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    }
  }

  getAlertSegregation(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.selectedAlertSegregationCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.loadAlertSegregationItems(filterFormOutput, true);
  }

  onAlertSegregationCategoryChange(event: Event) {
    this.selectedAlertSegregationCategory = String((event.target as HTMLSelectElement)?.value || UNIFIED_AIOPS_ALL_SELECTED_VALUE);
    this.loadAlertSegregationItems(this.appliedFilterCriteria, false);
  }

  /**
   * Loads alert-segregation items for the current selection. All Category fetches the high-level categories
   * (and, on a global load, rebuilds the dropdown); a specific category re-fetches its sub-levels server-side
   * via the device_category param (the selected raw slug) and keeps the existing high-level dropdown options.
   */
  private loadAlertSegregationItems(filterFormOutput: UnifiedAiopsDashboardFilterCriteria, rebuildCategoryOptions: boolean) {
    const criteria = this.selectedAlertSegregationCategory === UNIFIED_AIOPS_ALL_SELECTED_VALUE
      ? filterFormOutput
      : { ...filterFormOutput, deviceCategory: this.selectedAlertSegregationCategory };
    this.resetAlertSegregationData(rebuildCategoryOptions);
    this.loadWidget(this.loaderNames.alertSegregation, this.svc.getAlertSegregationItems(criteria), res => {
      this.alertSegregationItems = res || [];
      if (rebuildCategoryOptions) {
        this.alertSegregationCategoryOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' },
          ...this.alertSegregationItems.map(item => ({ value: item.key || '', label: item.name }))];
      }
      this.alertSegregationDisplayItems = this.alertSegregationItems;
      this.alertSegregationOptions = this.svc.convertToAlertSegregationOptions(this.alertSegregationItems);
      this.alertSegregationSummary = this.svc.convertToAlertSegregationSummary(this.alertSegregationItems);
    }, () => {
      this.resetAlertSegregationData(rebuildCategoryOptions);
    }, 'alertSegregation');
  }

  get isAlertSegregationFiltered(): boolean {
    return this.selectedAlertSegregationCategory !== UNIFIED_AIOPS_ALL_SELECTED_VALUE;
  }

  private resetAlertSegregationData(resetCategoryOptions: boolean) {
    this.alertSegregationItems = [];
    this.alertSegregationDisplayItems = [];
    this.alertSegregationOptions = {};
    this.alertSegregationSummary = { critical: '0', warning: '0', info: '0' };
    if (resetCategoryOptions) {
      this.alertSegregationCategoryOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
      this.selectedAlertSegregationCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    }
  }

  getBusinessServices(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.businessServices = [];
    this.loadWidget(this.loaderNames.businessServices, this.svc.getBusinessServices(filterFormOutput), res => {
      this.businessServices = this.svc.convertToBusinessServicesViewData(res);
    }, () => {
      this.businessServices = [];
    }, 'businessServices');
  }

  getGeoDistribution(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.geoHeatmapOptions = {};
    this.loadWidget(this.loaderNames.geoDistribution, this.svc.getGeoHeatmap(filterFormOutput), res => {
      this.geoHeatmapOptions = this.svc.convertToGeoHeatmapOptions(res);
    }, () => {
      this.geoHeatmapOptions = {};
    }, 'geoDistribution');
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
    }, 'privateCloudCoverage');
  }

  getPublicCloudCoverage(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.publicCloudCoverageGroups = [];
    this.publicCloudCoverageTotal = '0';
    this.loadWidget(this.loaderNames.publicCloudCoverage, this.svc.getPublicCloudCoverage(filterFormOutput), res => {
      this.publicCloudCoverageGroups = this.svc.convertToCoverageGroupsViewData(res);
      this.publicCloudCoverageTotal = this.svc.getCoverageGroupsResourceTotal(this.publicCloudCoverageGroups);
    }, () => {
      this.publicCloudCoverageGroups = [];
      this.publicCloudCoverageTotal = '0';
    }, 'publicCloudCoverage');
  }

  getDatacenterGeographies(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    if (!this.mapSvc.shouldShowMapWidgets()) {
      this.widgetLoading.datacenterGeographies = false;
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
      this.widgetLoading.datacenterGeographies = false;
      return;
    }

    this.widgetLoading.datacenterGeographies = true;
    this.datacenterGeographyViewData = [];
    this.datacenterGeographyDcMap = {};
    this.clearDatacenterGeographyMarkers();
    this.spinnerService.start(this.loaderNames.datacenterGeographies);

    this.mapSvc.loadMap().then(() => {
      if (this.isDestroyed) {
        this.widgetLoading.datacenterGeographies = false;
        this.spinnerService.stop(this.loaderNames.datacenterGeographies);
        return;
      }

      this.datacenterGeographiesMapAvailable = this.mapSvc.isAvailable();
      if (!this.datacenterGeographiesMapAvailable) {
        this.datacenterGeographiesLoaded = true;
        this.widgetLoading.datacenterGeographies = false;
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
        finalize(() => {
          this.widgetLoading.datacenterGeographies = false;
          setTimeout(() => this.spinnerService.stop(this.loaderNames.datacenterGeographies), 0);
        })
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
        this.datacenterGeographyClusterListeners.push(marker.addListener('click', () => {
          this.ngZone.run(() => this.openDatacenterGeography(location));
        }));
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

    contentElement?.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        event.preventDefault();
        const datacenterId = anchor.getAttribute('href')?.match(/datacenter\/([^/?#]+)/)?.[1];
        this.ngZone.run(() => {
          this.openRouteInNewTab(datacenterId ? ['/unitycloud/datacenter', datacenterId] : this.linkRoutes.datacenter);
        });
      });
    });

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

  // Private Cloud Geo Distribution - mirrors the Datacenter Geographies map. One marker per private
  // cloud site, colored by platform (VMware / Nutanix) and sized by total resources at the site.
  getPrivateCloudGeo(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    if (!this.mapSvc.shouldShowMapWidgets()) {
      this.widgetLoading.privateCloudGeo = false;
      this.privateCloudGeoLoaded = false;
      this.privateCloudGeoMapAvailable = false;
      this.privateCloudGeoAllSites = [];
      this.privateCloudGeoSites = [];
      this.privateCloudGeoNameMap = {};
      this.cleanupPrivateCloudGeoMap();
      return;
    }

    if (this.privateCloudGeoLoaded) {
      this.applyPrivateCloudGeoFilter();
      this.widgetLoading.privateCloudGeo = false;
      return;
    }

    this.widgetLoading.privateCloudGeo = true;
    this.privateCloudGeoSites = [];
    this.privateCloudGeoNameMap = {};
    this.clearPrivateCloudGeoMarkers();
    this.spinnerService.start(this.loaderNames.privateCloudGeo);

    this.mapSvc.loadMap().then(() => {
      if (this.isDestroyed) {
        this.widgetLoading.privateCloudGeo = false;
        this.spinnerService.stop(this.loaderNames.privateCloudGeo);
        return;
      }

      this.privateCloudGeoMapAvailable = this.mapSvc.isAvailable();
      if (!this.privateCloudGeoMapAvailable) {
        this.privateCloudGeoLoaded = true;
        this.widgetLoading.privateCloudGeo = false;
        this.spinnerService.stop(this.loaderNames.privateCloudGeo);
        return;
      }

      this.svc.getPrivateCloudGeoDistribution(filterFormOutput).pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.widgetLoading.privateCloudGeo = false;
          setTimeout(() => this.spinnerService.stop(this.loaderNames.privateCloudGeo), 0);
        })
      ).subscribe(res => {
        this.setPrivateCloudGeoData(res);
      }, () => {
        this.privateCloudGeoLoaded = true;
        this.privateCloudGeoView = null;
        this.privateCloudGeoAllSites = [];
        this.applyPrivateCloudGeoFilter();
      });
    });
  }

  private setPrivateCloudGeoData(res: UnifiedAiopsPrivateCloudGeoView) {
    this.privateCloudGeoLoaded = true;
    this.privateCloudGeoView = res || null;
    this.privateCloudGeoAllSites = (res && res.sites) || [];
    this.applyPrivateCloudGeoFilter();
  }

  private applyPrivateCloudGeoFilter() {
    const platform = this.selectedPrivateCloudPlatform;
    this.privateCloudGeoSites = platform === UNIFIED_AIOPS_ALL_SELECTED_VALUE
      ? this.privateCloudGeoAllSites
      : (this.privateCloudGeoAllSites || []).filter(site => site.platformKey === platform);

    this.privateCloudGeoNameMap = this.privateCloudGeoSites.reduce((result: { [key: string]: string[] }, site) => {
      const key = this.getPrivateCloudGeoLocationKey(site);
      result[key] = result[key] || [];
      result[key].push(site.datacenterName);
      return result;
    }, {});

    if (this.privateCloudGeoSites.length && this.privateCloudGeoMapAvailable) {
      this.initializePrivateCloudGeoMap().then(() => this.addPrivateCloudGeoMarkers());
    } else {
      this.cleanupPrivateCloudGeoMap();
    }
  }

  onPrivateCloudPlatformChange(event: Event) {
    this.selectedPrivateCloudPlatform = String((event.target as HTMLSelectElement)?.value || UNIFIED_AIOPS_ALL_SELECTED_VALUE);
    this.applyPrivateCloudGeoFilter();
  }

  private async initializePrivateCloudGeoMap() {
    if (this.privateCloudGeoMap || !this.privateCloudGeoMapElementRef || !this.privateCloudGeoMapAvailable) {
      return;
    }

    const mapsLibrary = await this.mapSvc.importMapsLibrary();
    if (!mapsLibrary) {
      this.privateCloudGeoMapAvailable = false;
      return;
    }
    const { Map } = mapsLibrary;
    if (this.isDestroyed || !this.privateCloudGeoMapElementRef) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const map = new Map(this.privateCloudGeoMapElementRef.nativeElement, {
        center: this.privateCloudGeoInitialCenter,
        zoom: this.privateCloudGeoInitialZoom,
        minZoom: 2.2,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        mapId: environment.gmId
      });
      this.privateCloudGeoMap = map;
      this.privateCloudGeoClusterInfoWindow = new google.maps.InfoWindow();
      // disableAutoPan + an upward offset keep the hover card above the marker so it never pans the
      // map (which would slide the marker out from under the cursor and cause an open/close flicker).
      this.privateCloudGeoHoverInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true, pixelOffset: new google.maps.Size(0, -8) });
      this.privateCloudGeoTilesLoaded = map.addListener('tilesloaded', () => {
        this.addPrivateCloudGeoMarkers();
        this.privateCloudGeoTilesLoaded?.remove();
        this.privateCloudGeoTilesLoaded = null;
      });
    });
  }

  private async addPrivateCloudGeoMarkers() {
    if (!this.privateCloudGeoMap || !this.privateCloudGeoSites.length) {
      return;
    }

    this.clearPrivateCloudGeoMarkers();
    const markerLibrary = await this.mapSvc.importMarkerLibrary();
    if (!markerLibrary) return;
    const { AdvancedMarkerElement } = markerLibrary;
    if (this.isDestroyed || !this.privateCloudGeoMap) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const map = this.privateCloudGeoMap;
      if (!map) {
        return;
      }

      this.privateCloudGeoSites.forEach(site => {
        const position = this.getPrivateCloudGeoPosition(site);
        if (!position) {
          return;
        }

        const marker = new AdvancedMarkerElement({
          position,
          map,
          title: `${site.datacenterName} - ${site.platformType}`,
          content: this.createPrivateCloudMarkerContent(site)
        });
        (marker as any).unityLocationKey = this.getPrivateCloudGeoLocationKey(site);

        const infoWindow = new google.maps.InfoWindow({
          content: this.createPrivateCloudInfoWindowContent(site),
          position
        });
        infoWindow.open({
          map,
          anchor: marker
        });

        this.privateCloudGeoInfoWindows.push(infoWindow);
        this.privateCloudGeoMarkers.push(marker);
        this.privateCloudGeoInfoWindowListeners.push(infoWindow.addListener('domready', () => this.bindPrivateCloudGeoPopover(site, infoWindow)));
        this.privateCloudGeoClusterListeners.push(marker.addListener('click', () => {
          this.ngZone.run(() => this.openPrivateCloudGeo(site));
        }));

        const markerContent = marker.content as HTMLElement;
        if (markerContent) {
          markerContent.style.cursor = 'pointer';
          markerContent.addEventListener('mouseenter', () => this.showPrivateCloudGeoHoverCard(site, position));
          markerContent.addEventListener('mouseleave', () => this.privateCloudGeoHoverInfoWindow?.close());
        }
      });

      this.privateCloudGeoCluster = new MarkerClusterer({
        map,
        markers: this.privateCloudGeoMarkers as any
      });

      this.privateCloudGeoClusterListeners.push(
        this.privateCloudGeoCluster.addListener('mouseover', (cluster: any) => this.openPrivateCloudGeoClusterPopover(cluster)),
        this.privateCloudGeoCluster.addListener('mouseout', () => this.privateCloudGeoClusterInfoWindow?.close()),
        this.privateCloudGeoCluster.addListener('click', () => this.privateCloudGeoClusterInfoWindow?.close())
      );
    });
  }

  private createPrivateCloudMarkerContent(site: UnifiedAiopsPrivateCloudGeoSite): HTMLElement {
    const color = UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_COLORS[site.platformKey] || '#6c757d';
    const size = this.getPrivateCloudMarkerSize(site.totalResources);
    const marker = document.createElement('div');
    marker.style.width = `${size}px`;
    marker.style.height = `${size}px`;
    marker.style.borderRadius = '50%';
    marker.style.background = color;
    marker.style.border = '2px solid #ffffff';
    marker.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.35)';
    marker.style.opacity = '0.92';
    return marker;
  }

  private getPrivateCloudMarkerSize(totalResources: number): number {
    const minSize = 14;
    const maxSize = 34;
    const max = this.privateCloudGeoView?.maxResources || 0;
    if (max <= 0) {
      return minSize;
    }
    const ratio = Math.min(1, Math.max(0, totalResources / max));
    return Math.round(minSize + (maxSize - minSize) * Math.sqrt(ratio));
  }

  private createPrivateCloudInfoWindowContent(site: UnifiedAiopsPrivateCloudGeoSite): string {
    return `<div id="pcgeo_${site.key}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#1f2937;padding:3px 8px;border-radius:5px;white-space:nowrap;font-size:12px;font-weight:600;line-height:1.3;cursor:pointer;">${site.datacenterName}</div>`;
  }

  private showPrivateCloudGeoHoverCard(site: UnifiedAiopsPrivateCloudGeoSite, position: google.maps.LatLngLiteral) {
    if (!this.privateCloudGeoHoverInfoWindow || !this.privateCloudGeoMap) {
      return;
    }
    this.privateCloudGeoHoverInfoWindow.setContent(this.createPrivateCloudHoverCardContent(site));
    this.privateCloudGeoHoverInfoWindow.setPosition(position);
    this.privateCloudGeoHoverInfoWindow.open(this.privateCloudGeoMap);
  }

  // Rich detail card shown when the marker is hovered (name + platform + resource / alert breakdown).
  private createPrivateCloudHoverCardContent(site: UnifiedAiopsPrivateCloudGeoSite): string {
    const color = UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_COLORS[site.platformKey] || '#6c757d';
    const dark = '#1f2937';
    const row = (icon: string, iconColor: string, label: string, value: number, valueColor: string): string =>
      `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;">`
      + `<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:#5f6b78;">`
      + `<i class="fa ${icon}" style="width:14px;text-align:center;color:${iconColor};"></i>${label}</span>`
      + `<span style="font-size:12px;font-weight:600;color:${valueColor};">${this.formatMapNumber(value)}</span></div>`;
    const header = `<div style="display:flex;align-items:center;gap:8px;padding:10px 14px 9px;border-bottom:1px solid #eef1f4;">`
      + `<span style="width:9px;height:9px;border-radius:50%;background:${color};flex-shrink:0;"></span>`
      + `<span style="font-size:14px;font-weight:700;color:${dark};">${site.datacenterName}</span></div>`;
    const platform = `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid #eef1f4;">`
      + `<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:#5f6b78;"><i class="fa fa-sitemap" style="width:14px;text-align:center;color:#8a96a3;"></i>Platform Type</span>`
      + `<span style="font-size:12px;font-weight:700;color:${dark};">${site.platformType}</span></div>`;
    const alerts = `<div style="padding:6px 14px;border-bottom:1px solid #eef1f4;">`
      + row('fa-th-large', '#5f6b78', 'Total Resources', site.totalResources, dark)
      + row('fa-bell', '#f0a020', 'Total Alerts', site.totalAlerts, dark)
      + row('fa-times-circle', '#cc0000', 'Critical Alerts', site.critical, '#cc0000')
      + row('fa-exclamation-triangle', '#ff8800', 'Warning Alerts', site.warning, '#ff8800')
      + row('fa-info-circle', '#378ad8', 'Information Alerts', site.info, '#378ad8')
      + `</div>`;
    const resources = `<div style="padding:6px 14px 9px;">`
      + row('fa-desktop', '#5f6b78', 'VM Count', site.vmCount, dark)
      + row('fa-cubes', '#5f6b78', 'Clusters', site.clustersCount, dark)
      + row('fa-hdd', '#5f6b78', 'Storage', site.storageCount, dark)
      + `</div>`;
    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;width:250px;background:#fff;color:${dark};line-height:1.3;">${header}${platform}${alerts}${resources}</div>`;
  }

  private formatMapNumber(value: number): string {
    return (Number(value) || 0).toLocaleString('en-US');
  }

  private openPrivateCloudGeoClusterPopover(cluster: any) {
    if (!this.privateCloudGeoClusterInfoWindow || !this.privateCloudGeoMap) {
      return;
    }

    let content = '<div style="font-weight:500;">Private Cloud Sites</div><br>';
    (cluster.markers || []).forEach((marker: any) => {
      const names = this.privateCloudGeoNameMap[marker.unityLocationKey] || [];
      names.forEach(name => {
        content = `${content}<span>${name}</span><br>`;
      });
    });

    this.privateCloudGeoClusterInfoWindow.setContent(content);
    this.privateCloudGeoClusterInfoWindow.setPosition(cluster.position || cluster.getCenter?.());
    this.privateCloudGeoClusterInfoWindow.open(this.privateCloudGeoMap);
  }

  private bindPrivateCloudGeoPopover(site: UnifiedAiopsPrivateCloudGeoSite, infoWindow: google.maps.InfoWindow) {
    const id = `pcgeo_${site.key}`;
    const contentElement = document.getElementById(id);
    if (!contentElement) {
      return;
    }

    const infoWindowShell = contentElement.closest('.gm-style-iw-a')?.parentElement as HTMLElement;
    if (infoWindowShell) {
      this.privateCloudGeoZIndexMap[id] = Number.parseInt(infoWindowShell.style.getPropertyValue('z-index'), 10) || 0;
    }

    contentElement.addEventListener('click', () => {
      this.ngZone.run(() => this.openPrivateCloudGeo(site));
    });

    contentElement.addEventListener('mouseover', () => {
      const high = Math.max(...Object.keys(this.privateCloudGeoZIndexMap).map(key => this.privateCloudGeoZIndexMap[key]), 0);
      this.privateCloudGeoOldZIndex = this.privateCloudGeoZIndexMap[id] || 0;
      infoWindow.setZIndex(high + 1);
    });

    contentElement.addEventListener('mouseout', () => {
      infoWindow.setZIndex(this.privateCloudGeoOldZIndex || 0);
      this.privateCloudGeoOldZIndex = null;
    });
  }

  private getPrivateCloudGeoPosition(site: UnifiedAiopsPrivateCloudGeoSite): google.maps.LatLngLiteral | null {
    const lat = Number(site.lat);
    const lng = Number(site.long);
    if (!isFinite(lat) || !isFinite(lng)) {
      return null;
    }
    return { lat, lng };
  }

  private getPrivateCloudGeoLocationKey(site: UnifiedAiopsPrivateCloudGeoSite): string {
    return `${site.lat}_${site.long}`;
  }

  private clearPrivateCloudGeoMarkers() {
    this.privateCloudGeoClusterListeners.forEach(listener => listener.remove());
    this.privateCloudGeoClusterListeners = [];
    this.privateCloudGeoInfoWindowListeners.forEach(listener => listener.remove());
    this.privateCloudGeoInfoWindowListeners = [];
    this.privateCloudGeoInfoWindows.forEach(infoWindow => infoWindow.close());
    this.privateCloudGeoInfoWindows = [];
    this.privateCloudGeoMarkers.forEach(marker => marker.map = null);
    this.privateCloudGeoMarkers = [];
    this.privateCloudGeoZIndexMap = {};
    this.privateCloudGeoCluster?.clearMarkers();
    this.privateCloudGeoCluster = null;
    this.privateCloudGeoClusterInfoWindow?.close();
    this.privateCloudGeoHoverInfoWindow?.close();
  }

  private cleanupPrivateCloudGeoMap() {
    this.clearPrivateCloudGeoMarkers();
    this.privateCloudGeoTilesLoaded?.remove();
    this.privateCloudGeoTilesLoaded = null;
    this.privateCloudGeoMapElementRef = null;
    this.privateCloudGeoMap = null;
    this.privateCloudGeoClusterInfoWindow = null;
    this.privateCloudGeoHoverInfoWindow = null;
  }

  openPrivateCloudGeo(site: UnifiedAiopsPrivateCloudGeoSite) {
    this.openRouteInNewTab(site?.datacenterUuid ? ['/unitycloud/datacenter', site.datacenterUuid] : this.linkRoutes.datacenter);
  }

  openPrivateCloudGeoDistribution() {
    this.openRouteInNewTab(this.linkRoutes.pccloud);
  }

  get hasPrivateCloudGeo(): boolean {
    return this.widgetLoading.privateCloudGeo ||
      (this.mapSvc.shouldShowMapWidgets() && this.privateCloudGeoMapAvailable && !!this.privateCloudGeoSites?.length);
  }

  // Newly Provisioned VMs - paginated table; the request carries the applied global filters plus the
  // widget-local filters (search / cloud / status / vm state / lifecycle stage / lifecycle status) + page.
  getNewVms() {
    const filter = this.getNewVmsFilter();
    this.loadWidget(this.loaderNames.newVms, this.svc.getNewlyProvisionedVms(this.appliedFilterCriteria, filter, this.newVmsPageNo, this.newVmsPageSize), res => {
      this.newVms = (res && res.rows) || [];
      this.newVmsTotal = (res && res.total) || 0;
      this.newVmsLoaded = true;
    }, () => {
      this.newVms = [];
      this.newVmsTotal = 0;
      this.newVmsLoaded = true;
    }, 'newVms');
  }

  private getNewVmsFilter(): UnifiedAiopsNewVmsFilter {
    return {
      search: this.newVmsSearch,
      cloudPlatform: this.selectedNewVmCloud,
      status: this.selectedNewVmStatus,
      vmState: this.selectedNewVmState,
      lifecycleStage: this.selectedNewVmStage,
      lifecycleStageStatus: this.selectedNewVmStageStatus
    };
  }

  newVmsPageChange(pageNo: number) {
    if (this.newVmsPageNo === pageNo) {
      return;
    }
    this.newVmsPageNo = pageNo;
    this.getNewVms();
  }

  onNewVmSelectChange(field: 'cloud' | 'status' | 'state' | 'stage' | 'stageStatus', event: Event) {
    const value = String((event.target as HTMLSelectElement)?.value || UNIFIED_AIOPS_ALL_SELECTED_VALUE);
    if (field === 'cloud') {
      this.selectedNewVmCloud = value;
    } else if (field === 'status') {
      this.selectedNewVmStatus = value;
    } else if (field === 'state') {
      this.selectedNewVmState = value;
    } else if (field === 'stage') {
      this.selectedNewVmStage = value;
    } else {
      this.selectedNewVmStageStatus = value;
    }
    this.newVmsPageNo = 1;
    this.getNewVms();
  }

  onNewVmSearch(event: Event) {
    this.newVmsSearch = String((event.target as HTMLInputElement)?.value || '');
    if (this.newVmsSearchTimer) {
      clearTimeout(this.newVmsSearchTimer);
    }
    this.newVmsSearchTimer = setTimeout(() => {
      this.newVmsPageNo = 1;
      this.getNewVms();
    }, 400);
  }

  get hasNewVms(): boolean {
    return this.widgetLoading.newVms || this.newVmsLoaded || !!this.newVms?.length;
  }

  getApplicationRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.applicationRows = [];
    this.loadWidget(this.loaderNames.applications, this.svc.getApplicationRows(filterFormOutput), res => {
      this.applicationRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.applicationRows = [];
    }, 'applications');
  }

  getServiceApplicationOptions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.serviceApplicationOptions = [];
    this.serviceRows = [];
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
      this.widgetLoading.services = false;
    }, 'serviceApplications');
  }

  onServiceApplicationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedServiceApplicationId = target?.value || '';
    this.getServiceRows(this.appliedFilterCriteria);
  }

  getServiceRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.serviceRows = [];
    if (!this.selectedServiceApplicationId) {
      this.widgetLoading.services = false;
      return;
    }
    this.loadWidget(this.loaderNames.services, this.svc.getServiceRows(filterFormOutput, this.selectedServiceApplicationId), res => {
      this.serviceRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.serviceRows = [];
    }, 'services');
  }

  getDatabaseRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.databaseRows = [];
    this.loadWidget(this.loaderNames.databases, this.svc.getDatabaseRows(filterFormOutput), res => {
      this.databaseRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.databaseRows = [];
    }, 'databases');
  }

  getOsRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.osRows = [];
    this.loadWidget(this.loaderNames.os, this.svc.getOsRows(filterFormOutput), res => {
      this.osRows = this.svc.convertToTableRowsViewData(res);
    }, () => {
      this.osRows = [];
    }, 'os');
  }

  getBandwidthBar(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.bandwidthBarOptions = {};
    this.loadWidget(this.loaderNames.bandwidthBar, this.svc.getBandwidthBar(filterFormOutput), res => {
      this.bandwidthBarOptions = this.svc.convertToBandwidthBarOptions(res);
    }, () => {
      this.bandwidthBarOptions = {};
    }, 'bandwidthBar');
  }

  getBandwidthLine(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.bandwidthLineOptions = {};
    this.loadWidget(this.loaderNames.bandwidthLine, this.svc.getBandwidthLine(filterFormOutput), res => {
      this.bandwidthLineOptions = this.svc.convertToBandwidthLineOptions(res);
    }, () => {
      this.bandwidthLineOptions = {};
    }, 'bandwidthLine');
  }

  getPlatformPerformance(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.platformPerformanceOptions = {};
    this.loadWidget(this.loaderNames.platformPerformance, this.svc.getPlatformPerformance(filterFormOutput), res => {
      this.platformPerformanceOptions = this.svc.convertToPlatformPerformanceOptions(res);
    }, () => {
      this.platformPerformanceOptions = {};
    }, 'platformPerformance');
  }

  getPerformanceMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.performanceMetrics = this.svc.getEmptyPerformanceMetrics();
    this.loadWidget(this.loaderNames.performanceMetrics, this.svc.getPerformanceMetrics(filterFormOutput), res => {
      this.performanceMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.performanceMetrics = this.svc.getEmptyPerformanceMetrics();
    }, 'performanceMetrics');
  }

  getDeviceAvailability(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.deviceAvailabilityOptions = {};
    this.loadWidget(this.loaderNames.deviceAvailability, this.svc.getDeviceAvailability(filterFormOutput), res => {
      this.deviceAvailabilityOptions = this.svc.convertToDeviceAvailabilityOptions(res);
    }, () => {
      this.deviceAvailabilityOptions = {};
    }, 'deviceAvailability');
  }

  getAvailabilityCategory(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.selectedAvailabilityCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    this.loadAvailabilityCategoryRows(filterFormOutput, true);
  }

  /**
   * Loads availability-by-category rows for the current selection. All Category fetches the high-level
   * categories (and, on a global load, rebuilds the dropdown); a specific category re-fetches its sub-levels
   * server-side via the device_category param (the selected raw slug) and keeps the existing dropdown options.
   */
  private loadAvailabilityCategoryRows(filterFormOutput: UnifiedAiopsDashboardFilterCriteria, rebuildCategoryOptions: boolean) {
    const criteria = this.selectedAvailabilityCategory === UNIFIED_AIOPS_ALL_SELECTED_VALUE
      ? filterFormOutput
      : { ...filterFormOutput, deviceCategory: this.selectedAvailabilityCategory };
    this.resetAvailabilityCategoryData(rebuildCategoryOptions);
    this.loadWidget(this.loaderNames.availabilityCategory, this.svc.getAvailabilityCategory(criteria), res => {
      this.availabilityCategoryRows = res || [];
      if (rebuildCategoryOptions) {
        this.availabilityCategoryFilterOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' },
          ...this.availabilityCategoryRows.map(row => ({ value: row.key || '', label: row.label }))];
      }
      this.availabilityCategoryDisplayRows = this.availabilityCategoryRows;
      this.availabilityCategoryOptions = this.svc.convertToAvailabilityCategoryOptions(this.availabilityCategoryRows);
      this.availabilityCategorySummary = this.svc.convertToAvailabilityCategorySummary(this.availabilityCategoryRows);
    }, () => {
      this.resetAvailabilityCategoryData(rebuildCategoryOptions);
    }, 'availabilityCategory');
  }

  private resetAvailabilityCategoryData(resetCategoryOptions: boolean) {
    this.availabilityCategoryRows = [];
    this.availabilityCategoryDisplayRows = [];
    this.availabilityCategoryOptions = {};
    this.availabilityCategorySummary = this.getEmptyAvailabilityCategorySummary();
    if (resetCategoryOptions) {
      this.availabilityCategoryFilterOptions = [{ value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Category' }];
      this.selectedAvailabilityCategory = UNIFIED_AIOPS_ALL_SELECTED_VALUE;
    }
  }

  getAlertTrend(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertTrendOptions = {};
    this.loadWidget(this.loaderNames.alertTrend, this.svc.getAlertTrend(filterFormOutput), res => {
      this.alertTrendOptions = this.svc.convertToAlertTrendOptions(res);
    }, () => {
      this.alertTrendOptions = {};
    }, 'alertTrend');
  }

  getAlertReductionMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertReductionMetrics = [];
    this.loadWidget(this.loaderNames.alertReduction, this.svc.getAlertReductionMetrics(filterFormOutput), res => {
      this.alertReductionMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.alertReductionMetrics = [];
      // Allow a retry with identical criteria after a failed fetch.
      this.alertsLoadedCriteriaKey = '';
    }, 'alertReduction');
  }

  getAlertResponseMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertResponseMetrics = [];
    this.loadWidget(this.loaderNames.alertResponse, this.svc.getAlertResponseMetrics(filterFormOutput), res => {
      this.alertResponseMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.alertResponseMetrics = [];
      this.alertsLoadedCriteriaKey = '';
    }, 'alertResponse');
  }

  getAlertSourceSankey(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertSourceSankeyOptions = {};
    this.loadWidget(this.loaderNames.alertSourceSankey, this.svc.getAlertSourceSankey(filterFormOutput), res => {
      this.alertSourceSankeyOptions = this.svc.convertToAlertSourceSankeyOptions(res);
    }, () => {
      this.alertSourceSankeyOptions = {};
      this.alertsLoadedCriteriaKey = '';
    }, 'alertSourceSankey');
  }

  getAlertLifecycleSankey(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.alertLifecycleSankeyOptions = {};
    this.loadWidget(this.loaderNames.alertLifecycleSankey, this.svc.getAlertLifecycleSankey(filterFormOutput), res => {
      this.alertLifecycleSankeyOptions = this.svc.convertToAlertLifecycleSankeyOptions(res);
    }, () => {
      this.alertLifecycleSankeyOptions = {};
      this.alertsLoadedCriteriaKey = '';
    }, 'alertLifecycleSankey');
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
    }, 'orphanedDevices');
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
    }, 'orphanedByCategory');
  }

  orphanedDevicesPageChange(pageNo: number) {
    if (this.orphanedDevicesPageNo === pageNo) {
      return;
    }
    this.orphanedDevicesPageNo = pageNo;
    this.getOrphanedDevices(this.appliedFilterCriteria);
  }

  openOrphanedDevice(device: UnifiedAiopsOrphanedDeviceRow) {
    this.openRouteInNewTab(this.getCategoryRoute(device?.resourceType, device?.provider) || this.linkRoutes.devices);
  }

  openIdleDevice(device: UnifiedAiopsIdleDeviceRow) {
    this.openRouteInNewTab(this.getCategoryRoute(device?.resourceType, device?.provider) || this.linkRoutes.devices);
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
    }, 'idleDevices');
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
    }, 'idleDuration');
  }

  idleDevicesPageChange(pageNo: number) {
    if (this.idleDevicesPageNo === pageNo) {
      return;
    }
    this.idleDevicesPageNo = pageNo;
    this.getIdleDevices(this.appliedFilterCriteria);
  }

  getRecentAlertSummaryMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.recentAlertSummaryMetrics = this.svc.getEmptyRecentAlertSummaryMetrics();
    this.loadWidget(this.loaderNames.recentAlertSummary, this.svc.getRecentAlertSummaryMetrics(filterFormOutput), res => {
      this.recentAlertSummaryMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.recentAlertSummaryMetrics = this.svc.getEmptyRecentAlertSummaryMetrics();
    }, 'recentAlertSummary');
  }

  getRecentAlerts(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.recentAlerts = [];
    this.loadWidget(this.loaderNames.recentAlerts, this.svc.getRecentAlerts(filterFormOutput), res => {
      this.recentAlerts = this.svc.convertToRecentAlertsViewData(res).slice(0, this.recentAlertsDisplayLimit);
    }, () => {
      this.recentAlerts = [];
    }, 'recentAlerts');
  }

  getRemediationDonut(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationDonutOptions = {};
    this.loadWidget(this.loaderNames.remediationDonut, this.svc.getRemediationDonut(filterFormOutput), res => {
      this.remediationDonutOptions = this.svc.convertToRemediationDonutOptions(res);
    }, () => {
      this.remediationDonutOptions = {};
    }, 'remediationDonut');
  }

  getRemediationActions(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationActionsOptions = {};
    this.loadWidget(this.loaderNames.remediationActions, this.svc.getRemediationActions(filterFormOutput), res => {
      this.remediationActionsOptions = this.svc.convertToRemediationActionsOptions(res);
    }, () => {
      this.remediationActionsOptions = {};
    }, 'remediationActions');
  }

  getRemediationSummary(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationSummary = [];
    this.loadWidget(this.loaderNames.remediationSummary, this.svc.getRemediationSummary(filterFormOutput), res => {
      this.remediationSummary = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.remediationSummary = [];
    }, 'remediationSummary');
  }

  getRemediationMetrics(filterFormOutput: UnifiedAiopsDashboardFilterCriteria) {
    this.remediationMetrics = [];
    this.loadWidget(this.loaderNames.remediationMetrics, this.svc.getRemediationMetrics(filterFormOutput), res => {
      this.remediationMetrics = this.svc.convertToRemediationMetricsViewData(res);
    }, () => {
      this.remediationMetrics = [];
    }, 'remediationMetrics');
  }

  private startWidgetLoadingState() {
    this.widgetLoadingKeys.forEach(key => this.widgetLoading[key] = true);
  }

  get hasSummaryMetrics(): boolean {
    return this.widgetLoading.summaryMetrics || !!this.executiveView;
  }

  get hasDiscovery(): boolean {
    return this.widgetLoading.discovery || !!this.discoveryDisplayRows.length || this.isDiscoveryFiltered;
  }

  get hasAlertSegregation(): boolean {
    return this.widgetLoading.alertSegregation || !!this.alertSegregationDisplayItems.length || this.isAlertSegregationFiltered;
  }

  get hasBusinessServices(): boolean {
    return this.widgetLoading.businessServices || !!this.businessServices?.length;
  }

  get hasEmployeeExperience(): boolean {
    return this.showEmployeeExperienceWidget;
  }

  get hasGeoDistribution(): boolean {
    return this.widgetLoading.geoDistribution || this.hasChartData(this.geoHeatmapOptions);
  }

  get hasPrivateCloudCoverage(): boolean {
    return this.widgetLoading.privateCloudCoverage || this.hasCoverageValues(this.privateCloudCoverage);
  }

  /** The resource bar chart renders only when the response has a single private cloud type. */
  get showPrivateCloudCoverageChart(): boolean {
    return this.privateCloudCoverage.length === 1;
  }

  get hasPublicCloudCoverage(): boolean {
    return this.widgetLoading.publicCloudCoverage ||
      (this.publicCloudCoverageGroups || []).some(group => this.hasCoverageValues(group.cards));
  }

  get hasDatacenterGeographies(): boolean {
    return this.widgetLoading.datacenterGeographies ||
      (this.mapSvc.shouldShowMapWidgets() && this.datacenterGeographiesMapAvailable && !!this.datacenterGeographyViewData?.length);
  }

  get hasApplicationRows(): boolean {
    return this.widgetLoading.applications || !!this.applicationRows?.length;
  }

  get hasServiceRows(): boolean {
    return this.widgetLoading.serviceApplications || this.widgetLoading.services
      || !!this.serviceApplicationOptions?.length || !!this.serviceRows?.length;
  }

  get hasDatabaseRows(): boolean {
    return this.widgetLoading.databases || !!this.databaseRows?.length;
  }

  get hasOsRows(): boolean {
    return this.widgetLoading.os || !!this.osRows?.length;
  }

  get hasApplicationServiceSection(): boolean {
    return this.hasApplicationRows || this.hasServiceRows;
  }

  get hasMonitoringTableSection(): boolean {
    return this.hasDatabaseRows || this.hasOsRows;
  }

  get hasBandwidthBar(): boolean {
    return this.widgetLoading.bandwidthBar || this.hasChartData(this.bandwidthBarOptions);
  }

  get hasBandwidthLine(): boolean {
    return this.widgetLoading.bandwidthLine || this.hasChartData(this.bandwidthLineOptions);
  }

  get hasPlatformPerformance(): boolean {
    return this.widgetLoading.platformPerformance || this.hasChartData(this.platformPerformanceOptions);
  }

  get hasPerformanceMetrics(): boolean {
    return this.widgetLoading.performanceMetrics || (this.performanceMetrics || []).some(metric => metric?.hasData);
  }

  get hasPerformanceSection(): boolean {
    return this.hasBandwidthBar || this.hasBandwidthLine || this.hasPlatformPerformance || this.hasPerformanceMetrics;
  }

  private getEmptyAvailabilityCategorySummary(): UnifiedAiopsAvailabilityCategorySummary {
    return {
      up: 'NA',
      down: 'NA',
      unknown: 'NA'
    };
  }

  get hasDeviceAvailability(): boolean {
    return this.widgetLoading.deviceAvailability || this.hasChartData(this.deviceAvailabilityOptions);
  }

  get hasAvailabilityCategory(): boolean {
    return this.widgetLoading.availabilityCategory || this.hasChartData(this.availabilityCategoryOptions) || this.isAvailabilityCategoryFiltered;
  }

  get hasAlertTrend(): boolean {
    return this.widgetLoading.alertTrend || this.hasChartData(this.alertTrendOptions);
  }

  get hasAnalyticsSection(): boolean {
    return this.hasDeviceAvailability || this.hasAvailabilityCategory || this.hasAlertTrend;
  }

  get hasAlertMetrics(): boolean {
    return this.widgetLoading.alertReduction ||
      this.widgetLoading.alertResponse ||
      this.hasMetricValues(this.alertReductionMetrics) ||
      this.hasMetricValues(this.alertResponseMetrics);
  }

  get hasAlertSourceSankey(): boolean {
    return this.widgetLoading.alertSourceSankey || this.hasChartData(this.alertSourceSankeyOptions);
  }

  get hasAlertLifecycleSankey(): boolean {
    return this.widgetLoading.alertLifecycleSankey || this.hasChartData(this.alertLifecycleSankeyOptions);
  }

  get hasAlertsSection(): boolean {
    return this.hasAlertMetrics || this.hasAlertSourceSankey || this.hasAlertLifecycleSankey;
  }

  get hasOrphanedDevices(): boolean {
    return this.widgetLoading.orphanedDevices || !!this.orphanedDevices?.length;
  }

  get hasOrphanedByCategory(): boolean {
    return this.widgetLoading.orphanedByCategory || this.orphanedByCategoryHasData;
  }

  get hasIdleDevices(): boolean {
    return this.widgetLoading.idleDevices || !!this.idleDevices?.length;
  }

  get hasIdleDuration(): boolean {
    return this.widgetLoading.idleDuration || this.idleDurationHasData;
  }

  get hasRecentAlertSummary(): boolean {
    return this.widgetLoading.recentAlertSummary ||
      this.hasMetricValues(this.recentAlertSummaryMetrics) ||
      (this.recentAlertSummaryMetrics || []).some(metric => metric?.hasData);
  }

  get hasRecentAlerts(): boolean {
    return this.widgetLoading.recentAlerts || !!this.recentAlerts?.length;
  }

  get hasRecentAlertsSection(): boolean {
    return this.hasRecentAlertSummary || this.hasRecentAlerts;
  }

  get hasRemediationDonut(): boolean {
    return this.widgetLoading.remediationDonut || this.hasChartData(this.remediationDonutOptions);
  }

  get hasRemediationActions(): boolean {
    return this.widgetLoading.remediationActions || this.hasChartData(this.remediationActionsOptions);
  }

  get hasRemediationSummary(): boolean {
    return this.widgetLoading.remediationSummary || this.hasMetricValues(this.remediationSummary);
  }

  get hasRemediationMetrics(): boolean {
    return this.widgetLoading.remediationMetrics || this.hasMetricValues(this.remediationMetrics);
  }

  get hasRemediationSection(): boolean {
    return this.hasRemediationDonut || this.hasRemediationActions || this.hasRemediationSummary || this.hasRemediationMetrics;
  }

  get hasAnyDashboardWidget(): boolean {
    return this.hasSummaryMetrics ||
      this.hasDiscovery ||
      this.hasAlertSegregation ||
      this.hasBusinessServices ||
      this.hasEmployeeExperience ||
      this.hasGeoDistribution ||
      this.hasPrivateCloudCoverage ||
      this.hasPublicCloudCoverage ||
      this.hasDatacenterGeographies ||
      this.hasApplicationRows ||
      this.hasServiceRows ||
      this.hasDatabaseRows ||
      this.hasOsRows ||
      this.hasPerformanceSection ||
      this.hasAnalyticsSection ||
      this.hasAlertsSection ||
      this.hasOrphanedDevices ||
      this.hasOrphanedByCategory ||
      this.hasIdleDevices ||
      this.hasIdleDuration ||
      this.hasRecentAlertsSection ||
      this.hasRemediationSection;
  }

  private hasMetricValues(metrics: Array<{ value?: string | number; up?: string | number; down?: string | number; unknown?: string | number }>): boolean {
    return (metrics || []).some(metric =>
      this.getNumericValue(metric?.value) > 0 ||
      this.getNumericValue(metric?.up) > 0 ||
      this.getNumericValue(metric?.down) > 0 ||
      this.getNumericValue(metric?.unknown) > 0
    );
  }

  private hasCoverageValues(cards: UnifiedAiopsCoverageCard[]): boolean {
    return (cards || []).some(card => (card.rows || []).some(row => this.getNumericValue(row?.value) > 0));
  }

  private getNumericValue(value: string | number | undefined | null): number {
    return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
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

  hasChartData(options?: EChartsOption): boolean {
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
      if (this.hasChartDataValue(item.links) || this.hasChartDataValue(item.edges)) {
        return true;
      }
      const data = item.data;
      if (Array.isArray(data)) {
        return data.some(dataItem => this.hasChartDataValue(dataItem));
      }
      return this.hasChartDataValue(data);
    });
  }

  private hasChartDataValue(data: any): boolean {
    if (data === null || data === undefined) {
      return false;
    }
    if (typeof data === 'number') {
      return data > 0;
    }
    if (typeof data === 'string') {
      return false;
    }
    if (Array.isArray(data)) {
      return data.some(item => this.hasChartDataValue(item));
    }
    if (typeof data === 'object') {
      if (this.getNumericValue(data.value) > 0 || this.getNumericValue(data.count) > 0) {
        return true;
      }
      if (Array.isArray(data.source) && Array.isArray(data.target)) {
        return true;
      }
      return Object.keys(data)
        .filter(key => !['name', 'itemStyle', 'label', 'lineStyle', 'emphasis', 'tooltip', 'symbol', 'symbolSize'].includes(key))
        .some(key => this.hasChartDataValue(data[key]));
    }
    return false;
  }

  openExecLink(link?: string) {
    this.openRouteInNewTab(this.getExecLinkRoute(link));
  }

  canOpenExecLink(link?: string): boolean {
    return !!this.getExecLinkRoute(link);
  }

  private getExecLinkRoute(link?: string): any[] | null {
    const route = link ? (this.linkRoutes as { [key: string]: any })[link] : null;
    return Array.isArray(route) ? route : null;
  }

  openDeviceDiscovery() {
    this.openRouteInNewTab(this.linkRoutes.devices);
  }

  onDiscoveryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(this.getDiscoveryCategoryRoute(this.getChartParamLabel(params)));
    });
  }

  openDiscoveryCategory(row: UnifiedAiopsDiscoveryCoverageRow) {
    this.openRouteInNewTab(this.getDiscoveryCategoryRoute(row?.category));
  }

  canOpenDiscoveryCategory(row: UnifiedAiopsDiscoveryCoverageRow): boolean {
    return !!this.getDiscoveryCategoryRoute(row?.category);
  }

  private getDiscoveryCategoryRoute(category: string | undefined): any[] | null {
    const value = this.normalizeLinkText(category);
    if (value.includes('sd_wan') || value.includes('sdwan')) {
      return this.linkRoutes.networkControllers;
    }
    if (value.includes('application')) {
      return this.linkRoutes.applications;
    }
    if (value.includes('database')) {
      return this.linkRoutes.databases;
    }
    if (this.isKubernetesResource(value) || value.includes('container')) {
      return this.linkRoutes.kubernetes;
    }
    if (value.includes('baremetal') || value.includes('bare_metal')) {
      return this.linkRoutes.bmservers;
    }
    if (this.isGpuResource(value)) {
      return this.linkRoutes.gpu;
    }
    if (this.isStorageResource(value)) {
      return this.linkRoutes.storage;
    }
    if (value.includes('network')) {
      return this.linkRoutes.switches;
    }
    if (value.includes('private_cloud')) {
      return this.linkRoutes.pccloud;
    }
    if (value.includes('public_cloud')) {
      return this.linkRoutes.publicCloud;
    }
    if (value.includes('sensor') || value.includes('other')) {
      return this.linkRoutes.otherDevices;
    }
    return null;
  }

  openAlerts() {
    this.openRouteInNewTab(this.linkRoutes.alerts);
  }

  onAlertSegregationChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openAlerts());
  }

  openBusinessServices() {
    this.openRouteInNewTab(this.linkRoutes.businessService);
  }

  openBusinessService(row: UnifiedAiopsBusinessService) {
    const serviceId = row?.id;
    this.openRouteInNewTab(serviceId ? ['/unitycloud/business-service', serviceId, 'summary'] : null);
  }

  canOpenBusinessService(row: UnifiedAiopsBusinessService): boolean {
    return !!row?.id;
  }

  openEmployeeExperience() {
    window.open(UNIFIED_AIOPS_EMPLOYEE_EXPERIENCE_EXTERNAL_URL, '_blank', 'noopener');
  }

  openDatacenters() {
    this.openRouteInNewTab(this.linkRoutes.datacenter);
  }

  openPublicCloudGeoDistribution() {
    this.openRouteInNewTab(this.linkRoutes.publicCloudProvider.aws);
  }

  onGeoDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openPublicCloudGeoDistribution());
  }

  openPrivateCloudCoverage(provider?: UnifiedAiopsCoverageCard, row?: { label: string; value: string }) {
    this.openRouteInNewTab(this.getPrivateCoverageRoute(provider, row));
  }

  /** Public Cloud coverage links the provider total and each service count to that provider's public cloud page. */
  openPublicCloudProvider(provider?: UnifiedAiopsCoverageCard) {
    this.openRouteInNewTab(this.getProviderRoute(provider?.title, false));
  }

  canOpenPublicCloudProvider(provider?: UnifiedAiopsCoverageCard): boolean {
    return !!this.getProviderRoute(provider?.title, false);
  }

  canOpenPrivateCloudCoverage(provider?: UnifiedAiopsCoverageCard, row?: { label: string; value: string }): boolean {
    return !!this.getPrivateCoverageRoute(provider, row);
  }

  openDatacenterGeography(location: WorldMapWidgetViewdata) {
    const datacenters = location?.datacenters || [];
    const datacenterId = datacenters.length === 1 ? datacenters[0]?.uuid : '';
    this.openRouteInNewTab(datacenterId ? ['/unitycloud/datacenter', datacenterId] : null);
  }

  openApplicationDashboard() {
    this.openRouteInNewTab(this.linkRoutes.applications);
  }

  openApplicationRow(row: UnifiedAiopsTableRow) {
    const applicationId = row?.applicationId || row?.id || row?.uuid;
    this.openRouteInNewTab(applicationId ? ['/unitycloud/applications', applicationId, 'services'] : null);
  }

  canOpenApplicationRow(row: UnifiedAiopsTableRow): boolean {
    return !!(row?.applicationId || row?.id || row?.uuid);
  }

  openServicesOverview() {
    this.openRouteInNewTab(this.selectedServiceApplicationId
      ? ['/unitycloud/applications', this.selectedServiceApplicationId, 'services']
      : this.linkRoutes.applications);
  }

  openServiceRow(row: UnifiedAiopsTableRow) {
    const applicationId = row?.applicationId || this.selectedServiceApplicationId;
    const serviceId = row?.id || row?.uuid;
    if (applicationId && serviceId) {
      this.openRouteInNewTab(['/unitycloud/applications', applicationId, 'services', serviceId, 'details']);
      return;
    }
    this.openRouteInNewTab(applicationId ? ['/unitycloud/applications', applicationId, 'services'] : null);
  }

  canOpenServiceRow(row: UnifiedAiopsTableRow): boolean {
    return !!(row?.id || row?.uuid || row?.applicationId || this.selectedServiceApplicationId);
  }

  openDatabaseMonitoring() {
    this.openRouteInNewTab(this.linkRoutes.databases);
  }

  onPlatformPerformanceChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      const providerRoute = this.getProviderRoute(this.getChartParamLabel(params), false);
      this.openRouteInNewTab(providerRoute);
    });
  }

  onAvailabilityCategoryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(this.getCategoryRoute(this.getChartParamLabel(params)));
    });
  }

  onAlertTrendChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openAlerts());
  }

  onAlertSankeyChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openAlerts());
  }

  openRecentAlerts() {
    this.openAlerts();
  }

  showAlertDetails(alert: UnifiedAiopsRecentAlert) {
    const alertId = alert?.uuid || alert?.id;
    if (alertId) {
      this.alertDetailSvc.showAlertDetails(alertId);
    }
  }

  openAutoRemediation() {
    this.openRouteInNewTab(this.linkRoutes.autoRemediation);
  }

  onRemediationChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openAutoRemediation());
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

  private openRouteInNewTab(commands: any[] | null) {
    if (!commands?.length) {
      return;
    }
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

  private getPrivateCoverageRoute(provider?: UnifiedAiopsCoverageCard, row?: { label: string; value: string }): any[] | null {
    const rowLabel = this.normalizeLinkText(row?.label);
    const providerLabel = this.normalizeLinkText(provider?.title);
    if (this.isVmResource(rowLabel)) {
      return this.linkRoutes.vmAll;
    }
    if (rowLabel.includes('hypervisor')) {
      return this.linkRoutes.hypervisors;
    }
    if (rowLabel.includes('database') || rowLabel.includes('db')) {
      return this.linkRoutes.databases;
    }
    if (rowLabel) {
      return this.getCategoryRoute(rowLabel, providerLabel);
    }
    return providerLabel ? this.linkRoutes.pccloud : null;
  }

  private getCategoryRoute(value: string | undefined, provider?: string | undefined): any[] | null {
    const normalizedValue = this.normalizeLinkText(value);
    const providerKey = this.getProviderKey(provider);
    if (this.isVmResource(normalizedValue)) {
      return providerKey ? this.getProviderVmRoute(providerKey) : this.linkRoutes.vmAll;
    }
    if (this.isKubernetesResource(normalizedValue)) {
      return this.linkRoutes.kubernetes;
    }
    if (this.isStorageResource(normalizedValue)) {
      return this.linkRoutes.storage;
    }
    if (normalizedValue.includes('bare_metal') || normalizedValue.includes('baremetal')) {
      return this.linkRoutes.bmservers;
    }
    if (this.isGpuResource(normalizedValue)) {
      return this.linkRoutes.gpu;
    }
    if (normalizedValue.includes('database') || normalizedValue.includes('db')) {
      return this.linkRoutes.databases;
    }
    if (normalizedValue.includes('switch')) {
      return this.linkRoutes.switches;
    }
    if (normalizedValue.includes('firewall')) {
      return this.linkRoutes.firewalls;
    }
    if (normalizedValue.includes('load_balancer') || normalizedValue.includes('loadbalancer')) {
      return this.linkRoutes.loadbalancers;
    }
    if (normalizedValue.includes('network')) {
      return this.linkRoutes.switches;
    }
    if (normalizedValue.includes('hypervisor')) {
      return this.linkRoutes.hypervisors;
    }
    return this.getProviderRoute(normalizedValue, false);
  }

  private getProviderRoute(value: string | undefined, withFallback = true): any[] | null {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.publicCloudProvider.aws;
      case 'azure':
        return this.linkRoutes.publicCloudProvider.azure;
      case 'gcp':
        return this.linkRoutes.publicCloudProvider.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.publicCloudProvider.oracle;
      default:
        return withFallback ? this.linkRoutes.publicCloud : null;
    }
  }

  private getProviderVmRoute(value: string | undefined): any[] | null {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.vmProvider.aws;
      case 'azure':
        return this.linkRoutes.vmProvider.azure;
      case 'gcp':
        return this.linkRoutes.vmProvider.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.vmProvider.oracle;
      default:
        return value ? null : this.linkRoutes.vmAll;
    }
  }

  private getProviderKey(value: string | undefined): string {
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

  private getChartParamLabel(params: any): string {
    return params?.data?.category || params?.data?.label || params?.data?.name || params?.name || params?.seriesName || '';
  }

  private isVmResource(value: string): boolean {
    return value.includes('vm') || value.includes('virtual_machine') || value.includes('instance');
  }

  private isStorageResource(value: string): boolean {
    return value.includes('storage') || value.includes('volume') || value.includes('disk');
  }

  private isKubernetesResource(value: string): boolean {
    return value.includes('kubernetes') || value.includes('k8s') || value.includes('container') || value.includes('pod');
  }

  private isGpuResource(value: string): boolean {
    return value.includes('gpu');
  }

  private normalizeLinkText(value: string | undefined): string {
    return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  }

  private loadWidget<T>(
    loaderName: string,
    request: Observable<T>,
    onSuccess: (res: T) => void,
    onError: () => void,
    loadingKey?: keyof UnifiedAiopsWidgetLoadingState
  ) {
    if (loadingKey) {
      this.widgetLoading[loadingKey] = true;
    }
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        if (loadingKey) {
          this.widgetLoading[loadingKey] = false;
        }
        setTimeout(() => this.spinnerService.stop(loaderName), 0);
      })
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
