import { Component, OnDestroy, OnInit } from '@angular/core';
import { deviceTypesOptions, NcDeviceGroupsCrudService } from './nc-device-groups-crud.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { NCMDeviceGroupType, NCMDevicesType } from '../nc-device-groups.type';

@Component({
  selector: 'nc-device-groups-crud',
  templateUrl: './nc-device-groups-crud.component.html',
  styleUrls: ['./nc-device-groups-crud.component.scss'],
  providers: [NcDeviceGroupsCrudService]
})
export class NcDeviceGroupsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceGroupId: string;
  ncmDeviceTypes: LabelValueType[] = deviceTypesOptions;
  ncmDevices: NCMDevicesType[] = [];

  actionMessage: 'Add' | 'Edit';
  ncmDeviceGroupId: string;
  ncmDeviceGroupData: NCMDeviceGroupType;

  deviceGroupForm: FormGroup;
  deviceGroupFormErrors: any;
  deviceGroupFormValidationMessages: any;
  deviceGroupFormData: any;

  activeForm: string = 'deviceGroupForm';
  nonFieldErr: string = '';
  scheduleFormData: any;

  deviceTypesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  devicesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: NcDeviceGroupsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.ncmDeviceGroupId = params.get('device-groupId');
      this.actionMessage = this.ncmDeviceGroupId ? 'Edit' : 'Add';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.ncmDeviceGroupId) {
      this.getNCMDeviceGroupDetails();
    } else {
      this.manageActiveForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getNCMDevices(deviceTypes: string[]) {
    this.crudSvc.getNCMDevices(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ncmDevices = res;
    }, (err: HttpErrorResponse) => {
      this.ncmDevices = [];
    })
  }

  getNCMDevicesInEditCase(deviceTypes: string[]) {
    this.crudSvc.getNCMDevices(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ncmDevices = res;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.ncmDevices = [];
    })
  }

  getNCMDeviceGroupDetails() {
    this.crudSvc.getNCMDeviceGroupDetails(this.ncmDeviceGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ncmDeviceGroupData = res;
      this.getNCMDevicesInEditCase(this.ncmDeviceGroupData.device_types);
    }, (err: HttpErrorResponse) => {
      this.ncmDeviceGroupData = null;
      this.manageActiveForm();
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'deviceGroupForm':
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if (this.deviceGroupForm && this.deviceGroupForm.valid) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          this.onSubmitDeviceGroupForm();
        }
        break;
      default:
        this.activeForm = 'deviceGroupForm';
        this.buildDeviceGroupsForm();
        if (this.ncmDeviceGroupId) {
          this.buildScheduleForm();
        }
    }
    this.spinner.stop('main');
  }

  buildDeviceGroupsForm() {
    this.deviceGroupForm = this.crudSvc.buildDeviceGroupForm(this.ncmDeviceGroupData, this.ncmDevices);
    this.deviceGroupFormErrors = this.crudSvc.resetDeviceGroupFormErrors();
    this.deviceGroupFormValidationMessages = this.crudSvc.deviceGroupFormValidationMessages;
    this.deviceGroupFormData = this.deviceGroupForm.getRawValue();
    this.deviceGroupForm.get('device_types').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.ncmDevices = [];
      this.deviceGroupForm.get('devices').setValue([], { emitEvent: false });
      this.getNCMDevices(val);
    })
  }

  onSubmitDeviceGroupForm() {
    if (this.deviceGroupForm.invalid) {
      this.deviceGroupFormErrors = this.utilService.validateForm(this.deviceGroupForm, this.deviceGroupFormValidationMessages, this.deviceGroupFormErrors);
      this.deviceGroupForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.deviceGroupFormErrors = this.utilService.validateForm(this.deviceGroupForm, this.deviceGroupFormValidationMessages, this.deviceGroupFormErrors);
      });
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.ncmDeviceGroupId) {
      this.scheduleSvc.addOrEdit(this.ncmDeviceGroupData.schedule_meta, this.ncmDeviceGroupData.notification);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.onSubmit(runNowFlag);
    }
  }

  handleError(err: any) {
    this.deviceGroupFormErrors = this.crudSvc.resetDeviceGroupFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.deviceGroupForm.controls) {
          this.activeForm = 'deviceGroupForm';
          this.deviceGroupFormErrors[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.deviceGroupForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    if (this.ncmDeviceGroupId) {
      this.crudSvc.saveDeviceGroup(obj, this.ncmDeviceGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Device group updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.saveDeviceGroup(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Device group added successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  goBack() {
    if (this.ncmDeviceGroupId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
