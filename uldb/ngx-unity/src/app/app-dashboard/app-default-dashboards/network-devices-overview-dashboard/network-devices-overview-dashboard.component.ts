import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { interfaceColumnMapping, NetworkDevicesOverviewDashboardService, NetworkStatusByGroupData, NetworkStatusByGroupViewData, NetworkSummaryAlertsBySeverityViewData, NetworkSummaryAlertsDetailsViewData, NetworkSummaryInterfaceDetailsViewData, NetworkSummaryInterfaceSummaryViewData, NetworkSummaryUtilizationViewData, NetworkSummaryViewData } from './network-devices-overview-dashboard.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'network-devices-overview-dashboard',
  templateUrl: './network-devices-overview-dashboard.component.html',
  styleUrls: ['./network-devices-overview-dashboard.component.scss'],
  providers: [NetworkDevicesOverviewDashboardService]
})
export class NetworkDevicesOverviewDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  datacenterList: Array<DatacenterFast> = [];
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
    showUncheckAll: false,
    appendToBody: true,
    mandatoryLimit: 1,
  };
  datacenterSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'datacenter',
    checkedPlural: 'datacenters',
    defaultTitle: 'Select Datacenters',
    allSelected: 'All Datacenters',
  };

  networkSummaryViewData: NetworkSummaryViewData = new NetworkSummaryViewData();

  statusByGroupViewData: NetworkStatusByGroupViewData = new NetworkStatusByGroupViewData();
  isSelected: boolean = false;

  alertsBySeverityViewData: NetworkSummaryAlertsBySeverityViewData = new NetworkSummaryAlertsBySeverityViewData();
  interfaceSummaryViewData: NetworkSummaryInterfaceSummaryViewData = new NetworkSummaryInterfaceSummaryViewData();
  cpuUtilizationViewData: NetworkSummaryUtilizationViewData[] = [];
  memoryUtilizationViewData: NetworkSummaryUtilizationViewData[] = [];
  alertsDetailsViewData: NetworkSummaryAlertsDetailsViewData[] = [];

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 7,
    buttonClasses: 'btn btn-default btn-block btn-sm p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false
  };
  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };
  tableColumns: TableColumnMapping[] = interfaceColumnMapping;
  form: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  interfaceDetailsViewData: NetworkSummaryInterfaceDetailsViewData[] = [];

  constructor(private networkDevicesSvc: NetworkDevicesOverviewDashboardService,
    private alertDetailSvc: AimlAlertDetailsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService) {
    this.currentCriteria = { pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { datacenter: [] } };
  }

  ngOnInit(): void {
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getDatacenters();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFilterChange() {
    this.getNetworkSummary();
    this.getStatusByGroup();
    this.getAlertsBySeverity();
    this.getInterfaceSummary();
    this.getUtilization();
    this.getAlertsDetails();
    this.getInterfaceDetails();
    this.syncInterfaceDetails();
  }

  refreshData() {
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getDatacenters();
    this.buildForm();
  }

  getDatacenters() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.datacenter = [];
    this.networkDevicesSvc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenterList = data;
      this.datacenterList.forEach(datacenter => {
        this.currentCriteria.multiValueParam.datacenter.push(datacenter.uuid);
      });
      this.getNetworkSummary();
      this.getStatusByGroup();
      this.getAlertsBySeverity();
      this.getInterfaceSummary();
      this.getUtilization();
      this.getAlertsDetails();
      this.getInterfaceDetails();
      this.syncInterfaceDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Datacenters.'));
      this.spinner.stop('main');
    });
  }

  getNetworkSummary() {
    this.spinner.start(this.networkSummaryViewData.totalDevicesLoader);
    this.spinner.start(this.networkSummaryViewData.devicesLoader);
    this.networkDevicesSvc.getNetworkSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.networkSummaryViewData = this.networkDevicesSvc.convertToNetworkSummaryData(data);
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
    this.statusByGroupViewData = new NetworkStatusByGroupViewData();
    this.networkDevicesSvc.getStatusByGroupData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.networkDevicesSvc.convertToStatusByGroupViewData(res.result.data, this.statusByGroupViewData);
      }
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    });
  }

  selectbyGroup(data: NetworkStatusByGroupData, parentIndex?: number) {
    if (this.statusByGroupViewData.selectedViewType == 'Manufacturer') {
      if (data.nodeType == 'Manufacturer') {
        this.isSelected = data.selected;
        this.statusByGroupViewData.displayViewData.forEach((dv) => {
          dv.selected = false;
          dv.nodes.forEach((mdl) => {
            mdl.selected = false;
          })
        })
        data.selected = !this.isSelected;
      } else if (data.nodeType == 'Model') {
        this.isSelected = data.selected;
        this.statusByGroupViewData.displayViewData[parentIndex].nodes.forEach((dv) => {
          dv.selected = false;
        })
        data.selected = !this.isSelected;
      } else {
        this.goToDeviceDetails(data, data.monitoring.configured);
      }
    } else if (this.statusByGroupViewData.selectedViewType == 'Model') {
      if (data.nodeType == 'Model') {
        this.isSelected = data.selected;
        this.statusByGroupViewData.displayViewData.forEach((dv) => {
          dv.selected = false;
        })
        data.selected = !this.isSelected;
      } else {
        this.goToDeviceDetails(data, data.monitoring.configured);
      }
    } else {
      this.goToDeviceDetails(data, data.monitoring.configured);
    }
  }

  onSelectByGroupTypeChange() {
    this.statusByGroupViewData.displayViewData.forEach((dv) => {
      dv.nodes.forEach(dvn => {
        dvn.selected = false;
      })
      dv.selected = false;
    })
    this.isSelected = false;
    switch (this.statusByGroupViewData.selectedViewType) {
      case 'Manufacturer':
        this.statusByGroupViewData.displayViewData = this.statusByGroupViewData.manufacturerViewData;
        break;
      case 'Model':
        this.statusByGroupViewData.displayViewData = this.statusByGroupViewData.modelViewData;
        break;
      case 'Device':
        this.statusByGroupViewData.displayViewData = this.statusByGroupViewData.deviceViewData;
        break;
      default:
        this.statusByGroupViewData.displayViewData = this.statusByGroupViewData.manufacturerViewData;
        break;
    }
  }

  getClass(data: NetworkStatusByGroupData) {
    if (this.statusByGroupViewData.selectedViewType == 'Manufacturer') {
      if (data.nodeType == 'Model') {
        return 'model-margin';
      } else if (data.nodeType == 'Device') {
        return 'device-margin';
      }
    } else if (this.statusByGroupViewData.selectedViewType == 'Model') {
      if (data.nodeType == 'Device') {
        return 'model-margin';
      }
    }
    return '';
  }

  goToDeviceDetails(host: any, monitoring?: boolean) {
    switch (host.type) {
      case 'switch':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.SWITCHES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switch', host.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case 'firewall':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.FIREWALL, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', host.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case 'load_balancer':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', host.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  getAlertsBySeverity() {
    this.spinner.start(this.alertsBySeverityViewData.loader);
    this.alertsBySeverityViewData.chartData = null;
    this.networkDevicesSvc.getAlertsBySeverityData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alertsBySeverityViewData = this.networkDevicesSvc.convertToAlertsBySeverityData(data);
      if (data.events_data?.total_events) {
        this.alertsBySeverityViewData.chartData = this.networkDevicesSvc.convertToAlertsBySeverityChartData(data);
      }
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    });
  }

  getSeverityDetailsClass(value: number) {
    if (value < 0) {
      return 'fas fa-caret-down text-success';
    } else {
      return 'fas fa-caret-up text-danger';
    }
  }

  getInterfaceSummary() {
    this.spinner.start(this.interfaceSummaryViewData.loader);
    this.interfaceSummaryViewData.chartData = null;
    this.currentCriteria.params = [{ 'summary': true }];
    this.networkDevicesSvc.getInterfaceSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.total_interfaces) {
        this.interfaceSummaryViewData.chartData = this.networkDevicesSvc.convertToInterfaceSummaryChartData(data);
      }
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    });
    this.currentCriteria.params = [{}];
  }

  getUtilization() {
    this.spinner.start('NetworkSummaryCpuUtilizationLoader');
    this.spinner.start('NetworkSummaryMemoryUtilizationLoader');
    this.networkDevicesSvc.getUtilizationData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.cpuUtilizationViewData = this.networkDevicesSvc.convertToCpuUtilizationViewData(res.result.data.top_10_cpu_usage);
        this.memoryUtilizationViewData = this.networkDevicesSvc.convertToMemoryUtilizationViewData(res.result.data.top_10_memory_usage);
      }
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  getPercentageClass(value: number): string {
    return value < 65 ? 'text-success' : value >= 65 && value < 85 ? 'text-warning' : 'text-danger';
  }

  goToGraphDetails(host: any, type: string, monitoring?: boolean) {
    switch (host.type) {
      case 'switch':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.SWITCHES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switch', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case 'firewall':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.FIREWALL, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case 'load_balancer':
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      default:
    }
  }

  alertsDetailsPageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.getAlertsDetails();
  }

  getAlertsDetails() {
    this.spinner.start('NetworkSummaryAlertsDetailsLoader');
    this.networkDevicesSvc.getAlertsDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.alertsDetailsViewData = this.networkDevicesSvc.convertToAlertDetailsViewData(res.result.data);
      }
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    });
  }

  viewAlertDetails(alertId: string) {
    this.alertDetailSvc.showAlertDetails(alertId);
  }

  buildForm() {
    this.form = this.networkDevicesSvc.buildForm(this.columnsSelected);
    this.form.get('interfaceDetail').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInterfaceDetails();
    });
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.form.getRawValue().columns);
    this.spinner.stop('main');
  }

  getInterfaceDetails() {
    this.spinner.start('NetworkSummaryInterfaceDetailsLoader');
    this.currentCriteria.params = [{ 'filter_type': this.form.get('interfaceDetail').value }];
    this.networkDevicesSvc.getInterfaceDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceDetailsViewData = this.networkDevicesSvc.convertToInterfaceDetailsViewData(data.results);
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    });
    this.currentCriteria.params = [{}];
  }

  loadDetails(view: any) {
    this.goToInterfaceDetails(view);
  }

  goToInterfaceDetails(view: NetworkSummaryInterfaceDetailsViewData) {
    this.router.navigate([view.hostType, view.hostId, 'interface', view.itemId], { relativeTo: this.route });
  }

  syncInterfaceDetails() {
    this.networkDevicesSvc.syncInterfaceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInterfaceSummary();
      this.getInterfaceDetails();
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
