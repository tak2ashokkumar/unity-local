import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PUBLIC_CLOUD_TICKET_PRIORITY_OPTIONS, PUBLIC_CLOUD_TICKET_STATE_OPTIONS, PUBLIC_CLOUD_TICKET_TYPE_OPTIONS } from '../public-cloud-compute-dashboard/public-cloud-compute-dashboard.const';
import { PublicCloudFilterOption } from '../public-cloud-compute-dashboard/public-cloud-compute-dashboard.type';
import { AutoRemediationExecSummaryWidgetData, CapacityAndGrowthInsightsWidgetData, chartColors, ClusterCapacityUtilTrendWidgetData, CpuReadyWidgetData, DiskLatencyWidgetData, ExecutiveSummaryViewData, ExecutiveSummaryWidgetData, IdleDevicesDistribution, IdleDevicesViewData, InfrastructureHealthWidgetData, OrphanedDeviceView, OrphanedDeviceWidgetView, PerformanceHotspotWidgetData, PrivateCloudComputeDashboardService, RecentAlertSummaryViewData, RiskOptimizationViewData, RiskOptimizationWidgetData, SwapBalloonMemoryWidgetData, TicketPriorityOptionsWidgetData, TicketsItemViewData, TicketStatusOptionsWidgetData, Top10ClustersByVMsWidgetData, TopAutoRemediationActionWidgetData, TopCriticalAlertsViewData } from './private-cloud-compute-dashboard.service';
import { labelAndValueType, PrivateCloudAlertSideCard, PrivateCloudUtilization, ScopeDataType, TopHeaderDataType } from './private-cloud-compute-dashboard.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';


@Component({
  selector: 'private-cloud-compute-dashboard',
  templateUrl: './private-cloud-compute-dashboard.component.html',
  styleUrls: ['./private-cloud-compute-dashboard.component.scss'],
  providers: [PrivateCloudComputeDashboardService]
})
export class PrivateCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private filterFormUnsubscribe = new Subject<void>();

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
    // enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    // showCheckAll: true,
    // showUncheckAll: true,
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
  capacityAndGrowthInsightsWidgetData: CapacityAndGrowthInsightsWidgetData = new CapacityAndGrowthInsightsWidgetData();

  top10ClustersByVMsWidgetData: Top10ClustersByVMsWidgetData = new Top10ClustersByVMsWidgetData();
  clusterCapacityUtilTrendWidgetData: ClusterCapacityUtilTrendWidgetData = new ClusterCapacityUtilTrendWidgetData();

  infrastructureHealthWidgetData: InfrastructureHealthWidgetData = new InfrastructureHealthWidgetData();

  performanceHotspotWidgetData: PerformanceHotspotWidgetData = new PerformanceHotspotWidgetData();
  utilizationRows: PrivateCloudUtilization = new PrivateCloudUtilization()

  idleDevicesRow: IdleDevicesViewData = new IdleDevicesViewData()
  idleDistributionRows: IdleDevicesDistribution = new IdleDevicesDistribution()

  diskLatencyWidgetData: DiskLatencyWidgetData = new DiskLatencyWidgetData();
  cpuReadyWidgetData: CpuReadyWidgetData = new CpuReadyWidgetData();
  swapBalloonMemoryWidgetData: SwapBalloonMemoryWidgetData = new SwapBalloonMemoryWidgetData();



  alertSummaryMetrics: RecentAlertSummaryViewData = new RecentAlertSummaryViewData();
  criticalAlerts: TopCriticalAlertsViewData = new TopCriticalAlertsViewData()
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

  orphanedByCategoryColors = chartColors;
  orphanedByCategory: any[] = []




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
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService, private overlay: Overlay) {
    this.ticketDatePickerScrollStrategy = this.overlay.scrollStrategies.reposition();
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': null }]
    };
  }

  ngOnInit(): void {
    this.getHeaderInfo();
    this.getFilterDropdowns();
    this.buildFilterForm();
    setTimeout(() => {
      this.loadWidgets();
    });
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

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get filter dropdown values data. Try again later'));
      });
  }

  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm();
    this.watchFilterChanges();
  }

  private watchFilterChanges() {
    this.filterForm.get('platforms').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.loadWidgets();
      });

    this.filterForm.get('datacenters').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.loadWidgets();
      });
    this.filterForm.get('environments').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.loadWidgets();
      });

    this.filterForm.get('accounts').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.loadWidgets();
      });
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

  //------------Capacity and Growth Insight ----------------------

  getCapacityGrowthWidgetData() {
    this.spinner.start(this.capacityAndGrowthInsightsWidgetData.vmDensityLoader);
    this.spinner.start(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
    this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
    this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
    this.svc.getCapacityGrowthWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = this.svc.convertToVmDensityChartDataChartData(res.vmDensityPerHost);
          this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = this.svc.convertToVmCapacityChartData(res.capacityTrendAndForecast);
          this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = this.svc.convertToVmProvisioningViewData(res.provisioningStatus);
        }
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmDensityLoader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmDensityLoader);
        this.spinner.stop(this.capacityAndGrowthInsightsWidgetData.vmCapacityLoader);
        this.capacityAndGrowthInsightsWidgetData.vmDensityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmCapacityChartData = null;
        this.capacityAndGrowthInsightsWidgetData.vmProvisioningViewData = null;
        this.notification.error(new Notification('Failed to get Capacity and Growth data. Try again later'));
      });
  }

  //-----Top 10 Clusters By VM Count-----------

  getTop10ClustersByVMsWidgetData() {
    this.spinner.start(this.top10ClustersByVMsWidgetData.loader);
    this.top10ClustersByVMsWidgetData.chartData = null;
    this.svc.getTop10ClustersByVMsWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.spinner.stop(this.top10ClustersByVMsWidgetData.loader);
        let chartdata = this.svc.convertToTop10ClustersByVMCountViewData(res)
        this.top10ClustersByVMsWidgetData.chartData = this.svc.convertToTop10ClustersByVMsChartData(chartdata.clusterList);
      }
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.top10ClustersByVMsWidgetData.loader);

      this.notification.error(new Notification('Failed to get top10 Clusters By VMs data. Try again later'));
    });
  }

  //-----Cluster Capacity Utilization Trend-----------

  getClusterCapacityUtilTrendWidgetData() {
    this.spinner.start(this.clusterCapacityUtilTrendWidgetData.loader);
    this.clusterCapacityUtilTrendWidgetData.chartData = null;
    this.svc.getClusterCapacityUtilTrendWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.spinner.stop(this.clusterCapacityUtilTrendWidgetData.loader);
        let data = this.svc.convertToClusterCapacityUtilTrendViewData(res);
        this.clusterCapacityUtilTrendWidgetData.chartData = this.svc.convertToClusterCapacityUtilTrendChartData(data);
      }
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.clusterCapacityUtilTrendWidgetData.loader);
      this.clusterCapacityUtilTrendWidgetData.chartData = null;
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  //-----Infrastructure Health / Hardware Status------

  getInfrastructureHealthWidgetData() {
    this.spinner.start(this.infrastructureHealthWidgetData.loader);
    // this.infrastructureHealthWidgetData = null;
    this.svc.getInfrastructureHealthWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.infrastructureHealthWidgetData = this.svc.convertInfrastructureHealthViewData(res);
        }
        this.spinner.stop(this.infrastructureHealthWidgetData.loader);

      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.infrastructureHealthWidgetData.loader);

        this.notification.error(new Notification('Failed to get Infrastructure and Hardware Health Widget data. Try again later'));
      });
  }



  getPerformanceHotspotWidgetData() {
    this.utilizationRows.utilRow = [];
    this.spinner.start(this.loaderNames.performanceHotspot);
    this.svc.getUtilizationRows(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop(this.loaderNames.performanceHotspot);
      this.utilizationRows = this.svc.convertToUtilizationViewData(res);
    }, () => {
      this.utilizationRows.utilRow = [];
      this.spinner.stop(this.loaderNames.performanceHotspot);
      this.notification.error(new Notification('Failed to get Performance Hotspot data. Try again later'));
    });
  }

  getIdleDevicesData() {
    this.idleDevicesRow.devicesRow = []
    this.idleDistributionRows.distributionRow = []
    this.idleDistributionRows.chartData = null;

    this.spinner.start(this.idleDevicesRow.loader);
    this.spinner.start(this.idleDistributionRows.loader);
    this.svc.getIdleDevicesData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop(this.idleDevicesRow.loader);
      this.spinner.stop(this.idleDistributionRows.loader);

      this.idleDevicesRow = this.svc.convertToDeviceIdleViewData(res)
      this.idleDistributionRows = this.svc.convertToIdleDevicesDistributionViewData(res.idleDurationDistribution)
      this.idleDistributionRows.chartData = this.svc.convertToIdleDurationDistributionChartData(this.idleDistributionRows.distributionRow)
    }, () => {
      this.idleDistributionRows.chartData = null;
      this.idleDevicesRow.devicesRow = []
      this.idleDistributionRows.distributionRow = []
      this.spinner.stop(this.idleDistributionRows.loader);
      this.spinner.stop(this.idleDevicesRow.loader);
      this.notification.error(new Notification('Failed to get Idle Devices data. Try again later'));
    });
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
          this.diskLatencyWidgetData.chartData = this.svc.convertTodiskLatencyChartData(res);
          this.cpuReadyWidgetData.chartData = this.svc.convertToCpuReadyChartData(res);
          this.swapBalloonMemoryWidgetData.chartData = this.svc.convertToSwapBalloonMemoryChartData(res);
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
        this.notification.error(new Notification('Failed to get Disk Latency data. Try again later'));
      });
  }

  //Alert and Events

  getAlertAndEventsWidgetData() {
    let filterFormOutput = this.filterForm.getRawValue();
    this.getRecentAlerts(filterFormOutput);
  }

  getRecentAlerts(filterFormOutput: any) {
    this.criticalAlerts.alertList = null;
    this.spinner.start(this.alertSummaryMetrics.loader)
    this.spinner.start(this.criticalAlerts.loader)
    this.svc.getRecentAlerts(filterFormOutput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryView(res);
      this.criticalAlerts = this.svc.convertToTopCriticalAlertsViewData(res.recentAlerts);
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    }, () => {
      this.criticalAlerts.alertList = null;
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    });
  }

  getOrphanedDeviceData() {
    this.spinner.start(this.orphanedDeviceListViewData.loader);
    this.orphanedDeviceListViewData.orphanList = null;
    this.svc.getOrphanedDeviceData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.orphanedDeviceListViewData = this.svc.convertToOrphanedDeviceListView(res);
          this.orphanedByCategory = res.orphanedByCategory
          this.orphanedDeviceWidgetViewData.chartData = this.svc.convertToOrphanedByCategoryChartData(res.orphanedByCategory)
        }
        this.spinner.stop(this.orphanedDeviceListViewData.loader);

      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.orphanedDeviceListViewData.loader);
        this.orphanedDeviceListViewData.orphanList = null;
        this.notification.error(new Notification('Failed to get Orphaned Device data. Try again later'));
      });
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  refreshData() {
    this.loadWidgets();
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }


  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  trackByValue(index: number, option: labelAndValueType) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

}
