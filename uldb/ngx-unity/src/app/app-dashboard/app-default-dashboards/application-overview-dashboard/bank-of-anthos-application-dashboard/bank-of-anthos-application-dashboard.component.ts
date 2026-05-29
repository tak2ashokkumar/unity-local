import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import {
  BankOfAnthosApplicationDashboardService,
  CheckoutAbondanRateWidgetViewData,
  ConversionRateWidgetViewData,
  NewCustomersWidgetViewData,
  ReturningCustomerCategoryWidgetViewData,
  SessionToOrderFunnelWidgetViewData
} from './bank-of-anthos-application-dashboard.service';

@Component({
  selector: 'bank-of-anthos-application-dashboard',
  templateUrl: './bank-of-anthos-application-dashboard.component.html',
  styleUrls: ['./bank-of-anthos-application-dashboard.component.scss'],
  providers: [BankOfAnthosApplicationDashboardService]
})
export class BankOfAnthosApplicationDashboardComponent implements OnInit, OnChanges, OnDestroy {

  @Input('appId') appId: number;
  @Input('reload') reload: boolean;
  @Input('filters') filters: DurationDropdownType;

  private ngUnsubscribe = new Subject();

  sessionToOrderFunnelWidgetViewData: SessionToOrderFunnelWidgetViewData = new SessionToOrderFunnelWidgetViewData();
  returningCustomerCategoryWidgetViewData: ReturningCustomerCategoryWidgetViewData = new ReturningCustomerCategoryWidgetViewData();
  newCustomersWidgetViewData: NewCustomersWidgetViewData = new NewCustomersWidgetViewData();
  checkoutAbondanRateWidgetViewData: CheckoutAbondanRateWidgetViewData = new CheckoutAbondanRateWidgetViewData();
  conversionRateWidgetViewData: ConversionRateWidgetViewData = new ConversionRateWidgetViewData();

  applicationResponseTimeViewData: any;
  errorRateViewData: any;
  paymentFailureViewData: any;
  paymentGatewayLatencyViewData: any;

  constructor(
    private svc: BankOfAnthosApplicationDashboardService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) { }

  ngOnInit(): void { }

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
        this.getApplicationResponseTimeGraph();
        this.getErrorRateGraph();
        this.getPayemntFailureRateGraph();
        this.getPaymentGatewayLatencyGraph();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

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
        this.notification.error(new Notification('Failed to get BoA Sessions data. Try again later'));
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
        this.notification.error(new Notification('Failed to get Error Analysis data. Try again later'));
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
        this.notification.error(new Notification('Failed to get Active Users data. Try again later'));
      });
  }

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
        this.notification.error(new Notification('Failed to get Success rate data. Try again later'));
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
        this.notification.error(new Notification('Failed to get Signup failure rate data. Try again later'));
      });
  }

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
        this.notification.error(new Notification('Failed to get application resp time data'));
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
        this.notification.error(new Notification('Failed to get services error rate data'));
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
        this.notification.error(new Notification('Failed to get application error rate data'));
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
        this.notification.error(new Notification('Failed to get application latency data'));
      });
  }
}
