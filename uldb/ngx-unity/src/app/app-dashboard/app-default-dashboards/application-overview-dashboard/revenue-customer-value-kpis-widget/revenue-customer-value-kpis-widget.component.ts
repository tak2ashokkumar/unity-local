import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { RevenueCustomerValueKpisWidgetService } from './revenue-customer-value-kpis-widget.service';

@Component({
  selector: 'revenue-customer-value-kpis-widget',
  templateUrl: './revenue-customer-value-kpis-widget.component.html',
  styleUrls: ['./revenue-customer-value-kpis-widget.component.scss'],
  providers: [RevenueCustomerValueKpisWidgetService]
})
export class RevenueCustomerValueKpisWidgetComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject();
  // @Input("reload") reload: boolean;
  @Input("filters") filters: any;
  @Input("appId") appId: number;

  revenueByCategoryViewData: any;
  revenueByTrafficSourceViewData: any;
  operationalAnomalyDetectionViewData: any;

  constructor(private svc: RevenueCustomerValueKpisWidgetService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getRevenueByCategoryGraph();
        this.getRevenueByTrafficSourceGraph();
        this.getOperationalAnomalyDetectionGraph();
      }, 0)
    }
  }

  getRevenueByCategoryGraph() {
    this.spinner.start('RevenueByCategoryLoader');
    this.revenueByCategoryViewData = null;
    this.svc.getRevenueByCategoryChartData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.revenueByCategoryViewData = this.svc.convertRevenueByCategoryChartData(res);
      this.spinner.stop('RevenueByCategoryLoader');
    }, err => {
      this.spinner.stop('RevenueByCategoryLoader');
      this.notification.error(new Notification('Failed to get revenue by category data'));
    });
  }

  getRevenueByTrafficSourceGraph() {
    this.spinner.start('RevenueByTrafficSourceLoader');
    this.revenueByTrafficSourceViewData = null;
    this.svc.getRevenueByTrafficSourceChartData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.revenueByTrafficSourceViewData = this.svc.convertRevenueByTrafficSourceChartData(res);
      this.spinner.stop('RevenueByTrafficSourceLoader');
    }, err => {
      this.spinner.stop('RevenueByTrafficSourceLoader');
      this.notification.error(new Notification('Failed to get revenue by traffic source data'));
    });
  }

  getOperationalAnomalyDetectionGraph() {
    this.spinner.start('OperationalAnomalyDetectionLoader');
    this.operationalAnomalyDetectionViewData = null;
    this.svc.getOperationalAnomalyDetectionKPIsChartData(this.appId, this.filters?.from, this.filters?.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operationalAnomalyDetectionViewData = this.svc.convertOperationalAnomalyDetectionChartData(res);
      this.spinner.stop('OperationalAnomalyDetectionLoader');
    }, err => {
      this.spinner.stop('OperationalAnomalyDetectionLoader');
      this.notification.error(new Notification('Failed to get revenue by traffic source data'));
    });
  }

}
