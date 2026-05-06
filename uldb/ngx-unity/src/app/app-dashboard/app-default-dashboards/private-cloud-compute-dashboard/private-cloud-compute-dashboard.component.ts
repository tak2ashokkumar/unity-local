import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AlertSummaryViewData, AutoRemediationExecSummaryWidgetData, CapacityAndGrowthInsightsWidgetData, ClusterCapacityUtilTrendWidgetData, CpuReadyWidgetData, DiskLatencyWidgetData, ExecutiveSummaryViewData, ExecutiveSummaryWidgetData, InfrastructureHealthWidgetData, PerformanceHotspotWidgetData, PrivateCloudComputeDashboardService, RiskOptimizationViewData, RiskOptimizationWidgetData, SwapBalloonMemoryWidgetData, TicketPriorityOptionsWidgetData, TicketsItemViewData, TicketStatusOptionsWidgetData, Top10ClustersByVMsWidgetData, TopAutoRemediationActionWidgetData, TopCriticalAlertsViewData } from './private-cloud-compute-dashboard.service';
import { labelAndValueType, PrivateCloudAlertSideCard, PrivateCloudAlertTrendLegendItem, PrivateCloudUtilization, PrivateCloudUtilizationRow, ScopeDataType, TopHeaderDataType } from './private-cloud-compute-dashboard.type';

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

  diskLatencyWidgetData: DiskLatencyWidgetData = new DiskLatencyWidgetData();
  cpuReadyWidgetData: CpuReadyWidgetData = new CpuReadyWidgetData();
  swapBalloonMemoryWidgetData: SwapBalloonMemoryWidgetData = new SwapBalloonMemoryWidgetData();

  riskOptimizationViewData: RiskOptimizationViewData = new RiskOptimizationViewData();
  riskOptimizationWidgetData: RiskOptimizationWidgetData = new RiskOptimizationWidgetData();
  autoRemediationExecSummaryWidgetData: AutoRemediationExecSummaryWidgetData = new AutoRemediationExecSummaryWidgetData();
  topAutoRemediationActionWidgetData: TopAutoRemediationActionWidgetData = new TopAutoRemediationActionWidgetData()


  alertSummaryMetrics: AlertSummaryViewData = new AlertSummaryViewData();
  criticalAlerts: TopCriticalAlertsViewData = new TopCriticalAlertsViewData()
  alertTrendLegend: any;
  alertTrendPolarOptions: EChartsOption = {};
  alertTrendStackOptions: EChartsOption = {};
  alertSideCards: PrivateCloudAlertSideCard[] = [];
  ticketPriorityOptionsWidgetData: TicketPriorityOptionsWidgetData = new TicketPriorityOptionsWidgetData();
  ticketStatusOptions: TicketStatusOptionsWidgetData = new TicketStatusOptionsWidgetData();
  tickets: TicketsItemViewData = new TicketsItemViewData();
  totalTickets = 0;

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    utilization: 'publicCloudUtilizationLoader',
    latencyWorkloads: 'publicCloudLatencyWorkloadsLoader',
    errorRateWorkloads: 'publicCloudErrorRateWorkloadsLoader',
    databasePerformance: 'publicCloudDatabasePerformanceLoader',
    databaseLatencyBadges: 'publicCloudDatabaseLatencyBadgesLoader',
    alertSummary: 'publicCloudAlertSummaryLoader',
    criticalAlerts: 'publicCloudCriticalAlertsLoader',
    alertTrend: 'publicCloudAlertTrendLoader',
    alertSideCards: 'publicCloudAlertSideCardsLoader',
    ITSMTicketList: 'ITSMTicketLoader',
    performanceHotspot: 'performanceHotspotLoader'
  };

  constructor(private svc: PrivateCloudComputeDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
  }

  ngOnInit(): void {
    this.getHeaderInfo();
    this.getFilterDropdowns();
    this.buildFilterForm();
    this.loadWidgets();
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
        // console.log("filters res,", res)
        if (res?.filters) {
          this.accountOptions = res.filters.accounts ? res.filters.accounts : [];
          this.datacenterOptions = res.filters.datacenters ? res.filters.datacenters : [];
          this.environmentOptions = res.filters.environments ? res.filters.environments : [];
          this.platformOptions = res.filters.platforms ? res.filters.platforms : [];
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get filter dropdown values data. Try again later'));
      });
  }

  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.platformOptions, this.datacenterOptions, this.environmentOptions, this.accountOptions);
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
    this.getExecutiveSummaryWidgetData();
    this.getCapacityGrowthWidgetData();
    this.getTop10ClustersByVMsWidgetData();
    this.getClusterCapacityUtilTrendWidgetData();
    this.getInfrastructureHealthWidgetData();
    this.getPerformanceHotspotWidgetData();
    this.getPerformanceWorkloadWidgetData();
    this.getAlertAndEventsWidgetData();
    this.getRiskOptimizationWidgetData();
    this.getAutoRemediationSummaryWidgetData();
  }

  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.platformOptions = [];
    this.environmentOptions = [];
    this.accountOptions = [];
  }

  //---------Executive Summary / Cloud Inventory------

  getExecutiveSummaryWidgetData() {
    this.spinner.start(this.executiveSummaryWidgetData.cloudTypeLoader);
    this.spinner.start(this.executiveSummaryWidgetData.powerActivityLoader);
    this.spinner.start(this.executiveSummaryWidgetData.vmCountByOSTypeLoader)
    this.executiveSummaryWidgetData.cloudTypeChartData = null;
    this.executiveSummaryWidgetData.powerActivityChartData = null;
    this.executiveSummaryWidgetData.vmCountByOSTypeChartData = null;
    this.executiveSummaryWidgetData.environmentAndCriticalityChartData = null;
    this.executiveSummaryWidgetData.alertSeverityViewData = null;
    this.svc.getExecutiveSummaryWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.executiveSummaryViewData = this.svc.convertExecutiveSummaryViewData(res.executiveSummary);
          this.executiveSummaryWidgetData.cloudTypeChartData = this.svc.convertToCloudTypeChartData(res.cloudTypeDistribution);
          this.executiveSummaryWidgetData.powerActivityChartData = this.svc.convertToPowerActivityChartData(res.powerActivityState);
          this.executiveSummaryWidgetData.vmCountByOSTypeChartData = this.svc.convertToVmCountByOSTypeChartData(res.vmCountByOSType);
          this.executiveSummaryWidgetData.environmentAndCriticalityChartData = this.svc.convertToEnvironmentAndCriticalityChartData(res.environmentCriticality);
          this.executiveSummaryWidgetData.alertSeverityViewData = this.svc.convertToAlertSeverityViewData(res.alertsSeverity);
        }
        this.spinner.stop(this.executiveSummaryWidgetData.cloudTypeLoader);
        this.spinner.stop(this.executiveSummaryWidgetData.powerActivityLoader);
        this.spinner.stop(this.executiveSummaryWidgetData.vmCountByOSTypeLoader)
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.executiveSummaryWidgetData.cloudTypeLoader);
        this.spinner.stop(this.executiveSummaryWidgetData.powerActivityLoader);
        this.spinner.stop(this.executiveSummaryWidgetData.vmCountByOSTypeLoader)
        this.notification.error(new Notification('Failed to get Executive Summary Data data. Try again later'));
      });
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
        this.notification.error(new Notification('Failed to get Capacity and Growth data. Try again later'));
      });
  }

  //-----Top 10 Clusters By VM Count-----------

  getTop10ClustersByVMsWidgetData() {
    this.spinner.start(this.top10ClustersByVMsWidgetData.loader);
    this.top10ClustersByVMsWidgetData.chartData = null;
    this.svc.getTop10ClustersByVMsWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.top10ClustersByVMsWidgetData.chartData = this.svc.convertToTop10ClustersByVMsChartData(res);
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get top10 Clusters By VMs data. Try again later'));
      });
  }

  //-----Cluster Capacity Utilization Trend-----------

  getClusterCapacityUtilTrendWidgetData() {
    this.spinner.start(this.clusterCapacityUtilTrendWidgetData.loader);
    this.clusterCapacityUtilTrendWidgetData.chartData = null;
    this.svc.getClusterCapacityUtilTrendWidgetData(this.filterForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.clusterCapacityUtilTrendWidgetData.chartData = this.svc.convertToClusterCapacityUtilTrendChartData(res);
        }
      }, (_err: HttpErrorResponse) => {
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
      this.utilizationRows = this.svc.convertToUtilizationViewData(res);
    }, () => {
      this.utilizationRows.utilRow = [];
      this.notification.error(new Notification('Failed to get Performance Hotspot data. Try again later'));
    });
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
        this.notification.error(new Notification('Failed to get Disk Latency data. Try again later'));
      });
  }

  //Alert and Events

  getAlertAndEventsWidgetData() {
    let filterFormOutput = this.filterForm.getRawValue();
    this.getAlertEvents(filterFormOutput);
    this.getAlertTrends(filterFormOutput);

  }

  getAlertEvents(filterFormOutput: any) {
    this.criticalAlerts.alertList = null;
    // this.alertSummaryMetrics = null;
    this.spinner.start(this.alertSummaryMetrics.loader)
    this.spinner.start(this.criticalAlerts.loader)
    this.svc.getAlertEvents(filterFormOutput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryView(res.alertSummary);
      this.criticalAlerts = this.svc.convertToTopCriticalAlertsViewData(res.topCriticalAlerts);
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    }, () => {
      // this.alertSummaryMetrics = null;
      this.criticalAlerts.alertList = null;
      this.spinner.stop(this.loaderNames.alertSummary)
      this.spinner.stop(this.alertSummaryMetrics.loader)
      this.spinner.stop(this.criticalAlerts.loader)
    });
  }


  getAlertTrends(filterFormOutput: any) {
    this.alertSideCards = [];
    this.alertTrendPolarOptions = {};
    this.alertTrendStackOptions = {};
    this.spinner.start(this.loaderNames.criticalAlerts)
    this.spinner.start(this.loaderNames.alertTrend)
    this.spinner.start(this.loaderNames.alertSideCards)
    this.svc.getAlertTrends(filterFormOutput).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.alertTrendLegend = res;
        this.alertSideCards = this.svc.convertToAlertSideCardsViewData(res);
        this.alertTrendStackOptions = this.svc.convertToAlertTrendStackOptions(res);
        this.alertTrendPolarOptions = this.svc.convertToAlertTrendPolarOptions(res);
        this.spinner.stop(this.loaderNames.criticalAlerts)
        this.spinner.stop(this.loaderNames.alertTrend)
        this.spinner.stop(this.loaderNames.alertSideCards)
      }, () => {
        this.alertSideCards = [];
        this.alertTrendPolarOptions = {};
        this.alertTrendStackOptions = {};
        this.spinner.stop(this.loaderNames.criticalAlerts)
        this.spinner.stop(this.loaderNames.alertTrend)
        this.spinner.stop(this.loaderNames.alertSideCards)
      });
  }

  getITSMTicket(filterFormOutput: any) {
    this.spinner.start(this.ticketPriorityOptionsWidgetData.loader);
    this.spinner.start(this.ticketStatusOptions.loader);
    this.spinner.start(this.tickets.loader);
    this.ticketPriorityOptionsWidgetData.chartData = null;
    this.ticketStatusOptions.chartData = null;
    this.tickets = null;
    this.svc.getITSMTicket(filterFormOutput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketPriorityOptionsWidgetData.chartData = this.svc.convertToTicketPriorityOptions(res.ticketsByPriority);
      this.ticketStatusOptions.chartData = this.svc.convertToTicketStatusOptions(res.ticketsByStatus);
      this.tickets = this.svc.convertToTicketViewData(res.tickets);
      this.spinner.stop(this.ticketPriorityOptionsWidgetData.loader);
      this.spinner.stop(this.ticketStatusOptions.loader);
      this.spinner.start(this.tickets.loader);
    }, () => {
      this.tickets = null;
      this.ticketPriorityOptionsWidgetData.chartData = null;
      this.ticketStatusOptions.chartData = null;
      this.spinner.stop(this.ticketPriorityOptionsWidgetData.loader);
      this.spinner.stop(this.ticketStatusOptions.loader);
      this.spinner.stop(this.tickets.loader);

    });
  }

  // Risk Optimization
  getRiskOptimizationWidgetData() {
    this.spinner.start(this.riskOptimizationWidgetData.loader);
    this.riskOptimizationWidgetData.chartData = null;
    this.riskOptimizationViewData = null;
    this.svc.getRiskOptimizationWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        console.log(res)
        this.riskOptimizationWidgetData.chartData = this.svc.convertRiskOptimizationWidgetData(res.capacityRiskAlerts);
        this.riskOptimizationViewData = this.svc.convertRiskOptimizationSummaryData(res);
      }
      this.spinner.stop(this.riskOptimizationWidgetData.loader);
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.riskOptimizationWidgetData.loader);
      this.notification.error(new Notification('Failed to get Risk Optimization widget data. Try again later'));
    });
  }

  // Auto Remediation Summary
  getAutoRemediationSummaryWidgetData() {
    this.spinner.start(this.autoRemediationExecSummaryWidgetData.loader);
    this.spinner.start(this.topAutoRemediationActionWidgetData.loader);
    this.autoRemediationExecSummaryWidgetData.chartData = null;
    this.topAutoRemediationActionWidgetData.chartData = null;
    this.svc.getAutoRemediationSummaryWidgetData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.autoRemediationExecSummaryWidgetData.chartData = this.svc.convertToAutoRemediationExecSummaryChartData(res.executionSummary);
        this.topAutoRemediationActionWidgetData.chartData = this.svc.convertToTopAutoRemediationActionChartData(res.topActions);
      }
      this.spinner.stop(this.autoRemediationExecSummaryWidgetData.loader);
      this.spinner.stop(this.topAutoRemediationActionWidgetData.loader);
    }, (_err: HttpErrorResponse) => {
      this.spinner.stop(this.autoRemediationExecSummaryWidgetData.loader);
      this.spinner.stop(this.topAutoRemediationActionWidgetData.loader);
      this.notification.error(new Notification('Failed to get Auto Remediation Execution data. Try again later'));
    });
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
