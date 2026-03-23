import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabData } from 'src/app/shared/tabdata';
import { BudgetAnomalyViewData, BudgetDetailsByDeviceViewData, CostAlertsViewData, CostAnomalyViewData, CostByApplicationsViewData, CostByCostCenterWidgetViewData, CostByDeviceTypeWidgetViewData, CostIntelligenceService, CostPerVMViewData, CostUtilizationByMetricsViewData, DateDropdownOptionsData, DeviceCountWidgetViewData, IdleVMSWidgetViewData, MetricDistributionsViewData, MetricRateFrequencyViewData, MetricsAndRateViewData, TotalCostWidgetViewData } from './cost-intelligence.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'cost-intelligence',
  templateUrl: './cost-intelligence.component.html',
  styleUrls: ['./cost-intelligence.component.scss'],
  providers: [CostIntelligenceService]
})
export class CostIntelligenceComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
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
  costUtilizationByMetricsViewData = new CostUtilizationByMetricsViewData();

  constructor(private svc: CostIntelligenceService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) { }

  ngOnInit(): void {
    this.dateDropdownOptions = this.svc.getDateDropdownOptions();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.loadData();
  }

  onFilterChange(formData: any) {
    this.dateDropdownOptions.formData = formData;
    this.dateDropdownOptions.frequency = this.dateDropdownOptions.options.find(opt => opt.value == formData.period).valueAsFrequency;
    console.log('onFilterChange dateDropdownOptions', this.dateDropdownOptions);
    this.loadData();
  }

  loadData() {
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
      // this.getCostUtilizationByMetrics();
      // this.getMetricAndRateData();
      // this.getMetricDistributionData();
      // this.getRateFrequencyData();
      // this.getCostAlertsData();
      this.getDeviceDetailsData();
      this.getCostAnomalyData();
    }, 0);
  }

  getTotalCost() {
    this.spinner.start('totalCostWidgetLoader');
    this.svc.getTotalCost(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.totalCostWidgetViewData = this.svc.convertToTotalCostViewData(res);
      this.spinner.stop('totalCostWidgetLoader');
    }, err => {
      this.spinner.stop('totalCostWidgetLoader');
    })
  }

  getDeviceCount() {
    this.spinner.start('deviceCountWidgetLoader');
    this.svc.getDeviceCount(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCountWidgetViewData = this.svc.convertToDeviceCountViewData(res);
      this.spinner.stop('deviceCountWidgetLoader');
    }, err => {
      this.spinner.stop('deviceCountWidgetLoader');
    })
  }

  getIdleVms() {
    this.spinner.start('idleVmsSummaryLoader');
    this.svc.getIdleVms(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.idleVmsWidgetViewData = this.svc.convertToIdleVmsViewData(res);
      this.spinner.stop('idleVmsSummaryLoader');
    }, err => {
      this.spinner.stop('idleVmsSummaryLoader');
    })
  }

  getCostByDeviceType() {
    this.spinner.start('costByDeviceTypeLoader');
    this.costByDeviceTypeWidgetViewData = [];
    this.svc.getCostByDeviceType(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByDeviceTypeWidgetViewData = this.svc.convertToCostByDeviceTypeViewData(res.device_type_costs);
      this.spinner.stop('costByDeviceTypeLoader');
    }, err => {
      this.spinner.stop('costByDeviceTypeLoader');
    })
  }

  getCostByCostCenter() {
    this.spinner.start('costByCostCenterLoader');
    this.costByCostCenterWidgetViewData = [];
    this.svc.getCostByCostCenter(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByCostCenterWidgetViewData = this.svc.convertToCostByCostCenterViewData(res);
      this.spinner.stop('costByCostCenterLoader');
    }, err => {
      this.spinner.stop('costByCostCenterLoader');
    })
  }

  getCostForTop5VMs() {
    this.spinner.start('costPerVMLoader');
    this.costPerVMViewData = [];
    this.svc.getCostForTop5VMs(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costPerVMViewData = this.svc.convertToCostPerVMViewData(res);
      this.spinner.stop('costPerVMLoader');
    }, err => {
      this.spinner.stop('costPerVMLoader');
    })
  }

  getCostByBusinessUnit() {
    this.spinner.start('costByBUChartDataLoader');
    this.costByBUChartData = null;
    this.svc.getCostByBusinessUnit(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByBUChartData = this.svc.convertToCostByBUChartData(res);
      this.spinner.stop('costByBUChartDataLoader');
    }, err => {
      this.spinner.stop('costByBUChartDataLoader');
    })
  }

  getTopApplicationsByCost() {
    this.spinner.start('costByApplicationLoader');
    this.costByApplicationViewData = [];
    this.svc.getTopApplicationsByCost(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByApplicationViewData = this.svc.convertToCostByApplicationViewData(res);
      this.spinner.stop('costByApplicationLoader');
    }, err => {
      this.spinner.stop('costByApplicationLoader');
    })
  }

  getTopOSByCost() {
    this.spinner.start('costByOSChartDataLoader');
    this.costByOSChartData = null;
    this.svc.getTopOSByCost(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.costByOSChartData = this.svc.convertToCostByOSChartData(res);
      }
      this.spinner.stop('costByOSChartDataLoader');
    }, err => {
      this.spinner.stop('costByOSChartDataLoader');
    })
  }

  operationalUtilizationByServiceChartData: UnityChartDetails;
  getOperationalCostUtilizationByService() {
    this.spinner.start('operationalCostUtilizationByServiceLoader');
    this.svc.getOperationalCostUtilizationByService(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operationalUtilizationByServiceChartData = this.svc.convertToOperationalCostUtilizationChartData(res);
      this.spinner.stop('operationalCostUtilizationByServiceLoader');
    }, err => {
      this.spinner.stop('operationalCostUtilizationByServiceLoader');
    })
  }

  fixedUtilizationByServiceChartData: UnityChartDetails;
  getFixedCostUtilizationByService() {
    this.spinner.start('fixedCostUtilizationByServiceLoader');
    this.svc.getFixedCostUtilizationByService(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.fixedUtilizationByServiceChartData = this.svc.convertToFixedCostUtilizationChartData(res);
      this.spinner.stop('fixedCostUtilizationByServiceLoader');
    }, err => {
      this.spinner.stop('fixedCostUtilizationByServiceLoader');
    })
  }

  budgetAnomalyViewData: BudgetAnomalyViewData[] = [];
  getBudgetAnamolies() {
    this.spinner.start('budgetAnomalyLoader');
    this.svc.getBudgetAnamolies(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.budgetAnomalyViewData = this.svc.convertToBudgetAnomaliesViewData(res);
      this.spinner.stop('budgetAnomalyLoader');
    }, err => {
      this.spinner.stop('budgetAnomalyLoader');
    })
  }

  onUtilizationTrendFilterChange(formData: any) {
    console.log('onUtilizationTrendFilterChange', formData);
    let frequency = this.costUtilizationByMetricsViewData.dropdownOptions.find(opt => opt.value == formData.period).valueAsFrequency;
    console.log('onUtilizationTrendFilterChange', frequency);
    this.getCostUtilizationByMetrics(frequency);
  }

  getCostUtilizationByMetrics(frequency: string) {
    this.spinner.start(this.costUtilizationByMetricsViewData.loader);
    this.costUtilizationByMetricsViewData.chartData = null;
    this.svc.getCostUtilizationByMetrics(frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costUtilizationByMetricsViewData.cpu = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.cpu);
      this.costUtilizationByMetricsViewData.memory = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.memory);
      this.costUtilizationByMetricsViewData.storage = this.svc.convertToCostUtilizationByMetricsViewData(res.metrics.storage);
      this.costUtilizationByMetricsViewData.chartData = this.svc.convertToCostUtilizationByMetricsChartData(res);
      this.spinner.stop(this.costUtilizationByMetricsViewData.loader);
    }, err => {
      this.spinner.stop(this.costUtilizationByMetricsViewData.loader);
    })
  }

  costAlerts: CostAlertsViewData[] = [];
  getCostAlertsData() {
    this.spinner.start('costAlertsLoader');
    this.svc.getCostAlertsData(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costAlerts = this.svc.convertToCostAlertsViewData(res);
      this.spinner.stop('costAlertsLoader');
    }, err => {
      this.spinner.stop('costAlertsLoader');
    })
  }

  budgetDetailsByDevice: BudgetDetailsByDeviceViewData[] = [];
  getDeviceDetailsData() {
    this.spinner.start('budgetDetailsByDeviceLoader');
    this.svc.getDeviceDetailsData(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.budgetDetailsByDevice = this.svc.convertToBudgetDetailsByDeviceViewData(res);
      this.spinner.stop('budgetDetailsByDeviceLoader');
    }, err => {
      this.spinner.stop('budgetDetailsByDeviceLoader');
    })
  }

  costAnomalyViewData: CostAnomalyViewData[] = [];
  getCostAnomalyData() {
    this.spinner.start('costAnomalyLoader');
    this.svc.getCostAnomalyData(this.dateDropdownOptions.frequency).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costAnomalyViewData = this.svc.convertToCostAnomalyViewData(res);
      this.spinner.stop('costAnomalyLoader');
    }, err => {
      this.spinner.stop('costAnomalyLoader');
    })
  }

  goToDetails(view: CostByDeviceTypeWidgetViewData) {
    if (!view.deviceType) {
      return;
    }
    this.router.navigate(['details', view.deviceType], { relativeTo: this.route });
  }

}

let tabItems = [
  {
    name: 'InfraSpend 360',
    url: '/cost-analysis/cost-intelligence',
  },
  // {
  //   name: 'Unified Cost Intelligence Hub' ,
  //   url: '/cost-analysis/cost-intelligence/summary',
  // },
  // {
  //   name: 'Functional Cost Insights' ,
  //   url: '/cost-analysis/cost-intelligence/functional-cost-insights',
  // },
  // {
  //   name: 'Dynamic Cost Insights' ,
  //   url: '/cost-analysis/cost-intelligence/dynamic-cost-insights',
  // },
  // {
  //   name: 'Operational Spend Insights' ,
  //   url: '/cost-analysis/cost-intelligence/operational-spend-insights',
  // },
  // {
  //   name: 'Fixed Spend Insights' ,
  //   url: '/cost-analysis/cost-intelligence/fixed-spend-insights',
  // },
  // {
  //   name: 'Availablility Cost Insights' ,
  //   url: '/cost-analysis/cost-intelligence/availability-cost-insights',
  // }
]
