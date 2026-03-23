import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { AppUtilityService, AuthLevelMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { SNMPCrudType } from '../../entities/snmp-crud.type';
import { StorageMonitoringConfigService } from './storage-monitoring-config.service';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';

@Component({
  selector: 'storage-monitoring-config',
  templateUrl: './storage-monitoring-config.component.html',
  styleUrls: ['./storage-monitoring-config.component.scss'],
  providers: [StorageMonitoringConfigService]
})
export class StorageMonitoringConfigComponent implements OnInit, OnDestroy {
  monitoringDetails: SNMPCrudType;
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  monitoringEnabled: boolean;
  SNMPVersionMapping = SNMPVersionMapping;
  AuthLevelMapping = AuthLevelMapping;
  deviceId: string = '';
  device: DeviceTabData;
  monitoring: DeviceMonitoringType;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  nonFieldErr: string = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private configSvc: StorageMonitoringConfigService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.getDeviceMonitoring();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  getDeviceMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.getDeviceMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring = res.monitoring;
      this.getMonitoringDetails();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getMonitoringDetails() {
    this.configSvc.getMonitoringConfig(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringDetails = res;
      this.spinnerService.stop('main');
      this.buildForm();
    }, err => {
      this.monitoringDetails = null;
      this.spinnerService.stop('main');
      this.buildForm();
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.configSvc.buildForm(this.monitoringDetails);
    this.formErrors = this.configSvc.resetFormErrors();
    this.formValidationMessages = this.configSvc.switchValidationMessages;
    this.form.get('connection_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'SNMP') {
        this.configSvc.setSnmpFields();
        this.subscribeToSnmpVerionChanges();
      } else if (val == 'Api') {
        this.configSvc.setAPIField();
      } else if (val == 'Agent') {
        this.configSvc.setAgentField();
      }
    });
    if (this.form.get('snmp_version')) {
      this.subscribeToSnmpVerionChanges();
    }
  }

  subscribeToSnmpVerionChanges() {
    if (this.form.get('snmp_version')) {
      this.form.get('snmp_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res == SNMPVersionMapping.V3) {
          this.form = this.configSvc.setV3Fields();
          this.subscr = this.form.get('snmp_authlevel').valueChanges.subscribe(res => {
            if (res == AuthLevelMapping.NoAuthNoPriv) {
              this.form = this.configSvc.setNoAuthNoPrivFields();
            } else if (res == AuthLevelMapping.AuthNoPriv) {
              this.form = this.configSvc.setAtuhNoPrivFields();
            } else {
              this.form = this.configSvc.setAuthPrivFields();
            }
            this.form.updateValueAndValidity();
          });
        } else {
          this.form = this.configSvc.setV1_V2Fields();
          if (this.subscr && !this.subscr.closed) {
            this.subscr.unsubscribe();
          }
        }
        this.form.updateValueAndValidity();
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    }
  }

  handleError(err: any) {
    this.formErrors = this.configSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  resetConfig(configState: boolean) {
    this.device.configured = configState;
    this.storageService.put('device', this.device, StorageType.SESSIONSTORAGE);
    this.configSvc.monitoringEnabled();
  }

  confirmMonitoringConfig() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      if (this.form.get('connection_type').value == 'Agent') {
        return;
      }
      this.spinnerService.start('main');
      if (this.monitoring.configured && this.monitoringDetails) {
        this.configSvc.updateMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Monitoring details updated successfully.'));
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.configSvc.enableMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.form = null;
          this.resetConfig(true);
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Monitoring enabled successfully.'));
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmDeleteConfig() {
    this.spinnerService.start('main');
    this.confirmDeleteModalRef.hide();
    this.configSvc.deleteMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = null;
      this.resetConfig(false);
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      this.getDeviceMonitoring();
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Something went wrong!! Please try again'));
    });
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  toggleMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.toggleMonitoring(this.deviceId, this.device.deviceType, this.monitoring.enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring.enabled = !this.monitoring.enabled;
      this.spinnerService.stop('main');
      this.getDeviceMonitoring();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

}
