import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CheckoutAbondanRateWidgetViewData, ConversionRateWidgetViewData, ConversionSalesFunnelKpisWidgetService, DurationDropdownType, NewVsReturningCustomersWidgetViewData, OrderPlcedWidgetViewData } from './conversion-sales-funnel-kpis-widget.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'conversion-sales-funnel-kpis-widget',
  templateUrl: './conversion-sales-funnel-kpis-widget.component.html',
  styleUrls: ['./conversion-sales-funnel-kpis-widget.component.scss'],
  providers: [ConversionSalesFunnelKpisWidgetService]
})
export class ConversionSalesFunnelKpisWidgetComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input('filters') filters: DurationDropdownType;
  @Input('appId') appId: number;

  checkoutAbondanRateWidgetViewData: CheckoutAbondanRateWidgetViewData = new CheckoutAbondanRateWidgetViewData();
  conversionRateWidgetViewData: ConversionRateWidgetViewData = new ConversionRateWidgetViewData();
  orderPlcedWidgetViewData: OrderPlcedWidgetViewData = new OrderPlcedWidgetViewData();
  newVsReturningCustomersWidgetViewData: NewVsReturningCustomersWidgetViewData = new NewVsReturningCustomersWidgetViewData();
  constructor(private svc: ConversionSalesFunnelKpisWidgetService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getCheckoutAbondanRate();
        this.getConversionRate();
        this.getOrderPlced();
        this.getNewVsReturningCustomers();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCheckoutAbondanRate() {
    this.spinner.start(this.checkoutAbondanRateWidgetViewData.loader);
    this.checkoutAbondanRateWidgetViewData.chartData = null;
    this.svc.getCheckoutAbondanRate(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.checkoutAbondanRateWidgetViewData.chartData = this.svc.convertToCheckoutAbondanRateChartData(res);
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

  getNewVsReturningCustomers() {
    this.spinner.start(this.newVsReturningCustomersWidgetViewData.loader);
    this.newVsReturningCustomersWidgetViewData.chartData = null;
    this.svc.getNewVsReturningCustomers(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.newVsReturningCustomersWidgetViewData.chartData = this.svc.convertToNewVsReturningCustomersChartdata(res);
      this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.newVsReturningCustomersWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get New Vs Returning Customers data. Try again later'));
    })
  }

}
