import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AstronomyShopApplicationDashboardService,
  AlertViewData,
  CategoriesViewedWidgetViewData,
  CheckoutAbondanRateWidgetViewData,
  ComponentsOverviewViewData,
  ConversionRateWidgetViewData,
  DatabaseOverviewViewData,
  HostOverviewViewData,
  NewCustomersWidgetViewData,
  NewVsReturningCustomersWidgetViewData,
  OrderPlcedWidgetViewData,
  ProcessOverviewViewData,
  ReturningCustomerCategoryWidgetViewData,
  ServiceViewData,
  SessionToOrderFunnelWidgetViewData,
  TrafficSourceOverGivenPeriodWidgetViewData,
  UniqueVisitorsWidgetViewData
} from './astronomy-shop-application-dashboard.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';

/**
 * Monolithic dashboard component for the Astronomy Shop application.
 * Consolidates all APM observability sections (customer behavior, traffic, performance,
 * revenue, infrastructure, alerts) into a single component driven by `appId` and `filters` inputs.
 */
@Component({
  selector: 'astronomy-shop-application-dashboard',
  templateUrl: './astronomy-shop-application-dashboard.component.html',
  styleUrls: ['./astronomy-shop-application-dashboard.component.scss'],
  providers: [AstronomyShopApplicationDashboardService]
})
export class AstronomyShopApplicationDashboardComponent implements OnInit, OnChanges, OnDestroy {

  @Input('appId') appId: number;
  @Input('reload') reload: boolean;
  @Input('filters') filters: DurationDropdownType;

  private ngUnsubscribe = new Subject();

  // ── Customer Behavior Insights ─────────────────────────────────────────────

  sessionToOrderFunnelWidgetViewData: SessionToOrderFunnelWidgetViewData = new SessionToOrderFunnelWidgetViewData();
  returningCustomerCategoryWidgetViewData: ReturningCustomerCategoryWidgetViewData = new ReturningCustomerCategoryWidgetViewData();
  newCustomersWidgetViewData: NewCustomersWidgetViewData = new NewCustomersWidgetViewData();

  // ── Conversion & Sales Funnel ──────────────────────────────────────────────

  checkoutAbondanRateWidgetViewData: CheckoutAbondanRateWidgetViewData = new CheckoutAbondanRateWidgetViewData();
  conversionRateWidgetViewData: ConversionRateWidgetViewData = new ConversionRateWidgetViewData();
  orderPlcedWidgetViewData: OrderPlcedWidgetViewData = new OrderPlcedWidgetViewData();
  newVsReturningCustomersWidgetViewData: NewVsReturningCustomersWidgetViewData = new NewVsReturningCustomersWidgetViewData();

  // ── Traffic & Engagement ───────────────────────────────────────────────────

  categoriesViewedWidgetViewData: CategoriesViewedWidgetViewData = new CategoriesViewedWidgetViewData();
  trafficSourceOverGivenPeriodWidgetViewData: TrafficSourceOverGivenPeriodWidgetViewData = new TrafficSourceOverGivenPeriodWidgetViewData();
  uniqueVisitorsWidgetViewData: UniqueVisitorsWidgetViewData = new UniqueVisitorsWidgetViewData();

  // ── Performance & Reliability ──────────────────────────────────────────────

  applicationResponseTimeViewData: any;
  errorRateViewData: any;
  paymentFailureViewData: any;
  paymentGatewayLatencyViewData: any;

  // ── Revenue & Customer Value ───────────────────────────────────────────────

  revenueByCategoryViewData: any;
  revenueByTrafficSourceViewData: any;

  // ── Services Overview ──────────────────────────────────────────────────────

  currentCriteriaForServicesOverview: SearchCriteria;
  serviceViewData: ServiceViewData[] = [];
  countForServicesOverview: number;
  avgThroughput: string;
  avgLatency: string;
  avgAvailablility: string;
  serviceLoader: string = 'service-overview';

  // ── Components / Process / DB / Host Overview ──────────────────────────────

  public pcFastData: PCFastData[] = [];
  platformMapping = PlatFormMapping;
  /** Hidden when all health counts are zero — avoids rendering an empty doughnut. */
  showDoughnutChart: boolean = true;
  componentsOverviewWidgetData: ComponentsOverviewViewData = new ComponentsOverviewViewData();
  processOverviewWidgetData: ProcessOverviewViewData = new ProcessOverviewViewData();
  databaseOverviewWidgetData: DatabaseOverviewViewData = new DatabaseOverviewViewData();
  hostOverviewWidgetData: HostOverviewViewData = new HostOverviewViewData();

  // ── Critical Alerts ────────────────────────────────────────────────────────

  currentCriteria: SearchCriteria;
  alertsViewData: AlertViewData[] = [];
  count: number;
  alertsLoader: string = 'alertsLoader';

  constructor(
    private svc: AstronomyShopApplicationDashboardService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteriaForServicesOverview = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit(): void { }

  /** Triggers a full data refresh whenever `appId` or `filters` changes. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.filters?.currentValue) {
      this.filters = changes.filters.currentValue;
    }
    if (changes?.appId?.currentValue) {
      this.appId = changes.appId.currentValue;
    }
    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getSessionToOrderFunnel();
        this.getReturningCustomerCategory();
        this.getNewCustomers();

        this.getCheckoutAbondanRate();
        this.getConversionRate();
        this.getOrderPlced();
        this.getNewVsReturningCustomers();

        this.getCategoriesViewedWidgetViewData();
        this.getTrafficSourceOverGivenPeriod();
        this.getUniqueVisitors();

        this.getApplicationResponseTimeGraph();
        this.getErrorRateGraph();
        this.getPayemntFailureRateGraph();
        this.getPaymentGatewayLatencyGraph();

        this.getRevenueByCategoryGraph();
        this.getRevenueByTrafficSourceGraph();

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

  /** Cancels all active HTTP subscriptions on destroy. */
  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  /** Returns the `total_avg` from a metric data array rounded to 1 decimal, or '0' if absent. */
  getAverage(data: any[]): string {
    if (!data || !data.length) { return '0'; }
    const totalAvgObj = data.find(item => item && item.hasOwnProperty('total_avg'));
    if (totalAvgObj) {
      return (Math.round(totalAvgObj.total_avg * 10) / 10).toString();
    }
    return '0';
  }

  /** Returns the sum of up/down/unknown counts; 0 means no data to show in the doughnut. */
  showDoughnut(apps: any[]): number {
    if (!apps || !apps.length) { return 0; }
    const upCount = apps.find((item: any) => item && item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item && item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item && item.hasOwnProperty('unknown_count'))?.unknown_count || 0;
    return upCount + downCount + unknownCount;
  }

  // ── Pagination: Critical Alerts ───────────────────────────────────────────

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

  // ── Pagination: Services Overview ─────────────────────────────────────────

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

  // ── Customer Behavior Insights ────────────────────────────────────────────

  getSessionToOrderFunnel() {
    this.spinner.start(this.sessionToOrderFunnelWidgetViewData.loader);
    this.sessionToOrderFunnelWidgetViewData.chartData = null;
    this.svc.getSessionToOrderFunnel(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.sessionToOrderFunnelWidgetViewData.chartData = this.svc.convertToSessionToOrderFunnelChartData(res);
        }
        this.spinner.stop(this.sessionToOrderFunnelWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.sessionToOrderFunnelWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Session To Order Funnel data. Try again later'));
      });
  }

  getReturningCustomerCategory() {
    this.spinner.start(this.returningCustomerCategoryWidgetViewData.loader);
    this.returningCustomerCategoryWidgetViewData.chartData = null;
    this.svc.getReturningCustomerCategory(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.returningCustomerCategoryWidgetViewData.chartData = this.svc.convertToReturningCustomerCategoryChartData(res);
        }
        this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Returning Customer Category data. Try again later'));
      });
  }

  getNewCustomers() {
    this.spinner.start(this.newCustomersWidgetViewData.loader);
    this.newCustomersWidgetViewData.chartData = null;
    this.svc.getNewCustomers(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.newCustomersWidgetViewData.chartData = this.svc.convertToNewCustomersChartData(res);
        }
        this.spinner.stop(this.newCustomersWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.newCustomersWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get New Customers data. Try again later'));
      });
  }

  // ── Conversion & Sales Funnel ─────────────────────────────────────────────

  getCheckoutAbondanRate() {
    this.spinner.start(this.checkoutAbondanRateWidgetViewData.loader);
    this.checkoutAbondanRateWidgetViewData.chartData = null;
    this.svc.getCheckoutAbondanRate(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.checkoutAbondanRateWidgetViewData.chartData = this.svc.convertToCheckoutAbondanRateChartData(res);
        }
        this.spinner.stop(this.checkoutAbondanRateWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.checkoutAbondanRateWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Checkout Abondan Rate data. Try again later'));
      });
  }

  getConversionRate() {
    this.spinner.start(this.conversionRateWidgetViewData.loader);
    this.conversionRateWidgetViewData.chartData = null;
    this.svc.getConversionRate(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.conversionRateWidgetViewData.chartData = this.svc.convertToConversionRateChartData(res);
        }
        this.spinner.stop(this.conversionRateWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.conversionRateWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Conversion Rate data. Try again later'));
      });
  }

  getOrderPlced() {
    this.spinner.start(this.orderPlcedWidgetViewData.loader);
    this.orderPlcedWidgetViewData.chartData = null;
    this.svc.getOrderPlced(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.orderPlcedWidgetViewData.chartData = this.svc.convertToOrderPlcedChartData(res);
        }
        this.spinner.stop(this.orderPlcedWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.orderPlcedWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Order Placed data. Try again later'));
      });
  }

  getNewVsReturningCustomers() {
    this.spinner.start(this.newVsReturningCustomersWidgetViewData.loader);
    this.newVsReturningCustomersWidgetViewData.chartData = null;
    this.svc.getNewVsReturningCustomers(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.newVsReturningCustomersWidgetViewData.chartData = this.svc.convertToNewVsReturningCustomersChartdata(res);
        }
        this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get New Vs Returning Customers data. Try again later'));
      });
  }

  // ── Traffic & Engagement ──────────────────────────────────────────────────

  getCategoriesViewedWidgetViewData() {
    this.spinner.start(this.categoriesViewedWidgetViewData.loader);
    this.categoriesViewedWidgetViewData.chartData = null;
    this.svc.getCategoriesViewedWidgetViewData(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.categoriesViewedWidgetViewData.chartData = this.svc.convertToCategoriesViewedWidgetViewDataChartData(res);
        }
        this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Categories Viewed data. Try again later'));
      });
  }

  getTrafficSourceOverGivenPeriod() {
    this.spinner.start(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
    this.trafficSourceOverGivenPeriodWidgetViewData.chartData = null;
    this.svc.getTrafficSourceOverGivenPeriod(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.trafficSourceOverGivenPeriodWidgetViewData.chartData = this.svc.convertToTrafficSourceOverGivenPeriodChartData(res);
        }
        this.spinner.stop(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Traffic Source data. Try again later'));
      });
  }

  getUniqueVisitors() {
    this.spinner.start(this.uniqueVisitorsWidgetViewData.loader);
    this.uniqueVisitorsWidgetViewData.chartData = null;
    this.svc.getUniqueVisitors(this.appId, this.filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.uniqueVisitorsWidgetViewData.chartData = this.svc.convertToUniqueVisitorsChartData(res);
        }
        this.spinner.stop(this.uniqueVisitorsWidgetViewData.loader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.uniqueVisitorsWidgetViewData.loader);
        this.notification.error(new Notification('Failed to get Unique Visitors data. Try again later'));
      });
  }

  // ── Performance & Reliability ─────────────────────────────────────────────

  getApplicationResponseTimeGraph() {
    this.spinner.start('ApplicationResponseTimeLoader');
    this.applicationResponseTimeViewData = null;
    this.svc.getApplicationResponseTimeChartData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.applicationResponseTimeViewData = this.svc.convertApplicationResponseTimeChartData(res);
        }
        this.spinner.stop('ApplicationResponseTimeLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('ApplicationResponseTimeLoader');
        this.notification.error(new Notification('Failed to get application response time data'));
      });
  }

  getErrorRateGraph() {
    this.spinner.start('ErrorRateLoader');
    this.errorRateViewData = null;
    this.svc.getErrorRateData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.errorRateViewData = this.svc.convertErrorRateChartData(res);
        }
        this.spinner.stop('ErrorRateLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('ErrorRateLoader');
        this.notification.error(new Notification('Failed to get error rate data'));
      });
  }

  getPayemntFailureRateGraph() {
    this.spinner.start('PyamentFailureRateLoader');
    this.paymentFailureViewData = null;
    this.svc.getPaymentFailureData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.paymentFailureViewData = this.svc.convertPyamentFailureChartData(res);
        }
        this.spinner.stop('PyamentFailureRateLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('PyamentFailureRateLoader');
        this.notification.error(new Notification('Failed to get payment failure rate data'));
      });
  }

  getPaymentGatewayLatencyGraph() {
    this.spinner.start('PaymentGatewayLatencyLoader');
    this.paymentGatewayLatencyViewData = null;
    this.svc.getPayemntGatewayLatencyData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.paymentGatewayLatencyViewData = this.svc.convertPayemntGatewayLatencyChartData(res);
        }
        this.spinner.stop('PaymentGatewayLatencyLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('PaymentGatewayLatencyLoader');
        this.notification.error(new Notification('Failed to get payment gateway latency data'));
      });
  }

  // ── Revenue & Customer Value ──────────────────────────────────────────────

  getRevenueByCategoryGraph() {
    this.spinner.start('RevenueByCategoryLoader');
    this.revenueByCategoryViewData = null;
    this.svc.getRevenueByCategoryChartData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.revenueByCategoryViewData = this.svc.convertRevenueByCategoryChartData(res);
        }
        this.spinner.stop('RevenueByCategoryLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('RevenueByCategoryLoader');
        this.notification.error(new Notification('Failed to get revenue by category data'));
      });
  }

  getRevenueByTrafficSourceGraph() {
    this.spinner.start('RevenueByTrafficSourceLoader');
    this.revenueByTrafficSourceViewData = null;
    this.svc.getRevenueByTrafficSourceChartData(this.appId, this.filters?.from, this.filters?.to)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.revenueByTrafficSourceViewData = this.svc.convertRevenueByTrafficSourceChartData(res);
        }
        this.spinner.stop('RevenueByTrafficSourceLoader');
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop('RevenueByTrafficSourceLoader');
        this.notification.error(new Notification('Failed to get revenue by traffic source data'));
      });
  }

  // ── Services Overview ─────────────────────────────────────────────────────

  /** Fetches the paginated APM service list and populates the table with per-service KPIs. */
  getServiceOverviewData() {
    this.spinner.start(this.serviceLoader);
    this.svc.getServiceOverviewData(this.currentCriteriaForServicesOverview, this.appId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.countForServicesOverview = res.count || 0;
          this.serviceViewData = res.results ? this.svc.convertToServiceViewData(res.results) : [];
          this.avgThroughput = res.avg_throughput || '';
          this.avgLatency = res.avg_latency || '';
          this.avgAvailablility = res.avg_availability || '';
        } else {
          this.serviceViewData = [];
          this.countForServicesOverview = 0;
        }
        this.spinner.stop(this.serviceLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.serviceLoader);
        this.notification.error(new Notification('Failed to get Services Overview data. Try again later'));
      });
  }

  // ── Components Overview ───────────────────────────────────────────────────

  /** Fires 3 parallel calls for component availability, response time and duration. */
  getComponentsOverview() {
    this.spinner.start(this.componentsOverviewWidgetData.healthLoader);
    this.spinner.start(this.componentsOverviewWidgetData.durationLoader);
    this.spinner.start(this.componentsOverviewWidgetData.responseTimeLoader);

    this.componentsOverviewWidgetData.healthChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'availability', 'component')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.componentsOverviewWidgetData.healthChartData = this.svc.convertToComponentDoughnutChartViewData(res.data, this.filters, '', '', 'line');
          this.showDoughnutChart = this.showDoughnut(res.data) !== 0;
          this.componentsOverviewWidgetData.healthAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
        this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
      });

    this.componentsOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'component')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.componentsOverviewWidgetData.responseTimeChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Duration', 'line');
          this.componentsOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
        this.notification.error(new Notification('Failed to get Component Response Time data. Try again later'));
      });

    this.componentsOverviewWidgetData.durationChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'duration', 'component')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.componentsOverviewWidgetData.durationChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Response Time', 'line');
          this.componentsOverviewWidgetData.durationAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
        this.notification.error(new Notification('Failed to get Component Duration data. Try again later'));
      });
  }

  // ── Process Overview ──────────────────────────────────────────────────────

  /** Fires 3 parallel calls for process throughput, response time and availability. */
  getProcessOverview() {
    this.spinner.start(this.processOverviewWidgetData.throughputLoader);
    this.spinner.start(this.processOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.processOverviewWidgetData.responseTimeLoader);

    this.processOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.filters, this.appId, 'throughput', 'process')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.processOverviewWidgetData.throughputChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Throughput');
          this.processOverviewWidgetData.throughputAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
        this.notification.error(new Notification('Failed to get Process Throughput data. Try again later'));
      });

    this.processOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'process')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.processOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Response Time');
          this.processOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
        this.notification.error(new Notification('Failed to get Process Response Time data. Try again later'));
      });

    this.processOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'process')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.processOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Availablility');
          this.processOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
        this.notification.error(new Notification('Failed to get Process Availability data. Try again later'));
      });
  }

  // ── Data & Messaging Overview ─────────────────────────────────────────────

  /** Fires 3 parallel calls for database/messaging query throughput, response time and availability. */
  getDataandMessegingOverview() {
    this.spinner.start(this.databaseOverviewWidgetData.latencyLoader);
    this.spinner.start(this.databaseOverviewWidgetData.responseTimeLoader);
    this.spinner.start(this.databaseOverviewWidgetData.availabilityLoader);

    this.databaseOverviewWidgetData.latencyChartData = null;
    this.svc.getLatencyData(this.filters, this.appId, 'total_queries', 'database')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.databaseOverviewWidgetData.latencyChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Throughput');
          this.databaseOverviewWidgetData.latencyAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
        this.notification.error(new Notification('Failed to get Data & Messaging Latency data. Try again later'));
      });

    this.databaseOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'database')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.databaseOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Response Time');
          this.databaseOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
        this.notification.error(new Notification('Failed to get Data & Messaging Response Time data. Try again later'));
      });

    this.databaseOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'database')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.data) {
          this.databaseOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Availablility');
          this.databaseOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
        }
        this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
        this.notification.error(new Notification('Failed to get Data & Messaging Availability data. Try again later'));
      });
  }

  // ── Host Overview ─────────────────────────────────────────────────────────

  /** Fires 4 parallel calls for host CPU, memory, disk I/O and system load metrics. */
  getHostOverview() {
    this.spinner.start(this.hostOverviewWidgetData.cpuUtilizationLoader);
    this.spinner.start(this.hostOverviewWidgetData.memoryUsageLoader);
    this.spinner.start(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    this.spinner.start(this.hostOverviewWidgetData.systemLoadTimeLoader);

    this.hostOverviewWidgetData.cpuUtilizationChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'cpu_utilization')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.devices) {
          this.hostOverviewWidgetData.cpuUtilizationChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'CPU Utilization', 'Time', '');
          this.hostOverviewWidgetData.cpuUtilizationAvg = (Math.round((res.total_avg || 0) * 10) / 10).toString();
        }
        this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
        this.notification.error(new Notification('Failed to get CPU Utilization data. Try again later'));
      });

    this.hostOverviewWidgetData.memoryUsageChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'mem_usage')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.devices) {
          this.hostOverviewWidgetData.memoryUsageChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Memory Usage', 'Time', '');
          this.hostOverviewWidgetData.memoryUsageAvg = (Math.round((res.total_avg || 0) * 10) / 10).toString();
        }
        this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
        this.notification.error(new Notification('Failed to get Memory Usage data. Try again later'));
      });

    this.hostOverviewWidgetData.diskInputOutputTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'disk_read_write')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.devices) {
          this.hostOverviewWidgetData.diskInputOutputTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Disk I/O', 'Time', '');
          this.hostOverviewWidgetData.diskInputOutputTimeAvg = (Math.round((res.total_avg || 0) * 10) / 10).toString();
        }
        this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
        this.notification.error(new Notification('Failed to get Disk I/O data. Try again later'));
      });

    this.hostOverviewWidgetData.systemLoadTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'sys_load')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.devices) {
          this.hostOverviewWidgetData.systemLoadTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'System Load', 'Time', '');
          this.hostOverviewWidgetData.systemLoadTimeAvg = (Math.round((res.total_avg || 0) * 10) / 10).toString();
        }
        this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
        this.notification.error(new Notification('Failed to get System Load data. Try again later'));
      });
  }

  // ── Physical & Cloud Infrastructure ──────────────────────────────────────

  /** Fetches linked cloud environments and converts them into PCFastData rows. */
  getPhysicalAndCloudInfrastructure() {
    this.spinner.start('privateCloudWidgetLoader');
    this.pcFastData = [];
    this.svc.getCloudList(this.appId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.pcFastData = (res && res.length) ? this.svc.convertToPCFastData(res) : [];
        this.spinner.stop('privateCloudWidgetLoader');
      }, (_err: HttpErrorResponse) => {
        this.pcFastData = [];
        this.spinner.stop('privateCloudWidgetLoader');
        this.notification.error(new Notification('Failed to get Physical and Cloud Infrastructure data. Try again later'));
      });
  }

  // ── Critical Alerts ───────────────────────────────────────────────────────

  /** Fetches the paginated top critical business events and populates the alerts table. */
  getCriticalAlertsData() {
    this.spinner.start(this.alertsLoader);
    this.svc.getAlertsData(this.currentCriteria, this.appId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.count = res.count || 0;
          this.alertsViewData = res.results ? this.svc.convertToCriticalAlertsData(res.results) : [];
        } else {
          this.alertsViewData = [];
          this.count = 0;
        }
        this.spinner.stop(this.alertsLoader);
      }, (_err: HttpErrorResponse) => {
        this.spinner.stop(this.alertsLoader);
        this.notification.error(new Notification('Failed to get Critical Alerts data. Try again later'));
      });
  }
}
