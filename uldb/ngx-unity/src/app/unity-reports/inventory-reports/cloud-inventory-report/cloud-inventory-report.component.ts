import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudInventoryReportService, CloudInventoryReportViewData } from './cloud-inventory-report.service';
import { Subject, from } from 'rxjs';
import { PlatFormMapping, FaIconMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CloudNamesType } from './cloud-inventory-report.type';
import { FormGroup, FormControl } from '@angular/forms';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ChartType, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label, Color, SingleDataSet } from 'ng2-charts';
import { merge as _merge } from 'lodash-es';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil, mergeMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ReportSchedulesService } from '../../report-schedules/report-schedules.service';
import { ReportSchedulesCrudService } from '../../report-schedules-crud/report-schedules-crud.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

@Component({
  selector: 'cloud-inventory-report',
  templateUrl: './cloud-inventory-report.component.html',
  styleUrls: ['./cloud-inventory-report.component.scss'],
  providers: [CloudInventoryReportService]
})
export class CloudInventoryReportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  // tabItems: TabData[] = tabData;
  cloudsData: { name: PlatFormMapping, value: string, isPublic: boolean }[] = [
    { name: PlatFormMapping.VMWARE, value: 'VMware', isPublic: false },
    { name: PlatFormMapping.OPENSTACK, value: 'OpenStack', isPublic: false },
    { name: PlatFormMapping.VCLOUD, value: 'OVM', isPublic: false },
    { name: PlatFormMapping.PROXMOX, value: 'Proxmox', isPublic: false },
    { name: PlatFormMapping.G3_KVM, value: 'G3 KVM', isPublic: false },
    { name: PlatFormMapping.ESXI, value: 'ESXi', isPublic: false },
    { name: PlatFormMapping.CUSTOM, value: 'Custom', isPublic: false },
    { name: PlatFormMapping.AWS, value: 'AWS', isPublic: true },
    { name: PlatFormMapping.AZURE, value: 'Azure', isPublic: true },
    { name: PlatFormMapping.GCP, value: 'GCP', isPublic: true }
  ];
  clouds: { name: PlatFormMapping, value: string, isPublic: boolean }[] = [];
  names: CloudNamesType[] = [];
  reportViewdata: CloudInventoryReportViewData[] = [];
  FaIconMapping = FaIconMapping;
  scheduleId: string;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;

  cloudSettings: IMultiSelectSettings = {
    keyToSelect: "value",
    lableToDisplay: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  namesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

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


  constructor(private reportSvc: CloudInventoryReportService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: ReportSchedulesCrudService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.scheduleId = params.get('scheduleId');
    });
  }

  ngOnInit() {
    this.buildFilterForm();
    if (this.scheduleId) {
      this.setFilterWithScheduledValues();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private setFilterWithScheduledValues() {
    this.scheduleSvc.getScheduleById(this.scheduleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.filterForm.get('cloudType').setValue(res.report_meta.cloudType);
      this.filterForm.get('cloud').setValue(res.report_meta.cloud);
      this.selectedClouds = res.report_meta.cloud;
      this.filterForm.get('report_url').setValue(res.report_meta.report_url);
      this.filterForm.addControl('tempCloudName', new FormControl(res.report_meta.cloudName));
      this.getCloudNames(res.report_meta.cloud);
    }, err => { this.notification.error(new Notification('Something went wrong!! Please try again')) });
  }

  private getCloudNames(selectedClouds: string[]) {
    this.reportSvc.getCloudNames(selectedClouds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.names = res;
      if (this.scheduleId && this.filterForm.get('tempCloudName')) {
        let tempCloudName = <CloudNamesType[]>this.filterForm.get('tempCloudName').value;
        let arr: CloudNamesType[] = [];
        tempCloudName.forEach(name => {
          arr.push(this.names.find(n => n.uuid == name.uuid));
        });
        this.filterForm.get('cloudName').setValue(arr);
        this.filterForm.removeControl('tempCloudName');
        this.generateReport();
      }
    }, err => {
      this.names = [];
    });
  }

  buildFilterForm() {
    this.filterForm = this.reportSvc.createFilterForm();
    this.filterFormValidationMessages = this.reportSvc.filterValidationMessages;
    this.filterFormErrors = this.reportSvc.resetFilterFormErrors();
    this.filterForm.get('cloudType').valueChanges.subscribe(v => {
      if (v == 'all') {
        this.clouds = this.cloudsData;
      } else if (v == 'public') {
        this.clouds = this.cloudsData.filter(c => c.isPublic)
      } else {
        this.clouds = this.cloudsData.filter(c => !c.isPublic)
      }
      this.selectedClouds = [];
      this.filterForm.get('cloud').reset([]);
      this.filterForm.get('cloudName').reset([]);
    });
  }

  selectedClouds: string[] = [];
  cloudChanged() {
    let selectedClouds = (<string[]>this.filterForm.get('cloud').value);
    if (this.selectedClouds == selectedClouds) {
      return;
    }
    this.selectedClouds = selectedClouds;
    if (selectedClouds.length) {
      this.filterForm.get('cloudName').reset();
      this.getCloudNames(selectedClouds);
    } else {
      this.names = [];
    }
  }

  generateReport() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors); });
    } else {
      this.spinner.start('main');
      this.reportSvc.generateReport(<CloudNamesType[]>this.filterForm.get('cloudName').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.reportViewdata = this.reportSvc.convertToViewdata(res);
        this.getUtilization();
        this.getContainers();
        this.getAwsCloudData();
        this.getAzureCloudData();
        this.getGCPCloudData();
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  getUtilization() {
    from(this.reportViewdata.filter(d => d.cloudType == 'private')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.reportSvc.getCloudAllocations(e.cloudId)
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
      return this.reportSvc.getContainerPods(e.cloudId)
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

  getAwsCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'AWS')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.reportSvc.getAWSCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].awsSummary = this.reportSvc.convertToAWSWidgetViewData(value);
        } else {
          this.reportViewdata[index].awsSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

  getAzureCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'AZURE')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.reportSvc.getAzureCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].azureSummary = this.reportSvc.convertToAzureWidgetViewData(value);
        } else {
          this.reportViewdata[index].azureSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

  getGCPCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'GCP')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.reportSvc.getGCPCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].gcpSummary = this.reportSvc.convertToGCPWidgetViewData(value);
        } else {
          this.reportViewdata[index].gcpSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

  generatePDFReport() {
    if (!this.reportViewdata.length) {
      return;
    }
    this.spinner.start('main');
    this.reportSvc.downloadReport(<string[]>this.filterForm.get('cloudName').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/reports/get_report/?file_name=${data.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  sendEmail() {
    if (!this.reportViewdata.length) {
      return;
    }
    this.spinner.start('main');
    this.reportSvc.sendEmail(<string[]>this.filterForm.get('cloudName').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Report sent to email.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to send via email. Tryagain later.'));
    });
  }

  saveSchedule() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors); });
    } else {
      this.scheduleSvc.addOrEdit(this.scheduleId, this.filterForm.getRawValue());
    }
  }

}
