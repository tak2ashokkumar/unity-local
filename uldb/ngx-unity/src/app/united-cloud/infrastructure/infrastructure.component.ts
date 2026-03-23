import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { InfrastructureAlertTrendWidgetViewData, InfrastructureAlertsViewData, InfrastructureCpuAndRamUtilizationViewData, InfrastructureDcCloudCostViewData, InfrastructureDcSummaryViewData, InfrastructureDeviceSubType, InfrastructureDeviceType, InfrastructureDevicesSummaryViewData, InfrastructureHostViewData, InfrastructurePrivateCloudViewData, InfrastructurePublicCloudSummaryViewData, InfrastructureService, InfrastructureStatusByGroupData, InfrastructureStatusByGroupViewData, InfrastructureSummaryViewData, InfrastructureWidgetOption, InfrastructureWidgetOptions, deviceTypes, publicClouds } from './infrastructure.service';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { InfrastructureWidgetDeviceManufacturerType, InfrastructureWidgetDeviceModelType, InfrastructureWidgetDeviceStatusType, InfrastructureWidgetDeviceType, InfrastructureWidgetOptionsType } from './infrastructure.type';

@Component({
  selector: 'infrastructure',
  templateUrl: './infrastructure.component.html',
  styleUrls: ['./infrastructure.component.scss'],
  providers: [InfrastructureService]
})
export class InfrastructureComponent implements OnInit, AfterViewInit, OnDestroy {

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

  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'name',
    lableToDisplay: 'name',
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

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "displayName",
    keyToSelect: "name",
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
    checked: 'datacenter',
    checkedPlural: 'datacenters',
    defaultTitle: 'Select Datacenters',
    allSelected: 'All Datacenters',
  };

  cloudSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    checked: 'cloud',
    checkedPlural: 'clouds',
    defaultTitle: 'Select Clouds',
    allSelected: 'All Clouds',
  };

  deviceTypeSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    checked: 'device',
    checkedPlural: 'devices',
    defaultTitle: 'Select Devices',
    allSelected: 'All Devices',
  };

  private ngUnsubscribe = new Subject();
  datacenterList: Array<DatacenterFast> = [];
  cloudList: any[] = publicClouds;
  currentCriteria: SearchCriteria;
  dcFilter: string[] = [];
  pcFilter: string[] = publicClouds.map(c => c.name);
  summaryViewData: InfrastructureSummaryViewData = new InfrastructureSummaryViewData();
  totalDevicesViewData: InfrastructureDevicesSummaryViewData = new InfrastructureDevicesSummaryViewData();
  privateCloudViewData: InfrastructurePrivateCloudViewData = new InfrastructurePrivateCloudViewData();
  publicCloudViewData: InfrastructurePublicCloudSummaryViewData = new InfrastructurePublicCloudSummaryViewData();
  alertsDetailsViewData: InfrastructureAlertsViewData[] = [];
  dcCloudCostViewData: InfrastructureDcCloudCostViewData = new InfrastructureDcCloudCostViewData();
  dcViewData: InfrastructureDcSummaryViewData = new InfrastructureDcSummaryViewData();
  pcViewData: InfrastructureDcSummaryViewData = new InfrastructureDcSummaryViewData();
  cpuUtilizationViewData: InfrastructureCpuAndRamUtilizationViewData[] = [];
  ramUtilizationViewData: InfrastructureCpuAndRamUtilizationViewData[] = [];
  dcChartFilter: string[] = [];
  alertTrendPolarChartData: UnityChartData = new UnityChartData();
  alertTrendBarChartData: UnityChartData = new UnityChartData();
  alertTrendWidgetViewData: InfrastructureAlertTrendWidgetViewData = new InfrastructureAlertTrendWidgetViewData();
  alertTrendFilterForm: FormGroup;
  deviceTypes: Array<{ name: string, displayName: string }> = deviceTypes;
  devices: string[] = deviceTypes.map(d => d.name);
  isSelected: boolean = false;

  InfrastructureWidgetOptions: Array<InfrastructureWidgetOptionsType> = InfrastructureWidgetOptions;
  InfrastructureWidgetForm: FormGroup;
  dataType: string = InfrastructureWidgetOption.DEVICESTATUS;

  @ViewChild('scrollableTbody') scrollableTbody: ElementRef;
  private resizeObserver: ResizeObserver;
  hasScroll: boolean = false;

  constructor(private infrastructureService: InfrastructureService,
    private alertDetailSvc: AimlAlertDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.currentCriteria = { pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { datacenter: [] } };
  }

  ngOnInit(): void {
    this.getDatacenters();
  }

  ngAfterViewInit() {
    const el = this.scrollableTbody.nativeElement;
    this.hasScroll = el.scrollHeight > el.clientHeight;
    this.resizeObserver = new ResizeObserver(() => {
      this.hasScroll = el.scrollHeight > el.clientHeight;
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.resizeObserver?.disconnect();
  }

  refreshData() {
    this.getDatacenters();
    this.pcFilter = publicClouds.map(c => c.name);
  }

  getDatacenters() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.datacenter = [];
    this.datacenterList = [];
    this.dcFilter = [];
    this.dcChartFilter = [];
    this.infrastructureService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenterList = data;
      this.datacenterList.forEach(datacenter => {
        this.dcFilter.push(datacenter.uuid);
        this.dcChartFilter.push(datacenter.uuid);
      });
      this.currentCriteria.multiValueParam.datacenter = this.dcFilter;
      this.buildAlertTrendFilterForm();
      this.getInfrastructureSummary();
      this.getTotalDevicesSummary();
      this.getPrivateCloudSummary();
      this.getPublicCloudSummary();
      this.buildInfrastructureWidgetForm();
      this.getAlertsSummary();
      this.getDcCloudCost();
      this.getDcChartData();
      this.getPcChartData();
      this.getAlertTrendSummary();
      this.getCpuAndRamUtilizationSummary();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Datacenters.'));
      this.spinner.stop('main');
    });
  }

  getInfrastructureSummary() {
    this.spinner.start('InfrastructureDatacenterSummaryLoader');
    this.spinner.start('InfrastructureCabinetSummaryLoader');
    this.spinner.start('InfrastructureAlertsSummaryLoader');
    this.spinner.start('InfrastructureTotalResourcesSummaryLoader');
    this.summaryViewData = null;
    this.infrastructureService.getInfrastructureSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryViewData = this.infrastructureService.convertToInfrastructureSummaryViewData(data);
      this.spinner.stop('InfrastructureDatacenterSummaryLoader');
      this.spinner.stop('InfrastructureCabinetSummaryLoader');
      this.spinner.stop('InfrastructureAlertsSummaryLoader');
      this.spinner.stop('InfrastructureTotalResourcesSummaryLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Total Devices Summary.'));
      this.spinner.stop('InfrastructureDatacenterSummaryLoader');
      this.spinner.stop('InfrastructureCabinetSummaryLoader');
      this.spinner.stop('InfrastructureAlertsSummaryLoader');
      this.spinner.stop('InfrastructureTotalResourcesSummaryLoader');
    });
  }

  getTotalDevicesSummary() {
    this.spinner.start('TotalDevicesSummaryLoader');
    this.totalDevicesViewData = null;
    this.infrastructureService.getTotalDevicesSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.totalDevicesViewData = this.infrastructureService.convertToInfrastructureDevicesSummaryViewData(data);
      this.spinner.stop('TotalDevicesSummaryLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Total Devices Summary.'));
      this.spinner.stop('TotalDevicesSummaryLoader');
    });
  }

  getPrivateCloudSummary() {
    this.spinner.start('PrivateCloudSummaryLoader');
    this.privateCloudViewData = null;
    this.infrastructureService.getPrivateCloudSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.privateCloudViewData = this.infrastructureService.convertToPrivateCloudViewData(data);
      this.spinner.stop('PrivateCloudSummaryLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Private Cloud Summary.'));
      this.spinner.stop('PrivateCloudSummaryLoader');
    });
  }

  getPublicCloudSummary() {
    this.spinner.start('PublicCloudSummaryLoader');
    this.publicCloudViewData = null;
    this.infrastructureService.getPublicCloudSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.publicCloudViewData = this.infrastructureService.convertToPublicCloudSummaryViewData(data);
      this.spinner.stop('PublicCloudSummaryLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Public Cloud Summary.'));
      this.spinner.stop('PublicCloudSummaryLoader');
    });
  }

  buildInfrastructureWidgetForm() {
    this.InfrastructureWidgetForm = this.infrastructureService.buildInfrastructureWidgetForm();
    this.getInfrastructureStatusByGroupData(true);
    this.syncInfrastructureStatusByGroupData();
    this.InfrastructureWidgetForm.get('dataType').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type: string) => {
      this.dataType = type;
      this.getInfrastructureStatusByGroupData(true);
    });
  }

  statusByGroupViewData: InfrastructureStatusByGroupViewData = new InfrastructureStatusByGroupViewData();
  getInfrastructureStatusByGroupData(isSpinnerRequired?: boolean) {
    if (isSpinnerRequired) {
      this.spinner.start('InfrastructureSummaryStatusByGroupLoader');
    }
    this.statusByGroupViewData = new InfrastructureStatusByGroupViewData();
    this.infrastructureService.getInfrastructureStatusByGroupData(this.dataType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      switch (this.dataType) {
        case InfrastructureWidgetOption.DEVICESTATUS:
          this.infrastructureService.convertToInfrastructureWidgetDeviceStatusViewData(<InfrastructureWidgetDeviceStatusType>res, this.statusByGroupViewData);
          break;
        case InfrastructureWidgetOption.MANUFACTURER:
          this.infrastructureService.convertToInfrastructureWidgetDeviceManufacturerViewData(<InfrastructureWidgetDeviceManufacturerType>res, this.statusByGroupViewData);
          break;
        case InfrastructureWidgetOption.MODEL:
          this.infrastructureService.convertToInfrastructureWidgetDeviceModelViewData(<InfrastructureWidgetDeviceModelType>res, this.statusByGroupViewData);
          break;
        case InfrastructureWidgetOption.DEVICETYPE:
          this.infrastructureService.convertToInfrastructureWidgetDeviceTypeViewData(<InfrastructureWidgetDeviceType>res, this.statusByGroupViewData);
          break;
        default:
          this.infrastructureService.convertToInfrastructureWidgetDeviceStatusViewData(<InfrastructureWidgetDeviceStatusType>res, this.statusByGroupViewData);
          break;
      }
      this.spinner.stop('InfrastructureSummaryStatusByGroupLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('InfrastructureSummaryStatusByGroupLoader');
    });
  }

  syncInfrastructureStatusByGroupData() {
    this.infrastructureService.syncInfrastructureStatusByGroupData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInfrastructureStatusByGroupData();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getAlertsSummary() {
    this.spinner.start('AlertsSummaryLoader');
    this.alertsDetailsViewData = [];
    this.infrastructureService.getAlertsSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.alertsDetailsViewData = this.infrastructureService.convertToInfrastructureAlertsViewData(data);
      this.spinner.stop('AlertsSummaryLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Alerts Summary.'));
      this.spinner.stop('AlertsSummaryLoader');
    });
  }

  getDcCloudCost() {
    this.spinner.start('InfrastructureCostLoader');
    this.spinner.start('InfrastructureDcCostLoader');
    this.spinner.start('InfrastructureCloudCostLoader');
    this.dcCloudCostViewData = null;
    this.infrastructureService.getDcCloudCost(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.dcCloudCostViewData = this.infrastructureService.convertToDcCloudCostViewData(data);
      this.spinner.stop('InfrastructureCostLoader');
      this.spinner.stop('InfrastructureDcCostLoader');
      this.spinner.stop('InfrastructureCloudCostLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Datacenter and Cloud cost.'));
      this.spinner.stop('InfrastructureCostLoader');
      this.spinner.stop('InfrastructureDcCostLoader');
      this.spinner.stop('InfrastructureCloudCostLoader');
    });
  }

  getDcChartData() {
    this.spinner.start('InfrastructureDcChartLoader');
    this.dcViewData.total = 0;
    this.dcViewData.chartData = null;
    this.infrastructureService.getDcChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.dc_data.length) {
        this.dcViewData = this.infrastructureService.convertToDcViewData(data);
      }
      this.spinner.stop('InfrastructureDcChartLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Datacenter Summary.'));
      this.spinner.stop('InfrastructureDcChartLoader');
    });
  }

  getPcChartData() {
    this.spinner.start('InfrastructurePcChartLoader');
    this.currentCriteria.multiValueParam.datacenter = [];
    this.currentCriteria.multiValueParam['cloud'] = this.pcFilter;
    this.pcViewData.total = 0;
    this.pcViewData.chartData = null;
    this.infrastructureService.getPcChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.cloud_data.length) {
        this.pcViewData = this.infrastructureService.convertToPcViewData(data);
      }
      this.spinner.stop('InfrastructurePcChartLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cloud Summary.'));
      this.spinner.stop('InfrastructurePcChartLoader');
    });
    this.currentCriteria.multiValueParam.datacenter = this.dcFilter;
    delete this.currentCriteria.multiValueParam['cloud'];
  }

  getAlertTrendSummary() {
    this.spinner.start('InfrastructureAlertTrendLoader');
    this.spinner.start('InfrastructureRawEventsLoader');
    this.currentCriteria.multiValueParam['cloud'] = this.alertTrendFilterForm.get('clouds').value;
    this.currentCriteria.multiValueParam['device_type'] = this.alertTrendFilterForm.get('deviceTypes').value;
    this.currentCriteria.params[0]['duration'] = this.alertTrendFilterForm.get('duration').value;
    this.alertTrendPolarChartData = null;
    this.alertTrendBarChartData = null;
    this.alertTrendWidgetViewData = null;
    this.infrastructureService.getAlertTrendSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.summary.raw_events || data.summary.conditions || data.summary.alerts) {
        this.alertTrendPolarChartData = this.infrastructureService.convertToAlertTrendPolarChartData(data);
      }
      if (data.raw_events.total || data.noise_deduction.correlated || data.noise_deduction.dedupe || data.noise_deduction.suppressed || data.first_response.total) {
        this.alertTrendBarChartData = this.infrastructureService.convertToAlertTrendBarChartData(data);
      }
      this.alertTrendWidgetViewData = this.infrastructureService.convertToAlertTrendWidgetData(data);
      this.spinner.stop('InfrastructureAlertTrendLoader');
      this.spinner.stop('InfrastructureRawEventsLoader');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Alert Trend Summary.'));
      this.spinner.stop('InfrastructureAlertTrendLoader');
      this.spinner.stop('InfrastructureRawEventsLoader');
    });
    delete this.currentCriteria.multiValueParam['cloud'];
    delete this.currentCriteria.multiValueParam['device_type'];
    delete this.currentCriteria.params[0]['duration'];
  }

  getCpuAndRamUtilizationSummary() {
    this.spinner.start('InfrastructureCpuUtilizationSummaryLoader');
    this.spinner.start('InfrastructureRamUtilizationSummaryLoader');
    this.cpuUtilizationViewData = [];
    this.ramUtilizationViewData = [];
    this.infrastructureService.getCpuAndRamUtilizationSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.cpuUtilizationViewData = this.infrastructureService.convertToCpuUtilizationViewData(res.result.data.top_10_cpu_usage);
        this.ramUtilizationViewData = this.infrastructureService.convertToRamUtilizationViewData(res.result.data.top_10_memory_usage);
      }
      this.spinner.stop('InfrastructureCpuUtilizationSummaryLoader');
      this.spinner.stop('InfrastructureRamUtilizationSummaryLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Failed to get Utilization Summary.'));
      this.spinner.stop('InfrastructureCpuUtilizationSummaryLoader');
      this.spinner.stop('InfrastructureRamUtilizationSummaryLoader');
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  getPercentageClass(value: number): string {
    return value < 65 ? 'text-success' : value >= 65 && value < 85 ? 'text-warning' : 'text-danger';
  }

  getSeverityDetailsClass(value: number) {
    if (value < 0) {
      return 'fas fa-caret-down text-success';
    } else {
      return 'fas fa-caret-up text-danger';
    }
  }

  buildAlertTrendFilterForm() {
    this.alertTrendFilterForm = this.infrastructureService.buildAlertTrendFilterForm();
    this.alertTrendFilterForm.get('datacenters').setValue(this.dcFilter);
    this.alertTrendFilterForm.get('clouds').setValue(this.cloudList.map(c => c.name));
    this.alertTrendFilterForm.get('deviceTypes').setValue(this.devices);
    // this.alertTrendFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //   this.getAlertTrendSummary();
    // });
  }

  onFilterChange() {
    this.currentCriteria.multiValueParam.datacenter = this.dcFilter;
    this.alertTrendFilterForm.get('datacenters').setValue(this.dcFilter);
    this.getInfrastructureSummary();
    this.getTotalDevicesSummary();
    this.getPrivateCloudSummary();
    this.getPublicCloudSummary();
    this.buildInfrastructureWidgetForm();
    this.getAlertsSummary();
    this.getDcCloudCost();
    this.getDcChartData();
    this.getPcChartData();
    this.getAlertTrendSummary();
    this.getCpuAndRamUtilizationSummary();
  }

  onDcChartFilterChange() {
    this.currentCriteria.multiValueParam.datacenter = this.dcChartFilter;
    this.getDcChartData();
    this.currentCriteria.multiValueParam.datacenter = this.dcFilter;
  }

  onCloudChartFilterChange() {
    this.getPcChartData();
  }

  onAlertTrendFilterChange() {
    this.currentCriteria.multiValueParam.datacenter = this.alertTrendFilterForm.get('datacenters').value;
    this.getAlertTrendSummary();
    this.currentCriteria.multiValueParam.datacenter = this.dcFilter;
  }

  selectbyGroup(data: InfrastructureStatusByGroupData, parentIndex?: number) {
    if (this.dataType == InfrastructureWidgetOption.DEVICESTATUS) {
      if (data.nodeType == 'Device Status') {
        this.isSelected = data.selected;
        this.statusByGroupViewData.displayViewData.forEach((dv) => {
          dv.selected = false;
        })
        data.selected = !this.isSelected;
      } else {
        this.goToDeviceDetails(data, data.monitoring.configured);
      }
    } else if (this.dataType == InfrastructureWidgetOption.MANUFACTURER) {
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
    } else if (this.dataType == InfrastructureWidgetOption.MODEL) {
      this.isSelected = data.selected;
      if (data.nodeType == 'Model') {
        this.statusByGroupViewData.displayViewData.forEach((dv) => {
          dv.selected = false;
        })
        data.selected = !this.isSelected;
      } else {
        this.goToDeviceDetails(data, data.monitoring.configured);
      }
    } else if (this.dataType == InfrastructureWidgetOption.DEVICETYPE) {
      if (data.nodeType == 'Device Type') {
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

  getClass(data: InfrastructureStatusByGroupData) {
    if (this.dataType == InfrastructureWidgetOption.MANUFACTURER) {
      if (data.nodeType == 'Model') {
        return 'model-margin';
      } else if (data.nodeType == 'Device') {
        return 'device-margin';
      }
    } else if (this.dataType == InfrastructureWidgetOption.MODEL || this.dataType == InfrastructureWidgetOption.DEVICESTATUS || this.dataType == InfrastructureWidgetOption.DEVICETYPE) {
      if (data.nodeType == 'Device') {
        return 'model-margin';
      }
    }
    return '';
  }

  getColorClass(status: string): string {
    switch (status) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-danger';
      case 'unknown':
        return 'text-muted';
      case 'amber':
        return 'text-warning';
      default:
        break;
    }
  }

  checkDeviceTypeExist(device: InfrastructureStatusByGroupData) {
    if (device?.type) {
      if (device.type == InfrastructureDeviceType.VM) {
        let deviceSubTypes: Array<string> = ['vmware_vm', 'esxi_vm', 'hyperv_vm', 'custom_vm'];
        return deviceSubTypes.includes(device.subType) ? true : false;
      } else {
        let deviceTypes: Array<string> = ['switch', 'firewall', 'load_balancer', 'hypervisor', 'baremetal', 'mac_device', 'storage', 'sensor', 'smart_pdu', 'rfid_reader'];
        return deviceTypes.includes(device.type) ? true : false;
      }
    } else {
      return true;
    }
  }

  goToDeviceDetails(device: InfrastructureStatusByGroupData | InfrastructureHostViewData, monitoring?: boolean) {
    if (device.type == InfrastructureDeviceType.VM) {
      this.goToDeviceDetailsByDeviceSubType(device, monitoring);
    } else {
      this.goToDeviceDetailsByDeviceType(device, monitoring);
    }
  }

  goToDeviceDetailsByDeviceSubType(device: InfrastructureStatusByGroupData | InfrastructureHostViewData, monitoring?: boolean) {
    switch (device.subType) {
      case InfrastructureDeviceSubType.VMWARE_VM:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'vmware', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.ESXI_VM:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.ESXI, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'esxi', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.HYPERV_VM:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.HYPER_V, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'hyperv', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.CUSTOM_VM:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'custom', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  goToDeviceDetailsByDeviceType(device: InfrastructureStatusByGroupData | InfrastructureHostViewData, monitoring?: boolean) {
    switch (device.type) {
      case InfrastructureDeviceType.SWITCH:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SWITCHES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switch', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.FIREWALL:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.FIREWALL, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.LOAD_BALANCER:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.HYPERVISOR:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.HYPERVISOR, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['hypervisors', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.BAREMETAL:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['bmservers', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.MAC_DEVICE:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.MAC_MINI, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['macdevices', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.STORAGE:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['storagedevices', device.uuid, 'zbx', 'details'], { relativeTo: this.route });
        break;
      case InfrastructureDeviceType.SENSOR:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SENSOR, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['iot-devices', device.uuid, 'zbx', 'sensor-details'], { queryParams: { from: 'infrastructure' }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.SMART_PDU:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SMART_PDU, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['iot-devices', device.uuid, 'zbx', 'smart-pdu-details'], { queryParams: { from: 'infrastructure' }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.RFID_READER:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.RFID_READER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['iot-devices', device.uuid, 'zbx', 'rfid-reader-details'], { queryParams: { from: 'infrastructure' }, relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  goToGraphDetails(host: InfrastructureHostViewData, type: string, monitoring?: boolean) {
    if (host.type == InfrastructureDeviceType.VM) {
      this.goToGraphDetailsBySubType(host, type, monitoring);
    } else {
      this.goToGraphDetailsByType(host, type, monitoring);
    }
  }

  goToGraphDetailsBySubType(host: InfrastructureHostViewData, type: string, monitoring?: boolean) {
    switch (host.subType) {
      case InfrastructureDeviceSubType.VMWARE_VM:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'vmware', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.ESXI_VM:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.ESXI, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'esxi', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.HYPERV_VM:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.HYPER_V, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'hyperv', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceSubType.CUSTOM_VM:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['vms', 'custom', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  goToGraphDetailsByType(host: InfrastructureHostViewData, type: string, monitoring?: boolean) {
    switch (host.type) {
      case InfrastructureDeviceType.SWITCH:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.SWITCHES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['switch', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.FIREWALL:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.FIREWALL, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['firewalls', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.LOAD_BALANCER:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['load-balancers', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.HYPERVISOR:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.HYPERVISOR, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['hypervisors', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.BAREMETAL:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['bmservers', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.MAC_DEVICE:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.MAC_MINI, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['macdevices', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      case InfrastructureDeviceType.STORAGE:
        this.storageService.put('device', { name: host.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: monitoring }, StorageType.SESSIONSTORAGE);
        this.router.navigate(['storagedevices', host.uuid, 'zbx', 'monitoring-graphs'], { queryParams: { utilizationType: type }, relativeTo: this.route });
        break;
      default:
        break;
    }
  }

  viewAlertDetails(alertId: string) {
    this.alertDetailSvc.showAlertDetails(alertId);
  }

  goTo(target: string, count: number) {
    // if (count <= 0) return;
    this.router.navigate([target], { relativeTo: this.route });
  }
}
