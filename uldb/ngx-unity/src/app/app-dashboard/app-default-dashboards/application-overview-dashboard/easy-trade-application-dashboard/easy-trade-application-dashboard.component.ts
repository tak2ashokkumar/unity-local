import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertViewData, CategoriesViewedWidgetViewData, CheckoutAbondanRateWidgetViewData, ComponentsOverviewViewData, ConversionRateWidgetViewData, DatabaseOverviewViewData, EasyTradeApplicationDashboardService, HostOverviewViewData, NewCustomersWidgetViewData, NewVsReturningCustomersWidgetViewData, OrderPlcedWidgetViewData, ProcessOverviewViewData, ReturningCustomerCategoryWidgetViewData, ServiceViewData, SessionToOrderFunnelWidgetViewData, TrafficSourceOverGivenPeriodWidgetViewData, UniqueVisitorsWidgetViewData } from './easy-trade-application-dashboard.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'easy-trade-application-dashboard',
  templateUrl: './easy-trade-application-dashboard.component.html',
  styleUrls: ['./easy-trade-application-dashboard.component.scss'],
  providers: [EasyTradeApplicationDashboardService]
})
export class EasyTradeApplicationDashboardComponent implements OnInit, OnDestroy, OnChanges {
  @Input("appId") appId: number;
  private ngUnsubscribe = new Subject();
  @Input("reload") reload: boolean;
  @Input("filters") filters: DurationDropdownType;

  sessionToOrderFunnelWidgetViewData: SessionToOrderFunnelWidgetViewData = new SessionToOrderFunnelWidgetViewData();
  returningCustomerCategoryWidgetViewData: ReturningCustomerCategoryWidgetViewData = new ReturningCustomerCategoryWidgetViewData();
  newCustomersWidgetViewData: NewCustomersWidgetViewData = new NewCustomersWidgetViewData();

  checkoutAbondanRateWidgetViewData: CheckoutAbondanRateWidgetViewData = new CheckoutAbondanRateWidgetViewData();
  conversionRateWidgetViewData: ConversionRateWidgetViewData = new ConversionRateWidgetViewData();
  orderPlcedWidgetViewData: OrderPlcedWidgetViewData = new OrderPlcedWidgetViewData();
  newVsReturningCustomersWidgetViewData: NewVsReturningCustomersWidgetViewData = new NewVsReturningCustomersWidgetViewData();

  categoriesViewedWidgetViewData: CategoriesViewedWidgetViewData = new CategoriesViewedWidgetViewData();
  trafficSourceOverGivenPeriodWidgetViewData: TrafficSourceOverGivenPeriodWidgetViewData = new TrafficSourceOverGivenPeriodWidgetViewData();
  uniqueVisitorsWidgetViewData: UniqueVisitorsWidgetViewData = new UniqueVisitorsWidgetViewData();

  applicationResponseTimeViewData: any;
  errorRateViewData: any;
  paymentFailureViewData: any;
  paymentGatewayLatencyViewData: any;

  revenueByCategoryViewData: any;
  revenueByTrafficSourceViewData: any;
  operationalAnomalyDetectionViewData: any;

  currentCriteriaForServicesOverview: SearchCriteria;
  serviceViewData: ServiceViewData[] = [];
  countForServicesOverview: number;
  avgThroughput: string;
  avgLatency: string;
  avgAvailablility: string;
  serviceLoader: string = 'service-overview';

  public pcFastData: PCFastData[] = [];
  cloudList: any[] = [];
  platformMapping = PlatFormMapping;
  showDoughnutChart: boolean = true;
  componentsOverviewWidgetData: ComponentsOverviewViewData = new ComponentsOverviewViewData();
  processOverviewWidgetData: ProcessOverviewViewData = new ProcessOverviewViewData();
  databaseOverviewWidgetData: DatabaseOverviewViewData = new DatabaseOverviewViewData();
  hostOverviewWidgetData: HostOverviewViewData = new HostOverviewViewData();

  currentCriteria: SearchCriteria;
  alertsViewData: AlertViewData[] = [];
  count: number;
  alertsLoader: string = 'alertsLoader';

  constructor(private svc: EasyTradeApplicationDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.currentCriteriaForServicesOverview = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    // this.appId = 10;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.filters?.currentValue) {
      this.filters = changes?.filters?.currentValue;
    }

    if (changes?.appId?.currentValue) {
      this.appId = changes?.appId?.currentValue;
    }

    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getSessionToOrderFunnel();
        this.getSessionsByDateRange();
        this.getNewUsers();

        this.getOrderSuccessRate();
        this.getConversionRate();
        this.getOrderPlced();
        this.getActiveUsersVsEvents();

        this.getSumOfOrdersSubmittedData();
        this.getSumOfOrdersExecutedByRegion();
        this.getUniqueVisitors();

        this.getApplicationResponseTimeGraph();
        this.getErrorRateGraph();
        this.getPayemntFailureRateGraph();
        this.getPaymentGatewayLatencyGraph();

        this.getRevenueByMarketingSourceData();
        this.getRevenueByRegionData();
        this.getKPIsByUSDChartData();

        this.getServiceOverviewData();
        this.getComponentsOverview();
        this.getProcessOverview();
        this.getDataandMessegingOverview();
        this.getHostOverview();
        this.getPhysicalAndCloudInfrastructure();

        this.getCriticalAlertsData();
      }, 0);
    }

  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCriticalAlertsData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCriticalAlertsData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCriticalAlertsData();
  }

  // filters for services-overview widget
  onSortedForServicesOverview($event: SearchCriteria) {
    this.currentCriteriaForServicesOverview.sortColumn = $event.sortColumn;
    this.currentCriteriaForServicesOverview.sortDirection = $event.sortDirection;
    this.currentCriteriaForServicesOverview.pageNo = 1;
    this.getServiceOverviewData();
  }

  onSearchedForServicesOverview(event: string) {
    this.currentCriteriaForServicesOverview.searchValue = event;
    this.currentCriteriaForServicesOverview.pageNo = 1;
    this.getServiceOverviewData();
  }

  pageChangeForServicesOverview(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteriaForServicesOverview.pageNo = pageNo;
    this.getServiceOverviewData();
  }

  pageSizeChangeForServicesOverview(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteriaForServicesOverview.pageSize = pageSize;
    this.currentCriteriaForServicesOverview.pageNo = 1;
    this.getServiceOverviewData();
  }

  // for customer-behaviour-insights widget
  getSessionToOrderFunnel() {
    this.spinner.start(this.sessionToOrderFunnelWidgetViewData.loader);
    this.sessionToOrderFunnelWidgetViewData.chartData = null;
    this.svc.getSessionToOrderFunnel(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.sessionToOrderFunnelWidgetViewData.chartData = this.svc.convertToSessionToOrderFunnelChartData(res);
      this.spinner.stop(this.sessionToOrderFunnelWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.sessionToOrderFunnelWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Session To Order Funnel data. Try again later'));
    })
  }

  getSessionsByDateRange() {
    this.spinner.start(this.returningCustomerCategoryWidgetViewData.loader);
    this.returningCustomerCategoryWidgetViewData.chartData = null;
    this.svc.getSessionsByDateRange(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.returningCustomerCategoryWidgetViewData.chartData = this.svc.convertToSessionsByDateRangeChartData(res);
      this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Returning Customer Category data. Try again later'));
    })
  }

  getNewUsers() {
    this.spinner.start(this.newCustomersWidgetViewData.loader);
    this.newCustomersWidgetViewData.chartData = null;
    this.svc.getNewUsers(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.newCustomersWidgetViewData.chartData = this.svc.convertToNewUsersChartData(res);
      this.spinner.stop(this.newCustomersWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.newCustomersWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get New Customers data. Try again later'));
    })
  }

  // for conversion-sales-funnal widget
  getOrderSuccessRate() {
    this.spinner.start(this.checkoutAbondanRateWidgetViewData.loader);
    this.checkoutAbondanRateWidgetViewData.chartData = null;
    this.svc.getOrderSuccessRate(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.checkoutAbondanRateWidgetViewData.chartData = this.svc.convertToOrderSuccessRateChartData(res);
      this.spinner.stop(this.checkoutAbondanRateWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.checkoutAbondanRateWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Checkout Abondan Rate data. Try again later'));
    })
  }

  getConversionRate() {
    this.spinner.start(this.conversionRateWidgetViewData.loader);
    this.conversionRateWidgetViewData.chartData = null;
    this.svc.getConversionRate(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.conversionRateWidgetViewData.chartData = this.svc.convertToConversionRateChartData(res);
      this.spinner.stop(this.conversionRateWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.conversionRateWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Conversion Rate data. Try again later'));
    })
  }

  getOrderPlced() {
    this.spinner.start(this.orderPlcedWidgetViewData.loader);
    this.orderPlcedWidgetViewData.chartData = null;
    this.svc.getOrderPlced(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orderPlcedWidgetViewData.chartData = this.svc.convertToOrderPlcedChartData(res);
      this.spinner.stop(this.orderPlcedWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.orderPlcedWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Order Placed data. Try again later'));
    })
  }

  getActiveUsersVsEvents() {
    this.spinner.start(this.newVsReturningCustomersWidgetViewData.loader);
    this.newVsReturningCustomersWidgetViewData.chartData = null;
    this.svc.getActiveUsersVsEvents(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.newVsReturningCustomersWidgetViewData.chartData = this.svc.convertToActiveUsersVsEventsChartdata(res);
      this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get New Vs Returning Customers data. Try again later'));
    })
  }

  // for traffic-engagement-kpis widget
  getSumOfOrdersSubmittedData() {
    this.spinner.start(this.categoriesViewedWidgetViewData.loader);
    this.categoriesViewedWidgetViewData.chartData = null;
    this.svc.getSumOfOrdersSubmittedData(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.categoriesViewedWidgetViewData.chartData = this.svc.convertToSumOfOrdersSubmittedChartData(res);
      this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Categories Viewed data. Try again later'));
    })
  }

  getSumOfOrdersExecutedByRegion() {
    this.spinner.start(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
    this.trafficSourceOverGivenPeriodWidgetViewData.chartData = null;
    this.svc.getSumOfOrdersExecutedByRegion(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trafficSourceOverGivenPeriodWidgetViewData.chartData = this.svc.convertToTSumOfOrdersExecutedByRegionChartData(res);
      this.spinner.stop(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Traffic Source data. Try again later'));
    })
  }

  getUniqueVisitors() {
    this.spinner.start(this.uniqueVisitorsWidgetViewData.loader);
    this.uniqueVisitorsWidgetViewData.chartData = null;
    this.svc.getUniqueVisitors(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.uniqueVisitorsWidgetViewData.chartData = this.svc.convertToUniqueVisitorsChartData(res);
      this.spinner.stop(this.uniqueVisitorsWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.uniqueVisitorsWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Unique Visitors data. Try again later'));
    })
  }

  // for performance-reliability-detection widget
  getApplicationResponseTimeGraph() {
    this.spinner.start('ApplicationResponseTimeLoader');
    this.applicationResponseTimeViewData = null;
    this.svc.getApplicationResponseTimeChartData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applicationResponseTimeViewData = this.svc.convertApplicationResponseTimeChartData(res);
      this.spinner.stop('ApplicationResponseTimeLoader');
    }, err => {
      this.spinner.stop('ApplicationResponseTimeLoader');
      this.notification.error(new Notification('Failed to get application response time data'));
    });
  }

  getErrorRateGraph() {
    this.spinner.start('ErrorRateLoader');
    this.errorRateViewData = null;
    this.svc.getErrorRateData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.errorRateViewData = this.svc.convertErrorRateChartData(res);
      this.spinner.stop('ErrorRateLoader');
    }, err => {
      this.spinner.stop('ErrorRateLoader');
      this.notification.error(new Notification('Failed to get error rate data'));
    });
  }

  getPayemntFailureRateGraph() {
    this.spinner.start('PyamentFailureRateLoader');
    this.paymentFailureViewData = null;
    this.svc.getPaymentFailureData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.paymentFailureViewData = this.svc.convertPyamentFailureChartData(res);
      this.spinner.stop('PyamentFailureRateLoader');
    }, err => {
      this.spinner.stop('PyamentFailureRateLoader');
      this.notification.error(new Notification('Failed to get payemnt failure rate data'));
    });
  }

  getPaymentGatewayLatencyGraph() {
    this.spinner.start('PaymentGatewayLatencyLoader');
    this.paymentGatewayLatencyViewData = null;
    this.svc.getPayemntGatewayLatencyData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.paymentGatewayLatencyViewData = this.svc.convertPayemntGatewayLatencyChartData(res);
      this.spinner.stop('PaymentGatewayLatencyLoader');
    }, err => {
      this.spinner.stop('PaymentGatewayLatencyLoader');
      this.notification.error(new Notification('Failed to get payment gateway latency data'));
    });
  }

  // for revenue-customer-value widget
  getRevenueByMarketingSourceData() {
    this.spinner.start('RevenueByCategoryLoader');
    this.revenueByCategoryViewData = null;
    this.svc.getRevenueByMarketingSourceData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.revenueByCategoryViewData = this.svc.convertRevenueByMarketingSourceChartData(res);
      this.spinner.stop('RevenueByCategoryLoader');
    }, err => {
      this.spinner.stop('RevenueByCategoryLoader');
      this.notification.error(new Notification('Failed to get revenue by category data'));
    });
  }

  getRevenueByRegionData() {
    this.spinner.start('RevenueByTrafficSourceLoader');
    this.revenueByTrafficSourceViewData = null;
    this.svc.getRevenueByRegionData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.revenueByTrafficSourceViewData = this.svc.convertRevenueByRegionChartData(res);
      this.spinner.stop('RevenueByTrafficSourceLoader');
    }, err => {
      this.spinner.stop('RevenueByTrafficSourceLoader');
      this.notification.error(new Notification('Failed to get revenue by traffic source data'));
    });
  }

  getKPIsByUSDChartData() {
    this.spinner.start('OperationalAnomalyDetectionLoader');
    this.operationalAnomalyDetectionViewData = null;
    this.svc.getKPIsByUSDChartData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operationalAnomalyDetectionViewData = this.svc.convertToKPIsByUSDChartData(res);
      this.spinner.stop('OperationalAnomalyDetectionLoader');
    }, err => {
      this.spinner.stop('OperationalAnomalyDetectionLoader');
      this.notification.error(new Notification('Failed to get revenue by traffic source data'));
    });
  }

  // for services overview widget
  getServiceOverviewData() {
    this.spinner.start(this.serviceLoader);
    this.svc.getServiceOverviewData(this.currentCriteriaForServicesOverview, this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.serviceViewData = this.svc.convertToServiceViewData(res.results);
      this.avgThroughput = res.avg_throughput;
      this.avgLatency = res.avg_latency;
      this.avgAvailablility = res.avg_availability;
      this.spinner.stop(this.serviceLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.serviceLoader);
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
  }

  getComponentsOverview() {
    this.spinner.start(this.componentsOverviewWidgetData.healthLoader);
    this.spinner.start(this.componentsOverviewWidgetData.durationLoader);
    this.spinner.start(this.componentsOverviewWidgetData.responseTimeLoader);
    this.componentsOverviewWidgetData.healthChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'availability', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.healthChartData = this.svc.convertToComponentDoughnutChartViewData(res.data, this.filters, '', '', 'line');
      if (this.showDoughnut(res.data) == 0) {
        this.showDoughnutChart = false;
      }
      this.componentsOverviewWidgetData.healthAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
    //Response time
    this.componentsOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.responseTimeChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Duration', 'line');
      this.componentsOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.componentsOverviewWidgetData.durationChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'duration', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.durationChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Response Time', 'line');
      this.componentsOverviewWidgetData.durationAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getAverage(data: any[]) {
    const totalAvgObj = data.find(item => item.hasOwnProperty('total_avg'));
    if (totalAvgObj) {
      return (Math.round(totalAvgObj.total_avg * 10) / 10).toString();
    }
  }

  showDoughnut(apps: any[]) {
    const upCount = apps.find((item: any) => item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item.hasOwnProperty('unknown_count'))?.unknown_count || 0;

    // Calculate the total combined count
    const totalCount = upCount + downCount + unknownCount;
    return totalCount;
  }

  getProcessOverview() {
    this.spinner.start(this.processOverviewWidgetData.throughputLoader);
    this.spinner.start(this.processOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.processOverviewWidgetData.responseTimeLoader);
    this.processOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.filters, this.appId, 'throughput', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.throughputChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Throughput');
      this.processOverviewWidgetData.throughputAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
      this.notification.error(new Notification('Failed to get Throughput data. Try again later'));
    });
    //Response time
    this.processOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Response Time');
      this.processOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.processOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Availablility');
      this.processOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getDataandMessegingOverview() {
    this.spinner.start(this.databaseOverviewWidgetData.latencyLoader);
    this.spinner.start(this.databaseOverviewWidgetData.responseTimeLoader);
    this.spinner.start(this.databaseOverviewWidgetData.availabilityLoader);
    this.databaseOverviewWidgetData.latencyChartData = null;
    this.svc.getLatencyData(this.filters, this.appId, 'total_queries', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.latencyChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Throughput');
      this.databaseOverviewWidgetData.latencyAvg = this.getAverage(res.data);
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
      this.notification.error(new Notification('Failed to get latency data. Try again later'));
    });
    //Response time
    this.databaseOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Response Time');
      this.databaseOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.databaseOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Availablility');
      this.databaseOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getHostOverview() {
    this.spinner.start(this.hostOverviewWidgetData.cpuUtilizationLoader);
    this.spinner.start(this.hostOverviewWidgetData.memoryUsageLoader);
    this.spinner.start(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    this.spinner.start(this.hostOverviewWidgetData.systemLoadTimeLoader);
    this.hostOverviewWidgetData.cpuUtilizationChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'cpu_utilization').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.cpuUtilizationChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'CPU Utilization', 'Time', '');
      this.hostOverviewWidgetData.cpuUtilizationAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
      this.notification.error(new Notification('Failed to get CPU Utilization data. Try again later'));
    });
    //Memory Usage
    this.hostOverviewWidgetData.memoryUsageChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'mem_usage').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.memoryUsageChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Memory Usage', 'Time', '');
      this.hostOverviewWidgetData.memoryUsageAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
      this.notification.error(new Notification('Failed to get Memory Usage data. Try again later'));
    });
    //Disk I/O
    this.hostOverviewWidgetData.diskInputOutputTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'disk_read_write').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.diskInputOutputTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Disk I/O', 'Time', '');
      this.hostOverviewWidgetData.diskInputOutputTimeAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
      this.notification.error(new Notification('Failed to get Disk I/O data. Try again later'));
    });
    //Sys Load Time
    this.hostOverviewWidgetData.systemLoadTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'sys_load').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.systemLoadTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'System Load', 'Time', '');
      this.hostOverviewWidgetData.systemLoadTimeAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
      this.notification.error(new Notification('Failed to get System Load data. Try again later'));
    });
  }

  getPhysicalAndCloudInfrastructure() {
    this.spinner.start('privateCloudWidgetLoader');
    this.pcFastData = [];
    this.svc.getCloudList(this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.pcFastData = this.svc.convertToPCFastData(res);
      this.spinner.stop('privateCloudWidgetLoader');
    }, (err: HttpErrorResponse) => {
      this.pcFastData = [];
      this.spinner.stop('privateCloudWidgetLoader');
      this.notification.error(new Notification('Failed to get Physical and Cloud Infrastructure data. Try again later'));
    });
  }

  isClusterWidget(platfromType: string) {
    switch (platfromType) {
      case 'VMware':
      case 'United Private Cloud vCenter': return true;
      default: return false;
    }
  }

  // for critical-alert-widget
  getCriticalAlertsData() {
    this.spinner.start(this.alertsLoader);
    this.svc.getAlertsData(this.currentCriteria, this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.alertsViewData = this.svc.convertToCriticalAlertsData(res.results);
      this.spinner.stop(this.alertsLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.alertsLoader);
      this.notification.error(new Notification('Failed to get Critical Alerts data. Try again later'));
    });
  }

}
