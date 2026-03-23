import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CategoriesViewedWidgetViewData, DurationDropdownType, TrafficEngagementKpisWidgetService, TrafficSourceOverGivenPeriodWidgetViewData, UniqueVisitorsWidgetViewData } from './traffic-engagement-kpis-widget.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'traffic-engagement-kpis-widget',
  templateUrl: './traffic-engagement-kpis-widget.component.html',
  styleUrls: ['./traffic-engagement-kpis-widget.component.scss'],
  providers: [TrafficEngagementKpisWidgetService]
})
export class TrafficEngagementKpisWidgetComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input('filters') filters: DurationDropdownType;
  @Input('appId') appId: number;

  categoriesViewedWidgetViewData: CategoriesViewedWidgetViewData = new CategoriesViewedWidgetViewData();
  trafficSourceOverGivenPeriodWidgetViewData: TrafficSourceOverGivenPeriodWidgetViewData = new TrafficSourceOverGivenPeriodWidgetViewData();
  uniqueVisitorsWidgetViewData: UniqueVisitorsWidgetViewData = new UniqueVisitorsWidgetViewData();

  constructor(private svc: TrafficEngagementKpisWidgetService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.filters?.currentValue || changes?.appId?.currentValue) {
      setTimeout(() => {
        this.getCategoriesViewedWidgetViewData();
        this.getTrafficSourceOverGivenPeriod();
        this.getUniqueVisitors();
      }, 0);
    }
  }

  getCategoriesViewedWidgetViewData() {
    this.spinner.start(this.categoriesViewedWidgetViewData.loader);
    this.categoriesViewedWidgetViewData.chartData = null;
    this.svc.getCategoriesViewedWidgetViewData(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.categoriesViewedWidgetViewData.chartData = this.svc.convertToCategoriesViewedWidgetViewDataChartData(res);
      this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.categoriesViewedWidgetViewData.loader);
      this.notification.error(new Notification('Failed to get Categories Viewed data. Try again later'));
    })
  }

  getTrafficSourceOverGivenPeriod() {
    this.spinner.start(this.trafficSourceOverGivenPeriodWidgetViewData.loader);
    this.trafficSourceOverGivenPeriodWidgetViewData.chartData = null;
    this.svc.getTrafficSourceOverGivenPeriod(this.appId, this.filters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trafficSourceOverGivenPeriodWidgetViewData.chartData = this.svc.convertToTrafficSourceOverGivenPeriodChartData(res);
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
}
