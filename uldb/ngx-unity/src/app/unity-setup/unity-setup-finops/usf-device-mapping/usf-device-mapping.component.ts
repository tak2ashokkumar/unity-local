import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { deviceTypes, UsfDeviceMappingService } from './usf-device-mapping.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';
import { IPageInfo } from 'ngx-virtual-scroller';
import { DeviceDataType } from '../unity-setup-finops.type';

@Component({
  selector: 'usf-device-mapping',
  templateUrl: './usf-device-mapping.component.html',
  styleUrls: ['./usf-device-mapping.component.scss'],
  providers: [UsfDeviceMappingService]
})
export class UsfDeviceMappingComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  nonFieldErr: string;

  action: 'Update';
  uuid: string;
  viewData: any;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  deviceTypes = deviceTypes;
  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 4,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };
  deviceTypeSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Device Type',
    checkedPlural: 'device types selected'
  };
  devicesCriteria: SearchCriteria;
  deviceCount: number = 0;
  devices: DeviceDataType[] = [];
  devicesToBeSelected: DeviceDataType[] = [];
  devicesToBeRemoved: DeviceDataType[] = [];
  selectedDevices: DeviceDataType[] = [];
  devicesLoading: boolean = false;

  constructor(private svc: UsfDeviceMappingService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.uuid = params.get('Id');
    });
    this.devicesCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { device_type: [] } };
  }

  ngOnInit(): void {    
    this.spinner.start('main');
    this.getMappedDevices();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMappedDevices() {
    this.svc.getMappedDevicesForBB(this.uuid).subscribe((res: any) => {
      this.viewData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error.error));
      this.spinner.stop('main');
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.viewData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.form.get('device_types')?.value?.length > 0) {
      this.getDevicesByDeviceTypes();
      let selectedDevices = this.form.get('devices').value;
      selectedDevices.forEach(d => {
        d.deviceIcon = this.svc.getIconByDeviceType(d.device_type);
      })
      this.selectedDevices = selectedDevices;
    }
  }

  getDevicesByDeviceTypes() {
    let device_types = this.form.get('device_types')?.value;
    if (device_types?.length > 0) {
      this.spinner.start('devicesList');
      this.devices = [];
      this.deviceCount = 0;
      this.devicesLoading = true;
      this.devicesCriteria.pageNo = 1;
      this.devicesCriteria.pageSize = 10;
      this.devicesCriteria.multiValueParam.device_type = this.form.get('device_types').value;
      this.svc.getDevicesByDeviceTypes(this.devicesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.deviceCount = res.count;
        this.devices = res.results;
        this.devicesLoading = false;
        this.spinner.stop('devicesList');
      }, (err: HttpErrorResponse) => {
        this.devicesLoading = false;
        this.spinner.stop('devicesList');
      })
    }
  }

  onDeviceSearched(event: string) {
    this.devicesCriteria.searchValue = event;
    this.devicesCriteria.pageNo = 1;
    this.getDevicesByDeviceTypes();
  }

  isDeviceInSelectedList(device: DeviceDataType) {
    let d = this.selectedDevices.find(sd => sd.uuid == device.uuid);
    if (d) {
      return true;
    }
    return false;
  }

  onClickToSelectDevice(device: DeviceDataType) {
    if (this.devicesToBeSelected.length) {
      let deviceExistsInIndex = this.devicesToBeSelected.findIndex(d => d.uuid == device.uuid);
      if (deviceExistsInIndex == -1) {
        this.devicesToBeSelected.push(_clone(device));
      } else {
        this.devicesToBeSelected.splice(deviceExistsInIndex, 1);
      }
    } else {
      this.devicesToBeSelected.push(_clone(device));
    }
  }

  devicesSelectedClass(device: DeviceDataType) {
    if (!this.devicesToBeSelected.length && !this.selectedDevices.length) {
      return `far fa-square`;
    }
    for (let i = 0; i < this.devicesToBeSelected.length; i++) {
      let d = this.devicesToBeSelected.find(dtbs => dtbs.uuid == device.uuid);
      if (d) {
        return "fas fa-check-square";
      }
    }
    for (let i = 0; i < this.selectedDevices.length; i++) {
      let d = this.selectedDevices.find(sd => sd.uuid == device.uuid);
      if (d) {
        return "fas fa-check-square";
      }
    }
    return "far fa-square";
  }

  addToSelectedDevices() {
    if (this.selectedDevices.length) {
      for (let i = 0; i < this.devicesToBeSelected.length; i++) {
        let deviceExistsInIndex = this.selectedDevices.findIndex(sd => sd.uuid == this.devicesToBeSelected[i].uuid);
        if (deviceExistsInIndex == -1) {
          this.selectedDevices.push(_clone(this.devicesToBeSelected[i]));
        }
      }
    } else {
      this.selectedDevices = this.selectedDevices.concat(this.devicesToBeSelected);
    }
    this.devicesToBeSelected = [];
  }

  removeDeviceFromSelection(device: DeviceDataType) {
    if (device.toBeRemoved) {
      let deviceIndex = this.devicesToBeRemoved.findIndex(d => d.uuid == device.uuid);
      if (deviceIndex != -1) {
        this.devicesToBeRemoved.splice(deviceIndex, 1);
      }
      device.toBeRemoved = false;
    } else {
      device.toBeRemoved = true;
      this.devicesToBeRemoved.push(_clone(device));
    }
  }

  removeFromSelectedDevices() {
    this.selectedDevices = this.selectedDevices.filter(sd => !sd.toBeRemoved);
    this.devicesToBeRemoved = [];
  }

  onSelectedSearch(event: string) { }

  fetchMoreDevices(event: IPageInfo) {
    let returnCondition = !this.devices.length || this.devicesLoading ||
      this.deviceCount <= this.devices.length ||
      (this.devices.length % this.devicesCriteria.pageSize) != 0 ||
      event.endIndex != (this.devices.length - 1);

    if (returnCondition) {
      return;
    }

    this.devicesLoading = true;
    this.devicesCriteria.pageNo = Math.ceil(this.devices.length / this.devicesCriteria.pageSize + 1);
    this.svc.getDevicesByDeviceTypes(this.devicesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCount = res.count;
      this.devices = this.devices.concat(res.results);
      this.devicesLoading = false;
    }, (err: HttpErrorResponse) => {
      this.devicesLoading = false;
    })
  }

  manageSelectedDevices() {
      if (this.selectedDevices.length > 0) {
        this.selectedDevices.forEach(sd => sd.selected = true);
      }
      this.form.get('devices').setValue(this.selectedDevices);
  }

  submit() {
    this.manageSelectedDevices();
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      let obj = Object.assign({}, this.form.getRawValue());
      this.svc.submit(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.goBack();
        this.notification.success(new Notification('Devices Mapped to Building Block successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      });
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
