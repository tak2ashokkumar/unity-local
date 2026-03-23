import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterCabinetsFast, DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { InfrastructureIotDevicesService, IOTDevicesAirflowWidgetViewData, IOTDevicesHumidityWidgetViewData, IOTDevicesRecentEventsViewData, IOTDevicesStatusByGroupData, IOTDevicesStatusByGroupViewData, IOTDevicesSummaryViewData, IOTDevicesTemperatureWidgetViewData, IotDevicesTypes, RecentModifiedRFIDTagsViewData, SmartPDUViewData } from './infrastructure-iot-devices.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'infrastructure-iot-devices',
  templateUrl: './infrastructure-iot-devices.component.html',
  styleUrls: ['./infrastructure-iot-devices.component.scss'],
  providers: [InfrastructureIotDevicesService]
})
export class InfrastructureIotDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private temperatureWidgetTrendChartCabinetSubscr: Subscription;
  private temperatureWidgetTrendChartDeviceSubscr: Subscription;
  private humidityWidgetTrendChartDeviceSubscr: Subscription;
  private airflowWidgetTrendChartDeviceSubscr: Subscription;
  currentCriteria: SearchCriteria;

  datacenterList: Array<DatacenterFast> = [];
  cabinetList: Array<DatacenterCabinetsFast> = [];
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

  summaryData = new IOTDevicesSummaryViewData();

  statusByGroupViewData: IOTDevicesStatusByGroupViewData = new IOTDevicesStatusByGroupViewData();
  isSelected: boolean = false;

  smartPDUsViewData: SmartPDUViewData[] = [];
  temperatureWidgetViewData = new IOTDevicesTemperatureWidgetViewData();
  humidityWidgetViewData = new IOTDevicesHumidityWidgetViewData();
  airflowWidgetViewData = new IOTDevicesAirflowWidgetViewData();
  recentModifiedRFIDTagsViewData: RecentModifiedRFIDTagsViewData[] = [];
  recentEventsViewData: IOTDevicesRecentEventsViewData[] = [];

  isInitialPageLoad: boolean = true;

  constructor(private svc: InfrastructureIotDevicesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,) {
    this.currentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { datacenter: [] } };
  }

  ngOnInit(): void {
    this.getDatacenters();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDatacenters();
  }

  onFilterChange() {
    this.cabinetList = [];
    this.datacenterList.forEach(dc => {
      let exists = this.currentCriteria.multiValueParam.datacenter.includes(dc.uuid);
      if (exists) {
        this.cabinetList.push(...dc.cabinets);
      }
    });
    this.getSummaryData();
  }

  getDatacenters() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.datacenter = [];
    this.svc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenterList = data;
      this.cabinetList = [];
      this.datacenterList.forEach(dc => {
        this.currentCriteria.multiValueParam.datacenter.push(dc.uuid);
        this.cabinetList.push(...dc.cabinets);
      });
      this.getSummaryData();
    }, (err: HttpErrorResponse) => {
      this.isInitialPageLoad = false;
      this.notification.error(new Notification('Failed to get Datacenters.'));
      this.spinner.stop('main');
    });
  }

  getSummaryData() {
    this.svc.getSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData = this.svc.convertToSummaryViewData(data);
      if (this.summaryData?.totalDevices && this.summaryData?.totalDevices.total > 0) {
        this.getStatusByGroup();
        this.getSmartPDUs();
        this.getRecentModifiedRFIDTags();
        this.getRecentEvents();
        setTimeout(() => {
          if (this.cabinetList.length > 0) {
            this.spinner.start(this.temperatureWidgetViewData.loader);
            this.getTemperatureWidgetSummaryData();
            this.getTemperatureWidgetTop5SensorsData();
            const cabinetId = this.cabinetList[0]?.id;
            this.temperatureWidgetViewData.trendChartDeviceSelectionForm.get('cabinet').setValue(cabinetId, { emitEvent: false });
            this.handleTemperatureWidgetTrendChartCabinetValueChange();
            this.getIotDevicesByCabinet(cabinetId);

            this.spinner.start(this.humidityWidgetViewData.loader);
            this.spinner.start(this.airflowWidgetViewData.loader);
            this.getHumidityWidgetSummaryData();
            this.getAirflowWidgetSummaryData();
            this.getIotDevicesBySensorDeviceType();
          }
          this.isInitialPageLoad = false;
        }, 2);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch IOT Devices Summary.'));
    });
  }

  getIotDevicesByCabinet(cabinetId: number) {
    this.svc.getIotDevicesByCabinet(cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.temperatureWidgetViewData.devicesList = data;
      this.temperatureWidgetViewData.trendChartDeviceSelectionForm.get('device').setValue(this.temperatureWidgetViewData?.devicesList[0]?.uuid, { emitEvent: false });
      if (this.temperatureWidgetTrendChartDeviceSubscr && !this.temperatureWidgetTrendChartDeviceSubscr.closed) {
        this.temperatureWidgetTrendChartDeviceSubscr.unsubscribe();
      }
      this.temperatureWidgetTrendChartDeviceSubscr = this.temperatureWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.getTemperatureWidgetTrendData(true);
      })
      this.getTemperatureWidgetTrendData();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get devices by canbinet.'));
      this.spinner.stop('main');
    });
  }

  getIotDevicesBySensorDeviceType() {
    this.svc.getIotDevicesBySensorDeviceType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.humidityWidgetViewData.devicesList = res;
      this.airflowWidgetViewData.devicesList = res;
      this.humidityWidgetViewData?.trendChartDeviceSelectionForm.get('device').setValue(this.humidityWidgetViewData?.devicesList[0]?.uuid, { emitEvent: false });
      if (this.humidityWidgetTrendChartDeviceSubscr && !this.humidityWidgetTrendChartDeviceSubscr.closed) {
        this.humidityWidgetTrendChartDeviceSubscr.unsubscribe();
      }
      this.humidityWidgetTrendChartDeviceSubscr = this.humidityWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.getHumidityWidgetTrendData(true);
      })
      this.airflowWidgetViewData?.trendChartDeviceSelectionForm.get('device').setValue(this.airflowWidgetViewData?.devicesList[0]?.uuid, { emitEvent: false });
      if (this.airflowWidgetTrendChartDeviceSubscr && !this.airflowWidgetTrendChartDeviceSubscr.closed) {
        this.airflowWidgetTrendChartDeviceSubscr.unsubscribe();
      }
      this.airflowWidgetTrendChartDeviceSubscr = this.airflowWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.getAirflowWidgetTrendData(true);
      })
      this.getHumidityWidgetTrendData();
      this.getAirflowWidgetTrendData();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get devices by canbinet.'));
      this.spinner.stop('main');
    })
  }

  getStatusByGroup() {
    this.spinner.start('IOTDevicesStatusByGroupLoader');
    this.statusByGroupViewData = new IOTDevicesStatusByGroupViewData();
    this.svc.getStatusByGroupData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.result?.data) {
        this.svc.convertToStatusByGroupViewData(res.result.data, this.statusByGroupViewData);
      }
      this.spinner.stop('IOTDevicesStatusByGroupLoader');
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification('Something went wrong !. Try again later.'));
      this.spinner.stop('IOTDevicesStatusByGroupLoader');
    });
  }

  getClass(data: IOTDevicesStatusByGroupData) {
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

  selectbyGroup(data: IOTDevicesStatusByGroupData, parentIndex?: number) {
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
        this.goToDeviceDetails(data);
      }
    } else if (this.statusByGroupViewData.selectedViewType == 'Model') {
      if (data.nodeType == 'Model') {
        this.isSelected = data.selected;
        this.statusByGroupViewData.displayViewData.forEach((dv) => {
          dv.selected = false;
        })
        data.selected = !this.isSelected;
      } else {
        this.goToDeviceDetails(data);
      }
    } else {
      this.goToDeviceDetails(data);
    }
  }

  goToDeviceDetails(device: IOTDevicesStatusByGroupData | SmartPDUViewData) {
    switch (device.type) {
      case IotDevicesTypes.SENSOR:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SENSOR, configured: device?.monitoring?.configured }, StorageType.SESSIONSTORAGE);
        this.router.navigate([device.uuid, 'zbx', 'sensor-details'], { queryParams: { from: 'iot-devices' }, relativeTo: this.route });
        break;
      case IotDevicesTypes.SMART_PDU:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.SMART_PDU, configured: device?.monitoring?.configured }, StorageType.SESSIONSTORAGE);
        this.router.navigate([device.uuid, 'zbx', 'smart-pdu-details'], { queryParams: { from: 'iot-devices' }, relativeTo: this.route });
        break;
      case IotDevicesTypes.RFID_READER:
        this.storageService.put('device', { name: device.name, deviceType: DeviceMapping.RFID_READER, configured: device?.monitoring?.configured }, StorageType.SESSIONSTORAGE);
        this.router.navigate([device.uuid, 'zbx', 'rfid-reader-details'], { queryParams: { from: 'iot-devices' }, relativeTo: this.route });
        break;
      default:
        break;
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

  getSmartPDUs() {
    this.spinner.start('SmartPDUsLoader');
    this.svc.getSmartPDUs(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.smartPDUsViewData = this.svc.convertToSmartPDUViewData(data.results);
      this.spinner.stop('SmartPDUsLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('SmartPDUsLoader');
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  onSelectTemperatureWidgetDateRange(event: any) {
    this.temperatureWidgetViewData.dateRangeformData = event;

    if (!this.isInitialPageLoad) {
      this.spinner.start(this.temperatureWidgetViewData.loader);

      this.temperatureWidgetViewData.isSummaryApiCallCompleted = false;
      this.temperatureWidgetViewData.isTrendApiCallCompleted = false;
      this.temperatureWidgetViewData.isTop5SensorApiCallCompleted = false;

      this.getTemperatureWidgetSummaryData();
      this.getTemperatureWidgetTop5SensorsData();
      this.getTemperatureWidgetTrendData();
    }
  }

  handleTemperatureWidgetTrendChartCabinetValueChange() {
    if (this.temperatureWidgetTrendChartCabinetSubscr && !this.temperatureWidgetTrendChartCabinetSubscr.closed) {
      this.temperatureWidgetTrendChartCabinetSubscr.unsubscribe();
    }
    this.temperatureWidgetTrendChartCabinetSubscr = this.temperatureWidgetViewData?.trendChartDeviceSelectionForm?.get('cabinet')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.temperatureWidgetViewData.trendChartData = null;
      this.temperatureWidgetViewData.devicesList = [];
      this.temperatureWidgetViewData.trendChartDeviceSelectionForm.get('device').setValue(null, { emitEvent: false });
      this.getIotDevicesByCabinetAndUpdateTemperatureWidgetTrendChartDevicesList(value);
    })
  }

  getIotDevicesByCabinetAndUpdateTemperatureWidgetTrendChartDevicesList(value: number) {
    this.spinner.start(this.temperatureWidgetViewData.trendChartDataLoader);
    this.svc.getIotDevicesByCabinet(value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.temperatureWidgetViewData.devicesList = data;
      this.spinner.stop(this.temperatureWidgetViewData.trendChartDataLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.temperatureWidgetViewData.trendChartDataLoader);
      this.notification.error(new Notification('Failed to get devices by canbinet.'));
      this.spinner.stop('main');
    });
  }

  isTemperatureWidgetApiCallsCompleted(widgetType: string) {
    switch (widgetType) {
      case 'summary':
        this.temperatureWidgetViewData.isSummaryApiCallCompleted = true;
        break;
      case 'trend':
        this.temperatureWidgetViewData.isTrendApiCallCompleted = true;
        break;
      case 'top5Sensors':
        this.temperatureWidgetViewData.isTop5SensorApiCallCompleted = true;
        break;
    }
    const isAllTemperatureWidgetApiCallCompleted = this.temperatureWidgetViewData?.isSummaryApiCallCompleted && this.temperatureWidgetViewData?.isTop5SensorApiCallCompleted && this.temperatureWidgetViewData?.isTrendApiCallCompleted;
    if (isAllTemperatureWidgetApiCallCompleted) {
      this.spinner.stop(this.temperatureWidgetViewData.loader);
    }
  }

  getTemperatureWidgetSummaryData() {
    this.temperatureWidgetViewData.summary = null;
    this.svc.getTemperatureWidgetSummaryData(this.currentCriteria, this.temperatureWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.temperatureWidgetViewData.summary = res;
      this.isTemperatureWidgetApiCallsCompleted('summary');
    }, (err: HttpErrorResponse) => {
      this.isTemperatureWidgetApiCallsCompleted('summary');
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getTemperatureWidgetTop5SensorsData() {
    this.temperatureWidgetViewData.top5DevicesChartData = null;
    this.svc.getTemperatureWidgetTop5SensorsData(this.currentCriteria, this.temperatureWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.temperatureWidgetViewData.top5DevicesChartData = this.svc.getTop5DevicesByTemperatureChartData(res);
      this.isTemperatureWidgetApiCallsCompleted('top5Sensors');
    }, (err: HttpErrorResponse) => {
      this.isTemperatureWidgetApiCallsCompleted('top5Sensors');
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getTemperatureWidgetTrendData(isAfterDeviceChange?: boolean) {
    this.temperatureWidgetViewData.trendChartData = null;
    if (this.temperatureWidgetViewData.devicesList.length == 0) {
      this.isTemperatureWidgetApiCallsCompleted('trend');
      return;
    }
    if (isAfterDeviceChange) {
      this.spinner.start(this.temperatureWidgetViewData.trendChartDataLoader);
    }
    this.svc.getTemperatureWidgetTrendData(this.currentCriteria, this.temperatureWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.temperatureWidgetViewData.trendChartData = this.svc.getTemperatureTrendChart(res, this.temperatureWidgetViewData.dateRangeformData);
      if (isAfterDeviceChange) {
        this.spinner.stop(this.temperatureWidgetViewData.trendChartDataLoader);
      } else {
        this.isTemperatureWidgetApiCallsCompleted('trend');
      }
    }, (err: HttpErrorResponse) => {
      if (isAfterDeviceChange) {
        this.spinner.stop(this.temperatureWidgetViewData.trendChartDataLoader);
      } else {
        this.isTemperatureWidgetApiCallsCompleted('trend');
      }
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  onSelectHumiditySummaryWidgetDateRange(event: any) {
    this.humidityWidgetViewData.dateRangeformData = event;
    if (!this.isInitialPageLoad) {
      this.spinner.start(this.humidityWidgetViewData.loader);

      this.humidityWidgetViewData.isSummaryApiCallCompleted = false;
      this.humidityWidgetViewData.isTrendApiCallCompleted = false;

      this.getHumidityWidgetSummaryData();
      this.getHumidityWidgetTrendData();
    }
  }

  isHumidityWidgetApiCallsCompleted(widgetType: string) {
    if (widgetType == 'summary') {
      this.humidityWidgetViewData.isSummaryApiCallCompleted = true;
    } else {
      this.humidityWidgetViewData.isTrendApiCallCompleted = true;
    }
    const isAllHumidityWidgetApiCallCompleted = this.humidityWidgetViewData?.isSummaryApiCallCompleted && this.humidityWidgetViewData?.isTrendApiCallCompleted;
    if (isAllHumidityWidgetApiCallCompleted) {
      this.spinner.stop(this.humidityWidgetViewData.loader);
    }
  }

  getHumidityWidgetSummaryData() {
    this.humidityWidgetViewData.summary = null;
    this.svc.getHumidityWidgetSummaryData(this.currentCriteria, this.humidityWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.humidityWidgetViewData.summary = res;
      this.isHumidityWidgetApiCallsCompleted('summary');
    }, (err: HttpErrorResponse) => {
      this.isHumidityWidgetApiCallsCompleted('summary');
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getHumidityWidgetTrendData(isAfterDeviceChange?: boolean) {
    this.humidityWidgetViewData.trendChartData = null;
    if (this.humidityWidgetViewData.devicesList.length == 0) {
      this.isHumidityWidgetApiCallsCompleted('trend');
      return;
    }
    if (isAfterDeviceChange) {
      this.spinner.start(this.humidityWidgetViewData.trendChartDataLoader);
    }
    this.svc.getHumidityWidgetTrendData(this.currentCriteria, this.humidityWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.humidityWidgetViewData.trendChartData = this.svc.getHumidityTrendChart(res, this.humidityWidgetViewData.dateRangeformData);
      if (isAfterDeviceChange) {
        this.spinner.stop(this.humidityWidgetViewData.trendChartDataLoader);
      } else {
        this.isHumidityWidgetApiCallsCompleted('trend');
      }
    }, (err: HttpErrorResponse) => {
      if (isAfterDeviceChange) {
        this.spinner.stop(this.humidityWidgetViewData.trendChartDataLoader);
      } else {
        this.isHumidityWidgetApiCallsCompleted('trend');
      }
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  onSelectAirflowWidgetDateRange(event: any) {
    this.airflowWidgetViewData.dateRangeformData = event;
    if (!this.isInitialPageLoad) {
      this.spinner.start(this.airflowWidgetViewData.loader);

      this.airflowWidgetViewData.isSummaryApiCallCompleted = false;
      this.airflowWidgetViewData.isTrendApiCallCompleted = false;

      this.getAirflowWidgetSummaryData();
      this.getAirflowWidgetTrendData();
    }
  }

  isAirflowWidgetApiCallsCompleted(widgetType: string) {
    if (widgetType == 'summary') {
      this.airflowWidgetViewData.isSummaryApiCallCompleted = true;
    } else {
      this.airflowWidgetViewData.isTrendApiCallCompleted = true;
    }
    const isAllAirflowWidgetApiCallCompleted = this.airflowWidgetViewData?.isSummaryApiCallCompleted && this.airflowWidgetViewData?.isTrendApiCallCompleted;
    if (isAllAirflowWidgetApiCallCompleted) {
      this.spinner.stop(this.airflowWidgetViewData.loader);
    }
  }

  getAirflowWidgetSummaryData() {
    this.airflowWidgetViewData.summary = null;
    this.svc.getAirflowWidgetSummaryData(this.currentCriteria, this.airflowWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.airflowWidgetViewData.summary = res;
      this.isAirflowWidgetApiCallsCompleted('summary');
    }, (err: HttpErrorResponse) => {
      this.isAirflowWidgetApiCallsCompleted('summary');
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getAirflowWidgetTrendData(isAfterDeviceChange?: boolean) {
    this.airflowWidgetViewData.trendChartData = null;
    if (this.airflowWidgetViewData.devicesList.length == 0) {
      this.isAirflowWidgetApiCallsCompleted('trend');
      return;
    }
    if (isAfterDeviceChange) {
      this.spinner.start(this.airflowWidgetViewData.trendChartDataLoader);
    }
    this.svc.getAirflowWidgetTrendData(this.currentCriteria, this.airflowWidgetViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.airflowWidgetViewData.trendChartData = this.svc.getAirflowTrendChart(res, this.airflowWidgetViewData.dateRangeformData);
      if (isAfterDeviceChange) {
        this.spinner.stop(this.airflowWidgetViewData.trendChartDataLoader);
      } else {
        this.isAirflowWidgetApiCallsCompleted('trend');
      }
    }, (err: HttpErrorResponse) => {
      if (isAfterDeviceChange) {
        this.spinner.stop(this.airflowWidgetViewData.trendChartDataLoader);
      } else {
        this.isAirflowWidgetApiCallsCompleted('trend');
      }
      this.notification.error(new Notification('Something went wrong !. Try again later.'));
    });
  }

  getRecentModifiedRFIDTags() {
    this.spinner.start('RecentModifiedRFIDTagsLoader');
    this.svc.getRecentModifiedRFIDTags(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.recentModifiedRFIDTagsViewData = this.svc.convertToRecentModifiedRFIDTagsViewData(data.results);
      this.spinner.stop('RecentModifiedRFIDTagsLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('RecentModifiedRFIDTagsLoader');
      this.notification.error(new Notification('Failed to fetch RFID tags data.'));
    });
  }

  getRecentEvents() {
    this.spinner.start('RecentEventsLoader');
    this.svc.getRecentEvents(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.recentEventsViewData = this.svc.convertToRecentEventsViewData(data.results);
      this.spinner.stop('RecentEventsLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('RecentEventsLoader');
      this.notification.error(new Notification('Failed to fetch recent events.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
