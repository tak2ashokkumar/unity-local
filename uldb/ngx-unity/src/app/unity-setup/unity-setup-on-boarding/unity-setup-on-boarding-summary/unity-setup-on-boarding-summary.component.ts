import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ChartType, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label, Color, SingleDataSet } from 'ng2-charts';

@Component({
  selector: 'unity-setup-on-boarding-summary',
  templateUrl: './unity-setup-on-boarding-summary.component.html',
  styleUrls: ['./unity-setup-on-boarding-summary.component.scss']
})
export class UnitySetupOnBoardingSummaryComponent implements OnInit {
  @Input('data') data: OnbSummaryInput;
  @Input('moduleName') moduleName: string;
  @Input('accessType') accessType: string;

  graphData: { percent: number; graphBg: string; } = { percent: 0, graphBg: '' };

  // defaultChartType: ChartType = 'doughnut';
  // defaultChartPlugins = [pluginDataLabels];
  // defaultChartOptions: ChartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   rotation: 2.0 * Math.PI,
  //   circumference: 2 * Math.PI,
  //   animation: {
  //     animateScale: true,
  //     animateRotate: true
  //   },
  //   plugins: {
  //     datalabels: {
  //       display: (context) => {
  //         return false;
  //       }
  //     }
  //   },
  //   title: {
  //     display: true
  //   },
  //   legend: {
  //     display: false,
  //   },
  // };

  // chartLabels: Label[] = ['Onboarded', 'Total'];
  // chartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  // chartData: SingleDataSet = [5, 5];
  // chartOptions: ChartOptions = this.defaultChartOptions;
  // chartLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getCircleParams();
  }

  getCircleParams() {
    if (this.data.success && this.data.count) {
      let defaultGray = getComputedStyle(document.documentElement).getPropertyValue(`--gray-200`);
      this.graphData.percent = Number((this.data.success / this.data.count * 100).toFixed(2));

      // this.chartData = [this.graphData.percent, this.graphData.percent >= 100 ? 0 : this.graphData.percent];
      // this.chartOptions.title.text = `${this.graphData.percent}`;

      let toDegree = (360 / 100) * this.graphData.percent;
      let color = getComputedStyle(document.documentElement).getPropertyValue(`--${this.data.deviceColorVar}`);

      // this.chartColor = [{ backgroundColor: [color, defaultGray] }];
      this.graphData.graphBg = `conic-gradient(${color} 0deg ${toDegree}deg, ${defaultGray} ${toDegree}deg 360deg)`;
    }
  }

  get summaryCardClass() {
    if (this.data.success) {
      return `enabled border-${this.data.deviceColorVar} pointer-link`;
    }
    return 'bg-gray-200';
  }

  gotToDevice() {
    if (!this.data.success) {
      return;
    }
    let route = 'unitycloud/devices/';
    switch (this.data.deviceType) {
      case DeviceMapping.SWITCHES:
        this.router.navigate([`${route}switches`]);
        break;
      case DeviceMapping.FIREWALL:
        this.router.navigate([`${route}firewalls`]);
        break;
      case DeviceMapping.LOAD_BALANCER:
        this.router.navigate([`${route}loadbalancers`]);
        break;
      case DeviceMapping.BARE_METAL_SERVER:
        this.router.navigate([`${route}bmservers`]);
        break;
      case DeviceMapping.HYPERVISOR:
        this.router.navigate([`${route}hypervisors`]);
        break;
      case DeviceMapping.MAC_MINI:
        this.router.navigate([`${route}macdevices`]);
        break;
      case DeviceMapping.STORAGE_DEVICES:
        this.router.navigate([`${route}storagedevices`]);
        break;
      case DeviceMapping.MOBILE_DEVICE:
        this.router.navigate([`${route}mobiledevices`]);
        break;
      case DeviceMapping.DC_VIZ:
        this.router.navigate([`unitycloud/datacenter/`]);
        break;
      case DeviceMapping.PDU:
        break;
      case DeviceMapping.CABINET_VIZ:
        break;
    }
  }
}

export interface OnbSummaryInput {
  icon: string;
  deviceType: string;
  deviceClass: string;
  deviceColorVar: string;
  count: number;
  success: number;
}