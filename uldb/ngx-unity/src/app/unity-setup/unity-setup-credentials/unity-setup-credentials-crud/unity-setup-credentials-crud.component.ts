import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { cloneDeep as _clone } from 'lodash-es';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnitySetupCredentials } from '../unity-setup-credentials.type';
import { DevicesFastByDeviceTypes, deviceTypes, UnitySetupCredentialsCrudService } from './unity-setup-credentials-crud.service';

@Component({
  selector: 'unity-setup-credentials-crud',
  templateUrl: './unity-setup-credentials-crud.component.html',
  styleUrls: ['./unity-setup-credentials-crud.component.scss'],
  providers: [UnitySetupCredentialsCrudService]
})
export class UnitySetupCredentialsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Update';
  credentialId: string;

  viewData: UnitySetupCredentials;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;
  nonFieldErr: string;

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
  devices: DevicesFastByDeviceTypes[] = [];
  devicesToBeSelected: DevicesFastByDeviceTypes[] = [];
  devicesToBeRemoved: DevicesFastByDeviceTypes[] = [];
  selectedDevices: DevicesFastByDeviceTypes[] = [];
  devicesLoading: boolean = false;

  constructor(private svc: UnitySetupCredentialsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.credentialId = params.get('credentialId');
      this.action = this.credentialId ? 'Update' : 'Create';
    });
    this.devicesCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { device_type: [] } };
  }

  ngOnInit(): void {
    if (this.credentialId) {
      this.spinner.start('main');
      this.getCredentialDetailsById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCredentialDetailsById() {
    this.svc.getCredentialDetailsById(this.credentialId).subscribe((res: any) => {
      this.viewData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error.error));
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.viewData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.form.get('device_types') && this.form.get('device_types').value && this.form.get('device_types').value.length > 0) {
      this.getDevicesByDeviceTypes();
      let selectedDevices = this.form.get('devices').value;
      selectedDevices.forEach(d => {
        d.deviceIcon = this.svc.getIconByDeviceType(d.device_type);
      })
      this.selectedDevices = selectedDevices;
    }
    this.form.get('type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'SNMPv1' || val == 'SNMPv2') {
        this.handleSNMPV1V2();
      } else if (val == 'SNMPv3') {
        this.handleSNMPV3();
      } else if (val == 'Active Directory') {
        this.handleActiveDirectory();
      } else if (val == 'SSH Key') {
        this.handleSSHKey();
      } else if (val == 'IPMI') {
        this.handleIPMI();
      } else if (val == 'SSH' || val == 'Windows' || val == 'REDFISH' || val == 'Default') {
        this.handleSSH();
      } else if (val == 'DATABASE') {
        this.handleDatabase();
      } else if (val == 'API User') {
        this.handleAPIUser();
      } else if (val == 'API Token') {
        this.handleAPIToken();
      } else if (val == 'CyberArk') {
        this.handleCyberArc();
      }
    });
    this.subscribeToSNMPV3SecurityLevel();
    this.subscribeToDeviceMapping();
  }

  subscribeToDeviceMapping() {
    this.form.get('device_mapping')?.valueChanges
      .pipe(
        takeUntil(this.form.get('device_mapping') && this.ngUnsubscribe),
        distinctUntilChanged()
      )
      .subscribe((val: boolean) => {
        if (val) {
          this.addFormControls([
            { name: 'device_types', control: new FormControl([], [Validators.required]) },
            { name: 'devices', control: new FormControl([], [Validators.required]) },
          ]);
        } else {
          this.removeFormControls([
            'device_types', 'devices',
          ]);
        }
      });
  }

  subscribeToSNMPV3SecurityLevel() {
    this.form.get('security_level')?.valueChanges
      .pipe(
        takeUntil(this.form.get('security_level') && this.ngUnsubscribe),
        distinctUntilChanged()
      )
      .subscribe((val: string) => {
        if (val == 'noAuthNoPriv') {
          this.handleSNMPV3NoAuthNoPriv();
        } else if (val == 'authNoPriv') {
          this.handleSNMPV3AuthNoPriv();
        } else if (val == 'authPriv') {
          this.handleSNMPV3AuthPriv();
        } else {
          this.handleSNMPV3NoAuthNoPriv();
        }
      });
  }

  addFormControls(controls: Array<{ name: string, control: FormControl }>): void {
    controls.forEach(ctrl => {
      if (!this.form.get(ctrl.name)) {
        this.form.addControl(ctrl.name, ctrl.control);
        this.handleFormSubscriptionsByCtrlName(ctrl.name);
      }
    });
  }
  handleFormSubscriptionsByCtrlName(ctrlName: string) {
    if (ctrlName == 'device_mapping') {
      this.subscribeToDeviceMapping();
    } else if (ctrlName == 'security_level') {
      this.subscribeToSNMPV3SecurityLevel();
    }
  }

  removeFormControls(controls: string[]): void {
    controls.forEach(control => this.form.get(control) ? this.form.removeControl(control) : null);
  }

  handleSNMPV1V2() {
    this.removeFormControls([
      'username', 'key', 'password', 'api_token', 'sudo_password', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'community', control: new FormControl('', [Validators.required]) },
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }

  handleActiveDirectory() {
    this.removeFormControls([
      'key', 'api_token', 'sudo_password', 'community',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'host', control: new FormControl('', [Validators.required]) },
      { name: 'ip_address', control: new FormControl('', [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]) },
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
    ]);
  }

  handleSSHKey() {
    this.removeFormControls([
      'community', 'api_token', 'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'host', 'ip_address', 'device_types', 'devices', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'key', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
      { name: 'sudo_password', control: new FormControl('') },
      { name: 'device_mapping', control: new FormControl(false) },
    ]);
  }

  handleIPMI() {
    this.removeFormControls([
      'community', 'username', 'key', 'password', 'api_token', 'sudo_password',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'host', control: new FormControl('', [Validators.required]) },
      { name: 'ip_address', control: new FormControl('', [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]) },
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
    ]);
  }

  handleSSH() {
    this.removeFormControls([
      'community', 'key', 'api_token', 'sudo_password', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_types', 'devices', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
    ]);
    const type: string = this.form.get('type').value;
    const isDeviceMappingFormCtrlRequired: boolean = type == 'SSH' || type == 'Windows' || type == 'Default';
    if (isDeviceMappingFormCtrlRequired) {
      this.addFormControls([{ name: 'device_mapping', control: new FormControl(false) }]);
    } else {
      this.removeFormControls(['device_mapping']);
    }
  }

  handleSNMPV3() {
    this.removeFormControls([
      'community', 'username', 'key', 'password', 'api_token', 'sudo_password', 'host', 'ip_address',
      'device_mapping', 'device_types', 'devices',
      'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase', 'database_type', 'port'
    ]);
    this.addFormControls([
      { name: 'security_name', control: new FormControl('', [Validators.required]) },
      { name: 'security_level', control: new FormControl('', [Validators.required]) },
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }
  handleSNMPV3NoAuthNoPriv() {
    this.removeFormControls([
      'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase'
    ]);
  }
  handleSNMPV3AuthNoPriv() {
    this.removeFormControls(['privacy_protocol', 'privacy_passphrase']);
    this.addFormControls([
      { name: 'authentication_protocol', control: new FormControl('', [Validators.required]) },
      { name: 'authentication_passphrase', control: new FormControl('', [Validators.required]) },
    ]);
  }
  handleSNMPV3AuthPriv() {
    this.addFormControls([
      { name: 'authentication_protocol', control: new FormControl('', [Validators.required]) },
      { name: 'authentication_passphrase', control: new FormControl('', [Validators.required]) },
      { name: 'privacy_protocol', control: new FormControl('', [Validators.required]) },
      { name: 'privacy_passphrase', control: new FormControl('', [Validators.required]) },
    ]);
  }

  handleDatabase() {
    this.removeFormControls([
      'community', 'key', 'sudo_password', 'api_token', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_types', 'devices', 'device_mapping'
    ]);
    this.addFormControls([
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
      { name: 'database_type', control: new FormControl('', [Validators.required]) },
      { name: 'port', control: new FormControl(null, [Validators.min(0)]) },
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }

  handleAPIUser() {
    this.removeFormControls([
      'community', 'api_token', 'key', 'sudo_password', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type'
    ]);
    this.addFormControls([
      { name: 'username', control: new FormControl('', [Validators.required]) },
      { name: 'password', control: new FormControl('', [Validators.required]) },
      { name: 'port', control: new FormControl(null, [Validators.min(0)]) },
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }

  handleAPIToken() {
    this.removeFormControls([
      'community', 'username', 'password', 'key', 'sudo_password', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type'
    ]);
    this.addFormControls([
      { name: 'api_token', control: new FormControl('', [Validators.required]) },
      { name: 'port', control: new FormControl(null, [Validators.min(0)]) },
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }

  handleCyberArc() {
    this.removeFormControls([
      'community', 'key', 'api_token', 'sudo_password', 'host', 'ip_address',
      'security_name', 'security_level', 'authentication_protocol', 'authentication_passphrase', 'privacy_protocol', 'privacy_passphrase',
      'device_mapping', 'device_types', 'devices', 'database_type', 'port'
    ]);

    this.addFormControls([
      { name: 'username', control: new FormControl('') }, // no validators
      { name: 'password', control: new FormControl('') }, // no validators
      { name: 'device_mapping', control: new FormControl(false) }
    ]);
  }

  onFocus(ctrName: string) {
    this.form.get(ctrName).setValue('');
    this.form.get(ctrName).updateValueAndValidity();
  }

  onBlur(ctrName: string) {
    if (this.form.get(ctrName).value == '') {
      this.form.get(ctrName).reset(Array(this.viewData[ctrName]?.length).fill('*').join(''))
      this.form.get(ctrName).updateValueAndValidity();
    }
  }

  getDevicesByDeviceTypes() {
    let device_types = this.form.get('device_types')?.value;
    if (device_types && device_types.length > 0) {
      this.spinner.start('devicesList');
      this.devices = [];
      this.deviceCount = 0;
      this.devicesLoading = true;
      this.devicesCriteria.pageNo = 1;
      this.devicesCriteria.pageSize = 10;
      this.devicesCriteria.multiValueParam.device_type = this.form.get('device_types').value;
      this.svc.getDevicesByDeviceTypes(this.devicesCriteria, this.form.get('type')?.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        // this.devices = this.svc.convertToViewData(res.results);
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

  isDeviceInSelectedList(device: DevicesFastByDeviceTypes) {
    let d = this.selectedDevices.find(sd => sd.uuid == device.uuid);
    if (d) {
      return true;
    }
    return false;
  }

  onClickToSelectDevice(device: DevicesFastByDeviceTypes) {
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

  devicesSelectedClass(device: DevicesFastByDeviceTypes) {
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

  removeDeviceFromSelection(device: DevicesFastByDeviceTypes) {
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
    this.svc.getDevicesByDeviceTypes(this.devicesCriteria, this.form.get('type')?.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCount = res.count;
      this.devices = this.devices.concat(res.results);
      this.devicesLoading = false;
    }, (err: HttpErrorResponse) => {
      this.devicesLoading = false;
    })
  }

  manageSelectedDevices() {
    if (!this.form.contains('devices')) {
      return;
    }
    if (this.credentialId) {
      if (this.selectedDevices.length > 0) {
        this.selectedDevices.forEach(sd => sd.selected = true);
      }
      if (this.viewData.devices.length > 0) {
        const removedDevices = <DevicesFastByDeviceTypes[]>this.viewData.devices.filter(d => !this.selectedDevices.find(sd => sd.uuid == d.uuid));
        removedDevices.forEach(rd => {
          rd.selected = false;
          delete rd.toBeRemoved
        });
        this.selectedDevices = this.selectedDevices.concat(removedDevices);
      }
      if (this.selectedDevices.length > 0) {
        this.form.get('devices').setValue(this.selectedDevices);
      }
    } else {
      if (this.selectedDevices.length > 0) {
        this.selectedDevices.forEach(sd => sd.selected = true);
        this.form.get('devices').setValue(this.selectedDevices);
      }
    }
  }

  submitCredentialForm() {
    this.manageSelectedDevices();
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.credentialId) {
        let obj = Object.assign({}, this.form.getRawValue());
        ['password', 'sudo_password'].forEach(field => {
          if (this.form.get(field) && !this.form.get(field).touched) {
            delete obj[field];
          }
        });
        this.svc.save(obj, this.credentialId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Credential updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      } else {
        let obj = Object.assign({}, this.form.getRawValue());
        this.svc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Credential added successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
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
    if (this.credentialId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
