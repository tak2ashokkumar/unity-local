import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { InfrastructureNetworkDevicesService, NetworkStatusByGroupData, NetworkStatusByGroupViewData, NetworkSummaryAlertsBySeverityViewData, NetworkSummaryAlertsDetailsViewData, NetworkSummaryInterfaceDetailsViewData, NetworkSummaryInterfaceSummaryViewData, NetworkSummaryUtilizationViewData, NetworkSummaryViewData, interfaceColumnMapping } from './infrastructure-network-devices.service';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';


@Component({
  selector: 'infrastructure-network-devices',
  templateUrl: './infrastructure-network-devices.component.html',
  styleUrls: ['./infrastructure-network-devices.component.scss'],
  providers: [InfrastructureNetworkDevicesService]
})
export class InfrastructureNetworkDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  datacenterList: Array<DatacenterFast> = [];
  networkSummaryViewData: NetworkSummaryViewData = new NetworkSummaryViewData();
  alertsBySeverityViewData: NetworkSummaryAlertsBySeverityViewData = new NetworkSummaryAlertsBySeverityViewData();
  cpuUtilizationViewData: NetworkSummaryUtilizationViewData[] = [];
  memoryUtilizationViewData: NetworkSummaryUtilizationViewData[] = [];
  interfaceSummaryViewData: NetworkSummaryInterfaceSummaryViewData = new NetworkSummaryInterfaceSummaryViewData();
  alertsDetailsViewData: NetworkSummaryAlertsDetailsViewData[] = [];
  interfaceDetailsViewData: NetworkSummaryInterfaceDetailsViewData[] = [];
  tableColumns: TableColumnMapping[] = interfaceColumnMapping;
  form: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  isSelected: boolean = false;

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

  constructor(private summaryService: InfrastructureNetworkDevicesService,
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
    this.ngUnsubscribe.complete()
  }

  refreshData() {
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getDatacenters();
    this.buildForm();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.getAlertsDetails();
  }

  getDatacenters() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.datacenter = [];
    this.summaryService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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

  statusByGroupViewData: NetworkStatusByGroupViewData = new NetworkStatusByGroupViewData();
  getStatusByGroup() {
    this.spinner.start('NetworkSummaryStatusByGroupLoader');
    this.statusByGroupViewData = new NetworkStatusByGroupViewData();
    this.summaryService.getStatusByGroupData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.summaryService.convertToStatusByGroupViewData(res.result.data, this.statusByGroupViewData);
      }
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryStatusByGroupLoader');
    });
  }

  getAlertsBySeverity() {
    this.spinner.start(this.alertsBySeverityViewData.loader);
    this.alertsBySeverityViewData.chartData = null;
    this.summaryService.getAlertsBySeverityData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alertsBySeverityViewData = this.summaryService.convertToAlertsBySeverityData(data);
      if (data.events_data.total_events) {
        this.alertsBySeverityViewData.chartData = this.summaryService.convertToAlertsBySeverityChartData(data);
      }
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.alertsBySeverityViewData.loader);
    });
  }

  getUtilization() {
    this.spinner.start('NetworkSummaryCpuUtilizationLoader');
    this.spinner.start('NetworkSummaryMemoryUtilizationLoader');
    this.summaryService.getUtilizationData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.cpuUtilizationViewData = this.summaryService.convertToCpuUtilizationViewData(res.result.data.top_10_cpu_usage);
        this.memoryUtilizationViewData = this.summaryService.convertToMemoryUtilizationViewData(res.result.data.top_10_memory_usage);
      }
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryCpuUtilizationLoader');
      this.spinner.stop('NetworkSummaryMemoryUtilizationLoader');
    });
  }

  getAlertsDetails() {
    this.spinner.start('NetworkSummaryAlertsDetailsLoader');
    this.summaryService.getAlertsDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.alertsDetailsViewData = this.summaryService.convertToAlertDetailsViewData(res.result.data);
      }
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryAlertsDetailsLoader');
    });
  }

  getInterfaceSummary() {
    this.spinner.start(this.interfaceSummaryViewData.loader);
    this.interfaceSummaryViewData.chartData = null;
    this.currentCriteria.params = [{ 'summary': true }];
    let params 
    this.summaryService.getInterfaceSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.total_interfaces) {
        this.interfaceSummaryViewData.chartData = this.summaryService.convertToInterfaceSummaryChartData(data);
      }
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop(this.interfaceSummaryViewData.loader);
    });
    this.currentCriteria.params = [{}];
  }

  getInterfaceDetails() {
    this.spinner.start('NetworkSummaryInterfaceDetailsLoader');
    this.currentCriteria.params = [{ 'filter_type': this.form.get('interfaceDetail').value }];
    this.summaryService.getInterfaceDetailsData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.interfaceDetailsViewData = this.summaryService.convertToInterfaceDetailsViewData(data.results);
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('NetworkSummaryInterfaceDetailsLoader');
    });
    this.currentCriteria.params = [{}];
  }

  syncInterfaceDetails() {
    this.summaryService.syncInterfaceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInterfaceSummary();
      this.getInterfaceDetails();
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

  buildForm() {
    this.form = this.summaryService.buildForm(this.columnsSelected);
    this.form.get('interfaceDetail').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInterfaceDetails();
    });
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.form.getRawValue().columns);
    this.spinner.stop('main');
  }

  onFilterChange() {
    this.getNetworkSummary();
    this.getStatusByGroup();
    this.getAlertsBySeverity();
    this.getAlertsDetails();
    this.getInterfaceSummary();
    this.getInterfaceDetails();
    this.syncInterfaceDetails();
    this.getUtilization();
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

  loadDetails(view: any) {
    this.goToInterfaceDetails(view);
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

  goToInterfaceDetails(view: NetworkSummaryInterfaceDetailsViewData) {
    this.router.navigate([view.hostType, view.hostId, 'interface', view.itemId], { relativeTo: this.route });
  }

  viewAlertDetails(alertId: string) {
    this.alertDetailSvc.showAlertDetails(alertId);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
