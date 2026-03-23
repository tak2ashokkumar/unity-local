import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { NetworkSummaryAlertsBySeverityViewData, NetworkSummaryAlertsDetailsViewData, NetworkSummaryUtilizationViewData, NetworkSummaryInterfaceSummaryViewData, NetworkSummaryManufacturer, NetworkSummaryService, NetworkSummaryViewData } from './network-summary.service';
import { NetworkSummaryStatusByGroup } from './network-summary.type';

@Component({
  selector: 'network-summary',
  templateUrl: './network-summary.component.html',
  styleUrls: ['./network-summary.component.scss'],
  providers: [NetworkSummaryService]
})
export class NetworkSummaryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  datacenterList: Array<DatacenterFast> = [];
  currentCriteria: SearchCriteria;
  networkSummaryViewData: NetworkSummaryViewData = new NetworkSummaryViewData();
  statusByGroupData: Array<NetworkSummaryStatusByGroup> = [];
  alertsBySeverityViewData: NetworkSummaryAlertsBySeverityViewData = new NetworkSummaryAlertsBySeverityViewData();
  cpuUtilizationViewData: NetworkSummaryUtilizationViewData[] = [];
  memoryUtilizationViewData: any[] = [];
  interfaceSummaryViewData: NetworkSummaryInterfaceSummaryViewData = new NetworkSummaryInterfaceSummaryViewData();
  alertsDetailsViewData: NetworkSummaryAlertsDetailsViewData[] = [];
  statusByGroupList: NetworkSummaryManufacturer[] = [];
  models: NetworkSummaryManufacturer[] = [];
  modelList: NetworkSummaryManufacturer[][] = [];
  deviceList: any[][] = [];
  manfDeviceList: any[][][] = [];
  modelDeviceList: any[][] = [];
  interfaceDetailsViewData: any[] = [];
  statusByGroup: string = 'Manufacturer';
  interfaceDetail: string = '';

  datacenterListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private summaryService: NetworkSummaryService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { datacenter: [] } };
  }

  ngOnInit(): void {
    this.getDatacenter();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.getAlertsDetails();
  }

  getDatacenter() {
    this.spinner.start('main');
    this.summaryService.getDatacenter().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenterList = data;
      this.datacenterList.forEach(datacenter => {
        this.currentCriteria.multiValueParam.datacenter.push(datacenter.uuid);
      });
      this.getNetworkSummary();
      this.getStatusByGroup();
      this.getAlertsBySeverity();
      this.getUtilization();
      this.getAlertsDetails();
      this.getInterfaceSummary();
      this.getInterfaceDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Datacenters.'));
      this.spinner.stop('main');
    });
  }

  getNetworkSummary() {
    this.spinner.start(this.networkSummaryViewData.totalDevicesLoader);
    this.spinner.start(this.networkSummaryViewData.devicesLoader);
    this.summaryService.getNetworkSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.networkSummaryViewData = this.summaryService.convertToNetworkSummaryData(data);
      this.spinner.stop(this.networkSummaryViewData.totalDevicesLoader);
      this.spinner.stop(this.networkSummaryViewData.devicesLoader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.networkSummaryViewData.totalDevicesLoader);
      this.spinner.stop(this.networkSummaryViewData.devicesLoader);
    });
  }

  getStatusByGroup() {
    this.spinner.start('NetworkSummaryStatusByGroupLoader');
    this.summaryService.getStatusByGroupData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.statusByGroupData = data;
      this.statusByGroupList = [];
      this.modelList = [];
      this.manfDeviceList = [];
      this.modelDeviceList = [];
      this.deviceList = [];
      Object.keys(data).forEach(key => {
        const res = data[key];
        let manf: NetworkSummaryManufacturer = new NetworkSummaryManufacturer();
        manf.name = key;
        this.statusByGroupList.push(manf);
        this.modelList.push(Object.keys(res.models).map(item => ({ name: item, isSelected: false })));
        this.models = this.models.concat(Object.keys(res.models).map(item => ({ name: item, isSelected: false })));
        const devices = [];
        Object.keys(res.models).forEach(modelName => {
          const deviceNames = res.models[modelName].map(item => ({
            name: item.name, uuid: item.uuid, type: item.device_type, status: item.status
          }));
          this.deviceList = this.deviceList.concat(deviceNames);
          devices.push(deviceNames);
          this.modelDeviceList.push(deviceNames);
        });
        this.manfDeviceList.push(devices);
      });
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    });
  }

  getAlertsBySeverity() {
    this.spinner.start(this.alertsBySeverityViewData.loader);
    this.alertsBySeverityViewData.chartData = null;
    this.summaryService.getAlertsBySeverityData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alertsBySeverityViewData = this.summaryService.convertToAlertsBySeverityData(data);
      this.alertsBySeverityViewData.chartData = this.summaryService.convertToAlertsBySeverityChartData(data);
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    });
  }

  getUtilization() {
    this.spinner.start('NetworkSummaryCpuUtilizationLoader');
    this.spinner.start('NetworkSummaryMemoryUtilizationLoader');
    this.summaryService.getCpuUtilizationData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.cpuUtilizationViewData = this.summaryService.convertToCpuUtilizationViewData(data.top_10_cpu_usage);
      this.memoryUtilizationViewData = this.summaryService.convertToMemoryUtilizationViewData(data.top_10_memory_usage);
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    });
  }

  getMemoryUtilization() {
    this.spinner.start('NetworkSummaryMemoryUtilizationLoader');
    this.summaryService.getMemoryUtilizationData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.memoryUtilizationViewData = this.summaryService.convertToMemoryUtilizationViewData(data);
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    });
  }

  getInterfaceSummary() {
    this.spinner.start(this.interfaceSummaryViewData.loader);
    this.interfaceSummaryViewData.chartData = null;
    this.summaryService.getInterfaceSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceSummaryViewData.chartData = this.summaryService.convertToInterfaceSummaryChartData(data);
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    });
  }

  getAlertsDetails() {
    this.spinner.start('NetworkSummaryAlertsDetailsLoader');
    this.summaryService.getAlertsDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alertsDetailsViewData = this.summaryService.convertToAlertDetailsViewData(data.results);
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    });
  }

  getInterfaceDetails() {
    this.spinner.start('NetworkSummaryInterfaceDetailsLoader');
    this.summaryService.getInterfaceDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceDetailsViewData = this.summaryService.convertToInterfaceDetailsViewData(data);
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    });
  }

  getSeverityDetailsClass(value: number) {
    if (value < 0) {
      return 'fas fa-caret-down text-success';
    } else {
      return 'fas fa-caret-up text-danger';
    }
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  getPercentageClass(value: number): string {
    return value < 65 ? 'text-success' : value >= 65 && value < 85 ? 'text-warning' : 'text-danger';
  }

  onFilterChange() {
    this.getNetworkSummary();
    this.getStatusByGroup();
    this.getAlertsBySeverity();
    this.getAlertsDetails();
    this.getInterfaceSummary();
    this.getInterfaceDetails();
    this.getUtilization();
  }

  onInterfaceDetailFilterChange() {
    this.currentCriteria.params = [{ 'filter_type': this.interfaceDetail }];
    this.getInterfaceDetails();
    this.currentCriteria.params = [{}];
  }

  showModals(index: number) {
    this.statusByGroupList.forEach(res => {
      res.isSelected = false;
    });
    this.statusByGroupList[index].isSelected = !this.statusByGroupList[index].isSelected;
    this.modelList.forEach(res => {
      res.forEach(model => {
        model.isSelected = false;
      });
    });
  }

  showDevices(i: number, j: number) {
    this.modelList.forEach(res => {
      res.forEach(model => {
        model.isSelected = false;
      });
    });
    this.modelList[i][j].isSelected = !this.modelList[i][j].isSelected;
  }

  showModelDevices(index: number) {
    this.models.forEach(model => {
      model.isSelected = false;
    });
    this.models[index].isSelected = !this.models[index].isSelected;
  }

  goToDeviceDetails(device: any) {
    switch (device.type) {
      case 'switch':
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SWITCHES }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switches', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case 'firewall':
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.FIREWALL }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case 'load_balancer':
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.LOAD_BALANCER }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      default:
    }
  }

  goToInterface(uuid: string) {
    this.router.navigate([uuid, 'interface'], { relativeTo: this.route });
  }
}
