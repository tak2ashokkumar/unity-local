import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CustomerBehaviorInsightsKpisWidgetService, NewCustomersWidgetViewData, ReturningCustomerCategoryWidgetViewData, SessionToOrderFunnelWidgetViewData } from './customer-behavior-insights-kpis-widget.service';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';

@Component({
  selector: 'customer-behavior-insights-kpis-widget',
  templateUrl: './customer-behavior-insights-kpis-widget.component.html',
  styleUrls: ['./customer-behavior-insights-kpis-widget.component.scss'],
  providers: [CustomerBehaviorInsightsKpisWidgetService]
})
export class CustomerBehaviorInsightsKpisWidgetComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input('filters') filters: DurationDropdownType;
  @Input('appId') appId: number;

  sessionToOrderFunnelWidgetViewData: SessionToOrderFunnelWidgetViewData = new SessionToOrderFunnelWidgetViewData();
  returningCustomerCategoryWidgetViewData: ReturningCustomerCategoryWidgetViewData = new ReturningCustomerCategoryWidgetViewData();
  newCustomersWidgetViewData: NewCustomersWidgetViewData = new NewCustomersWidgetViewData();

  constructor(private svc: CustomerBehaviorInsightsKpisWidgetService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getSessionToOrderFunnel();
        this.getReturningCustomerCategory();
        this.getNewCustomers();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

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

  getReturningCustomerCategory() {
    this.spinner.start(this.returningCustomerCategoryWidgetViewData.loader);
    this.returningCustomerCategoryWidgetViewData.chartData = null;
    this.svc.getReturningCustomerCategory(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.returningCustomerCategoryWidgetViewData.chartData = this.svc.convertToReturningCustomerCategoryChartData(res);
      this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.returningCustomerCategoryWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Returning Customer Category data. Try again later'));
    })
  }

  getNewCustomers() {
    this.spinner.start(this.newCustomersWidgetViewData.loader);
    this.newCustomersWidgetViewData.chartData = null;
    this.svc.getNewCustomers(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.newCustomersWidgetViewData.chartData = this.svc.convertToNewCustomersChartData(res);
      this.spinner.stop(this.newCustomersWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.newCustomersWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get New Customers data. Try again later'));
    })
  }
}
