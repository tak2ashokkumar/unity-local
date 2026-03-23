import { Component, Input, OnInit } from '@angular/core';
import { Subject, from } from 'rxjs';
import { Label, Color, SingleDataSet } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { merge as _merge } from 'lodash-es';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ManageReportCloudInventoryReportViewData, ManageReportCloudNamesType, PrivateReportPreviewService } from './private-report-preview.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { ManageReportDataType, ManageReportPrivateCloudData, } from './private-report-preview.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'private-report-preview',
  templateUrl: './private-report-preview.component.html',
  styleUrls: ['./private-report-preview.component.scss'],
  providers: [PrivateReportPreviewService]
})
export class PrivateReportPreviewComponent implements OnInit {
  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();

  names: ManageReportCloudNamesType[] = [];
  reportViewdata: ManageReportCloudInventoryReportViewData[] = [];
  FaIconMapping = FaIconMapping;
  scheduleId: string;
  selectedReport: ManageReportDataType;

  defaultChartType: ChartType = 'doughnut';
  defaultChartPlugins = [pluginDataLabels];
  defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 1.0 * Math.PI,
    legend: {
      fullWidth: false,
      labels: {
        boxWidth: 7
      },
      display: false,
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
          return context.dataset.data[context.dataIndex] ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    },
    title: {
      display: true,
      text: '%Utilization'
    }
  };

  chartOptions: ChartOptions = {
    legend: {
      display: true,
    },
    title: {
      display: false,
    }
  }

  vCPUChartLabels: Label[] = ['Used', 'Unused'];
  vCPUChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  vCPUChartData: SingleDataSet = [5, 5];
  vCPUChartOptions: ChartOptions = this.defaultChartOptions;
  vCPUChartLoading: boolean = false;

  ramChartLabels: Label[] = ['Used', 'Unused'];
  ramChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  ramChartData: SingleDataSet = [5, 5];
  ramChartOptions: ChartOptions = _merge({}, this.defaultChartOptions, this.chartOptions);;
  ramChartLoading: boolean = false;

  storageChartLabels: Label[] = ['Used', 'Unused'];
  storageChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  storageChartData: SingleDataSet = [5, 5];
  storageChartOptions: ChartOptions = _merge({}, this.defaultChartOptions, this.chartOptions);;
  storageChartLoading: boolean = false;

  ec2ChartLabels: Label[] = ['Running', 'Stopped'];
  ec2ChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  ec2ChartOptions: ChartOptions = this.defaultChartOptions;
  ec2ChartLoading: boolean = false;

  azureChartLabels: Label[] = ['Running', 'Stopped'];
  azureChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  azureChartOptions: ChartOptions = this.defaultChartOptions;
  azureChartLoading: boolean = false;

  gcpChartLabels: Label[] = ['Running', 'Stopped'];
  gcpChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  gcpChartOptions: ChartOptions = this.defaultChartOptions;
  gcpChartLoading: boolean = false;

  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private pcSvc: PrivateReportPreviewService,
    private notification: AppNotificationService,
  ) { }

  ngOnInit(): void {
    this.getReportById();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportById() {
    this.spinner.start('main');
    this.pcSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedReport = res;
      // this.generateReport();
      this.generateReport();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  generateReport() {
    this.spinner.start('main');
    let reportData = this.selectedReport.report_meta;
    this.pcSvc.generateReport(reportData.cloudName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.reportViewdata = this.pcSvc.convertToViewdata(res);
      this.getUtilization();
      this.getContainers();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  getUtilization() {
    from(this.reportViewdata.filter(d => d.cloudType == 'private')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.pcSvc.getCloudAllocations(e.cloudId)
    }), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
          if (res.get(key)) {
            const value = res.get(key);
            this.reportViewdata[index].pvtCloudsummary.RAMConfiguredValue = value.configured_ram?.value > 0 ? Number(value.configured_ram.value.toFixed(2)) : 0;
            this.reportViewdata[index].pvtCloudsummary.RAMConfiguredUnit = value.configured_ram?.unit ? value.configured_ram.unit : 'bytes';
            this.reportViewdata[index].pvtCloudsummary.RAMRuntimeUsage = value.ram_runtime_usage ? Number(value.ram_runtime_usage.toFixed(2)) : 0;
            this.reportViewdata[index].pvtCloudsummary.vCPUConfigured = value.configured_vcpu;
            this.reportViewdata[index].pvtCloudsummary.vCPURuntimeUsage = value.ram_runtime_usage ? Number(value.vcpu_runtime_usage.toFixed(2)) : 0;
            this.reportViewdata[index].pvtCloudsummary.diskSpaceAllocatedValue = value.allocated_storage_disk?.value > 0 ? Number(value.allocated_storage_disk.value.toFixed(2)) : 0;
            this.reportViewdata[index].pvtCloudsummary.diskSpaceAllocatedUnit = value.allocated_storage_disk?.unit ? value.allocated_storage_disk?.unit : 'bytes';
            this.reportViewdata[index].pvtCloudsummary.diskSpaceUtilization = value.disk_utilization?.value > 0 ? Number(value.disk_utilization.value.toFixed(2)) : 0;
          } else {
            this.reportViewdata[index].pvtCloudsummary.RAMRuntimeUsage = 0;
            this.reportViewdata[index].pvtCloudsummary.vCPURuntimeUsage = 0;
            this.reportViewdata[index].pvtCloudsummary.diskSpaceUtilization = 0;
          }
          this.spinner.stop('main');
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  getContainers() {
    from(this.reportViewdata.filter(d => d.cloudType == 'private')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.pcSvc.getContainerPods(e.cloudId)
    }), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
          if (res.get(key)) {
            const value = res.get(key);
            this.reportViewdata[index].pvtCloudsummary.containerCount = value;
          } else {
            this.reportViewdata[index].pvtCloudsummary.containerCount = 0;
          }
          this.spinner.stop('main');
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }
}