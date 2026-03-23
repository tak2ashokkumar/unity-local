import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ComponentsOverviewViewData, ComponentsOverviewWidgetService, DatabaseOverviewViewData, DropDownsViewData, HostOverviewViewData, ProcessOverviewViewData } from './components-overview-widget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'components-overview-widget',
  templateUrl: './components-overview-widget.component.html',
  styleUrls: ['./components-overview-widget.component.scss'],
  providers: [ComponentsOverviewWidgetService]
})
export class ComponentsOverviewWidgetComponent implements OnInit, OnDestroy, OnChanges {
  private ngUnsubscribe = new Subject();
  @Input("reload") reload: boolean;
  @Input("filters") filters: DurationDropdownType;
  @Input("appId") appId: number;

  public pcFastData: PCFastData[] = [];
  cloudList: any[] = [];
  platformMapping = PlatFormMapping;
  showDoughnutChart: boolean = true;

  componentsOverviewWidgetData: ComponentsOverviewViewData = new ComponentsOverviewViewData();
  processOverviewWidgetData: ProcessOverviewViewData = new ProcessOverviewViewData();
  databaseOverviewWidgetData: DatabaseOverviewViewData = new DatabaseOverviewViewData();
  hostOverviewWidgetData: HostOverviewViewData = new HostOverviewViewData();

  constructor(private svc: ComponentsOverviewWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    // this.getComponentsOverview();
    // this.getProcessOverview();
    // this.getDataandMessegingOverview();
    // this.getHostOverview();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['filters'] && !changes['filters'].firstChange) {
    //   this.handleFilterChange();
    // }
    // this.appId = changes?.appId?.currentValue;
    if (changes?.filters?.currentValue) {
      this.filters = changes?.filters?.currentValue;
      setTimeout(() => {
        this.handleFilterChange();
      }, 0);
    }
  }

  handleFilterChange() {
    this.getComponentsOverview();
    this.getProcessOverview();
    this.getDataandMessegingOverview();
    this.getHostOverview();
    this.getPhysicalAndCloudInfrastructure();
  }

  getComponentsOverview() {
    this.spinner.start(this.componentsOverviewWidgetData.healthLoader);
    this.spinner.start(this.componentsOverviewWidgetData.durationLoader);
    this.spinner.start(this.componentsOverviewWidgetData.responseTimeLoader);
    this.componentsOverviewWidgetData.healthChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'availability', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.healthChartData = this.svc.convertToComponentDoughnutChartViewData(res.data, this.filters, '', '', 'line');
      if(this.showDoughnut(res.data) == 0){
        this.showDoughnutChart = false;
      }
      this.componentsOverviewWidgetData.healthAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.healthLoader);
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
    //Response time
    this.componentsOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.responseTimeChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Duration', 'line');
      this.componentsOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.componentsOverviewWidgetData.durationChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'duration', 'component').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentsOverviewWidgetData.durationChartData = this.svc.convertToComponentChartViewData(res.data, this.filters, '', '', 'Component Response Time', 'line');
      this.componentsOverviewWidgetData.durationAvg = this.getAverage(res.data);
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.componentsOverviewWidgetData.durationLoader);
      this.notification.error(new Notification('Failed to get Duration data. Try again later'));
    });
  }

  getAverage(data: any[]) {
    const totalAvgObj = data.find(item => item.hasOwnProperty('total_avg'));
    if (totalAvgObj) {
      return (Math.round(totalAvgObj.total_avg * 10) / 10).toString();
    }
  }

  showDoughnut(apps: any[]){
    const upCount = apps.find((item: any) => item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item.hasOwnProperty('unknown_count'))?.unknown_count || 0;

    // Calculate the total combined count
    const totalCount = upCount + downCount + unknownCount;
    return totalCount;
  }

  getProcessOverview() {
    this.spinner.start(this.processOverviewWidgetData.throughputLoader);
    this.spinner.start(this.processOverviewWidgetData.availabilityLoader);
    this.spinner.start(this.processOverviewWidgetData.responseTimeLoader);
    this.processOverviewWidgetData.throughputChartData = null;
    this.svc.getThroughputData(this.filters, this.appId, 'throughput', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.throughputChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Throughput');
      this.processOverviewWidgetData.throughputAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.throughputLoader);
      this.notification.error(new Notification('Failed to get Throughput data. Try again later'));
    });
    //Response time
    this.processOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Response Time');
      this.processOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.processOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.processOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'process').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Process Availablility');
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
    this.svc.getLatencyData(this.filters, this.appId, 'total_queries', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.latencyChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Throughput');
      this.databaseOverviewWidgetData.latencyAvg = this.getAverage(res.data);
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.latencyLoader);
      this.notification.error(new Notification('Failed to get latency data. Try again later'));
    });
    //Response time
    this.databaseOverviewWidgetData.responseTimeChartData = null;
    this.svc.getResponseTimeData(this.filters, this.appId, 'response_time', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.responseTimeChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Response Time');
      this.databaseOverviewWidgetData.responseTimeAvg = this.getAverage(res.data);
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.databaseOverviewWidgetData.responseTimeLoader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    });
    //Duration
    this.databaseOverviewWidgetData.availabilityChartData = null;
    this.svc.getAvailabilityData(this.filters, this.appId, 'availability', 'database').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOverviewWidgetData.availabilityChartData = this.svc.convertToApplicationChartViewData(res.data, this.filters, '', '', 'Query Availablility');
      this.databaseOverviewWidgetData.availabilityAvg = this.getAverage(res.data);
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
    this.svc.getHostOverview(this.filters, this.appId, 'cpu_utilization').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.cpuUtilizationChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'CPU Utilization', 'Time', '');
      this.hostOverviewWidgetData.cpuUtilizationAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.cpuUtilizationLoader);
      this.notification.error(new Notification('Failed to get CPU Utilization data. Try again later'));
    });
    //Memory Usage
    this.hostOverviewWidgetData.memoryUsageChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'mem_usage').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.memoryUsageChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Memory Usage', 'Time', '');
      this.hostOverviewWidgetData.memoryUsageAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.memoryUsageLoader);
      this.notification.error(new Notification('Failed to get Memory Usage data. Try again later'));
    });
    //Disk I/O
    this.hostOverviewWidgetData.diskInputOutputTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'disk_read_write').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.diskInputOutputTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'Disk I/O', 'Time', '');
      this.hostOverviewWidgetData.diskInputOutputTimeAvg = (Math.round(res?.total_avg * 10) / 10).toString();
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.hostOverviewWidgetData.diskInputOutputTimeLoader);
      this.notification.error(new Notification('Failed to get Disk I/O data. Try again later'));
    });
    //Sys Load Time
    this.hostOverviewWidgetData.systemLoadTimeChartData = null;
    this.svc.getHostOverview(this.filters, this.appId, 'sys_load').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostOverviewWidgetData.systemLoadTimeChartData = this.svc.convertToCpuUtilizationChartViewData(res.devices, 'System Load', 'Time', '');
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
    this.svc.getCloudList(this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

}
