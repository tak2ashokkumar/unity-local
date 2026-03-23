import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { BUCostCenterApplications, BUCostCenterApplicationSummary, BULicenceCostCenter, BusinessUnits } from '../../../business-services.type';
import { ApplicationOverviewViewData, BusinessServiceSummaryService, ComponentsOverviewViewData, DatabaseOverviewViewData, DropDownsViewData, DurationDropdownViewData, HostOverviewViewData, ProcessOverviewViewData, ServicesOverviewViewData } from './business-service-summary.service';

@Component({
  selector: 'business-service-summary',
  templateUrl: './business-service-summary.component.html',
  styleUrls: ['./business-service-summary.component.scss'],
  providers: [BusinessServiceSummaryService]
})
export class BusinessServiceSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  buId: string;
  firstLoad: Boolean = false;

  businessUnits: BusinessUnits[] = [];
  licenseCostCenters: BULicenceCostCenter[] = [];
  selectedLCCs: number[] = [];
  applications: BUCostCenterApplications[] = [];
  selectedApps: number[] = [];
  form: FormGroup;
  durationDropdownViewData: DurationDropdownViewData;
  dropdownsViewData: DropDownsViewData = new DropDownsViewData();

  summaryData: BUCostCenterApplicationSummary;
  applicationOverviewWidgetData: ApplicationOverviewViewData = new ApplicationOverviewViewData();
  servicesOverviewWidgetData: ServicesOverviewViewData = new ServicesOverviewViewData();
  componentsOverviewWidgetData: ComponentsOverviewViewData = new ComponentsOverviewViewData();
  processOverviewWidgetData: ProcessOverviewViewData = new ProcessOverviewViewData();
  databaseOverviewWidgetData: DatabaseOverviewViewData = new DatabaseOverviewViewData();
  hostOverviewWidgetData: HostOverviewViewData = new HostOverviewViewData();
  public pcFastData: PCFastData[] = [];
  cloudList: any[] = [];
  platformMapping = PlatFormMapping;

  constructor(private svc: BusinessServiceSummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.route.parent?.paramMap.subscribe((params: ParamMap) => {
      this.buId = params.get('businessId');
      this.firstLoad = true;
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBusinessUnits();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.changes.disconnect();
  }

  refreshData() {
    this.getWidgetsData();
  }

  getBusinessUnits() {
    this.businessUnits = [];
    this.svc.getBusinessUnits().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.businessUnits = data;
        this.getLicenseCostCenters(this.buId);
      } else {
        this.businessUnits = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Business Unit Data'));
    });
  }

  getLicenseCostCenters(buId: string) {
    this.licenseCostCenters = [];
    this.svc.getLisenceCostCenters(buId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.licenseCostCenters = data;
        this.selectedLCCs = [...this.licenseCostCenters.map(lcc => lcc.license_centre_id)];
        this.getApplications(buId, this.selectedLCCs);
      } else {
        this.licenseCostCenters = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch License Cost Data'));
    });
  }

  getApplications(businessUnitId: string, costCenterIds: number[]) {
    this.applications = [];
    this.svc.getApplications(businessUnitId, costCenterIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.applications = data;
        this.selectedApps = this.applications.map(app => app.app_name_id);
        this.buildFilterForm();
      } else {
        this.applications = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.applications = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Application Data'));
    });
  }

  buildFilterForm() {
    this.form = this.svc.buildForm(this.buId);
    this.durationDropdownViewData = this.svc.getDurationDropdownViewData();
    this.getWidgetsData();

    this.form.get('licenseCostCenter')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(lcc => {
      if (lcc === 'all') {
        this.selectedLCCs = this.licenseCostCenters.map(lcc => lcc.license_centre_id);
        this.getWidgetsData();
      } else {
        this.selectedLCCs = [lcc];
      }
      this.onChangeLCCFilter();
    });

    this.form.get('application')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(app => {
      if (app === 'all') {
        this.selectedApps = this.applications.map(app => app.app_name_id);
      } else {
        this.selectedApps = [app];
      }
      this.getWidgetsData();
    });
  }

  async onChangeLCCFilter() {
    this.applications = await this.svc.getApplications(this.buId, this.selectedLCCs).toPromise();
    this.form.get('application')?.setValue('all', { emitEvent: true });
    // // as default value is all, assigning all apps to selected.
    // this.selectedApps = this.applications.map(app => app.app_name_id);
    // this.getWidgetsData();
  }

  ondurationDropdownChanged(event: any) {
    this.dropdownsViewData.selectedDateRangeFormData = event;
    if(this.firstLoad){
      this.firstLoad = false;
    }
    else{
      this.getWidgetsData();
    }
  }

  getWidgetsData() {
    setTimeout(() => {
      this.getSummary();
      this.getApplicationOverview();
      this.getServicesOverview();
      this.getComponentsOverview();
      this.getProcessOverview();
      this.getDataandMessegingOverview();
      this.getHostOverview();
      this.getPhysicalAndCloudInfrastructure();
    }, 1000)
  }

  buildForm() {
    // // LCC listener
    this.form.get('licenseCostCenter')?.valueChanges.subscribe(value => {
      if (value === 'all') {
        this.selectedLCCs = this.licenseCostCenters.map(lcc => lcc.license_centre_id);
      } else if (value) {
        this.selectedLCCs = [value];
      } else {
        this.selectedLCCs = [];
      }

      if (this.selectedLCCs.length) {
        this.getApplications(this.buId, this.selectedLCCs);
      } else {
        this.selectedApps = [];
        this.form.get('application')?.setValue('', { emitEvent: false });
      }
    });

    // // App listener
    this.form.get('application')?.valueChanges.subscribe(value => {
      if (value === 'all') {
        this.selectedApps = this.applications.map(app => app.app_name_id);
      } else {
        this.selectedApps = [value];
      }
      if (!this.firstLoad) {
        this.getWidgetsData();
      }
    });
  }





  getSummary() {
    // this.spinner.start('summaryLoader');
    this.svc.getSummary(this.selectedApps).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = res;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
  }

  getAverage(data: any[]) {
    const totalAvgObj = data.find(item => item.hasOwnProperty('total_avg'));
    if (totalAvgObj) {
      return (Math.round(totalAvgObj.total_avg * 10) / 10).toString();
    }
  }

  getApplicationOverview() {
    this.spinner.start(this.applicationOverviewWidgetData.throughputLoader);
    this.spinner.start(this.applicationOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.applicationOverviewWidgetData.responseTimeLoader);
    this.applicationOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.dropdownsViewData, this.selectedApps, 'throughput', 'application').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applicationOverviewWidgetData.throughputChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, 'Throughput (req/sec)', 'Time');
      this.applicationOverviewWidgetData.throughputAvg = this.getAverage(res.data);
      this.spinner.stop(this.applicationOverviewWidgetData.throughputLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.applicationOverviewWidgetData.throughputLoader);
      this.notification.error(new Notification('Failed to get Throughput data. Try again later'));
    });
    //Response time
    this.applicationOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'response_time', 'application').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applicationOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, 'Response Time (ms)', 'Time');
      this.applicationOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.applicationOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.applicationOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Availability
    this.applicationOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.dropdownsViewData, this.selectedApps, 'availability', 'application').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applicationOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, 'Availability (%)', 'Time');
      this.applicationOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.spinner.stop(this.applicationOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.applicationOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Availability data. Try again later'));
    });
  }

  getServicesOverview() {
    this.spinner.start(this.servicesOverviewWidgetData.throughputLoader);
    this.spinner.start(this.servicesOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.servicesOverviewWidgetData.responseTimeLoader);
    this.servicesOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.dropdownsViewData, this.selectedApps, 'throughput', 'service').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.servicesOverviewWidgetData.throughputChartData = this.svc.convertToServiceChartViewData(res.data, this.dropdownsViewData, 'Throughput (req/sec)', 'Time', 'area');
      this.servicesOverviewWidgetData.throughputAvg = this.getAverage(res.data);
      this.spinner.stop(this.servicesOverviewWidgetData.throughputLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.servicesOverviewWidgetData.throughputLoader);
      this.notification.error(new Notification('Failed to get Throughput data. Try again later'));
    });
    //Response time
    this.servicesOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'response_time', 'service').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.servicesOverviewWidgetData.responseTimeChartData = this.svc.convertToServiceChartViewData(res.data, this.dropdownsViewData, 'Response Time (ms)', 'Time', 'area');
      this.servicesOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.servicesOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.servicesOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Availability
    this.servicesOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.dropdownsViewData, this.selectedApps, 'availability', 'service').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.servicesOverviewWidgetData.availabilityChartData = this.svc.convertToServiceChartViewData(res.data, this.dropdownsViewData, 'Availability (%)', 'Time', 'line');
      this.servicesOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.spinner.stop(this.servicesOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.servicesOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Availability data. Try again later'));
    });
  }

  getComponentsOverview() {
    this.spinner.start(this.componentsOverviewWidgetData.healthLoader);
    this.spinner.start(this.componentsOverviewWidgetData.durationLoader);
    this.spinner.start(this.componentsOverviewWidgetData.responseTimeLoader);
    this.componentsOverviewWidgetData.healthChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'availability', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.healthChartData = this.svc.convertToComponentDoughnutChartViewData(res.data, this.dropdownsViewData, '', '', 'line');
      this.componentsOverviewWidgetData.healthAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
    //Response time
    this.componentsOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'response_time', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.responseTimeChartData = this.svc.convertToComponentChartViewData(res.data, this.dropdownsViewData, '', '', 'line');
      this.componentsOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.componentsOverviewWidgetData.durationChartData = null;
    this.svc.getAvailabilityData(this.dropdownsViewData, this.selectedApps, 'duration', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.durationChartData = this.svc.convertToComponentChartViewData(res.data, this.dropdownsViewData, '', '', 'line');
      this.componentsOverviewWidgetData.durationAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getProcessOverview() {
    this.spinner.start(this.processOverviewWidgetData.throughputLoader);
    this.spinner.start(this.processOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.processOverviewWidgetData.responseTimeLoader);
    this.processOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.dropdownsViewData, this.selectedApps, 'throughput', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.throughputChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.processOverviewWidgetData.throughputAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
      this.notification.error(new Notification('Failed to get Throughput data. Try again later'));
    });
    //Response time
    this.processOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'response_time', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.processOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.processOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.dropdownsViewData, this.selectedApps, 'availability', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.processOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getDataandMessegingOverview() {
    this.spinner.start(this.databaseOverviewWidgetData.latencyLoader);
    this.spinner.start(this.databaseOverviewWidgetData.responseTimeLoader);
    this.spinner.start(this.databaseOverviewWidgetData.availabilityLoader);
    this.databaseOverviewWidgetData.latencyChartData = null;
    this.svc.getLatencyData(this.dropdownsViewData, this.selectedApps, 'total_queries', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.latencyAvg = this.getAverage(res.data);
      this.databaseOverviewWidgetData.latencyChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
      this.notification.error(new Notification('Failed to get latency data. Try again later'));
    });
    //Response time
    this.databaseOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.dropdownsViewData, this.selectedApps, 'response_time', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.databaseOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.databaseOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.dropdownsViewData, this.selectedApps, 'availability', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
      this.databaseOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.dropdownsViewData, '', '');
      this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.availabilityLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getHostOverview() {
    this.spinner.start(this.hostOverviewWidgetData.cpuUtilizationLoader);
    this.spinner.start(this.hostOverviewWidgetData.memoryUsageLoader);
    this.spinner.start(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    this.spinner.start(this.hostOverviewWidgetData.systemLoadTimeLoader);
    this.hostOverviewWidgetData.cpuUtilizationChartData = null;
    this.svc.getHostOverview(this.dropdownsViewData, this.selectedApps, 'cpu_utilization').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.cpuUtilizationChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'CPU Utilization', 'Time');
      this.hostOverviewWidgetData.cpuUtilizationAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
      this.notification.error(new Notification('Failed to get CPU Utilization data. Try again later'));
    });
    //Memory Usage
    this.hostOverviewWidgetData.memoryUsageChartData = null;
    this.svc.getHostOverview(this.dropdownsViewData, this.selectedApps, 'mem_usage').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.memoryUsageChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Memory Usage', 'Time');
      this.hostOverviewWidgetData.memoryUsageAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
      this.notification.error(new Notification('Failed to get Memory Usage data. Try again later'));
    });
    //Disk I/O
    this.hostOverviewWidgetData.diskInputOutputTimeChartData = null;
    this.svc.getHostOverview(this.dropdownsViewData, this.selectedApps, 'disk_read_write').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.diskInputOutputTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Disk I/O', 'Time');
      this.hostOverviewWidgetData.diskInputOutputTimeAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
      this.notification.error(new Notification('Failed to get Disk I/O data. Try again later'));
    });
    //Sys Load Time
    this.hostOverviewWidgetData.systemLoadTimeChartData = null;
    this.svc.getHostOverview(this.dropdownsViewData, this.selectedApps, 'sys_load').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.systemLoadTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'System Load', 'Time');
      this.hostOverviewWidgetData.systemLoadTimeAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.systemLoadTimeLoader);
      this.notification.error(new Notification('Failed to get System Load data. Try again later'));
    });
  }

  getPhysicalAndCloudInfrastructure() {
    this.spinner.start('privateCloudWidgetLoader');
    this.pcFastData = [];
    this.svc.getCloudList(this.selectedApps).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.pcFastData = this.svc.convertToPCFastData(res);
      this.spinner.stop('privateCloudWidgetLoader');
    }, (err: HttpErrorResponse) => {
      this.pcFastData = [];
      this.spinner.stop('privateCloudWidgetLoader');
      this.notification.error(new Notification('Failed to get Physical and Cloud Infrastructure data. Try again later'));
    });
  }

  isClusterWidget(platfromType: string) {
    switch (platfromType) {
      case 'VMware':
      case 'United Private Cloud vCenter': return true;
      default: return false;
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route })
  }

}
