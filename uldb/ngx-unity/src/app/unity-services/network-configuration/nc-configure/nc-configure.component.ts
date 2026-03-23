import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { configDeviceTypeList, deviceTypes, NcConfigureService, NetworkDeviceViewData } from './nc-configure.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { cloneDeep as _clone } from 'lodash-es';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'nc-configure',
  templateUrl: './nc-configure.component.html',
  styleUrls: ['./nc-configure.component.scss'],
  providers: [NcConfigureService]
})
export class NcConfigureComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  deviceTypeList: Array<{ name: string, displayName: string }> = deviceTypes;
  credentialList: Array<DeviceDiscoveryCredentials> = [];
  configDeviceTypeList: Array<LabelValueType> = configDeviceTypeList;
  deviceList: Array<NetworkDeviceViewData> = [];
  selectedDevices: Array<NetworkDeviceViewData> = [];
  selectedDevice: NetworkDeviceViewData = null;
  selectedDeviceForValidateCred: NetworkDeviceViewData = null;
  isBulkSelected: boolean = false;
  selectedAll: boolean = false;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private service: NcConfigureService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalService: BsModalService) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
  }

  ngOnInit(): void {
    this.buildForm();
    this.getCredentials();
    this.getDevices();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDevices()
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
    //cred?
  }

  getCredentials() {
    this.credentialList = [];
    this.service.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.credentialList = res;
    });
  }

  getDevices(isSpinnerNotRequired?: boolean) {
    this.deviceList = [];
    this.selectedDevices = [];
    this.selectedAll = false;
    if (this.form.get('enable_or_encrypted_password')) {
      this.form.removeControl('ncm_credentials');
      this.form.removeControl('enable_or_encrypted_password');
      this.form.removeControl('config_device_type');
    }
    this.isBulkSelected = false;
    this.count = 0;
    if (!isSpinnerNotRequired) {
      this.spinner.start('main');
    }
    this.service.getDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.deviceList = this.service.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get devices. Please try again.'))
    });
  }

  buildForm() {
    this.form = this.service.buildForm();
    this.formErrors = this.service.resetDeviceFormErrors();
    this.validationMessages = this.service.deviceValdiationMessages;
    this.form.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.currentCriteria.params[0]['device_type'] = val;
      this.currentCriteria.pageNo = 1;
      this.getDevices();
    })
  }

  syncConfiguration(view: NetworkDeviceViewData) {
    if (view.syncInProgress || !view.isConfigured) {
      return;
    }
    this.handleSelectedDeviceForValidateCredFormControls();
    this.handleSelectedDeviceForConfigEditBtnFormControls();
    this.handleSelectedDeviceFormControls(view, false);
    view.syncInProgress = true;
    this.service.syncConfiguration(view.uuid, view.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getDevices();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  handleSelectedDeviceForValidateCredFormControls() {
    if (this.selectedDeviceForValidateCred) {
      this.selectedDeviceForValidateCred.onValidateCredBtn = false;
      this.selectedDeviceForValidateCred.form.get('ncm_credentials').disable();
      this.selectedDeviceForValidateCred.form.get('enable_or_encrypted_password').disable();
      this.selectedDeviceForValidateCred.form.get('config_device_type').disable();
      this.selectedDeviceForValidateCred.form.get('ncm_credentials').removeValidators([Validators.required]);
      this.selectedDeviceForValidateCred.form.get('config_device_type').removeValidators([Validators.required]);
      this.selectedDeviceForValidateCred.form.get('ncm_credentials').updateValueAndValidity();
      this.selectedDeviceForValidateCred.form.get('config_device_type').updateValueAndValidity();
      this.selectedDeviceForValidateCred = null;
    }
  }

  handleSelectedDeviceForConfigEditBtnFormControls() {
    if (this.selectedDevices.length == 1) {
      this.selectedDevices.getFirst().isSelected = false;
      this.selectedDevices.getFirst().form.get('ncm_credentials').disable();
      this.selectedDevices.getFirst().form.get('enable_or_encrypted_password').disable();
      this.selectedDevices.getFirst().form.get('config_device_type').disable();
      this.selectedDevices.getFirst().form.get('ncm_credentials').setValidators([Validators.required]);
      this.selectedDevices.getFirst().form.get('config_device_type').setValidators([Validators.required]);
      this.selectedDevices.getFirst().form.get('ncm_credentials').updateValueAndValidity();
      this.selectedDevices.getFirst().form.get('config_device_type').updateValueAndValidity();
      this.selectedDevices = [];
    }
  }

  handleSelectedDeviceFormControls(view: NetworkDeviceViewData, isFormControlsEnable?: boolean) {
    if (isFormControlsEnable) {
      view.form.get('ncm_credentials').enable();
      view.form.get('enable_or_encrypted_password').enable();
      if (!view.isConfigured) {
        view.form.get('config_device_type').enable();
      }
      view.form.get('ncm_credentials').setValidators([Validators.required]);
      view.form.get('config_device_type').setValidators([Validators.required]);
    } else {
      view.form.get('ncm_credentials').disable();
      view.form.get('enable_or_encrypted_password').disable();
      view.form.get('config_device_type').disable();
      view.form.get('ncm_credentials').removeValidators([Validators.required]);
      view.form.get('config_device_type').removeValidators([Validators.required]);
    }
    view.form.get('ncm_credentials').updateValueAndValidity();
    view.form.get('config_device_type').updateValueAndValidity();
  }

  selectAll() {
    if (!this.deviceList.length) {
      this.selectedAll = false;
      return;
    }
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.deviceList.forEach(view => {
        let sdIndex = this.selectedDevices.findIndex(sd => sd.uuid == view.uuid);
        if (sdIndex != -1) {
          this.selectedDevices.splice(sdIndex, 1);
        }
        if (!view.inProgress) {
          view.isSelected = false;
          this.select(view);
        }
      });
    } else {
      this.deviceList.forEach(view => {
        if (!view.inProgress) {
          view.isSelected = true;
          this.select(view);
        }
      });
    }
  }

  select(view: NetworkDeviceViewData) {
    if (view.inProgress) {
      return;
    }

    this.handleSelectedDeviceForValidateCredFormControls();

    view.isSelected = !view.isSelected;
    if (view.isSelected) {
      this.selectedDevices.push(view);
      if (this.selectedDevices.length < 2) {
        this.handleSelectedDeviceFormControls(view, true);
      }
    } else {
      let sdIndex = this.selectedDevices.findIndex(sd => sd.uuid == view.uuid);
      if (sdIndex != -1) {
        this.selectedDevices.splice(sdIndex, 1);
        this.selectedAll = false;
      }
      if (this.selectedDevices.length == 1) {
        this.handleSelectedDeviceFormControls(this.selectedDevices.getFirst(), true);
      }
      if (!view.isConfigured) {
        view.form.get('enable_or_encrypted_password').setValue('');
        view.form.get('ncm_credentials').setValue('');
        view.form.get('config_device_type').setValue('');
      }
      this.handleSelectedDeviceFormControls(view, false);
    }

    if (this.selectedDevices.length > 1) {
      this.selectedDevices.forEach(device => {
        if (!device.isConfigured) {
          device.form.get('enable_or_encrypted_password').setValue('');
          device.form.get('ncm_credentials').setValue('');
          device.form.get('config_device_type').setValue('');
        }
        this.handleSelectedDeviceFormControls(device, false);
      });
      this.form.addControl('ncm_credentials', new FormControl('', [Validators.required]));
      this.form.addControl('enable_or_encrypted_password', new FormControl(''));
      this.form.addControl('config_device_type', new FormControl('', [Validators.required]));
      this.isBulkSelected = true;
    } else {
      this.selectedDevice = view;
      this.form.removeControl('ncm_credentials');
      this.form.removeControl('enable_or_encrypted_password');
      this.form.removeControl('config_device_type');
      this.isBulkSelected = false;
    }
  }

  validateCredentials(view: NetworkDeviceViewData) {
    if (this.isBulkSelected) {
      return;
    }
    if (view.onValidateCredBtn) {
      if (view.form.invalid) {
        view.formErrors = this.utilService.validateForm(view.form, this.validationMessages, view.formErrors);
        view.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          view.formErrors = this.utilService.validateForm(view.form, this.validationMessages, view.formErrors);
        });
      } else {
        this.spinner.start('main');
        let obj = Object.assign({});
        obj['devices'] = [];
        obj.devices.push({ 'uuid': view.uuid, 'device_type': view.deviceType });
        obj['ncm_credentials'] = view.form.get('ncm_credentials').value;
        obj['enable_or_encrypted_password'] = view.form.get('enable_or_encrypted_password').value;
        obj['config_device_type'] = view.form.get('config_device_type').value;
        this.service.validateCredentials(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.notification.success(new Notification('Credentials Are Valid.'));
          this.getDevices(true);
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification(err.error.detail ? err.error.detail : 'Failed to Validate Credentials. Please try again'));
        });
      }
    } else {
      this.handleOnValidateCredBtnClick(view);
    }
  }

  handleOnValidateCredBtnClick(view: NetworkDeviceViewData) {
    this.handleSelectedDeviceForValidateCredFormControls();
    this.handleSelectedDeviceForConfigEditBtnFormControls();
    view.onValidateCredBtn = !view.onValidateCredBtn;
    this.selectedDeviceForValidateCred = view;
    this.handleSelectedDeviceFormControls(this.selectedDeviceForValidateCred, true);
  }

  manageRecord(view: NetworkDeviceViewData) {
    if (view.inProgress || this.isBulkSelected) {
      return;
    }
    if (view.isSelected) {
      if (view.form.invalid) {
        view.formErrors = this.utilService.validateForm(view.form, this.validationMessages, view.formErrors);
        view.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          view.formErrors = this.utilService.validateForm(view.form, this.validationMessages, view.formErrors);
        });
      } else {
        this.spinner.start('main');
        let obj = Object.assign({});
        obj['devices'] = [];
        obj.devices.push({ 'uuid': view.uuid, 'device_type': view.deviceType });
        obj['ncm_credentials'] = view.form.get('ncm_credentials').value;
        obj['enable_or_encrypted_password'] = view.form.get('enable_or_encrypted_password').value;
        obj['config_device_type'] = view.form.get('config_device_type').value;
        this.service.configureDevice(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          if (view.isConfigured) {
            this.notification.success(new Notification('Configuration details submitted successfully for device configure update.'));
          } else {
            this.notification.success(new Notification('Configuration details submitted successfully for device configure.'));
          }
          view.inProgress = true;
          this.handleSelectedDeviceFormControls(view, false);
          this.syncDeviceData(res.task_id);
        }, (err: HttpErrorResponse) => {
          if (view.isConfigured) {
            this.notification.error(new Notification('Failed to update. Please try again'));
          } else {
            this.notification.error(new Notification('Failed to configure. Please try again'));
          }
          this.spinner.stop('main');
        });
      }
    } else {
      this.select(view);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      let obj = Object.assign({});
      obj['devices'] = [];
      if (this.selectedDevices.length) {
        this.selectedDevices.forEach(device => {
          obj.devices.push({ 'uuid': device.uuid, 'device_type': device.deviceType });
        });
      }
      obj['enable_or_encrypted_password'] = this.form.get('enable_or_encrypted_password').value;
      obj['ncm_credentials'] = this.form.get('ncm_credentials').value;
      obj['config_device_type'] = this.form.get('config_device_type').value;
      this.service.bulkUpdate(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notification.success(new Notification('Configuration details submitted successfully.'));
        this.isBulkSelected = false;
        this.syncDeviceData(res.task_id);
        this.getDevices();
      }, (err: HttpErrorResponse) => {
        this.isBulkSelected = false;
        this.notification.error(new Notification('Failed to submit Configuration details. Please try again'));
      });
    }
  }

  syncDeviceData(taskId: string) {
    this.service.syncDeviceData(taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDevices();
      this.notification.success(new Notification('Devices configured successfully.'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to configure. Please try again.'));
    })
  }

  getIconForValidateCred(view: NetworkDeviceViewData) {
    if (view.onValidateCredBtn) {
      return this.isBulkSelected ? 'fas fa-shield-alt action-icons-disabled' : 'fas fa-save';
    } else {
      return this.isBulkSelected ? 'fas fa-shield-alt action-icons-disabled' : 'fas fa-shield-alt';
    }
  }

  getTooltipMsgForValidateCred(view: NetworkDeviceViewData) {
    if (view.onValidateCredBtn) {
      return 'Submit';
    } else {
      return 'Validate Credentials';
    }
  }

  getIcon(view: NetworkDeviceViewData) {
    if (view.inProgress) {
      return 'fas fa-spin fa-spinner';
    }
    if (view.isSelected) {
      return this.isBulkSelected ? 'fas fa-check text-success action-icons-disabled' : 'fas fa-check';
    } else {
      return this.isBulkSelected ? 'fas fa-pencil-alt action-icons-disabled' : 'fas fa-pencil-alt';
    }
  }

  getTooltipMessage(view: NetworkDeviceViewData) {
    if (view.inProgress) {
      return 'In Progress';
    }
    if (view.isSelected) {
      return 'Submit';
    } else {
      return 'Edit';
    }
  }

  deleteDeviceConfig(view: NetworkDeviceViewData) {
    if (!view.isConfigured) {
      return;
    }
    this.handleSelectedDeviceForValidateCredFormControls();
    this.handleSelectedDeviceForConfigEditBtnFormControls();
    this.handleSelectedDeviceFormControls(view, false);
    this.selectedDevice = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteDeviceConfig() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.service.deleteDeviceConfig(this.selectedDevice.uuid, this.selectedDevice.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDevices(true);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Device configuration. Please try again later.'));
    })
  }
}
