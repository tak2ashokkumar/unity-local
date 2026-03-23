import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { DashboardPublicCloudWidgetViewData } from '../public-cloud.service';


@Component({
  selector: 'public-cloud-widget',
  templateUrl: './public-cloud-widget.component.html',
  styleUrls: ['./public-cloud-widget.component.scss']
})
export class PublicCloudWidgetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() widgetData: DashboardPublicCloudWidgetViewData;
  @Input() state: string;
  private ngUnsubscribe = new Subject();

  dataError: string = null;
  defaultChartType: ChartType = 'doughnut';
  defaultChartPlugins = [pluginDataLabels];
  defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 1.0 * Math.PI,
    legend: {
      fullWidth: false,
      labels: {
        boxWidth: 20
      },
      display: true,
      position: 'top'
    },
    circumference: Math.PI,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      datalabels: {
        color: '#FFF',
        font: {
          size: 12,
        },
        display: (context) => {
          return context.dataset.data[context.dataIndex] > 0 ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    },
  };

  widgetChartLabels: Label[] = ['Running', 'Stopped'];
  widgetChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  widgetChartData: SingleDataSet = [1, 2];
  widgetChartOptions: ChartOptions = this.defaultChartOptions;
  widgetChartLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.widgetChartData = [this.widgetData.activeVMs, this.widgetData.inactiveVMs];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.widgetData?.isFirstChange()) {
      this.widgetChartData = [this.widgetData.activeVMs, this.widgetData.inactiveVMs];
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goToSubscriptions(view: DashboardPublicCloudWidgetViewData) {
    switch (view.cloudType) {
      case 'AWS': this.router.navigate(['/unitycloud/publiccloud/aws']); break;
      case 'Azure': this.router.navigate(['/unitycloud/publiccloud/azure']); break;
      case 'GCP': this.router.navigate(['/unitycloud/publiccloud/gcp']); break;
      case 'Oracle': this.router.navigate(['/unitycloud/publiccloud/oracle']); break;
      default: this.router.navigate(['/unitycloud/publiccloud/aws']); break;
    }
  }

  goToCost(view: DashboardPublicCloudWidgetViewData) {
    switch (view.cloudType) {
      case 'AWS': this.router.navigate(['/cost-analysis/public-cloud/aws']); break;
      case 'Azure': this.router.navigate(['/cost-analysis/public-cloud/azure']); break;
      case 'GCP': this.router.navigate(['/cost-analysis/public-cloud/gcp']); break;
      case 'Oracle': this.router.navigate(['/cost-analysis/public-cloud/oci']); break;
      default: this.router.navigate(['/cost-analysis/public-cloud/aws']); break;
    }
  }

  goToServices(view: DashboardPublicCloudWidgetViewData) {
    switch (view.cloudType) {
      case 'AWS': this.router.navigate(['/unitycloud/publiccloud/aws']); break;
      case 'Azure': this.router.navigate(['/unitycloud/publiccloud/azure']); break;
      case 'GCP': this.router.navigate(['/unitycloud/publiccloud/gcp']); break;
      case 'Oracle': this.router.navigate(['/unitycloud/publiccloud/oracle']); break;
      default: this.router.navigate(['/unitycloud/publiccloud/aws']); break;
    }
  }

  goToResources(view: DashboardPublicCloudWidgetViewData) {
    switch (view.cloudType) {
      case 'AWS': this.router.navigate(['/unitycloud/publiccloud/aws']); break;
      case 'Azure': this.router.navigate(['/unitycloud/publiccloud/azure']); break;
      case 'GCP': this.router.navigate(['/unitycloud/publiccloud/gcp']); break;
      case 'Oracle': this.router.navigate(['/unitycloud/publiccloud/oracle']); break;
      default: this.router.navigate(['/unitycloud/publiccloud/aws']); break;
    }
    // switch (view.cloudType) {
    //   case 'AWS': this.router.navigate(['/unitycloud/publiccloud/aws/services/allresources']); break;
    //   case 'Azure': this.router.navigate(['/unitycloud/publiccloud/azure/services/allresources']); break;
    //   case 'GCP': this.router.navigate(['/unitycloud/publiccloud/gcp/services/allresources']); break;
    //   case 'Oracle': this.router.navigate(['/unitycloud/publiccloud/oracle/services/allresources']); break;
    //   default: this.router.navigate(['/unitycloud/publiccloud/aws/services/allresources']); break;
    // }
  }

  goToAlerts(view: DashboardPublicCloudWidgetViewData) {
    this.router.navigate(['/services/aiml-event-mgmt/alerts']);
  }

}
