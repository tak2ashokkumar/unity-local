import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AimlEventDetailsService } from 'src/app/shared/aiml-event-details/aiml-event-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { DEVICE_OPTIONS, DEVICE_TYPE_MAP, PLATFORM_OPTIONS, privateCloudTabItems, PRIVATE_CLOUD_TIME_RANGE_DEFAULT, PRIVATE_CLOUD_TIME_RANGE_OPTIONS } from './private-cloud-compute-dashboard.const';
import { CapacityAndGrowthInsightsWidgetData, chartColors, CpuReadyWidgetData, DevicesRowViewData, DiskLatencyWidgetData, ExecutiveSummaryDiscoveryCardViewData, ExecutiveSummaryViewData, ExecutiveSummaryWidgetData, IdleDevicesDistribution, IdleDevicesViewData, OrphanedDeviceList, OrphanedDeviceView, OrphanedDeviceWidgetView, PerformanceHotspotWidgetData, PrivateCloudComputeDashboardService, RecentAlertSummaryViewData, SwapBalloonMemoryWidgetData, TopCriticalAlertsViewData, VmDensityHost } from './private-cloud-compute-dashboard.service';
import { AutoRemediationSummaryResponse, ClusterCapacityTrendResponse, ClusterComponentSummaryFilterOptions, ClusterComponentSummaryResponse, ClusterMetricFilterOptions, ClusterMetricItem, ClusterMetricUsage, ClusterOptionItem, HypervisorHealthEnvironmentItem, HypervisorVersionComplianceItem, labelAndValueType, NetworkInterfaceItem, NewlyProvisionedVmItem, OrphanedDevice, PrivateCloudAlertSideCard, PrivateCloudGeoDistributionCell, PrivateCloudGeoDistributionViewData, PrivateCloudInventoryCardViewData, PrivateCloudUtilization, PrivateCloudUtilizationViewRow, ScopeDataType, StorageDatastoreItem, TopHeaderDataType, TopHostVmDensityItem, VmBackupRepositoryCapacityItem, VmBackupStatusItem, VmProvisioningSummaryResponse, VmWorkloadInsightItem } from './private-cloud-compute-dashboard.type';

type UtilizationSortKey = 'name' | 'cpuUtilization' | 'memoryUtilization' | 'storageUtilization' | 'networkSpeed' | 'uptime';
type SortDirection = 'asc' | 'desc';
type HypervisorHealthSortKey = 'name' | 'status' | 'vendor' | 'hv' | 'model' | 'mfr' | 'os' | 'cpuU' | 'memU' | 'storU' | 'fan' | 'psu' | 'temp' | 'hw';
type StorageDatastoreSortKey = 'name' | 'platform' | 'accountName' | 'type' | 'datacenter' | 'capacityGb' | 'usedGb' | 'percentUsed' | 'status' | 'vmCount' | 'hostCount';
type NetworkInterfaceSortKey = 'portGroup' | 'platform' | 'accountName' | 'cluster' | 'datacenter' | 'port' | 'vlan' | 'vmCount' | 'hostCount' | 'status' | 'rawStatus';
type ClusterMetricSortKey = 'platform' | 'cluster' | 'name' | 'accountName' | 'hostCount' | 'vmCount' | 'totalProcessor' | 'memoryUsage' | 'storageUsage' | 'cpuUsage';
type VmWorkloadSortKey = 'name' | 'osType' | 'platform' | 'accountName' | 'diskThroughputKbps' | 'cpuReadyPct' | 'memorySwapMb' | 'status';
type NewlyProvisionedVmSortKey = 'name' | 'status' | 'vm_state' | 'os_name' | 'cloud_type' | 'cloud_account_name' | 'provisioned_date' | 'last_discovered_date' | 'life_cycle_stage' | 'life_cycle_stage_status';
type OrphanedLifecycleSortKey = 'name' | 'osType' | 'platform' | 'accountName' | 'lifecycleStage' | 'lifecycleStatus' | 'datacenter' | 'lastSeen' | 'daysSinceStageChange' | 'stillMonitored' | 'status';
type VmBackupStatusSortKey = 'name' | 'osType' | 'platform' | 'accountName' | 'backupJob' | 'lastBackupStatus' | 'lastBackupTime' | 'ageBucket' | 'restorePoints' | 'oldestRestorePointDays' | 'backupSizeGb' | 'repository';
type HypervisorVersionComplianceSortKey = 'host' | 'platform' | 'platformGroup' | 'accountName' | 'currentVersion' | 'latestVersion' | 'versionGap' | 'compliance';
type RecentAlertSortKey = 'id' | 'deviceName' | 'severity' | 'description' | 'source' | 'acknowledged' | 'duration';

@Component({
  selector: 'private-cloud-compute-dashboard',
  templateUrl: './private-cloud-compute-dashboard.component.html',
  styleUrls: ['./private-cloud-compute-dashboard.component.scss'],
  providers: [PrivateCloudComputeDashboardService]
})
export class PrivateCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private filterFormUnsubscribe = new Subject<void>();
  private executiveSummaryChartInstances: any[] = [];
  private readonly platformRouteOptions = PLATFORM_OPTIONS;
  private readonly deviceRouteOptions = DEVICE_OPTIONS;
  private readonly deviceTypeMap = DEVICE_TYPE_MAP;
  private readonly privateCloudVmRouteOptions = privateCloudTabItems;
  readonly compactBarLabelThreshold = 10;

  filterForm: FormGroup;
  // Global Time Range (top filter): timeRangeOptions/selectedTimeRange drive the shared dropdown;
  // onTimeRangeChange patches timeRange/startDate/endDate into filterForm so getRawValue() carries them.
  readonly timeRangeOptions = PRIVATE_CLOUD_TIME_RANGE_OPTIONS;
  selectedTimeRange: string = PRIVATE_CLOUD_TIME_RANGE_DEFAULT;
  private selectedTimeRangeDates: { from: string; to: string } | null = null;
  platformOptions: labelAndValueType[] = [];
  timeRanges: any[] = []
  eventDatacenters: any[] = []
  eventClouds: any[] = []
  deviceTypes: any[] = []
  ticketDatePickerScrollStrategy: ScrollStrategy;

  datacenterOptions: labelAndValueType[] = [];
  environmentOptions: labelAndValueType[] = [];
  accountOptions: labelAndValueType[] = [];

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
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

  headerData: TopHeaderDataType = {
    lastRefreshed: '',
    scope: {
      providers: '',
      regions: '',
      accounts: '',
    }
  };
  topScope: ScopeDataType = {
    providers: '',
    regions: '',
    accounts: '',
  };

  currentCriteria: SearchCriteria;

  isDashboard: boolean = false;

  executiveSummaryViewData: ExecutiveSummaryViewData = new ExecutiveSummaryViewData();
  executiveSummaryWidgetData: ExecutiveSummaryWidgetData = new ExecutiveSummaryWidgetData();
  executiveSummaryDiscoveryCards: ExecutiveSummaryDiscoveryCardViewData[] = [];
  executiveSummaryActiveDiscoveryCard: ExecutiveSummaryDiscoveryCardViewData;
  executiveSummaryTaggedVmCount = 0;
  executiveSummaryBusinessCriticalCount = 0;
  executiveSummaryAwaitingEnvironmentTagCount = 0;
  showExecutiveSummaryWidget = true;
  privateCloudInventoryLoader: string = 'PrivateCloudInventoryLoader';
  privateCloudInventoryCards: PrivateCloudInventoryCardViewData[] = [];
  privateCloudInventoryTotalResources: number = 0;
  privateCloudInventorySortDirection: 'asc' | 'desc' = 'asc';
  showPrivateCloudInventoryWidget = true;
  privateCloudGeoDistributionLoader: string = 'PrivateCloudGeoDistributionLoader';
  privateCloudGeoDistributionViewData: PrivateCloudGeoDistributionViewData;
  privateCloudGeoDistributionChartData: UnityChartDetails;
  privateCloudGeoDistributionPlatform: string = 'all';
  showPrivateCloudGeoDistributionWidget = true;
  capacityAndGrowthInsightsWidgetData: CapacityAndGrowthInsightsWidgetData = new CapacityAndGrowthInsightsWidgetData();
  showCapacityGrowthWidget = true;
  hypervisorHealthLoader: string = 'HypervisorHealthEnvironmentLoader';
  hypervisorHealthChartLoader: string = 'HypervisorHealthChartLoader';
  hypervisorHealthRows: HypervisorHealthEnvironmentItem[] = [];
  hypervisorHealthChartRows: HypervisorHealthEnvironmentItem[] = [];
  hypervisorHealthCharts: Array<{ title: string; info: string; options: EChartsOption; legend: Array<{ label: string; color: string }> }> = [];
  hypervisorHealthTotal = 0;
  hypervisorHealthPageNo = 1;
  hypervisorHealthPageSize = 10;
  hypervisorHealthSearch = '';
  hypervisorHealthViewMode: 'table' | 'chart' = 'chart';
  hypervisorHealthSortKey: HypervisorHealthSortKey = 'name';
  hypervisorHealthSortDirection: SortDirection = 'asc';
  showHypervisorHealthWidget = true;

  storageDatastoresLoader: string = 'StorageDatastoresLoader';
  storageDatastoresChartLoader: string = 'StorageDatastoresChartLoader';
  storageDatastoreRows: StorageDatastoreItem[] = [];
  storageDatastoresChartData: EChartsOption;
  storageDatastoresTotal = 0;
  storageDatastoresPageNo = 1;
  storageDatastoresPageSize = 10;
  storageDatastoresSearch = '';
  storageDatastoresViewMode: 'table' | 'chart' = 'chart';
  storageDatastoresSortKey: StorageDatastoreSortKey = 'name';
  storageDatastoresSortDirection: SortDirection = 'asc';
  showStorageDatastoresWidget = true;
  networkInterfacesLoader: string = 'NetworkInterfacesLoader';
  networkInterfacesChartLoader: string = 'NetworkInterfacesChartLoader';
  networkInterfaceRows: NetworkInterfaceItem[] = [];
  networkInterfacesChartData: EChartsOption;
  networkInterfacesTotal = 0;
  networkInterfacesPageNo = 1;
  networkInterfacesPageSize = 10;
  networkInterfacesSearch = '';
  networkInterfacesViewMode: 'table' | 'chart' = 'chart';
  networkInterfacesSortKey: NetworkInterfaceSortKey = 'portGroup';
  networkInterfacesSortDirection: SortDirection = 'asc';
  showNetworkInterfacesWidget = true;
  clusterMetricsLoader: string = 'ClusterMetricsLoader';
  clusterMetricRows: ClusterMetricItem[] = [];
  clusterMetricsTotal = 0;
  clusterMetricsPageNo = 1;
  clusterMetricsPageSize = 10;
  clusterMetricsSearch = '';
  clusterMetricsViewMode: 'table' | 'chart' = 'chart';
  clusterMetricsSortKey: ClusterMetricSortKey = 'vmCount';
  clusterMetricsSortDirection: SortDirection = 'desc';
  clusterMetricFilterOptions: ClusterMetricFilterOptions = { platforms: [], clusters: [], accounts: [] };
  selectedClusterMetricPlatform = '';
  selectedClusterMetricCluster = '';
  selectedClusterMetricAccount = '';
  showClusterMetricsWidget = true;
  topClustersByVmCountLoader: string = 'TopClustersByVmCountLoader';
  clusterCapacityTrendLoader: string = 'ClusterCapacityTrendLoader';
  clusterComponentSummaryLoader: string = 'ClusterComponentSummaryLoader';
  topClustersByVmCountChartOptions: EChartsOption;
  clusterCapacityTrendChartOptions: EChartsOption;
  clusterComponentSummaryChartOptions: EChartsOption;
  clusterCapacityTrendData: ClusterCapacityTrendResponse;
  clusterComponentSummaryData: ClusterComponentSummaryResponse;
  selectedClusterCapacityTrendCluster = 'all';
  selectedClusterComponentPlatform = 'all';
  selectedClusterComponentCluster = 'all';
  clusterComponentFilterOptions: ClusterComponentSummaryFilterOptions = { platforms: [], clusters: [] };
  clusterPlatformLegendItems: Array<{ label: string; color: string }> = [];
  clusterComponentLegendItems: Array<{ label: string; value: number; color: string }> = [];

  performanceHotspotWidgetData: PerformanceHotspotWidgetData = new PerformanceHotspotWidgetData();
  showPerformanceHotspotsWidget = true;
  utilizationRows: PrivateCloudUtilization = new PrivateCloudUtilization()
  utilizationSortOptions: { value: UtilizationSortKey; label: string }[] = [
    { value: 'cpuUtilization', label: 'CPU Utilization' },
    { value: 'memoryUtilization', label: 'Memory Utilization' },
    { value: 'storageUtilization', label: 'Storage Utilization' },
    { value: 'networkSpeed', label: 'Network Speed' },
    { value: 'uptime', label: 'Up Time' }
  ];
  selectedUtilizationSort: UtilizationSortKey = 'cpuUtilization';
  utilizationSortDirection: SortDirection = 'desc';
  utilizationSearch: string = '';
  utilizationPageNo = 1;
  utilizationPageSize = 10;
  utilizationTotal = 0;
  utilizationViewMode: 'table' | 'chart' = 'chart';
  utilizationCpuMemoryChartOptions: EChartsOption = null;
  utilizationStorageChartOptions: EChartsOption = null;

  idleDevicesRow: IdleDevicesViewData = new IdleDevicesViewData()
  idleDistributionRows: IdleDevicesDistribution = new IdleDevicesDistribution()
  showIdleDevicesAnalysisWidget = true;
  showIdleDurationDistributionWidget = true;
  idleDevicesViewMode: 'table' | 'chart' = 'chart';
  idleDevicesSearch: string = '';
  idleDurationChartOptions: EChartsOption = null;

  diskLatencyWidgetData: DiskLatencyWidgetData = new DiskLatencyWidgetData();
  cpuReadyWidgetData: CpuReadyWidgetData = new CpuReadyWidgetData();
  swapBalloonMemoryWidgetData: SwapBalloonMemoryWidgetData = new SwapBalloonMemoryWidgetData();
  showPerformanceWorkloadInsightsWidget = true;
  vmWorkloadLoader: string = 'VmWorkloadLoader';
  vmWorkloadChartLoader: string = 'VmWorkloadChartLoader';
  vmWorkloadRows: VmWorkloadInsightItem[] = [];
  vmWorkloadTotal = 0;
  vmWorkloadPageNo = 1;
  vmWorkloadPageSize = 10;
  vmWorkloadSearch = '';
  vmWorkloadViewMode: 'table' | 'chart' = 'chart';
  vmWorkloadSortKey: VmWorkloadSortKey = 'name';
  vmWorkloadSortDirection: SortDirection = 'asc';
  vmWorkloadDiskChartOptions: EChartsOption;
  vmWorkloadScatterChartOptions: EChartsOption;
  vmWorkloadStatusChartOptions: EChartsOption;
  vmWorkloadStatusBreakdown = { Healthy: 0, Warning: 0, Critical: 0 };
  newlyProvisionedVmsLoader: string = 'NewlyProvisionedVmsLoader';
  newlyProvisionedVmsChartLoader: string = 'NewlyProvisionedVmsChartLoader';
  newlyProvisionedVmRows: NewlyProvisionedVmItem[] = [];
  newlyProvisionedVmsTotal = 0;
  newlyProvisionedVmsPageNo = 1;
  newlyProvisionedVmsPageSize = 10;
  newlyProvisionedVmsSearch = '';
  newlyProvisionedVmsViewMode: 'table' | 'chart' = 'chart';
  newlyProvisionedVmsSortKey: NewlyProvisionedVmSortKey = 'provisioned_date';
  newlyProvisionedVmsSortDirection: SortDirection = 'desc';
  newlyProvisionedWithin = 'Last 30 Days';
  newlyProvisionedVmStateChartOptions: EChartsOption;
  newlyProvisionedCloudAccountChartOptions: EChartsOption;
  newlyProvisionedTimelineChartOptions: EChartsOption;
  newlyProvisionedVmStateBreakdown = { up: 0, down: 0 };
  showNewlyProvisionedVmsWidget = true;



  alertSummaryMetrics: RecentAlertSummaryViewData = new RecentAlertSummaryViewData();
  criticalAlerts: TopCriticalAlertsViewData = new TopCriticalAlertsViewData()
  showRecentAlertsWidget = true;
  recentAlertsViewMode: 'table' | 'chart' = 'chart';
  recentAlertsSearch = '';
  recentAlertsPageNo = 1;
  recentAlertsPageSize = 10;
  recentAlertsTotal = 0;
  recentAlertsSortKey: RecentAlertSortKey = 'id';
  recentAlertsSortDirection: SortDirection = 'desc';
  recentAlertSeverityChartOptions: EChartsOption;
  recentAlertTopDevicesChartOptions: EChartsOption;
  autoRemediationSummaryLoader: string = 'AutoRemediationSummaryLoader';
  autoRemediationSummary: AutoRemediationSummaryResponse;
  autoRemediationRunbookChartOptions: EChartsOption;
  autoRemediationActionsChartOptions: EChartsOption;
  showAutoRemediationSummaryWidget = true;
  vmProvisioningSummaryLoader: string = 'VmProvisioningSummaryLoader';
  vmProvisioningSummary: VmProvisioningSummaryResponse;
  vmProvisioningReachabilityChartOptions: EChartsOption;
  vmProvisioningTrendSummaryChartOptions: EChartsOption;
  vmProvisioningCloudAccountSummaryChartOptions: EChartsOption;
  showVmProvisioningSummaryWidget = true;
  alertTrendLegend: any;
  alertTrendPolarOptions: EChartsOption = {};
  alertTrendStackOptions: EChartsOption = {};
  alertSideCards: PrivateCloudAlertSideCard[] = [];

  timeRangeFilter: string = '';
  eventDatacentersFilter: string = '';
  eventCloudsFilter: string = '';
  deviceTypesFilter: string = '';

  orphanedDeviceListViewData: OrphanedDeviceView = new OrphanedDeviceView()
  orphanedDeviceWidgetViewData: OrphanedDeviceWidgetView = new OrphanedDeviceWidgetView()
  showOrphanedDeviceListWidget = true;
  showOrphanedByCategoryWidget = true;

  orphanedByCategoryColors = chartColors;
  orphanedByCategory: any[] = []

  orphanedDevicesPageNo = 1;
  orphanedDevicesPageSize = 10;
  orphanedDevicesTotal = 0;
  orphanedLifecycleRows: OrphanedDevice[] = [];
  orphanedLifecycleViewMode: 'table' | 'chart' = 'chart';
  orphanedLifecycleSearch = '';
  orphanedLifecycleSortKey: OrphanedLifecycleSortKey = 'name';
  orphanedLifecycleSortDirection: SortDirection = 'asc';
  orphanedLifecycleStageChartOptions: EChartsOption;
  orphanedLifecycleOsChartOptions: EChartsOption;
  orphanedLifecycleDaysChartOptions: EChartsOption;
  orphanedLifecycleDatacenterChartOptions: EChartsOption;
  orphanedLifecycleStageLegendItems: Array<{ label: string; value: number; color: string }> = [];
  orphanedLifecycleOsLegendItems: Array<{ label: string; value: number; color: string }> = [];
  vmBackupStatusLoader: string = 'VmBackupStatusLoader';
  vmBackupStatusChartLoader: string = 'VmBackupStatusChartLoader';
  vmBackupStatusRows: VmBackupStatusItem[] = [];
  vmBackupStatusTotal = 0;
  vmBackupStatusPageNo = 1;
  vmBackupStatusPageSize = 10;
  vmBackupStatusSearch = '';
  vmBackupStatusViewMode: 'table' | 'chart' = 'chart';
  vmBackupStatusSortKey: VmBackupStatusSortKey = 'name';
  vmBackupStatusSortDirection: SortDirection = 'asc';
  vmBackupProtectedChartOptions: EChartsOption;
  vmBackupAgeChartOptions: EChartsOption;
  vmBackupJobTrendChartOptions: EChartsOption;
  vmBackupRestorePointChartOptions: EChartsOption;
  vmBackupRepositoryCapacityRows: VmBackupRepositoryCapacityItem[] = [];
  showVmBackupStatusWidget = true;
  hypervisorVersionComplianceLoader: string = 'HypervisorVersionComplianceLoader';
  hypervisorVersionComplianceChartLoader: string = 'HypervisorVersionComplianceChartLoader';
  hypervisorVersionComplianceRows: HypervisorVersionComplianceItem[] = [];
  hypervisorVersionComplianceTotal = 0;
  hypervisorVersionCompliancePageNo = 1;
  hypervisorVersionCompliancePageSize = 10;
  hypervisorVersionComplianceSearch = '';
  hypervisorVersionComplianceViewMode: 'table' | 'chart' = 'chart';
  hypervisorVersionComplianceSortKey: HypervisorVersionComplianceSortKey = 'host';
  hypervisorVersionComplianceSortDirection: SortDirection = 'asc';
  hypervisorVersionGapChartOptions: EChartsOption;
  hypervisorVersionPlatformChartOptions: EChartsOption;
  showHypervisorVersionComplianceWidget = true;

  idleDevicesPageNo = 1;
  idleDevicesPageSize = 10;
  idleDevicesTotal = 0;



  loaderNames = {
    filters: 'privateCloudFiltersLoader',
    utilization: 'privateCloudUtilizationLoader',
    latencyWorkloads: 'privateCloudLatencyWorkloadsLoader',
    errorRateWorkloads: 'privateCloudErrorRateWorkloadsLoader',
    databasePerformance: 'privateCloudDatabasePerformanceLoader',
    databaseLatencyBadges: 'privateCloudDatabaseLatencyBadgesLoader',
    alertSummary: 'privateCloudAlertSummaryLoader',
    criticalAlerts: 'privateCloudCriticalAlertsLoader',
    alertTrend: 'privateCloudAlertTrendLoader',
    alertSideCards: 'privateCloudAlertSideCardsLoader',
    ITSMTicketList: 'ITSMTicketLoader',
    performanceHotspot: 'performanceHotspotLoader'
  };
  idleDistributionChartData: UnityChartDetails;

  constructor(private svc: PrivateCloudComputeDashboardService,
    private router: Router,
    private alertDetailSvc: AimlEventDetailsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,
    private overlay: Overlay,
    private location: Location) {
    this.ticketDatePickerScrollStrategy = this.overlay.scrollStrategies.reposition();
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': null }]
    };
  }




  ngOnInit(): void {
    this.getHeaderInfo();
    this.buildFilterForm();
    this.getFilterDropdowns();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  getHeaderInfo() {
    this.svc.getHeaderInfo()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.headerData.lastRefreshed = res.lastRefreshed;
          this.topScope = res.scope;
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get header scope data. Try again later'));
      });
  }

  getFilterDropdowns() {
    this.svc.getFilterDropdowns()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.accountOptions = res.accounts ? res.accounts : [];
          this.datacenterOptions = res.datacenters ? res.datacenters : [];
          this.environmentOptions = res.environments ? res.environments : [];
          this.platformOptions = res.platforms ? res.platforms : [];
          this.deviceTypes = res.deviceTypes ? res.deviceTypes : [];
          this.eventClouds = res.eventClouds ? res.eventClouds : [];
          this.eventDatacenters = res.eventDatacenters ? res.eventDatacenters : [];
          this.timeRanges = res.timeRanges ? res.timeRanges : [];
          this.initializeDefaultFilterSelections();
          this.loadWidgets();
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get filter dropdown values data. Try again later'));
        this.loadWidgets();
      });
  }

  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm();
    this.onTimeRangeChange({ period: this.selectedTimeRange });
  }

  private initializeDefaultFilterSelections() {
    this.filterForm.patchValue({
      platforms: this.getSelectedFilterValues(this.platformOptions),
      datacenters: this.getSelectedFilterValues(this.datacenterOptions),
      environments: this.getSelectedFilterValues(this.environmentOptions),
      accounts: this.getSelectedFilterValues(this.accountOptions)
    }, { emitEvent: false });
  }

  private getSelectedFilterValues(options: labelAndValueType[]): string[] {
    return (options || [])
      .map(option => option?.value)
      .filter((value): value is string => !!value);
  }

  loadWidgets() {
    // const filterFormOutput = this.getFilterFormOutput();

    this.getExecutiveSummaryWidgetData();
    this.getPrivateCloudInventoryData();
    this.getPrivateCloudGeoDistributionData();
    this.getCapacityGrowthWidgetData();
    this.getHypervisorHealthChartData();
    this.getHypervisorHealthEnvironmentData();
    this.getStorageDatastoresChartData();
    this.getStorageDatastoresData();
    this.getNetworkInterfacesChartData();
    this.getNetworkInterfacesData();
    if (this.clusterMetricsViewMode === 'chart') {
      this.getClusterMetricsChartData();
    }
    this.getClusterMetricsData();
    this.getPerformanceHotspotWidgetData();
    this.getVmWorkloadChartData();
    this.getPerformanceWorkloadWidgetData();
    this.getNewlyProvisionedVmsChartData();
    this.getNewlyProvisionedVmsData();
    this.getRecentAlertsChartData();
    this.getAlertAndEventsWidgetData();
    this.getAutoRemediationSummary();
    this.getVmProvisioningSummary();
    this.getOrphanedDeviceData()
    this.getVmBackupStatusChartData();
    this.getVmBackupStatusData();
    this.getHypervisorVersionComplianceChartData();
    this.getHypervisorVersionComplianceData();
    this.getIdleDevicesData()
  }

  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.selectedTimeRange = PRIVATE_CLOUD_TIME_RANGE_DEFAULT;
    this.selectedTimeRangeDates = null;
    this.platformOptions = [];
    this.datacenterOptions = [];
    this.environmentOptions = [];
    this.accountOptions = [];
  }

  //---------Executive Summary / Cloud Inventory------

  getExecutiveSummaryWidgetData() {
    this.showExecutiveSummaryWidget = true;
    this.executiveSummaryChartInstances = [];

    this.executiveSummaryWidgetData.cloudTypeChartData = null;
    this.executiveSummaryWidgetData.powerActivityChartData = null;
    this.executiveSummaryWidgetData.resourceAllocationChartData = null;
    this.executiveSummaryWidgetData.vmCountByOSTypeChartData = null;
    this.executiveSummaryWidgetData.environmentAndCriticalityChartData = null;
    this.executiveSummaryWidgetData.alertSeverityViewData = null;
    this.executiveSummaryDiscoveryCards = [];
    this.executiveSummaryTaggedVmCount = 0;
    this.executiveSummaryBusinessCriticalCount = 0;
    this.executiveSummaryAwaitingEnvironmentTagCount = 0;


    this.startExecutiveSummaryWidgetLoaders()
    this.svc.getExecutiveSummaryWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopExecutiveSummaryWidgetLoaders()))
      .subscribe(res => {
        if (res) {
          this.showExecutiveSummaryWidget = this.hasExecutiveSummaryWidgetData(res);
          this.executiveSummaryViewData = this.svc.convertExecutiveSummaryViewData(res.executiveSummary, res.kpiRow, res.discoveryCards);
          this.executiveSummaryDiscoveryCards = this.svc.convertExecutiveSummaryDiscoveryCards(res);
          this.executiveSummaryWidgetData.cloudTypeChartData = this.svc.convertToCloudTypeChartData(res.cloudTypeDistribution);
          this.executiveSummaryWidgetData.powerActivityChartData = this.svc.convertToPowerActivityChartData(res.powerActivityState);
          this.executiveSummaryWidgetData.resourceAllocationChartData = res.allocPreview?.length
            ? this.svc.convertToAllocationPreviewChartData(res.allocPreview)
            : this.svc.convertToResourceAllocationChartData(res.resourceAllocation);
          this.executiveSummaryWidgetData.vmCountByOSTypeChartData = this.svc.convertToVmCountByOSTypeChartData(res.vmCountByOSType);
          this.executiveSummaryWidgetData.environmentAndCriticalityChartData = this.svc.convertToEnvironmentAndCriticalityChartData(res.environmentCriticality);
          this.executiveSummaryWidgetData.alertSeverityViewData = this.svc.convertToAlertSeverityViewData(res.alertsSeverity);
          this.executiveSummaryTaggedVmCount = this.getExecutiveSummaryTaggedVmCount(res.environmentCriticality);
          this.executiveSummaryBusinessCriticalCount = this.getExecutiveSummaryEnvironmentCount(res.environmentCriticality, 'Production');
          this.executiveSummaryAwaitingEnvironmentTagCount = this.getExecutiveSummaryEnvironmentCount(res.environmentCriticality, 'Untagged');
          this.resizeExecutiveSummaryCharts();
        } else {
          this.showExecutiveSummaryWidget = false;
        }
      }, (_err: HttpErrorResponse) => {
        this.executiveSummaryWidgetData.cloudTypeChartData = null;
        this.executiveSummaryWidgetData.powerActivityChartData = null;
        this.executiveSummaryWidgetData.resourceAllocationChartData = null;
        this.executiveSummaryWidgetData.vmCountByOSTypeChartData = null;
        this.executiveSummaryWidgetData.environmentAndCriticalityChartData = null;
        this.executiveSummaryWidgetData.alertSeverityViewData = null;
        this.executiveSummaryDiscoveryCards = [];
        this.executiveSummaryTaggedVmCount = 0;
        this.executiveSummaryBusinessCriticalCount = 0;
        this.executiveSummaryAwaitingEnvironmentTagCount = 0;
        this.showExecutiveSummaryWidget = false;
        this.notification.error(
          new Notification('Failed to get Executive Summary Data data. Try again later')
        );
      });
  }

  private getExecutiveSummaryTotalDiscoveredVms(data: any): number {
    const vmDiscoveryCard = (data?.discoveryCards || []).find(card => card?.title === 'VMs');
    return vmDiscoveryCard?.discovered || data?.executiveSummary?.totalVMs || 0;
  }

  private getExecutiveSummaryEnvironmentCount(environmentCriticality: any[], environment: string): number {
    const item = (environmentCriticality || []).find(row => row?.environment === environment);
    return item?.count || 0;
  }

  private getExecutiveSummaryTaggedVmCount(environmentCriticality: any[]): number {
    return (environmentCriticality || [])
      .filter(row => (row?.environment || '').toLowerCase() !== 'untagged')
      .reduce((total, row) => total + (row?.count || 0), 0);
  }

  private startExecutiveSummaryWidgetLoaders() {
    [this.executiveSummaryWidgetData.executiveSummaryLoader,
    this.executiveSummaryWidgetData.cloudTypeLoader,
    this.executiveSummaryWidgetData.powerActivityLoader,
    this.executiveSummaryWidgetData.resourceAllocationLoader,
    this.executiveSummaryWidgetData.vmCountByOSTypeLoader,
    this.executiveSummaryWidgetData.environmentAndCriticalityLoader,
    ].forEach(loaderName => this.spinner.start(loaderName));
  }

  private stopExecutiveSummaryWidgetLoaders() {
    [this.executiveSummaryWidgetData.cloudTypeLoader,
    this.executiveSummaryWidgetData.executiveSummaryLoader,
    this.executiveSummaryWidgetData.powerActivityLoader,
    this.executiveSummaryWidgetData.resourceAllocationLoader,
    this.executiveSummaryWidgetData.vmCountByOSTypeLoader,
    this.executiveSummaryWidgetData.environmentAndCriticalityLoader,
    ].forEach(loaderName => this.spinner.stop(loaderName));
  }

  private hasExecutiveSummaryWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  getPrivateCloudInventoryData() {
    this.showPrivateCloudInventoryWidget = true;
    this.privateCloudInventoryCards = [];
    this.privateCloudInventoryTotalResources = 0;
    this.spinner.start(this.privateCloudInventoryLoader);
    this.svc.getPrivateCloudInventoryData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.privateCloudInventoryLoader)))
      .subscribe(res => {
        this.showPrivateCloudInventoryWidget = this.hasPrivateCloudInventoryData(res);
        this.privateCloudInventoryCards = this.svc.convertToPrivateCloudInventoryViewData(res);
        this.privateCloudInventoryTotalResources = this.svc.getPrivateCloudInventoryTotalResources(res);
        this.sortPrivateCloudInventoryResources();
      }, (_err: HttpErrorResponse) => {
        this.privateCloudInventoryCards = [];
        this.privateCloudInventoryTotalResources = 0;
        this.showPrivateCloudInventoryWidget = false;
        this.notification.error(new Notification('Failed to get Private Cloud Inventory data. Try again later'));
      });
  }

  private hasPrivateCloudInventoryData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  setPrivateCloudInventorySortDirection(direction: 'asc' | 'desc') {
    this.privateCloudInventorySortDirection = direction;
    this.sortPrivateCloudInventoryResources();
  }

  private sortPrivateCloudInventoryResources() {
    const sortDirection = this.privateCloudInventorySortDirection === 'asc' ? 1 : -1;
    this.privateCloudInventoryCards = [...(this.privateCloudInventoryCards || [])]
      .map(card => ({
        ...card,
        resources: [...(card.resources || [])]
          .sort((a, b) => a.label.localeCompare(b.label) * sortDirection)
      }));
  }

  getPrivateCloudGeoDistributionData() {
    this.showPrivateCloudGeoDistributionWidget = true;
    this.privateCloudGeoDistributionViewData = null;
    this.privateCloudGeoDistributionChartData = null;
    this.privateCloudGeoDistributionPlatform = 'all';
    this.spinner.start(this.privateCloudGeoDistributionLoader);
    this.svc.getPrivateCloudGeoDistributionData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.privateCloudGeoDistributionLoader)))
      .subscribe(res => {
        this.privateCloudGeoDistributionViewData = this.svc.convertToPrivateCloudGeoDistributionViewData(res);
        this.showPrivateCloudGeoDistributionWidget = this.hasPrivateCloudGeoDistributionData();
        this.setPrivateCloudGeoDistributionChartData();
      }, (_err: HttpErrorResponse) => {
        this.privateCloudGeoDistributionViewData = null;
        this.privateCloudGeoDistributionChartData = null;
        this.showPrivateCloudGeoDistributionWidget = false;
        this.notification.error(new Notification('Failed to get Private Cloud Geo Distribution data. Try again later'));
      });
  }

  onPrivateCloudGeoDistributionPlatformChange(platform: string) {
    this.privateCloudGeoDistributionPlatform = platform || 'all';
    this.setPrivateCloudGeoDistributionChartData();
  }

  private setPrivateCloudGeoDistributionChartData() {
    this.privateCloudGeoDistributionChartData = this.svc.convertToPrivateCloudGeoDistributionChartData(
      this.getHighlightedPrivateCloudGeoDistributionCells()
    );
  }

  private getHighlightedPrivateCloudGeoDistributionCells(): PrivateCloudGeoDistributionCell[] {
    const cells = this.privateCloudGeoDistributionViewData?.cells || [];

    return cells.map(cell => ({
      ...cell,
      dimmed: this.privateCloudGeoDistributionPlatform !== 'all'
        && cell.platform !== this.privateCloudGeoDistributionPlatform
    }));
  }

  getPrivateCloudGeoDistributionLegendItems(): Array<{ label: string; count: number; color: string; platform: string }> {
    const groups = (this.privateCloudGeoDistributionViewData?.cells || [])
      .reduce((legendItems, cell) => {
        if (!legendItems[cell.platform]) {
          legendItems[cell.platform] = {
            label: cell.platformLabel,
            count: 0,
            color: cell.color,
            platform: cell.platform
          };
        }
        legendItems[cell.platform].count += 1;
        return legendItems;
      }, {} as { [platform: string]: { label: string; count: number; color: string; platform: string } });

    return Object.keys(groups).map(platform => groups[platform]);
  }

  private hasPrivateCloudGeoDistributionData(): boolean {
    return this.hasMeaningfulWidgetValue(this.privateCloudGeoDistributionViewData?.cells || []);
  }

  private hasMeaningfulExecutiveSummaryValue(value: unknown): boolean {
    return this.hasMeaningfulWidgetValue(value);
  }

  private hasMeaningfulWidgetValue(value: unknown, key = ''): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (this.isNonDisplayMetricKey(key)) {
      return false;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) && value !== 0;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.some(item => this.hasMeaningfulWidgetValue(item));
    }

    if (typeof value === 'object') {
      return Object.keys(value as { [key: string]: unknown })
        .some(childKey => this.hasMeaningfulWidgetValue((value as { [key: string]: unknown })[childKey], childKey));
    }

    return false;
  }

  private isNonDisplayMetricKey(key: string): boolean {
    return [
      'id',
      'uuid',
      'next',
      'previous',
      'page',
      'pageSize',
      'filterOptions',
      'filters',
      'lat',
      'long',
      'latitude',
      'longitude'
    ].indexOf(key) > -1;
  }

  //------------Capacity and Growth Insight ----------------------

  densityHostVm: VmDensityHost = new VmDensityHost();
  topHostsByVmDensity: TopHostVmDensityItem[] = [];
  topHostsByVmDensityLoader = 'TopHostsByVmDensityLoader';

  getCapacityGrowthWidgetData() {
    this.showCapacityGrowthWidget = true;
    this.densityHostVm.desnityHostRows = []
    this.topHostsByVmDensity = [];
    this.spinner.start(this.densityHostVm.loader);
    this.spinner.start(this.topHostsByVmDensityLoader);
    this.spinner.start(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
    this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmProvisioningChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
    this.svc.getCapacityGrowthWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.showCapacityGrowthWidget = this.hasCapacityGrowthWidgetData(res);
          this.densityHostVm = this.svc.convertToVmDensityHostViewData(res.topHostUtilization);
          this.topHostsByVmDensity = res.top5HostsByVmDensity || [];
          this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = this.svc.convertToVmCapacityChartData(res.capacityTrendAndForecast);
          this.capacityAndGrowthInsightsWidgetData.vmProvisioningChartData = this.svc.convertToVmProvisioningChartData(res.provisioningStatus);
          this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = this.svc.convertToVmProvisioningViewData(res.provisioningStatus);
        } else {
          this.showCapacityGrowthWidget = false;
        }
        this.spinner.stop(this.densityHostVm.loader);
        this.spinner.stop(this.topHostsByVmDensityLoader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
      }, (_err: HttpErrorResponse) => {
        this.densityHostVm.desnityHostRows = []
        this.topHostsByVmDensity = [];
        this.spinner.stop(this.densityHostVm.loader);
        this.spinner.stop(this.topHostsByVmDensityLoader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
        this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
        this.showCapacityGrowthWidget = false;
        this.notification.error(new Notification('Failed to get Capacity and Growth data. Try again later'));
      });
  }

  getHypervisorHealthEnvironmentData(hideWhenEmpty = true) {
    this.showHypervisorHealthWidget = true;
    this.hypervisorHealthRows = [];
    this.spinner.start(this.hypervisorHealthLoader);
    this.svc.getHypervisorHealthEnvironmentTableData(
      this.filterForm.getRawValue(),
      this.hypervisorHealthPageNo,
      this.hypervisorHealthPageSize,
      this.getHypervisorHealthOrdering(),
      this.hypervisorHealthSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.hypervisorHealthLoader)))
      .subscribe(res => {
        this.hypervisorHealthRows = res?.results || [];
        this.hypervisorHealthTotal = res?.count || 0;
        this.showHypervisorHealthWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.hypervisorHealthRows = [];
        this.hypervisorHealthTotal = 0;
        this.showHypervisorHealthWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Hypervisor Health data. Try again later'));
      });
  }

  setHypervisorHealthViewMode(mode: 'table' | 'chart') {
    this.hypervisorHealthViewMode = mode;
    if (mode === 'chart' && !this.hypervisorHealthCharts.length) {
      this.getHypervisorHealthChartData();
    }
  }

  getHypervisorHealthChartData() {
    this.hypervisorHealthChartRows = [];
    this.hypervisorHealthCharts = [];
    this.spinner.start(this.hypervisorHealthChartLoader);
    this.svc.getInfrastructureHealthStatusChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.hypervisorHealthChartLoader)))
      .subscribe(res => {
        this.hypervisorHealthChartRows = res?.results || [];
        this.hypervisorHealthCharts = this.svc.convertToHypervisorHealthCharts(this.hypervisorHealthChartRows, res?.powerSupplyStatusDistribution, res?.temperatureThresholds);
      }, (_err: HttpErrorResponse) => {
        this.hypervisorHealthChartRows = [];
        this.hypervisorHealthCharts = [];
        this.showHypervisorHealthWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.hypervisorHealthTotal,
          results: this.hypervisorHealthRows
        });
        this.notification.error(new Notification('Failed to get Hypervisor Health chart data. Try again later'));
      });
  }

  onHypervisorHealthSearched(searchText: string) {
    this.hypervisorHealthSearch = searchText || '';
    this.hypervisorHealthPageNo = 1;
    this.getHypervisorHealthEnvironmentData(false);
  }

  onHypervisorHealthSort(sortKey: HypervisorHealthSortKey) {
    if (this.hypervisorHealthSortKey === sortKey) {
      this.hypervisorHealthSortDirection = this.hypervisorHealthSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.hypervisorHealthSortKey = sortKey;
      this.hypervisorHealthSortDirection = 'asc';
    }

    this.hypervisorHealthPageNo = 1;
    this.getHypervisorHealthEnvironmentData(false);
  }

  hypervisorHealthPageChange(pageNo: number) {
    if (this.hypervisorHealthPageNo === pageNo) {
      return;
    }
    this.hypervisorHealthPageNo = pageNo;
    this.getHypervisorHealthEnvironmentData(false);
  }

  hypervisorHealthPageSizeChange(pageSize: number) {
    this.hypervisorHealthPageSize = pageSize;
    this.hypervisorHealthPageNo = 1;
    this.getHypervisorHealthEnvironmentData(false);
  }

  getHypervisorHealthSortIcon(sortKey: HypervisorHealthSortKey): string {
    if (this.hypervisorHealthSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.hypervisorHealthSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getHypervisorHealthOrdering(): string {
    return this.hypervisorHealthSortDirection === 'asc'
      ? this.hypervisorHealthSortKey
      : `-${this.hypervisorHealthSortKey}`;
  }

  getStorageDatastoresData(hideWhenEmpty = true) {
    this.showStorageDatastoresWidget = true;
    this.storageDatastoreRows = [];
    this.spinner.start(this.storageDatastoresLoader);
    this.svc.getStorageDatastoresTableData(
      this.filterForm.getRawValue(),
      this.storageDatastoresPageNo,
      this.storageDatastoresPageSize,
      this.getStorageDatastoresOrdering(),
      this.storageDatastoresSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.storageDatastoresLoader)))
      .subscribe(res => {
        this.storageDatastoreRows = res?.results || [];
        this.storageDatastoresTotal = res?.count || 0;
        this.showStorageDatastoresWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.storageDatastoreRows = [];
        this.storageDatastoresTotal = 0;
        this.showStorageDatastoresWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Storage Datastores data. Try again later'));
      });
  }

  setStorageDatastoresViewMode(mode: 'table' | 'chart') {
    this.storageDatastoresViewMode = mode;
    if (mode === 'chart' && !this.storageDatastoresChartData) {
      this.getStorageDatastoresChartData();
    }
  }

  getStorageDatastoresChartData() {
    this.storageDatastoresChartData = null;
    this.spinner.start(this.storageDatastoresChartLoader);
    this.svc.getStorageDatastoresChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.storageDatastoresChartLoader)))
      .subscribe(res => {
        this.storageDatastoresChartData = this.svc.convertToStorageDatastoresChart(res?.topByUsage || []);
      }, (_err: HttpErrorResponse) => {
        this.storageDatastoresChartData = null;
        this.showStorageDatastoresWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.storageDatastoresTotal,
          results: this.storageDatastoreRows
        });
        this.notification.error(new Notification('Failed to get Storage Datastores chart data. Try again later'));
      });
  }

  onStorageDatastoresSearched(searchText: string) {
    this.storageDatastoresSearch = searchText || '';
    this.storageDatastoresPageNo = 1;
    this.getStorageDatastoresData(false);
  }

  onStorageDatastoresSort(sortKey: StorageDatastoreSortKey) {
    if (this.storageDatastoresSortKey === sortKey) {
      this.storageDatastoresSortDirection = this.storageDatastoresSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.storageDatastoresSortKey = sortKey;
      this.storageDatastoresSortDirection = 'asc';
    }

    this.storageDatastoresPageNo = 1;
    this.getStorageDatastoresData(false);
  }

  storageDatastoresPageChange(pageNo: number) {
    if (this.storageDatastoresPageNo === pageNo) {
      return;
    }
    this.storageDatastoresPageNo = pageNo;
    this.getStorageDatastoresData(false);
  }

  storageDatastoresPageSizeChange(pageSize: number) {
    this.storageDatastoresPageSize = pageSize;
    this.storageDatastoresPageNo = 1;
    this.getStorageDatastoresData(false);
  }

  getStorageDatastoresSortIcon(sortKey: StorageDatastoreSortKey): string {
    if (this.storageDatastoresSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.storageDatastoresSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getStorageDatastoresOrdering(): string {
    return this.storageDatastoresSortDirection === 'asc'
      ? this.storageDatastoresSortKey
      : `-${this.storageDatastoresSortKey}`;
  }

  getNetworkInterfacesData(hideWhenEmpty = true) {
    this.showNetworkInterfacesWidget = true;
    this.networkInterfaceRows = [];
    this.spinner.start(this.networkInterfacesLoader);
    this.svc.getNetworkInterfacesTableData(
      this.filterForm.getRawValue(),
      this.networkInterfacesPageNo,
      this.networkInterfacesPageSize,
      this.getNetworkInterfacesOrdering(),
      this.networkInterfacesSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.networkInterfacesLoader)))
      .subscribe(res => {
        this.networkInterfaceRows = res?.results || [];
        this.networkInterfacesTotal = res?.count || 0;
        this.showNetworkInterfacesWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.networkInterfaceRows = [];
        this.networkInterfacesTotal = 0;
        this.showNetworkInterfacesWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Network Interfaces data. Try again later'));
      });
  }

  setNetworkInterfacesViewMode(mode: 'table' | 'chart') {
    this.networkInterfacesViewMode = mode;
    if (mode === 'chart' && !this.networkInterfacesChartData) {
      this.getNetworkInterfacesChartData();
    }
  }

  getNetworkInterfacesChartData() {
    this.networkInterfacesChartData = null;
    this.spinner.start(this.networkInterfacesChartLoader);
    this.svc.getNetworkInterfacesChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.networkInterfacesChartLoader)))
      .subscribe(res => {
        this.networkInterfacesChartData = this.svc.convertToNetworkInterfacesChart(res?.topByVmCount || []);
      }, (_err: HttpErrorResponse) => {
        this.networkInterfacesChartData = null;
        this.showNetworkInterfacesWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.networkInterfacesTotal,
          results: this.networkInterfaceRows
        });
        this.notification.error(new Notification('Failed to get Network Interfaces chart data. Try again later'));
      });
  }

  onNetworkInterfacesSearched(searchText: string) {
    this.networkInterfacesSearch = searchText || '';
    this.networkInterfacesPageNo = 1;
    this.getNetworkInterfacesData(false);
  }

  onNetworkInterfacesSort(sortKey: NetworkInterfaceSortKey) {
    if (this.networkInterfacesSortKey === sortKey) {
      this.networkInterfacesSortDirection = this.networkInterfacesSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.networkInterfacesSortKey = sortKey;
      this.networkInterfacesSortDirection = 'asc';
    }

    this.networkInterfacesPageNo = 1;
    this.getNetworkInterfacesData(false);
  }

  networkInterfacesPageChange(pageNo: number) {
    if (this.networkInterfacesPageNo === pageNo) {
      return;
    }
    this.networkInterfacesPageNo = pageNo;
    this.getNetworkInterfacesData(false);
  }

  networkInterfacesPageSizeChange(pageSize: number) {
    this.networkInterfacesPageSize = pageSize;
    this.networkInterfacesPageNo = 1;
    this.getNetworkInterfacesData(false);
  }

  getNetworkInterfacesSortIcon(sortKey: NetworkInterfaceSortKey): string {
    if (this.networkInterfacesSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.networkInterfacesSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getNetworkInterfacesOrdering(): string {
    return this.networkInterfacesSortDirection === 'asc'
      ? this.networkInterfacesSortKey
      : `-${this.networkInterfacesSortKey}`;
  }

  formatStorageGb(value: number): string {
    return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
  }

  getStoragePlatformBadgeClass(platform: string): string {
    const normalizedPlatform = (platform || '').toLowerCase();

    if (normalizedPlatform === 'vmware') {
      return 'badge-warning';
    }
    if (normalizedPlatform === 'nutanix') {
      return 'badge-success';
    }
    if (normalizedPlatform.indexOf('hyper') > -1) {
      return 'badge-primary';
    }

    return 'badge-secondary';
  }

  getHypervisorToneClass(status: string): string {
    const normalizedStatus = (status || '').toLowerCase();

    if (normalizedStatus === 'healthy' || normalizedStatus === 'up') {
      return 'success';
    }
    if (normalizedStatus === 'warning') {
      return 'warning';
    }
    if (normalizedStatus === 'critical' || normalizedStatus === 'down') {
      return 'danger';
    }
    if (normalizedStatus === 'unknown') {
      return 'secondary';
    }

    return 'muted';
  }

  getHypervisorMetricPct(metric: { pct: number | null }): number {
    return typeof metric?.pct === 'number' ? metric.pct : 0;
  }

  getHypervisorMetricTone(metric: { pct: number | null }): string {
    const pct = this.getHypervisorMetricPct(metric);
    if (!pct) {
      return 'muted';
    }
    return pct >= 85 ? 'danger' : pct >= 70 ? 'warning' : 'success';
  }

  getHypervisorTemperatureLabel(temp: number | null): string {
    return typeof temp === 'number' ? `${temp}°C` : 'Unknown';
  }

  getHypervisorTemperatureTone(temp: number | null): string {
    if (typeof temp !== 'number') {
      return 'secondary';
    }
    return temp >= 47 ? 'danger' : temp >= 40 ? 'warning' : 'success';
  }

  private hasCapacityGrowthWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  getUtilizationClass(utilizationPct: number): string {

    if (utilizationPct >= 50 && utilizationPct <= 70) {
      return 'bg-success';
    }

    if (utilizationPct > 85) {
      return 'bg-danger';
    }

    if (utilizationPct >= 71 && utilizationPct <= 85) {
      return 'bg-warning';
    }

    if (utilizationPct < 49) {
      return 'bg-primary';
    }

    return 'bg-secondary';
  }

  getClusterMetricsData(hideWhenEmpty = true) {
    this.showClusterMetricsWidget = true;
    this.clusterMetricRows = [];
    this.spinner.start(this.clusterMetricsLoader);
    this.svc.getClusterMetricsData(
      this.filterForm.getRawValue(),
      this.clusterMetricsPageNo,
      this.clusterMetricsPageSize,
      this.getClusterMetricsOrdering(),
      this.clusterMetricsSearch,
      this.selectedClusterMetricPlatform,
      this.selectedClusterMetricCluster,
      this.selectedClusterMetricAccount
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.clusterMetricsLoader)))
      .subscribe(res => {
        this.clusterMetricRows = res?.results || [];
        this.clusterMetricsTotal = res?.count || 0;
        this.clusterMetricFilterOptions = res?.filterOptions || this.clusterMetricFilterOptions;
        this.showClusterMetricsWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.clusterMetricRows = [];
        this.clusterMetricsTotal = 0;
        this.showClusterMetricsWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Cluster Metrics data. Try again later'));
      });
  }

  setClusterMetricsViewMode(mode: 'table' | 'chart') {
    this.clusterMetricsViewMode = mode;
    if (mode === 'chart' && !this.topClustersByVmCountChartOptions) {
      this.getClusterMetricsChartData();
    }
  }

  onClusterMetricsSearched(searchText: string) {
    this.clusterMetricsSearch = searchText || '';
    this.clusterMetricsPageNo = 1;
    this.getClusterMetricsData(false);
  }

  onClusterMetricsFilterChange() {
    this.clusterMetricsPageNo = 1;
    this.getClusterMetricsData(false);
  }

  onClusterMetricsPlatformFilterChange(event: Event) {
    this.selectedClusterMetricPlatform = (event.target as HTMLSelectElement).value || '';
    this.onClusterMetricsFilterChange();
  }

  onClusterMetricsClusterFilterChange(event: Event) {
    this.selectedClusterMetricCluster = (event.target as HTMLSelectElement).value || '';
    this.onClusterMetricsFilterChange();
  }

  onClusterMetricsAccountFilterChange(event: Event) {
    this.selectedClusterMetricAccount = (event.target as HTMLSelectElement).value || '';
    this.onClusterMetricsFilterChange();
  }

  onClusterMetricsSort(sortKey: ClusterMetricSortKey) {
    if (this.clusterMetricsSortKey === sortKey) {
      this.clusterMetricsSortDirection = this.clusterMetricsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.clusterMetricsSortKey = sortKey;
      this.clusterMetricsSortDirection = 'asc';
    }

    this.clusterMetricsPageNo = 1;
    this.getClusterMetricsData(false);
  }

  clusterMetricsPageChange(pageNo: number) {
    if (this.clusterMetricsPageNo === pageNo) {
      return;
    }
    this.clusterMetricsPageNo = pageNo;
    this.getClusterMetricsData(false);
  }

  clusterMetricsPageSizeChange(pageSize: number) {
    this.clusterMetricsPageSize = pageSize;
    this.clusterMetricsPageNo = 1;
    this.getClusterMetricsData(false);
  }

  getClusterMetricsSortIcon(sortKey: ClusterMetricSortKey): string {
    if (this.clusterMetricsSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.clusterMetricsSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getClusterMetricsOrdering(): string {
    return this.clusterMetricsSortDirection === 'asc'
      ? this.clusterMetricsSortKey
      : `-${this.clusterMetricsSortKey}`;
  }

  getClusterUsagePercent(usage?: ClusterMetricUsage): number {
    const percent = Number(usage?.pct || 0);
    return Math.max(0, Math.min(100, percent));
  }

  getClusterUsageBarClass(usage?: ClusterMetricUsage): string {
    const percent = this.getClusterUsagePercent(usage);

    if (percent >= 85) {
      return 'bg-danger';
    }
    if (percent >= 50) {
      return 'bg-warning';
    }

    return 'bg-success';
  }

  getClusterUsageAvailable(usage?: ClusterMetricUsage): number | null {
    if (usage?.cap === null || usage?.cap === undefined || usage?.used === null || usage?.used === undefined) {
      return null;
    }

    return Math.max(usage.cap - usage.used, 0);
  }

  formatClusterUsageValue(value: number | null, unit?: string): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    return `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 })} ${unit || ''}`.trim();
  }

  getClusterMetricsChartData() {
    this.getTopClustersByVmCountChartData();
    this.getClusterCapacityTrendChartData();
    this.getClusterComponentSummaryChartData();
  }

  getTopClustersByVmCountChartData() {
    this.topClustersByVmCountChartOptions = null;
    this.clusterPlatformLegendItems = this.svc.getClusterPlatformLegendItems();
    this.spinner.start(this.topClustersByVmCountLoader);
    this.svc.getTopClustersByVmCountChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.topClustersByVmCountLoader)))
      .subscribe(res => {
        this.topClustersByVmCountChartOptions = this.svc.convertToTopClustersByVmCountChart(res);
      }, (_err: HttpErrorResponse) => {
        this.topClustersByVmCountChartOptions = null;
        this.showClusterMetricsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.clusterMetricsTotal,
          results: this.clusterMetricRows
        });
        this.notification.error(new Notification('Failed to get Top Clusters by VM Count data. Try again later'));
      });
  }

  getClusterCapacityTrendChartData() {
    this.clusterCapacityTrendChartOptions = null;
    this.spinner.start(this.clusterCapacityTrendLoader);
    this.svc.getClusterCapacityTrendChartData(this.filterForm.getRawValue(), this.selectedClusterCapacityTrendCluster)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.clusterCapacityTrendLoader)))
      .subscribe(res => {
        this.clusterCapacityTrendData = res;
        this.clusterCapacityTrendChartOptions = this.svc.convertToClusterCapacityTrendChart(res);
      }, (_err: HttpErrorResponse) => {
        this.clusterCapacityTrendData = null;
        this.clusterCapacityTrendChartOptions = null;
        this.showClusterMetricsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.clusterMetricsTotal,
          results: this.clusterMetricRows
        });
        this.notification.error(new Notification('Failed to get Cluster Capacity Trend data. Try again later'));
      });
  }

  getClusterComponentSummaryChartData() {
    this.clusterComponentSummaryChartOptions = null;
    this.spinner.start(this.clusterComponentSummaryLoader);
    this.svc.getClusterComponentSummaryChartData(
      this.filterForm.getRawValue(),
      this.selectedClusterComponentPlatform,
      this.selectedClusterComponentCluster
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.clusterComponentSummaryLoader)))
      .subscribe(res => {
        this.clusterComponentSummaryData = res;
        this.clusterComponentFilterOptions = res?.filterOptions || this.clusterComponentFilterOptions;
        this.clusterComponentSummaryChartOptions = this.svc.convertToClusterComponentSummaryChart(res);
        this.clusterComponentLegendItems = this.svc.getClusterComponentLegendItems(res);
      }, (_err: HttpErrorResponse) => {
        this.clusterComponentSummaryData = null;
        this.clusterComponentSummaryChartOptions = null;
        this.clusterComponentLegendItems = [];
        this.showClusterMetricsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.clusterMetricsTotal,
          results: this.clusterMetricRows
        });
        this.notification.error(new Notification('Failed to get Cluster Component Summary data. Try again later'));
      });
  }

  onClusterCapacityTrendClusterChange(event: Event) {
    this.selectedClusterCapacityTrendCluster = (event.target as HTMLSelectElement).value || 'all';
    this.getClusterCapacityTrendChartData();
  }

  onClusterComponentPlatformChange(event: Event) {
    this.selectedClusterComponentPlatform = (event.target as HTMLSelectElement).value || 'all';
    this.selectedClusterComponentCluster = 'all';
    this.getClusterComponentSummaryChartData();
  }

  onClusterComponentClusterChange(event: Event) {
    this.selectedClusterComponentCluster = (event.target as HTMLSelectElement).value || 'all';
    this.getClusterComponentSummaryChartData();
  }

  getFilteredClusterComponentOptions(): ClusterOptionItem[] {
    const clusters = this.clusterComponentFilterOptions?.clusters || [];
    if (this.selectedClusterComponentPlatform === 'all') {
      return clusters;
    }

    return clusters.filter(cluster => cluster.platform === this.selectedClusterComponentPlatform);
  }

  getPerformanceHotspotWidgetData(hideWhenEmpty = true) {
    this.showPerformanceHotspotsWidget = true;
    this.utilizationRows.utilRow = [];
    this.getPerformanceHotspotChartData();
    this.spinner.start(this.loaderNames.performanceHotspot);
    this.svc.getUtilizationRows(
      this.filterForm.getRawValue(),
      this.utilizationPageNo,
      this.utilizationPageSize,
      this.getUtilizationOrdering(),
      this.utilizationSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.spinner.stop(this.loaderNames.performanceHotspot);
        this.showPerformanceHotspotsWidget = hideWhenEmpty ? this.hasPerformanceHotspotsWidgetData(res) : true;
        this.utilizationTotal = res?.count || 0;
        this.utilizationRows = this.svc.convertToUtilizationViewData(res);
      }, () => {
        this.utilizationRows.utilRow = [];
        this.utilizationTotal = 0;
        this.showPerformanceHotspotsWidget = !hideWhenEmpty;
        this.spinner.stop(this.loaderNames.performanceHotspot);
        this.notification.error(new Notification('Failed to get Performance Hotspot data. Try again later'));
      });
  }

  private getPerformanceHotspotChartData() {
    this.utilizationCpuMemoryChartOptions = null;
    this.utilizationStorageChartOptions = null;
    this.svc.getUtilizationChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.utilizationCpuMemoryChartOptions = this.svc.convertToUtilizationCpuMemoryChartOptions(res);
        this.utilizationStorageChartOptions = this.svc.convertToUtilizationStorageChartOptions(res);
      }, () => {
        this.utilizationCpuMemoryChartOptions = null;
        this.utilizationStorageChartOptions = null;
      });
  }

  private hasPerformanceHotspotsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  getIdleDevicesData(hideWhenEmpty = true) {
    this.showIdleDevicesAnalysisWidget = true;
    this.showIdleDurationDistributionWidget = true;
    this.idleDevicesRow.devicesRow = []
    this.idleDistributionRows.distributionRow = []
    this.idleDistributionRows.chartData = null;
    this.setIdleDurationChartOptions();

    this.spinner.start(this.idleDevicesRow.loader);
    this.spinner.start(this.idleDistributionRows.loader);
    this.svc.getIdleDevicesData(this.filterForm.getRawValue(), this.idleDevicesPageNo, this.idleDevicesPageSize).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop(this.idleDevicesRow.loader);
      this.spinner.stop(this.idleDistributionRows.loader);
      this.showIdleDevicesAnalysisWidget = hideWhenEmpty ? this.hasIdleDevicesAnalysisWidgetData(res) : true;
      this.showIdleDurationDistributionWidget = hideWhenEmpty ? this.hasIdleDurationDistributionWidgetData(res?.idleDurationDistribution) : true;

      this.idleDevicesRow = this.svc.convertToDeviceIdleViewData(res)
      this.idleDevicesTotal = res.count

      this.idleDistributionRows = this.svc.convertToIdleDevicesDistributionViewData(res.idleDurationDistribution)
      this.idleDistributionRows.chartData = this.svc.convertToIdleDurationDistributionChartData(this.idleDistributionRows.distributionRow)
      this.setIdleDurationChartOptions();
    }, () => {
      this.idleDistributionRows.chartData = null;
      this.idleDevicesRow.devicesRow = []
      this.idleDistributionRows.distributionRow = []
      this.setIdleDurationChartOptions();
      this.showIdleDevicesAnalysisWidget = !hideWhenEmpty;
      this.showIdleDurationDistributionWidget = !hideWhenEmpty;
      this.spinner.stop(this.idleDistributionRows.loader);
      this.spinner.stop(this.idleDevicesRow.loader);
      this.notification.error(new Notification('Failed to get Idle Devices data. Try again later'));
    });
  }

  private hasIdleDevicesAnalysisWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  private hasIdleDurationDistributionWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  setIdleDevicesViewMode(mode: 'table' | 'chart') {
    this.idleDevicesViewMode = mode;
  }

  onIdleDevicesSearched(searchText: string) {
    this.idleDevicesSearch = searchText || '';
  }

  getVisibleIdleDeviceRows(): DevicesRowViewData[] {
    const rows = this.idleDevicesRow?.devicesRow || [];
    const searchText = this.idleDevicesSearch.trim().toLowerCase();

    if (!searchText) {
      return rows;
    }

    return rows.filter(row => (row.deviceName || '').toLowerCase().includes(searchText));
  }

  getIdleDurationBarWidth(value: number): number {
    const values = (this.idleDistributionRows?.distributionRow || []).map(row => row.percent || 0);
    const maxValue = values.length ? Math.max(...values) : 0;

    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  private setIdleDurationChartOptions() {
    const rows = this.idleDistributionRows?.distributionRow || [];
    if (!rows.length) {
      this.idleDurationChartOptions = null;
      return;
    }
    const colors = rows.map(row => this.getIdleDurationColor(row.duration));

    this.idleDurationChartOptions = {
      color: colors,
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        data: rows.map(row => `${row.duration} ${row.percent}`)
      },
      series: [
        {
          name: 'Idle Devices',
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '48%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: rows.map((row, index) => ({
            value: row.percent,
            name: `${row.duration} ${row.percent}`,
            itemStyle: { color: colors[index % colors.length] }
          }))
        }
      ]
    };
  }

  getDistributionClass(index: number, duration?: string): string {
    switch (this.getIdleDurationBucket(duration, index)) {
      case '0-7 days':
        return 'bg-success';
      case '7-15 days':
        return 'bg-warning';
      case '15-30 days':
        return 'bg-danger';
      case '30+ days':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  private getIdleDurationColor(duration?: string): string {
    switch (this.getIdleDurationBucket(duration)) {
      case '0-7 days':
        return '#3db779';
      case '7-15 days':
        return '#f5a31a';
      case '15-30 days':
        return '#e94851';
      case '30+ days':
        return '#2f86de';
      default:
        return '#6c757d';
    }
  }

  private getIdleDurationBucket(duration?: string, index?: number): string {
    if (duration) {
      const normalized = duration.toLowerCase().replace(/\s+/g, ' ').trim();
      if (normalized.indexOf('0-7') > -1) {
        return '0-7 days';
      }
      if (normalized.indexOf('7-15') > -1) {
        return '7-15 days';
      }
      if (normalized.indexOf('15-30') > -1) {
        return '15-30 days';
      }
      if (normalized.indexOf('30+') > -1) {
        return '30+ days';
      }
    }

    return ['0-7 days', '7-15 days', '15-30 days', '30+ days'][index] || '';
  }

  getPerformanceWorkloadWidgetData(hideWhenEmpty = true) {
    this.showPerformanceWorkloadInsightsWidget = true;
    this.vmWorkloadRows = [];
    this.spinner.start(this.vmWorkloadLoader);
    this.svc.getPerformanceWorkloadWidgetData(
      this.filterForm.getRawValue(),
      this.vmWorkloadPageNo,
      this.vmWorkloadPageSize,
      this.getVmWorkloadOrdering(),
      this.vmWorkloadSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.vmWorkloadLoader)))
      .subscribe(res => {
        this.vmWorkloadRows = res?.results || [];
        this.vmWorkloadTotal = res?.count || 0;
        this.vmWorkloadStatusBreakdown = res?.statusBreakdown || { Healthy: 0, Warning: 0, Critical: 0 };
        this.showPerformanceWorkloadInsightsWidget = hideWhenEmpty ? this.hasPerformanceWorkloadInsightsWidgetData(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.vmWorkloadRows = [];
        this.vmWorkloadTotal = 0;
        this.showPerformanceWorkloadInsightsWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get VM Workload Insights data. Try again later'));
      });
  }

  setVmWorkloadViewMode(mode: 'table' | 'chart') {
    this.vmWorkloadViewMode = mode;
    if (mode === 'chart' && !this.vmWorkloadDiskChartOptions) {
      this.getVmWorkloadChartData();
    }
  }

  getVmWorkloadChartData() {
    this.vmWorkloadDiskChartOptions = null;
    this.vmWorkloadScatterChartOptions = null;
    this.vmWorkloadStatusChartOptions = null;
    this.spinner.start(this.vmWorkloadChartLoader);
    this.svc.getPerformanceWorkloadChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.vmWorkloadChartLoader)))
      .subscribe(res => {
        this.vmWorkloadStatusBreakdown = res?.statusBreakdown || { Healthy: 0, Warning: 0, Critical: 0 };
        this.vmWorkloadDiskChartOptions = this.svc.convertToVmWorkloadDiskThroughputChart(res);
        this.vmWorkloadScatterChartOptions = this.svc.convertToVmWorkloadCpuReadySwapChart(res);
        this.vmWorkloadStatusChartOptions = this.svc.convertToVmWorkloadStatusChart(res);
      }, (_err: HttpErrorResponse) => {
        this.vmWorkloadDiskChartOptions = null;
        this.vmWorkloadScatterChartOptions = null;
        this.vmWorkloadStatusChartOptions = null;
        this.showPerformanceWorkloadInsightsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.vmWorkloadTotal,
          results: this.vmWorkloadRows
        });
        this.notification.error(new Notification('Failed to get VM Workload Insights chart data. Try again later'));
      });
  }

  onVmWorkloadSearched(searchText: string) {
    this.vmWorkloadSearch = searchText || '';
    this.vmWorkloadPageNo = 1;
    this.getPerformanceWorkloadWidgetData(false);
  }

  onVmWorkloadSort(sortKey: VmWorkloadSortKey) {
    if (this.vmWorkloadSortKey === sortKey) {
      this.vmWorkloadSortDirection = this.vmWorkloadSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.vmWorkloadSortKey = sortKey;
      this.vmWorkloadSortDirection = 'asc';
    }

    this.vmWorkloadPageNo = 1;
    this.getPerformanceWorkloadWidgetData(false);
  }

  vmWorkloadPageChange(pageNo: number) {
    if (this.vmWorkloadPageNo === pageNo) {
      return;
    }
    this.vmWorkloadPageNo = pageNo;
    this.getPerformanceWorkloadWidgetData(false);
  }

  vmWorkloadPageSizeChange(pageSize: number) {
    this.vmWorkloadPageSize = pageSize;
    this.vmWorkloadPageNo = 1;
    this.getPerformanceWorkloadWidgetData(false);
  }

  getVmWorkloadSortIcon(sortKey: VmWorkloadSortKey): string {
    if (this.vmWorkloadSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.vmWorkloadSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getVmWorkloadOrdering(): string {
    return this.vmWorkloadSortDirection === 'asc'
      ? this.vmWorkloadSortKey
      : `-${this.vmWorkloadSortKey}`;
  }

  getNewlyProvisionedVmsData(hideWhenEmpty = true) {
    this.showNewlyProvisionedVmsWidget = true;
    this.newlyProvisionedVmRows = [];
    this.spinner.start(this.newlyProvisionedVmsLoader);
    this.svc.getNewlyProvisionedVmsData(
      this.filterForm.getRawValue(),
      this.newlyProvisionedVmsPageNo,
      this.newlyProvisionedVmsPageSize,
      this.getNewlyProvisionedVmsOrdering(),
      this.newlyProvisionedVmsSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.newlyProvisionedVmsLoader)))
      .subscribe(res => {
        this.newlyProvisionedVmRows = res?.results || [];
        this.newlyProvisionedVmsTotal = res?.count || 0;
        this.showNewlyProvisionedVmsWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.newlyProvisionedVmRows = [];
        this.newlyProvisionedVmsTotal = 0;
        this.showNewlyProvisionedVmsWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Newly Provisioned VMs data. Try again later'));
      });
  }

  setNewlyProvisionedVmsViewMode(mode: 'table' | 'chart') {
    this.newlyProvisionedVmsViewMode = mode;
    if (mode === 'chart' && !this.newlyProvisionedVmStateChartOptions) {
      this.getNewlyProvisionedVmsChartData();
    }
  }

  getNewlyProvisionedVmsChartData() {
    this.newlyProvisionedVmStateChartOptions = null;
    this.newlyProvisionedCloudAccountChartOptions = null;
    this.newlyProvisionedTimelineChartOptions = null;
    this.spinner.start(this.newlyProvisionedVmsChartLoader);
    this.svc.getNewlyProvisionedVmsChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.newlyProvisionedVmsChartLoader)))
      .subscribe(res => {
        this.newlyProvisionedVmStateBreakdown = res?.vmStateBreakdown || { up: 0, down: 0 };
        this.newlyProvisionedVmStateChartOptions = this.svc.convertToNewlyProvisionedVmStateChart(res);
        this.newlyProvisionedCloudAccountChartOptions = this.svc.convertToNewlyProvisionedCloudAccountChart(res);
        this.newlyProvisionedTimelineChartOptions = this.svc.convertToNewlyProvisionedTimelineChart(res);
      }, (_err: HttpErrorResponse) => {
        this.newlyProvisionedVmStateChartOptions = null;
        this.newlyProvisionedCloudAccountChartOptions = null;
        this.newlyProvisionedTimelineChartOptions = null;
        this.showNewlyProvisionedVmsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.newlyProvisionedVmsTotal,
          results: this.newlyProvisionedVmRows
        });
        this.notification.error(new Notification('Failed to get Newly Provisioned VMs chart data. Try again later'));
      });
  }

  onNewlyProvisionedVmsSearched(searchText: string) {
    this.newlyProvisionedVmsSearch = searchText || '';
    this.newlyProvisionedVmsPageNo = 1;
    this.getNewlyProvisionedVmsData(false);
  }

  onNewlyProvisionedVmsSort(sortKey: NewlyProvisionedVmSortKey) {
    if (this.newlyProvisionedVmsSortKey === sortKey) {
      this.newlyProvisionedVmsSortDirection = this.newlyProvisionedVmsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.newlyProvisionedVmsSortKey = sortKey;
      this.newlyProvisionedVmsSortDirection = 'asc';
    }

    this.newlyProvisionedVmsPageNo = 1;
    this.getNewlyProvisionedVmsData(false);
  }

  newlyProvisionedVmsPageChange(pageNo: number) {
    if (this.newlyProvisionedVmsPageNo === pageNo) {
      return;
    }
    this.newlyProvisionedVmsPageNo = pageNo;
    this.getNewlyProvisionedVmsData(false);
  }

  newlyProvisionedVmsPageSizeChange(pageSize: number) {
    this.newlyProvisionedVmsPageSize = pageSize;
    this.newlyProvisionedVmsPageNo = 1;
    this.getNewlyProvisionedVmsData(false);
  }

  getNewlyProvisionedVmsSortIcon(sortKey: NewlyProvisionedVmSortKey): string {
    if (this.newlyProvisionedVmsSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.newlyProvisionedVmsSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getNewlyProvisionedVmsOrdering(): string {
    return this.newlyProvisionedVmsSortDirection === 'asc'
      ? this.newlyProvisionedVmsSortKey
      : `-${this.newlyProvisionedVmsSortKey}`;
  }

  formatProvisionedVmDate(value: string, includeTime = true): string {
    if (!value) {
      return 'NA';
    }

    return includeTime ? moment(value).format('MMM DD, YYYY, h:mm A') : moment(value).format('DD MMM YYYY, HH:mm');
  }

  private hasPerformanceWorkloadInsightsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  //Alert and Events

  getAlertAndEventsWidgetData() {
    let filterFormOutput = this.filterForm.getRawValue();
    this.getRecentAlerts(filterFormOutput);
  }

  getRecentAlerts(filterFormOutput: any, hideWhenEmpty = true) {
    this.showRecentAlertsWidget = true;
    this.criticalAlerts.alertList = null;
    this.spinner.start(this.criticalAlerts.loader);
    this.svc.getRecentAlerts(
      filterFormOutput,
      this.recentAlertsPageNo,
      this.recentAlertsPageSize,
      this.getRecentAlertsOrdering(),
      this.recentAlertsSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.criticalAlerts.loader)))
      .subscribe(res => {
        this.showRecentAlertsWidget = hideWhenEmpty ? this.hasRecentAlertsWidgetData(res) : true;
        this.alertSummaryMetrics = this.svc.convertToAlertSummaryView(res);
        this.criticalAlerts = this.svc.convertToTopCriticalAlertsViewData(res.recentAlerts);
        this.recentAlertsTotal = res?.count || res?.recentAlerts?.length || 0;
      }, () => {
        this.criticalAlerts.alertList = null;
        this.recentAlertsTotal = 0;
        this.showRecentAlertsWidget = !hideWhenEmpty;
      });
  }

  private hasRecentAlertsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  viewAlertDetails(index: number) {
    this.alertDetailSvc.showEventDetails(this.criticalAlerts.alertList[index].uuid);
  }

  setRecentAlertsViewMode(mode: 'table' | 'chart') {
    this.recentAlertsViewMode = mode;
    if (mode === 'chart' && !this.recentAlertSeverityChartOptions) {
      this.getRecentAlertsChartData();
    }
  }

  getRecentAlertsChartData() {
    this.recentAlertSeverityChartOptions = null;
    this.recentAlertTopDevicesChartOptions = null;
    this.spinner.start(this.alertSummaryMetrics.loader);
    this.svc.getRecentAlertsChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.alertSummaryMetrics.loader)))
      .subscribe(res => {
        this.alertSummaryMetrics = this.svc.convertToAlertSummaryView(res);
        this.recentAlertSeverityChartOptions = this.svc.convertToRecentAlertSeverityDistributionChart(res);
        this.recentAlertTopDevicesChartOptions = this.svc.convertToRecentAlertTopDevicesChart(res);
      }, () => {
        this.recentAlertSeverityChartOptions = null;
        this.recentAlertTopDevicesChartOptions = null;
        this.showRecentAlertsWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.recentAlertsTotal,
          recentAlerts: this.criticalAlerts?.alertList
        });
        this.notification.error(new Notification('Failed to get Recent Alerts chart data. Try again later'));
      });
  }

  onRecentAlertsSearched(searchText: string) {
    this.recentAlertsSearch = searchText || '';
    this.recentAlertsPageNo = 1;
    this.getRecentAlerts(this.filterForm.getRawValue(), false);
  }

  onRecentAlertsSort(sortKey: RecentAlertSortKey) {
    if (this.recentAlertsSortKey === sortKey) {
      this.recentAlertsSortDirection = this.recentAlertsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.recentAlertsSortKey = sortKey;
      this.recentAlertsSortDirection = 'asc';
    }

    this.recentAlertsPageNo = 1;
    this.getRecentAlerts(this.filterForm.getRawValue(), false);
  }

  recentAlertsPageChange(pageNo: number) {
    if (this.recentAlertsPageNo === pageNo) {
      return;
    }
    this.recentAlertsPageNo = pageNo;
    this.getRecentAlerts(this.filterForm.getRawValue(), false);
  }

  recentAlertsPageSizeChange(pageSize: number) {
    this.recentAlertsPageSize = pageSize;
    this.recentAlertsPageNo = 1;
    this.getRecentAlerts(this.filterForm.getRawValue(), false);
  }

  getRecentAlertsSortIcon(sortKey: RecentAlertSortKey): string {
    if (this.recentAlertsSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.recentAlertsSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getRecentAlertsOrdering(): string {
    return this.recentAlertsSortDirection === 'asc'
      ? this.recentAlertsSortKey
      : `-${this.recentAlertsSortKey}`;
  }

  getAutoRemediationSummary() {
    this.showAutoRemediationSummaryWidget = true;
    this.autoRemediationSummary = null;
    this.autoRemediationRunbookChartOptions = null;
    this.autoRemediationActionsChartOptions = null;
    this.spinner.start(this.autoRemediationSummaryLoader);
    this.svc.getAutoRemediationSummary(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.autoRemediationSummaryLoader)))
      .subscribe(res => {
        this.autoRemediationSummary = res;
        this.autoRemediationRunbookChartOptions = this.svc.convertToAutoRemediationRunbookChart(res);
        this.autoRemediationActionsChartOptions = this.svc.convertToAutoRemediationActionsChart(res?.topAutoRemediationActions || []);
        this.showAutoRemediationSummaryWidget = this.hasMeaningfulExecutiveSummaryValue(res);
      }, () => {
        this.autoRemediationSummary = null;
        this.autoRemediationRunbookChartOptions = null;
        this.autoRemediationActionsChartOptions = null;
        this.showAutoRemediationSummaryWidget = false;
        this.notification.error(new Notification('Failed to get Auto-Remediation Summary data. Try again later'));
      });
  }

  getVmProvisioningSummary() {
    this.showVmProvisioningSummaryWidget = true;
    this.vmProvisioningSummary = null;
    this.vmProvisioningReachabilityChartOptions = null;
    this.vmProvisioningTrendSummaryChartOptions = null;
    this.vmProvisioningCloudAccountSummaryChartOptions = null;
    this.spinner.start(this.vmProvisioningSummaryLoader);
    this.svc.getVmProvisioningSummary(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.vmProvisioningSummaryLoader)))
      .subscribe(res => {
        this.vmProvisioningSummary = res;
        this.vmProvisioningReachabilityChartOptions = this.svc.convertToVmProvisioningReachabilitySummaryChart(res);
        this.vmProvisioningTrendSummaryChartOptions = this.svc.convertToVmProvisioningTrendSummaryChart(res);
        this.vmProvisioningCloudAccountSummaryChartOptions = this.svc.convertToVmProvisioningCloudAccountSummaryChart(res);
        this.showVmProvisioningSummaryWidget = this.hasMeaningfulExecutiveSummaryValue(res);
      }, () => {
        this.vmProvisioningSummary = null;
        this.vmProvisioningReachabilityChartOptions = null;
        this.vmProvisioningTrendSummaryChartOptions = null;
        this.vmProvisioningCloudAccountSummaryChartOptions = null;
        this.showVmProvisioningSummaryWidget = false;
        this.notification.error(new Notification('Failed to get VM Provisioning Summary data. Try again later'));
      });
  }


  getOrphanedDeviceData(hideWhenEmpty = true) {
    this.showOrphanedDeviceListWidget = true;
    this.showOrphanedByCategoryWidget = false;
    this.orphanedLifecycleRows = [];
    this.spinner.start(this.orphanedDeviceListViewData.loader);
    this.svc.getOrphanedDeviceData(
      this.filterForm.getRawValue(),
      this.orphanedDevicesPageNo,
      this.orphanedDevicesPageSize,
      this.getOrphanedLifecycleOrdering(),
      this.orphanedLifecycleSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.orphanedDeviceListViewData.loader)))
      .subscribe(res => {
        if (res) {
          this.showOrphanedDeviceListWidget = hideWhenEmpty ? this.hasOrphanedDeviceListWidgetData(res) : true;
          this.orphanedLifecycleRows = res.results || [];
          this.orphanedDevicesTotal = res.count;
          this.orphanedLifecycleStageChartOptions = this.svc.convertToOrphanedLifecycleStageChart(res);
          this.orphanedLifecycleOsChartOptions = this.svc.convertToOrphanedOsTypeChart(res);
          this.orphanedLifecycleDaysChartOptions = this.svc.convertToOrphanedDaysChart(res);
          this.orphanedLifecycleDatacenterChartOptions = this.svc.convertToOrphanedDatacenterChart(res);
          this.orphanedLifecycleStageLegendItems = this.getOrphanedChartLegendItems(
            res.chartData?.byLifecycleStage || {},
            ['#6d5df5', '#3472e8', '#e94851', '#f5a31a']
          );
          this.orphanedLifecycleOsLegendItems = this.getOrphanedChartLegendItems(
            res.chartData?.byOsType || {},
            ['#3fb374', '#3472e8']
          );
        } else {
          this.showOrphanedDeviceListWidget = !hideWhenEmpty;
        }
      }, (_err: HttpErrorResponse) => {
        this.orphanedLifecycleRows = [];
        this.orphanedLifecycleStageLegendItems = [];
        this.orphanedLifecycleOsLegendItems = [];
        this.showOrphanedDeviceListWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Orphaned Device data. Try again later'));
      });
  }

  private getOrphanedChartLegendItems(data: { [key: string]: number }, colors: string[]): Array<{ label: string; value: number; color: string }> {
    return Object.keys(data || {})
      .map((key, index) => ({
        label: key,
        value: Number(data[key]) || 0,
        color: colors[index % colors.length]
      }));
  }

  private hasOrphanedDeviceListWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  private hasOrphanedByCategoryWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  setOrphanedLifecycleViewMode(mode: 'table' | 'chart') {
    this.orphanedLifecycleViewMode = mode;
    if (mode === 'chart' && !this.orphanedLifecycleStageChartOptions) {
      this.getOrphanedDeviceData();
    }
  }

  onOrphanedLifecycleSearched(searchText: string) {
    this.orphanedLifecycleSearch = searchText || '';
    this.orphanedDevicesPageNo = 1;
    this.getOrphanedDeviceData(false);
  }

  onOrphanedLifecycleSort(sortKey: OrphanedLifecycleSortKey) {
    if (this.orphanedLifecycleSortKey === sortKey) {
      this.orphanedLifecycleSortDirection = this.orphanedLifecycleSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orphanedLifecycleSortKey = sortKey;
      this.orphanedLifecycleSortDirection = 'asc';
    }

    this.orphanedDevicesPageNo = 1;
    this.getOrphanedDeviceData(false);
  }

  getOrphanedLifecycleSortIcon(sortKey: OrphanedLifecycleSortKey): string {
    if (this.orphanedLifecycleSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.orphanedLifecycleSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getOrphanedLifecycleOrdering(): string {
    return this.orphanedLifecycleSortDirection === 'asc'
      ? this.orphanedLifecycleSortKey
      : `-${this.orphanedLifecycleSortKey}`;
  }



  orphanedDevicesPageChange(pageNo: number) {
    if (this.orphanedDevicesPageNo === pageNo) {
      return;
    }
    this.orphanedDevicesPageNo = pageNo;
    this.getOrphanedDeviceData(false);
  }

  orphanedDevicesPageSizeChange(pageSize: number) {
    this.orphanedDevicesPageSize = pageSize;
    this.orphanedDevicesPageNo = 1;
    this.getOrphanedDeviceData(false);
  }

  getVmBackupStatusData(hideWhenEmpty = true) {
    this.showVmBackupStatusWidget = true;
    this.vmBackupStatusRows = [];
    this.spinner.start(this.vmBackupStatusLoader);
    this.svc.getVmBackupStatusData(
      this.filterForm.getRawValue(),
      this.vmBackupStatusPageNo,
      this.vmBackupStatusPageSize,
      this.getVmBackupStatusOrdering(),
      this.vmBackupStatusSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.vmBackupStatusLoader)))
      .subscribe(res => {
        this.vmBackupStatusRows = res?.results || [];
        this.vmBackupStatusTotal = res?.count || 0;
        this.showVmBackupStatusWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.vmBackupStatusRows = [];
        this.vmBackupStatusTotal = 0;
        this.showVmBackupStatusWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get VM Backup Status data. Try again later'));
      });
  }

  setVmBackupStatusViewMode(mode: 'table' | 'chart') {
    this.vmBackupStatusViewMode = mode;
    if (mode === 'chart' && !this.vmBackupProtectedChartOptions) {
      this.getVmBackupStatusChartData();
    }
  }

  getVmBackupStatusChartData() {
    this.vmBackupProtectedChartOptions = null;
    this.vmBackupAgeChartOptions = null;
    this.vmBackupJobTrendChartOptions = null;
    this.vmBackupRestorePointChartOptions = null;
    this.vmBackupRepositoryCapacityRows = [];
    this.spinner.start(this.vmBackupStatusChartLoader);
    this.svc.getVmBackupStatusChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.vmBackupStatusChartLoader)))
      .subscribe(res => {
        this.vmBackupProtectedChartOptions = this.svc.convertToVmBackupProtectedChart(res);
        this.vmBackupAgeChartOptions = this.svc.convertToVmBackupAgeDistributionChart(res);
        this.vmBackupJobTrendChartOptions = this.svc.convertToVmBackupJobSuccessTrendChart(res);
        this.vmBackupRestorePointChartOptions = this.svc.convertToVmBackupRestorePointChart(res);
        this.vmBackupRepositoryCapacityRows = this.svc.convertToVmBackupRepositoryCapacity(res);
      }, (_err: HttpErrorResponse) => {
        this.vmBackupRepositoryCapacityRows = [];
        this.showVmBackupStatusWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.vmBackupStatusTotal,
          results: this.vmBackupStatusRows
        });
        this.notification.error(new Notification('Failed to get VM Backup Status chart data. Try again later'));
      });
  }

  onVmBackupStatusSearched(searchText: string) {
    this.vmBackupStatusSearch = searchText || '';
    this.vmBackupStatusPageNo = 1;
    this.getVmBackupStatusData(false);
  }

  onVmBackupStatusSort(sortKey: VmBackupStatusSortKey) {
    if (this.vmBackupStatusSortKey === sortKey) {
      this.vmBackupStatusSortDirection = this.vmBackupStatusSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.vmBackupStatusSortKey = sortKey;
      this.vmBackupStatusSortDirection = 'asc';
    }

    this.vmBackupStatusPageNo = 1;
    this.getVmBackupStatusData(false);
  }

  vmBackupStatusPageChange(pageNo: number) {
    if (this.vmBackupStatusPageNo === pageNo) {
      return;
    }
    this.vmBackupStatusPageNo = pageNo;
    this.getVmBackupStatusData(false);
  }

  vmBackupStatusPageSizeChange(pageSize: number) {
    this.vmBackupStatusPageSize = pageSize;
    this.vmBackupStatusPageNo = 1;
    this.getVmBackupStatusData(false);
  }

  getVmBackupStatusSortIcon(sortKey: VmBackupStatusSortKey): string {
    if (this.vmBackupStatusSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.vmBackupStatusSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getVmBackupStatusOrdering(): string {
    return this.vmBackupStatusSortDirection === 'asc'
      ? this.vmBackupStatusSortKey
      : `-${this.vmBackupStatusSortKey}`;
  }

  getVmBackupStatusBadgeClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'success':
        return 'backup-status-pill--success';
      case 'failed':
        return 'backup-status-pill--failed';
      case 'unprotected':
        return 'backup-status-pill--unprotected';
      default:
        return 'backup-status-pill--warning';
    }
  }

  getVmBackupRepositoryTone(usedPercentage: number): string {
    if (usedPercentage >= 85) {
      return 'bg-danger';
    }
    if (usedPercentage >= 70) {
      return 'bg-warning';
    }

    return 'bg-success';
  }

  getHypervisorVersionComplianceData(hideWhenEmpty = true) {
    this.showHypervisorVersionComplianceWidget = true;
    this.hypervisorVersionComplianceRows = [];
    this.spinner.start(this.hypervisorVersionComplianceLoader);
    this.svc.getHypervisorVersionComplianceData(
      this.filterForm.getRawValue(),
      this.hypervisorVersionCompliancePageNo,
      this.hypervisorVersionCompliancePageSize,
      this.getHypervisorVersionComplianceOrdering(),
      this.hypervisorVersionComplianceSearch
    )
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.hypervisorVersionComplianceLoader)))
      .subscribe(res => {
        this.hypervisorVersionComplianceRows = res?.results || [];
        this.hypervisorVersionComplianceTotal = res?.count || 0;
        this.showHypervisorVersionComplianceWidget = hideWhenEmpty ? this.hasMeaningfulExecutiveSummaryValue(res) : true;
      }, (_err: HttpErrorResponse) => {
        this.hypervisorVersionComplianceRows = [];
        this.hypervisorVersionComplianceTotal = 0;
        this.showHypervisorVersionComplianceWidget = !hideWhenEmpty;
        this.notification.error(new Notification('Failed to get Hypervisor Version Compliance data. Try again later'));
      });
  }

  setHypervisorVersionComplianceViewMode(mode: 'table' | 'chart') {
    this.hypervisorVersionComplianceViewMode = mode;
    if (mode === 'chart' && !this.hypervisorVersionGapChartOptions) {
      this.getHypervisorVersionComplianceChartData();
    }
  }

  getHypervisorVersionComplianceChartData() {
    this.hypervisorVersionGapChartOptions = null;
    this.hypervisorVersionPlatformChartOptions = null;
    this.spinner.start(this.hypervisorVersionComplianceChartLoader);
    this.svc.getHypervisorVersionComplianceChartData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop(this.hypervisorVersionComplianceChartLoader)))
      .subscribe(res => {
        this.hypervisorVersionGapChartOptions = this.svc.convertToHypervisorVersionGapChart(res);
        this.hypervisorVersionPlatformChartOptions = this.svc.convertToHypervisorPlatformHostCountChart(res);
      }, (_err: HttpErrorResponse) => {
        this.hypervisorVersionGapChartOptions = null;
        this.hypervisorVersionPlatformChartOptions = null;
        this.showHypervisorVersionComplianceWidget = this.hasMeaningfulExecutiveSummaryValue({
          count: this.hypervisorVersionComplianceTotal,
          results: this.hypervisorVersionComplianceRows
        });
        this.notification.error(new Notification('Failed to get Hypervisor Version Compliance chart data. Try again later'));
      });
  }

  onHypervisorVersionComplianceSearched(searchText: string) {
    this.hypervisorVersionComplianceSearch = searchText || '';
    this.hypervisorVersionCompliancePageNo = 1;
    this.getHypervisorVersionComplianceData(false);
  }

  onHypervisorVersionComplianceSort(sortKey: HypervisorVersionComplianceSortKey) {
    if (this.hypervisorVersionComplianceSortKey === sortKey) {
      this.hypervisorVersionComplianceSortDirection = this.hypervisorVersionComplianceSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.hypervisorVersionComplianceSortKey = sortKey;
      this.hypervisorVersionComplianceSortDirection = 'asc';
    }

    this.hypervisorVersionCompliancePageNo = 1;
    this.getHypervisorVersionComplianceData(false);
  }

  hypervisorVersionCompliancePageChange(pageNo: number) {
    if (this.hypervisorVersionCompliancePageNo === pageNo) {
      return;
    }
    this.hypervisorVersionCompliancePageNo = pageNo;
    this.getHypervisorVersionComplianceData(false);
  }

  hypervisorVersionCompliancePageSizeChange(pageSize: number) {
    this.hypervisorVersionCompliancePageSize = pageSize;
    this.hypervisorVersionCompliancePageNo = 1;
    this.getHypervisorVersionComplianceData(false);
  }

  getHypervisorVersionComplianceSortIcon(sortKey: HypervisorVersionComplianceSortKey): string {
    if (this.hypervisorVersionComplianceSortKey !== sortKey) {
      return 'fa-sort text-muted';
    }

    return this.hypervisorVersionComplianceSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  getHypervisorVersionComplianceOrdering(): string {
    return this.hypervisorVersionComplianceSortDirection === 'asc'
      ? this.hypervisorVersionComplianceSortKey
      : `-${this.hypervisorVersionComplianceSortKey}`;
  }

  getHypervisorVersionComplianceBadgeClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'compliant':
        return 'backup-status-pill--success';
      case 'warning':
        return 'backup-status-pill--warning';
      case 'non-compliant':
        return 'backup-status-pill--failed';
      default:
        return 'backup-status-pill--unprotected';
    }
  }

  openOrphanedDeviceDetails(device: OrphanedDeviceList) {
    this.openDeviceDetailsInNewTab({
      deviceType: device?.device,
      uuid: device?.uuid,
      vmSubType: device?.vmSubType,
      name: device?.name,
      monitoring: device?.monitoring,
      os: device?.os
    });
  }

  openIdleDeviceDetails(device: DevicesRowViewData) {
    this.openDeviceDetailsInNewTab({
      deviceType: device?.deviceType,
      uuid: device?.uuid,
      vmSubType: device?.vmSubType,
      name: device?.deviceName
    });
  }

  openUtilizationDeviceDetails(device: { deviceType: string; uuid: string; vmSubType?: string; name?: string }) {
    this.openDeviceDetailsInNewTab({
      deviceType: device?.deviceType,
      uuid: device?.uuid,
      vmSubType: device?.vmSubType,
      name: device?.name
    });
  }

  private getMappedOrphanedDeviceType(deviceType: string): string | undefined {
    const trimmedDeviceType = this.normalizeDeviceType(deviceType);
    return Object.entries(this.deviceTypeMap).find(([key]) => key.trim() === trimmedDeviceType)?.[1];
  }

  private getVmSubTypeRoute(vmSubType?: string): string | undefined {
    const trimmedVmSubType = (vmSubType || '').trim().toLowerCase();
    const directMatch = this.privateCloudVmRouteOptions.find(option => option.name.trim().toLowerCase() === trimmedVmSubType)?.url;

    if (directMatch) {
      return directMatch;
    }

    switch (trimmedVmSubType) {
      case 'vcloud director':
        return 'vcloud';
      case 'hyperv':
        return 'hyperv';
      case 'g3kvm':
        return 'g3kvm';
      default:
        return undefined;
    }
  }

  private normalizeDeviceType(deviceType?: string): string {
    const trimmedDeviceType = (deviceType || '').trim();

    if (trimmedDeviceType === 'Virtual Machines') {
      return 'Virtual Machine';
    }

    return trimmedDeviceType;
  }

  private isVmwareVirtualMachine(deviceType?: string, vmSubType?: string): boolean {
    return this.normalizeDeviceType(deviceType) === 'Virtual Machine' && (vmSubType || '').trim().toLowerCase() === 'vmware';
  }

  private isCustomVirtualMachine(deviceType?: string, vmSubType?: string): boolean {
    return this.normalizeDeviceType(deviceType) === 'Virtual Machine' && (vmSubType || '').trim().toLowerCase() === 'custom';
  }

  private getVmPlatformType(device: {
    vmSubType?: string;
    os?: string | { platform_type?: string };
  }): string | undefined {
    return device?.vmSubType || (typeof device?.os === 'string' ? undefined : device?.os?.platform_type);
  }

  private setVmwareDeviceContext(device: {
    name?: string;
    monitoring?: { configured?: boolean };
    os?: string | { platform_type?: string };
    vmSubType?: string;
  }) {
    this.storageService.put('device', {
      name: device?.name,
      deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE,
      configured: device?.monitoring?.configured,
      ssr_os: this.getVmPlatformType(device)
    }, StorageType.SESSIONSTORAGE);
  }

  private setCustomVmDeviceContext(device: {
    name?: string;
    monitoring?: { configured?: boolean };
    os?: string | { platform_type?: string };
    vmSubType?: string;
  }) {
    this.storageService.put('device', {
      name: device?.name,
      deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE,
      configured: device?.monitoring?.configured,
      os: device?.os,
      ssr_os: this.getVmPlatformType(device)
    }, StorageType.SESSIONSTORAGE);
  }

  private openDeviceDetailsInNewTab(device: {
    deviceType?: string;
    uuid?: string;
    vmSubType?: string;
    name?: string;
    monitoring?: { configured?: boolean };
    os?: string | { platform_type?: string };
  }) {
    const normalizedDeviceType = this.normalizeDeviceType(device?.deviceType);
    const devicePath = this.getMappedOrphanedDeviceType(normalizedDeviceType);

    if (!devicePath || !device?.uuid) {
      return;
    }

    const vmSubTypeRoute = normalizedDeviceType === 'Virtual Machine'
      ? this.getVmSubTypeRoute(device?.vmSubType)
      : undefined;

    if (this.isVmwareVirtualMachine(normalizedDeviceType, device?.vmSubType)) {
      this.setVmwareDeviceContext(device);
    } else if (this.isCustomVirtualMachine(normalizedDeviceType, device?.vmSubType)) {
      this.setCustomVmDeviceContext(device);
    }

    const detailsPath = vmSubTypeRoute
      ? `/unitycloud/devices/${devicePath}/${vmSubTypeRoute}/${device.uuid}/zbx/details`
      : `/unitycloud/devices/${devicePath}/${device.uuid}/zbx/details`;

    this.router.navigateByUrl(detailsPath);
  }
  idleDevicesPageChange(pageNo: number) {
    if (this.idleDevicesPageNo === pageNo) {
      return;
    }
    this.idleDevicesPageNo = pageNo;
    this.getIdleDevicesData(false);
  }
  getOrphanedStatusIconClass(status: string): string {
    switch (status) {
      case 'error':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';

      case 'warning':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';

      case 'success':
      case 'Idle':
      case 'Active':
        return 'fas fa-check-circle text-success font-xs-sm';

      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  openAllVmsInNewTab() {
    const routeUrl = this.router.serializeUrl(this.router.createUrlTree(['/unitycloud/devices/vms/allvms']));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  openAlertsInNewTab() {
    const routeUrl = this.router.serializeUrl(this.router.parseUrl('/services/aiml-event-mgmt/alerts'));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  onCloudTypeChartInit(chartInstance: any) {
    this.registerExecutiveSummaryChart(chartInstance);
    this.bindChartClick(chartInstance, params => {
      this.openCloudTypeRoute(params?.data?.name || params?.name);
    });
  }

  onExecutiveSummaryChartInit(chartInstance: any) {
    this.registerExecutiveSummaryChart(chartInstance);
  }

  openCloudTypeLegend(cloudType: string) {
    this.openCloudTypeRoute(cloudType);
  }

  onPowerActivityChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => {
      this.openPowerActivityRoute();
    });
  }

  private registerExecutiveSummaryChart(chartInstance: any) {
    if (!chartInstance || this.executiveSummaryChartInstances.indexOf(chartInstance) !== -1) {
      return;
    }
    this.executiveSummaryChartInstances.push(chartInstance);
    this.resizeExecutiveSummaryCharts();
  }

  private resizeExecutiveSummaryCharts() {
    setTimeout(() => {
      this.executiveSummaryChartInstances.forEach(chartInstance => {
        if (chartInstance && typeof chartInstance.resize === 'function') {
          chartInstance.resize();
        }
      });
    });
  }

  onOrphanedCategoryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openOrphanedCategoryRoute(params?.data?.name || params?.name);
    });
  }

  openOrphanedCategoryLegend(category: string) {
    this.openOrphanedCategoryRoute(category);
  }

  onUtilizationSortFieldChange(sortKey: string) {
    const nextSortKey = sortKey as UtilizationSortKey;

    if (this.selectedUtilizationSort !== nextSortKey) {
      this.utilizationSortDirection = 'desc';
    }

    this.selectedUtilizationSort = nextSortKey;
    this.utilizationPageNo = 1;
    this.getPerformanceHotspotWidgetData(false);
  }

  onUtilizationHeaderSort(sortKey: UtilizationSortKey) {
    if (this.selectedUtilizationSort === sortKey) {
      this.utilizationSortDirection = this.utilizationSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.selectedUtilizationSort = sortKey;
      this.utilizationSortDirection = 'desc';
    }

    this.utilizationPageNo = 1;
    this.getPerformanceHotspotWidgetData(false);
  }

  onUtilizationSearched(searchText: string) {
    this.utilizationSearch = searchText || '';
    this.utilizationPageNo = 1;
    this.getPerformanceHotspotWidgetData(false);
  }

  utilizationPageChange(pageNo: number) {
    if (this.utilizationPageNo === pageNo) {
      return;
    }

    this.utilizationPageNo = pageNo;
    this.getPerformanceHotspotWidgetData(false);
  }

  utilizationPageSizeChange(pageSize: number) {
    this.utilizationPageSize = pageSize;
    this.utilizationPageNo = 1;
    this.getPerformanceHotspotWidgetData(false);
  }

  setUtilizationViewMode(mode: 'table' | 'chart') {
    this.utilizationViewMode = mode;
    if (mode === 'chart' && !this.utilizationCpuMemoryChartOptions && !this.utilizationStorageChartOptions) {
      this.getPerformanceHotspotChartData();
    }
  }

  getVisibleUtilizationRows(): PrivateCloudUtilizationViewRow[] {
    return (this.utilizationRows?.utilRow || []) as PrivateCloudUtilizationViewRow[];
  }

  hasIdleDurationDistributionData(): boolean {
    const rows = this.idleDistributionRows?.distributionRow || [];
    return !!rows.length;
  }

  applyFilters() {
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.hypervisorHealthPageNo = 1;
    this.storageDatastoresPageNo = 1;
    this.networkInterfacesPageNo = 1;
    this.vmWorkloadPageNo = 1;
    this.utilizationPageNo = 1;
    this.newlyProvisionedVmsPageNo = 1;
    this.loadWidgets();
  }

  /** Captures the global Time Range selection (named period or custom range). Applied to widgets only on Apply. */
  onTimeRangeChange(event: { period?: string; from?: string | Date; to?: string | Date }) {
    this.selectedTimeRange = event?.period || this.selectedTimeRange;
    this.selectedTimeRangeDates = event?.period === 'custom'
      ? { from: this.formatTimeRangeDate(event?.from, false), to: this.formatTimeRangeDate(event?.to, true) }
      : null;
    // Store into the form so every widget's getRawValue() picks up the Time Range on the next Apply.
    this.filterForm?.patchValue({
      timeRange: this.selectedTimeRange,
      startDate: this.selectedTimeRange === 'custom' ? (this.selectedTimeRangeDates?.from || '') : '',
      endDate: this.selectedTimeRange === 'custom' ? (this.selectedTimeRangeDates?.to || '') : ''
    }, { emitEvent: false });
  }

  /** Formats a custom-range boundary as UTC ISO-8601 (e.g. 2026-07-01T00:00:00Z) for start_datetime / end_datetime. */
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

  refreshData() {
    this.loadWidgets();
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

  private openCloudTypeRoute(cloudType: string) {
    const platformOption = this.getPlatformRouteOption(cloudType);

    if (!platformOption?.value || !platformOption.value.startsWith('/')) {
      return;
    }

    const routeUrl = this.router.serializeUrl(this.router.parseUrl(platformOption.value));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private openPowerActivityRoute() {
    const routeUrl = this.router.serializeUrl(this.router.parseUrl('/unitycloud/pccloud/'));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private openOrphanedCategoryRoute(category: string) {
    const deviceOption = this.getDeviceRouteOption(category);

    if (!deviceOption?.value || !deviceOption.value.startsWith('/')) {
      return;
    }

    const routeUrl = this.router.serializeUrl(this.router.parseUrl(deviceOption.value));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private getUtilizationOrdering(): string {
    const sortKey = this.selectedUtilizationSort;
    return this.utilizationSortDirection === 'asc' ? sortKey : `-${sortKey}`;
  }

  private getPlatformRouteOption(cloudType: string): labelAndValueType | undefined {
    const normalizedCloudType = this.normalizeValue(cloudType);
    return this.platformRouteOptions.find(option => this.normalizeValue(option.label) === normalizedCloudType);
  }

  private getDeviceRouteOption(category: string): labelAndValueType | undefined {
    const normalizedCategory = this.normalizeValue(category);
    return this.deviceRouteOptions.find(option => this.normalizeValue(option.label) === normalizedCategory);
  }

  private normalizeValue(value: string): string {
    return (value || '').trim().toLowerCase();
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  getVmDensityWidth(vms: number): number {
    const max = Math.max(...(this.topHostsByVmDensity || []).map(row => row.vms || 0), 1);
    return Math.max(((vms || 0) / max) * 100, vms ? 4 : 0);
  }

  shouldShowVmDensityLabelInside(value: number): boolean {
    return value >= 18;
  }

  shouldShowBarLabelInside(value: number): boolean {
    return value > this.compactBarLabelThreshold;
  }

  getBarLabelOffset(value: number): string {
    if (value <= 0) {
      return '8px';
    }

    return `calc(${Math.min(value, 100)}% + 6px)`;
  }

  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  getUtilizationHeaderClass(sortKey: UtilizationSortKey): string {
    return this.selectedUtilizationSort === sortKey
      ? 'utilization-sort-active utilization-sort-enabled'
      : 'utilization-sort-disabled';
  }

  getUtilizationSortIcon(sortKey: UtilizationSortKey): string | null {
    if (this.selectedUtilizationSort !== sortKey) {
      return 'fa-sort';
    }

    return this.utilizationSortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down';
  }

  trackByValue(index: number, option: labelAndValueType) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

}
