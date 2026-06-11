import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TabData } from 'src/app/shared/tabdata';
import { BudgetAnomalyViewData, BudgetDetailsByDeviceViewData, CostAlertsViewData, CostAnomalyViewData, CostByApplicationsViewData, CostByCostCenterWidgetViewData, CostByDeviceTypeWidgetViewData, CostIntelligenceService, CostPerVMViewData, CostUtilizationByMetricsViewData, DateDropdownOptionsData, DeviceCountWidgetViewData, IdleVMSWidgetViewData, TotalCostWidgetViewData } from './cost-intelligence.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'cost-intelligence',
  templateUrl: './cost-intelligence.component.html',
  styleUrls: ['./cost-intelligence.component.scss'],
  providers: [CostIntelligenceService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostIntelligenceComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  tabItems: TabData[] = tabItems;
  dateDropdownOptions: DateDropdownOptionsData;

  totalCostWidgetViewData = new TotalCostWidgetViewData();
  deviceCountWidgetViewData = new DeviceCountWidgetViewData();
  idleVmsWidgetViewData = new IdleVMSWidgetViewData();
  costByDeviceTypeWidgetViewData: CostByDeviceTypeWidgetViewData[] = [];
  costByCostCenterWidgetViewData: CostByCostCenterWidgetViewData[] = [];
  costPerVMViewData: CostPerVMViewData[] = [];
  costByBUChartData: UnityChartDetails;
  costByApplicationViewData: CostByApplicationsViewData[] = [];
  costByOSChartData: UnityChartDetails;
  operationalUtilizationByServiceChartData: UnityChartDetails;
  fixedUtilizationByServiceChartData: UnityChartDetails;
  budgetAnomalyViewData: BudgetAnomalyViewData[] = [];
  costUtilizationByMetricsViewData = new CostUtilizationByMetricsViewData();
  costAlerts: CostAlertsViewData[] = [];
  budgetDetailsByDevice: BudgetDetailsByDeviceViewData[] = [];
  costAnomalyViewData: CostAnomalyViewData[] = [];

  constructor(private svc: CostIntelligenceService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dateDropdownOptions = this.svc.getDateDropdownOptions();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(): void {
    this.loadData();
  }

  onFilterChange(formData: any): void {
    this.dateDropdownOptions.formData = formData;
    const selected = this.dateDropdownOptions.options.find(opt => opt.value === formData.period);
    this.dateDropdownOptions.frequency = selected?.valueAsFrequency;
    this.loadData();
  }

  loadData(): void {
    setTimeout(() => {
      this.getTotalCost();
      this.getDeviceCount();
      this.getIdleVms();
      this.getCostByDeviceType();
      this.getCostByCostCenter();
      this.getCostForTop5VMs();
      this.getCostByBusinessUnit();
      this.getTopApplicationsByCost();
      this.getTopOSByCost();
      this.getOperationalCostUtilizationByService();
      this.getFixedCostUtilizationByService();
      this.getBudgetAnamolies();
      this.costUtilizationByMetricsViewData.defaultSelected = this.dateDropdownOptions.formData.period;
      this.getDeviceDetailsData();
      this.getCostAnomalyData();
    }, 0);
  }

  getTotalCost(): void {
    this.spinnerSvc.start('totalCostWidgetLoader');
    this.svc.getTotalCost(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('totalCostWidgetLoader')))
      .subscribe(res => {
        this.totalCostWidgetViewData = this.svc.convertToTotalCostViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load total cost data'));
      });
  }

  getDeviceCount(): void {
    this.spinnerSvc.start('deviceCountWidgetLoader');
    this.svc.getDeviceCount(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('deviceCountWidgetLoader')))
      .subscribe(res => {
        this.deviceCountWidgetViewData = this.svc.convertToDeviceCountViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load device count data'));
      });
  }

  getIdleVms(): void {
    this.spinnerSvc.start('idleVmsSummaryLoader');
    this.svc.getIdleVms(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('idleVmsSummaryLoader')))
      .subscribe(res => {
        this.idleVmsWidgetViewData = this.svc.convertToIdleVmsViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load idle VMs data'));
      });
  }

  getCostByDeviceType(): void {
    this.spinnerSvc.start('costByDeviceTypeLoader');
    this.costByDeviceTypeWidgetViewData = [];
    this.svc.getCostByDeviceType(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costByDeviceTypeLoader')))
      .subscribe(res => {
        this.costByDeviceTypeWidgetViewData = this.svc.convertToCostByDeviceTypeViewData(res.device_type_costs);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost by device type data'));
      });
  }

  getCostByCostCenter(): void {
    this.spinnerSvc.start('costByCostCenterLoader');
    this.costByCostCenterWidgetViewData = [];
    this.svc.getCostByCostCenter(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costByCostCenterLoader')))
      .subscribe(res => {
        this.costByCostCenterWidgetViewData = this.svc.convertToCostByCostCenterViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost by cost center data'));
      });
  }

  getCostForTop5VMs(): void {
    this.spinnerSvc.start('costPerVMLoader');
    this.costPerVMViewData = [];
    this.svc.getCostForTop5VMs(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costPerVMLoader')))
      .subscribe(res => {
        this.costPerVMViewData = this.svc.convertToCostPerVMViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost per VM data'));
      });
  }

  getCostByBusinessUnit(): void {
    this.spinnerSvc.start('costByBUChartDataLoader');
    this.costByBUChartData = null;
    this.svc.getCostByBusinessUnit(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costByBUChartDataLoader')))
      .subscribe(res => {
        this.costByBUChartData = this.svc.convertToCostByBUChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost by business unit data'));
      });
  }

  getTopApplicationsByCost(): void {
    this.spinnerSvc.start('costByApplicationLoader');
    this.costByApplicationViewData = [];
    this.svc.getTopApplicationsByCost(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costByApplicationLoader')))
      .subscribe(res => {
        this.costByApplicationViewData = this.svc.convertToCostByApplicationViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost by application data'));
      });
  }

  getTopOSByCost(): void {
    this.spinnerSvc.start('costByOSChartDataLoader');
    this.costByOSChartData = null;
    this.svc.getTopOSByCost(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costByOSChartDataLoader')))
      .subscribe(res => {
        if (res.length) {
          this.costByOSChartData = this.svc.convertToCostByOSChartData(res);
        }
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost by OS data'));
      });
  }

  getOperationalCostUtilizationByService(): void {
    this.spinnerSvc.start('operationalCostUtilizationByServiceLoader');
    this.svc.getOperationalCostUtilizationByService(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('operationalCostUtilizationByServiceLoader')))
      .subscribe(res => {
        this.operationalUtilizationByServiceChartData = this.svc.convertToOperationalCostUtilizationChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load operational cost utilization data'));
      });
  }

  getFixedCostUtilizationByService(): void {
    this.spinnerSvc.start('fixedCostUtilizationByServiceLoader');
    this.svc.getFixedCostUtilizationByService(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('fixedCostUtilizationByServiceLoader')))
      .subscribe(res => {
        this.fixedUtilizationByServiceChartData = this.svc.convertToFixedCostUtilizationChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load fixed cost utilization data'));
      });
  }

  getBudgetAnamolies(): void {
    this.spinnerSvc.start('budgetAnomalyLoader');
    this.svc.getBudgetAnamolies(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('budgetAnomalyLoader')))
      .subscribe(res => {
        this.budgetAnomalyViewData = this.svc.convertToBudgetAnomaliesViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load budget anomalies'));
      });
  }

  onUtilizationTrendFilterChange(formData: any): void {
    const selected = this.costUtilizationByMetricsViewData.dropdownOptions.find(opt => opt.value === formData.period);
    this.getCostUtilizationByMetrics(selected?.valueAsFrequency);
  }

  getCostUtilizationByMetrics(frequency: string): void {
    this.spinnerSvc.start(this.costUtilizationByMetricsViewData.loader);
    this.costUtilizationByMetricsViewData.chartData = null;
    this.svc.getCostUtilizationByMetrics(frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader(this.costUtilizationByMetricsViewData.loader)))
      .subscribe(res => {
        this.costUtilizationByMetricsViewData.cpu = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.cpu);
        this.costUtilizationByMetricsViewData.memory = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.memory);
        this.costUtilizationByMetricsViewData.storage = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.storage);
        this.costUtilizationByMetricsViewData.chartData = this.svc.convertToCostUtilizationByMetricsChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost utilization metrics'));
      });
  }

  getCostAlertsData(): void {
    this.spinnerSvc.start('costAlertsLoader');
    this.svc.getCostAlertsData(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costAlertsLoader')))
      .subscribe(res => {
        this.costAlerts = this.svc.convertToCostAlertsViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost alerts'));
      });
  }

  getDeviceDetailsData(): void {
    this.spinnerSvc.start('budgetDetailsByDeviceLoader');
    this.svc.getDeviceDetailsData(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('budgetDetailsByDeviceLoader')))
      .subscribe(res => {
        this.budgetDetailsByDevice = this.svc.convertToBudgetDetailsByDeviceViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load device details'));
      });
  }

  getCostAnomalyData(): void {
    this.spinnerSvc.start('costAnomalyLoader');
    this.svc.getCostAnomalyData(this.dateDropdownOptions.frequency)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('costAnomalyLoader')))
      .subscribe(res => {
        this.costAnomalyViewData = this.svc.convertToCostAnomalyViewData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to load cost anomaly data'));
      });
  }

  goToDetails(view: CostByDeviceTypeWidgetViewData): void {
    if (!view.deviceType) {
      return;
    }
    this.router.navigate(['details', view.deviceType], { relativeTo: this.route });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}

const tabItems: TabData[] = [
  {
    name: 'InfraSpend 360',
    url: '/cost-analysis/cost-intelligence',
  }
];
