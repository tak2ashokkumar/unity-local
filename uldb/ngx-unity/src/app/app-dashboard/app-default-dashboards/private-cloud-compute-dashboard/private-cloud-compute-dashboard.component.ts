import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
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
import { DEVICE_OPTIONS, DEVICE_TYPE_MAP, PLATFORM_OPTIONS, privateCloudTabItems } from './private-cloud-compute-dashboard.const';
import { CapacityAndGrowthInsightsWidgetData, chartColors, ClusterCapacityUtilTrendWidgetData, CpuReadyWidgetData, DevicesRowViewData, DiskLatencyWidgetData, ExecutiveSummaryViewData, ExecutiveSummaryWidgetData, IdleDevicesDistribution, IdleDevicesViewData, InfrastructureHealthWidgetData, OrphanedDeviceList, OrphanedDeviceView, OrphanedDeviceWidgetView, PerformanceHotspotWidgetData, PrivateCloudComputeDashboardService, RecentAlertSummaryViewData, SwapBalloonMemoryWidgetData, Top10ClustersByVMsWidgetData, TopCriticalAlertsViewData, VmDensityHost } from './private-cloud-compute-dashboard.service';
import { labelAndValueType, PrivateCloudAlertSideCard, PrivateCloudUtilization, ScopeDataType, TopHeaderDataType } from './private-cloud-compute-dashboard.type';

type UtilizationSortKey = 'cpuUtilization' | 'memoryUtilization' | 'storageUtilization' | 'networkSpeed' | 'uptime';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'private-cloud-compute-dashboard',
  templateUrl: './private-cloud-compute-dashboard.component.html',
  styleUrls: ['./private-cloud-compute-dashboard.component.scss'],
  providers: [PrivateCloudComputeDashboardService]
})
export class PrivateCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private filterFormUnsubscribe = new Subject<void>();
  private readonly platformRouteOptions = PLATFORM_OPTIONS;
  private readonly deviceRouteOptions = DEVICE_OPTIONS;
  private readonly deviceTypeMap = DEVICE_TYPE_MAP;
  private readonly privateCloudVmRouteOptions = privateCloudTabItems;
  readonly compactBarLabelThreshold = 10;

  filterForm: FormGroup;
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
  showExecutiveSummaryWidget = true;
  capacityAndGrowthInsightsWidgetData: CapacityAndGrowthInsightsWidgetData = new CapacityAndGrowthInsightsWidgetData();
  showCapacityGrowthWidget = true;

  top10ClustersByVMsWidgetData: Top10ClustersByVMsWidgetData = new Top10ClustersByVMsWidgetData();
  showTop10ClustersWidget = true;
  clusterCapacityUtilTrendWidgetData: ClusterCapacityUtilTrendWidgetData = new ClusterCapacityUtilTrendWidgetData();
  showClusterCapacityTrendWidget = true;

  infrastructureHealthWidgetData: InfrastructureHealthWidgetData = new InfrastructureHealthWidgetData();
  showSensorStatisticsWidget = true;

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

  idleDevicesRow: IdleDevicesViewData = new IdleDevicesViewData()
  idleDistributionRows: IdleDevicesDistribution = new IdleDevicesDistribution()
  showIdleDevicesAnalysisWidget = true;
  showIdleDurationDistributionWidget = true;

  diskLatencyWidgetData: DiskLatencyWidgetData = new DiskLatencyWidgetData();
  cpuReadyWidgetData: CpuReadyWidgetData = new CpuReadyWidgetData();
  swapBalloonMemoryWidgetData: SwapBalloonMemoryWidgetData = new SwapBalloonMemoryWidgetData();
  showPerformanceWorkloadInsightsWidget = true;



  alertSummaryMetrics: RecentAlertSummaryViewData = new RecentAlertSummaryViewData();
  criticalAlerts: TopCriticalAlertsViewData = new TopCriticalAlertsViewData()
  showRecentAlertsWidget = true;
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
    this.getCapacityGrowthWidgetData();
    this.getTop10ClustersByVMsWidgetData();
    this.getClusterCapacityUtilTrendWidgetData();
    this.getInfrastructureHealthWidgetData();
    this.getPerformanceHotspotWidgetData();
    this.getPerformanceWorkloadWidgetData();
    this.getAlertAndEventsWidgetData();
    this.getOrphanedDeviceData()
    this.getIdleDevicesData()
  }

  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.platformOptions = [];
    this.datacenterOptions = [];
    this.environmentOptions = [];
    this.accountOptions = [];
  }

  //---------Executive Summary / Cloud Inventory------

  getExecutiveSummaryWidgetData() {
    this.showExecutiveSummaryWidget = true;

    this.executiveSummaryWidgetData.cloudTypeChartData = null;
    this.executiveSummaryWidgetData.powerActivityChartData = null;
    this.executiveSummaryWidgetData.vmCountByOSTypeChartData = null;
    this.executiveSummaryWidgetData.environmentAndCriticalityChartData = null;
    this.executiveSummaryWidgetData.alertSeverityViewData = null;


    this.startExecutiveSummaryWidgetLoaders()
    this.svc.getExecutiveSummaryWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopExecutiveSummaryWidgetLoaders()))
      .subscribe(res => {
        if (res) {
          this.showExecutiveSummaryWidget = this.hasExecutiveSummaryWidgetData(res);
          this.executiveSummaryViewData = this.svc.convertExecutiveSummaryViewData(res.executiveSummary);
          this.executiveSummaryWidgetData.cloudTypeChartData = this.svc.convertToCloudTypeChartData(res.cloudTypeDistribution);
          this.executiveSummaryWidgetData.powerActivityChartData = this.svc.convertToPowerActivityChartData(res.powerActivityState);
          this.executiveSummaryWidgetData.vmCountByOSTypeChartData = this.svc.convertToVmCountByOSTypeChartData(res.vmCountByOSType);
          this.executiveSummaryWidgetData.environmentAndCriticalityChartData = this.svc.convertToEnvironmentAndCriticalityChartData(res.environmentCriticality);
          this.executiveSummaryWidgetData.alertSeverityViewData = this.svc.convertToAlertSeverityViewData(res.alertsSeverity);
        }
      }, (_err: HttpErrorResponse) => {
        this.executiveSummaryWidgetData.cloudTypeChartData = null;
        this.executiveSummaryWidgetData.powerActivityChartData = null;
        this.executiveSummaryWidgetData.vmCountByOSTypeChartData = null;
        this.executiveSummaryWidgetData.environmentAndCriticalityChartData = null;
        this.executiveSummaryWidgetData.alertSeverityViewData = null;
        this.showExecutiveSummaryWidget = false;
        this.notification.error(
          new Notification('Failed to get Executive Summary Data data. Try again later')
        );
      });
  }

  private startExecutiveSummaryWidgetLoaders() {
    [this.executiveSummaryWidgetData.executiveSummaryLoader,
    this.executiveSummaryWidgetData.cloudTypeLoader,
    this.executiveSummaryWidgetData.powerActivityLoader,
    this.executiveSummaryWidgetData.vmCountByOSTypeLoader,
    this.executiveSummaryWidgetData.environmentAndCriticalityLoader,
    ].forEach(loaderName => this.spinner.start(loaderName));
  }

  private stopExecutiveSummaryWidgetLoaders() {
    [this.executiveSummaryWidgetData.cloudTypeLoader,
    this.executiveSummaryWidgetData.executiveSummaryLoader,
    this.executiveSummaryWidgetData.powerActivityLoader,
    this.executiveSummaryWidgetData.vmCountByOSTypeLoader,
    this.executiveSummaryWidgetData.environmentAndCriticalityLoader,
    ].forEach(loaderName => this.spinner.stop(loaderName));
  }

  private hasExecutiveSummaryWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  private hasMeaningfulExecutiveSummaryValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (Array.isArray(value)) {
      return value.some(item => this.hasMeaningfulExecutiveSummaryValue(item));
    }

    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>)
        .some(item => this.hasMeaningfulExecutiveSummaryValue(item));
    }

    return false;
  }

  //------------Capacity and Growth Insight ----------------------

  densityHostVm: VmDensityHost = new VmDensityHost();

  getCapacityGrowthWidgetData() {
    this.showCapacityGrowthWidget = true;
    this.densityHostVm.desnityHostRows = []
    this.spinner.start(this.densityHostVm.loader);
    this.spinner.start(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
    this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
    this.svc.getCapacityGrowthWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.showCapacityGrowthWidget = this.hasCapacityGrowthWidgetData(res);
          this.densityHostVm = this.svc.convertToVmDensityHostViewData(res.topHostUtilization);
          this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = this.svc.convertToVmCapacityChartData(res.capacityTrendAndForecast);
          this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = this.svc.convertToVmProvisioningViewData(res.provisioningStatus);
        }
        this.spinner.stop(this.densityHostVm.loader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
      }, (_err: HttpErrorResponse) => {
        this.densityHostVm.desnityHostRows = []
        this.spinner.stop(this.densityHostVm.loader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
        this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
        this.showCapacityGrowthWidget = false;
        this.notification.error(new Notification('Failed to get Capacity and Growth data. Try again later'));
      });
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

  //-----Top 10 Clusters By VM Count-----------

  getTop10ClustersByVMsWidgetData() {
    this.showTop10ClustersWidget = true;
    this.spinner.start(this.top10ClustersByVMsWidgetData.loader);
    this.top10ClustersByVMsWidgetData.chartData = null;
    this.svc.getTop10ClustersByVMsWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.showTop10ClustersWidget = this.hasTop10ClustersWidgetData(res);
        this.spinner.stop(this.top10ClustersByVMsWidgetData.loader);
        let chartdata = this.svc.convertToTop10ClustersByVMCountViewData(res)
        this.top10ClustersByVMsWidgetData.chartData = this.svc.convertToTop10ClustersByVMsChartData(chartdata.clusterList);
      }
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.top10ClustersByVMsWidgetData.loader);
      this.showTop10ClustersWidget = false;
      this.notification.error(new Notification('Failed to get top10 Clusters By VMs data. Try again later'));
    });
  }

  private hasTop10ClustersWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  //-----Cluster Capacity Utilization Trend-----------

  getClusterCapacityUtilTrendWidgetData() {
    this.showClusterCapacityTrendWidget = true;
    this.spinner.start(this.clusterCapacityUtilTrendWidgetData.loader);
    this.clusterCapacityUtilTrendWidgetData.chartData = null;
    this.svc.getClusterCapacityUtilTrendWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.showClusterCapacityTrendWidget = this.hasClusterCapacityTrendWidgetData(res);
        this.spinner.stop(this.clusterCapacityUtilTrendWidgetData.loader);
        let data = this.svc.convertToClusterCapacityUtilTrendViewData(res);
        this.clusterCapacityUtilTrendWidgetData.chartData = this.svc.convertToClusterCapacityUtilTrendChartData(data);
      }
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.clusterCapacityUtilTrendWidgetData.loader);
      this.clusterCapacityUtilTrendWidgetData.chartData = null;
      this.showClusterCapacityTrendWidget = false;
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  private hasClusterCapacityTrendWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  //-----Infrastructure Health / Hardware Status------

  getInfrastructureHealthWidgetData() {
    this.showSensorStatisticsWidget = true;
    this.spinner.start(this.infrastructureHealthWidgetData.loader);
    // this.infrastructureHealthWidgetData = null;
    this.svc.getInfrastructureHealthWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.showSensorStatisticsWidget = this.hasSensorStatisticsWidgetData(res);
          this.infrastructureHealthWidgetData = this.svc.convertInfrastructureHealthViewData(res);
        }
        this.spinner.stop(this.infrastructureHealthWidgetData.loader);

      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.infrastructureHealthWidgetData.loader);
        this.showSensorStatisticsWidget = false;
        this.notification.error(new Notification('Failed to get Infrastructure and Hardware Health Widget data. Try again later'));
      });
  }

  private hasSensorStatisticsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }



  getPerformanceHotspotWidgetData() {
    this.showPerformanceHotspotsWidget = true;
    this.utilizationRows.utilRow = [];
    this.spinner.start(this.loaderNames.performanceHotspot);
    this.svc.getUtilizationRows(this.filterForm.getRawValue(), this.getUtilizationOrdering())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.spinner.stop(this.loaderNames.performanceHotspot);
        this.showPerformanceHotspotsWidget = this.hasPerformanceHotspotsWidgetData(res);
        this.utilizationRows = this.svc.convertToUtilizationViewData(res);
      }, () => {
        this.utilizationRows.utilRow = [];
        this.showPerformanceHotspotsWidget = false;
        this.spinner.stop(this.loaderNames.performanceHotspot);
        this.notification.error(new Notification('Failed to get Performance Hotspot data. Try again later'));
      });
  }

  private hasPerformanceHotspotsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  getIdleDevicesData() {
    this.showIdleDevicesAnalysisWidget = true;
    this.showIdleDurationDistributionWidget = true;
    this.idleDevicesRow.devicesRow = []
    this.idleDistributionRows.distributionRow = []
    this.idleDistributionRows.chartData = null;

    this.spinner.start(this.idleDevicesRow.loader);
    this.spinner.start(this.idleDistributionRows.loader);
    this.svc.getIdleDevicesData(this.filterForm.getRawValue(), this.idleDevicesPageNo, this.idleDevicesPageSize).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop(this.idleDevicesRow.loader);
      this.spinner.stop(this.idleDistributionRows.loader);
      this.showIdleDevicesAnalysisWidget = this.hasIdleDevicesAnalysisWidgetData(res);
      this.showIdleDurationDistributionWidget = this.hasIdleDurationDistributionWidgetData(res?.idleDurationDistribution);

      this.idleDevicesRow = this.svc.convertToDeviceIdleViewData(res)
      this.idleDevicesTotal = res.count

      this.idleDistributionRows = this.svc.convertToIdleDevicesDistributionViewData(res.idleDurationDistribution)
      this.idleDistributionRows.chartData = this.svc.convertToIdleDurationDistributionChartData(this.idleDistributionRows.distributionRow)
    }, () => {
      this.idleDistributionRows.chartData = null;
      this.idleDevicesRow.devicesRow = []
      this.idleDistributionRows.distributionRow = []
      this.showIdleDevicesAnalysisWidget = false;
      this.showIdleDurationDistributionWidget = false;
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

  getDistributionClass(index: number): string {
    switch (index) {
      case 0:
        return 'bg-success';
      case 1:
        return 'bg-warning';
      case 2:
        return 'bg-danger';
      case 3:
        return 'distribution-pink';
      default:
        return 'bg-secondary';
    }
  }

  getPerformanceWorkloadWidgetData() {
    this.showPerformanceWorkloadInsightsWidget = true;
    this.spinner.start(this.diskLatencyWidgetData.loader);
    this.spinner.start(this.cpuReadyWidgetData.loader);
    this.spinner.start(this.swapBalloonMemoryWidgetData.loader);
    this.diskLatencyWidgetData.chartData = null;
    this.cpuReadyWidgetData.chartData = null;
    this.swapBalloonMemoryWidgetData.chartData = null;
    this.svc.getPerformanceWorkloadWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.showPerformanceWorkloadInsightsWidget = this.hasPerformanceWorkloadInsightsWidgetData(res);
          this.diskLatencyWidgetData.chartData = this.svc.convertTodiskLatencyChartData(res.diskLatencyTop10);
          this.cpuReadyWidgetData.chartData = this.svc.convertToCpuReadyChartData(res.cpuReadyWaitTop10);
          this.swapBalloonMemoryWidgetData.chartData = this.svc.convertToSwapBalloonMemoryChartData(res.swapBalloonMemoryTop10);
        }
        this.spinner.stop(this.diskLatencyWidgetData.loader);
        this.spinner.stop(this.cpuReadyWidgetData.loader);
        this.spinner.stop(this.swapBalloonMemoryWidgetData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.diskLatencyWidgetData.loader);
        this.spinner.stop(this.cpuReadyWidgetData.loader);
        this.spinner.stop(this.swapBalloonMemoryWidgetData.loader);
        this.diskLatencyWidgetData.chartData = null;
        this.cpuReadyWidgetData.chartData = null;
        this.swapBalloonMemoryWidgetData.chartData = null;
        this.showPerformanceWorkloadInsightsWidget = false;
        this.notification.error(new Notification('Failed to get Disk Latency data. Try again later'));
      });
  }

  private hasPerformanceWorkloadInsightsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  //Alert and Events

  getAlertAndEventsWidgetData() {
    let filterFormOutput = this.filterForm.getRawValue();
    this.getRecentAlerts(filterFormOutput);
  }

  getRecentAlerts(filterFormOutput: any) {
    this.showRecentAlertsWidget = true;
    this.criticalAlerts.alertList = null;
    this.spinner.start(this.alertSummaryMetrics.loader)
    this.spinner.start(this.criticalAlerts.loader)
    this.svc.getRecentAlerts(filterFormOutput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.showRecentAlertsWidget = this.hasRecentAlertsWidgetData(res);
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryView(res);
      this.criticalAlerts = this.svc.convertToTopCriticalAlertsViewData(res.recentAlerts);
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    }, () => {
      this.criticalAlerts.alertList = null;
      this.showRecentAlertsWidget = false;
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    });
  }

  private hasRecentAlertsWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  viewAlertDetails(index: number) {
    this.alertDetailSvc.showEventDetails(this.criticalAlerts.alertList[index].uuid);
  }


  getOrphanedDeviceData() {
    this.showOrphanedDeviceListWidget = true;
    this.showOrphanedByCategoryWidget = true;
    this.spinner.start(this.orphanedDeviceListViewData.loader);
    this.spinner.start(this.orphanedDeviceWidgetViewData.loader);
    this.orphanedDeviceListViewData.orphanList = null;
    this.orphanedDeviceWidgetViewData.chartData = null;
    this.orphanedByCategory = [];
    this.svc.getOrphanedDeviceData(this.filterForm.getRawValue(), this.orphanedDevicesPageNo, this.orphanedDevicesPageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.showOrphanedDeviceListWidget = this.hasOrphanedDeviceListWidgetData(res);
          this.showOrphanedByCategoryWidget = this.hasOrphanedByCategoryWidgetData(res?.orphanedByCategory);
          this.orphanedDeviceListViewData = this.svc.convertToOrphanedDeviceListView(res);
          this.orphanedByCategory = (res.orphanedByCategory || []).filter(item => Number(item?.count) > 0);
          this.orphanedDevicesTotal = res.count
          this.orphanedDeviceWidgetViewData.chartData = this.svc.convertToOrphanedByCategoryChartData(this.orphanedByCategory)
        }
        this.spinner.stop(this.orphanedDeviceListViewData.loader);
        this.spinner.stop(this.orphanedDeviceWidgetViewData.loader);

      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.orphanedDeviceListViewData.loader);
        this.spinner.stop(this.orphanedDeviceWidgetViewData.loader);

        this.orphanedDeviceListViewData.orphanList = null;
        this.orphanedDeviceWidgetViewData.chartData = null;
        this.orphanedByCategory = [];
        this.showOrphanedDeviceListWidget = false;
        this.showOrphanedByCategoryWidget = false;
        this.notification.error(new Notification('Failed to get Orphaned Device data. Try again later'));
      });
  }

  private hasOrphanedDeviceListWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }

  private hasOrphanedByCategoryWidgetData(data: unknown): boolean {
    return this.hasMeaningfulExecutiveSummaryValue(data);
  }



  orphanedDevicesPageChange(pageNo: number) {
    if (this.orphanedDevicesPageNo === pageNo) {
      return;
    }
    this.orphanedDevicesPageNo = pageNo;
    this.getOrphanedDeviceData();
  }

  orphanedDevicesPageSizeChange(event: Event) {
    this.orphanedDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.orphanedDevicesPageNo = 1;
    this.getOrphanedDeviceData();
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
    this.getIdleDevicesData();
  }
  getOrphanedStatusIconClass(status: string): string {
    switch (status) {
      case 'error':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';

      case 'warning':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';

      case 'success':
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
    this.bindChartClick(chartInstance, params => {
      this.openCloudTypeRoute(params?.data?.name || params?.name);
    });
  }

  openCloudTypeLegend(cloudType: string) {
    this.openCloudTypeRoute(cloudType);
  }

  onPowerActivityChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => {
      this.openPowerActivityRoute();
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
    this.getPerformanceHotspotWidgetData();
  }

  onUtilizationHeaderSort(sortKey: UtilizationSortKey) {
    if (this.selectedUtilizationSort === sortKey) {
      this.utilizationSortDirection = this.utilizationSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.selectedUtilizationSort = sortKey;
      this.utilizationSortDirection = 'desc';
    }

    this.getPerformanceHotspotWidgetData();
  }

  applyFilters() {
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.loadWidgets();
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
      return null;
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
