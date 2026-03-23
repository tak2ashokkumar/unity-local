import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { deviceTypeList, IotDevicesService, IotDeviceViewData, statusList } from './iot-devices.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { from, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { IotDeviceManufacturerType, IotDeviceModelType } from '../entities/iot-device.type';
import { FormGroup } from '@angular/forms';
import { AppLevelService } from 'src/app/app-level.service';

@Component({
  selector: 'iot-devices',
  templateUrl: './iot-devices.component.html',
  styleUrls: ['./iot-devices.component.scss'],
  providers: [IotDevicesService]
})
export class IotDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  deviceTypeList: LabelValueType[] = deviceTypeList;
  manufacturerList: IotDeviceManufacturerType[] = [];
  modelList: IotDeviceModelType[] = [];
  statusList: LabelValueType[] = statusList;

  count: number = 0;
  viewData: IotDeviceViewData[] = [];

  manufacturerSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  manufacturerTexts: IMultiSelectTexts = {
    defaultTitle: 'Manufacturer',
  };

  modelSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  modelTexts: IMultiSelectTexts = {
    defaultTitle: 'Model',
  };

  statusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  @ViewChild('tagsFormRef') tagsFormRef: ElementRef;
  tagsFormModelRef: BsModalRef;
  nonFieldErr: string = '';
  tagsForm: FormGroup;
  tagsFormErrors: any;
  tagsFormValidationMessages: any;
  tagsAutocompleteItems: string[] = [];
  inputView: IotDeviceViewData;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: IotDevicesService,
    private appService: AppLevelService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ device_type: null }], multiValueParam: { manufacturer: [], model: [], status: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getManufacturers();
    this.getIotDevices();
    this.getTags();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getIotDevices();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getIotDevices();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getIotDevices();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ device_type: null }], multiValueParam: { manufacturer: [], model: [], status: [] } };
    this.modelList = [];
    this.getIotDevices();
  }

  onDeviceTypeOrManufacturerFilterChange() {
    this.onFilterChange();
    if (this.currentCriteria?.params[0]?.device_type && this.currentCriteria?.multiValueParam?.manufacturer?.length) {
      this.getModels();
    }
  }

  onModelFilterChange() {
    if (this.currentCriteria?.params[0]?.device_type && this.currentCriteria?.multiValueParam?.manufacturer?.length) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = 1;
      this.getIotDevices();
    }
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getIotDevices();
  }

  getManufacturers() {
    this.manufacturerList = [];
    this.svc.getManufacturers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturerList = res;
    });
  }

  getModels() {
    this.modelList = [];
    this.svc.getModels(this.currentCriteria?.params[0]?.device_type, this.currentCriteria?.multiValueParam?.manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modelList = res;
    });
  }

  getIotDevices() {
    this.svc.getIotDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToIotDevicesViewData(res.results);
      this.getDeviceData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinner.stop('main');
    })
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToDetails(view: IotDeviceViewData) {
    this.storageService.put('device', { name: view.name, deviceType: this.utilSvc.getDeviceMappingByDeviceType(view.deviceType), configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.deviceType == 'sensor') {
      this.router.navigate([view.deviceId, 'zbx', 'sensor-overview'], { relativeTo: this.route });
    } else if (view.deviceType == 'smart_pdu') {
      this.router.navigate([view.deviceId, 'zbx', 'smart-pdu-details'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.deviceId, 'zbx', 'rfid-reader-details'], { relativeTo: this.route });
    }
  }

  goToStats(view: IotDeviceViewData) {
    if (!view.isStatsButtonEnabled) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: this.utilSvc.getDeviceMappingByDeviceType(view.deviceType), configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.deviceId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  updateTags(view: IotDeviceViewData) {
    this.inputView = view;
    this.tagsForm = this.svc.createTagsForm(view.tags);
    this.tagsFormErrors = this.svc.resetTagsFormErrors();
    this.tagsFormValidationMessages = this.svc.tagsFormValidationMessages;
    this.tagsFormModelRef = this.modalService.show(this.tagsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitTags() {
    this.spinner.start('main');
    this.svc.updateTags(<{ tags: string[] }>this.tagsForm.getRawValue(), this.inputView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tagsFormModelRef.hide();
      this.getIotDevices();
      this.notification.success(new Notification('Tags updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.tagsFormModelRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }

}
