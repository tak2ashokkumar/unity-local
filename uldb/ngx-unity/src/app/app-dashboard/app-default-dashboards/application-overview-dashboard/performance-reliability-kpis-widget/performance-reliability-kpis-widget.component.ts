import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PerformanceReliabilityKpisWidgetService } from './performance-reliability-kpis-widget.service';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'performance-reliability-kpis-widget',
  templateUrl: './performance-reliability-kpis-widget.component.html',
  styleUrls: ['./performance-reliability-kpis-widget.component.scss'],
  providers: [PerformanceReliabilityKpisWidgetService]
})
export class PerformanceReliabilityKpisWidgetComponent implements OnInit, OnDestroy, OnChanges {

  private ngUnsubscribe = new Subject();
  // @Input("reload") reload: boolean;
  @Input("filters") filters: any;
  @Input("appId") appId: number;

  applicationResponseTimeViewData: any;
  errorRateViewData: any;
  paymentFailureViewData: any;
  paymentGatewayLatencyViewData: any;

  constructor(private svc: PerformanceReliabilityKpisWidgetService,
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
        this.getApplicationResponseTimeGraph();
        this.getErrorRateGraph();
        this.getPayemntFailureRateGraph();
        this.getPaymentGatewayLatencyGraph();
      }, 0)
    }
  }

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

}
