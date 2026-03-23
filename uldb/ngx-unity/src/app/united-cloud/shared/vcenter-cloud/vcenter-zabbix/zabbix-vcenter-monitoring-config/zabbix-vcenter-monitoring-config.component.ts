import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ZabbixVcenterMonitoringConfigService } from './zabbix-vcenter-monitoring-config.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Subject, Subscription } from 'rxjs';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { SNMPCrudType } from '../../../entities/snmp-crud.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'zabbix-vcenter-monitoring-config',
  templateUrl: './zabbix-vcenter-monitoring-config.component.html',
  styleUrls: ['./zabbix-vcenter-monitoring-config.component.scss']
})
export class ZabbixVcenterMonitoringConfigComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  deviceId: string;
  device: DeviceTabData;
  monitoring: DeviceMonitoringType;

  monitoringDetails: SNMPCrudType;

  nonFieldErr: string = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: ZabbixVcenterMonitoringConfigService,
    private route: ActivatedRoute,
    private utilSvc: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalSvc: BsModalService,
    private storageSvc: StorageService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('pcId');
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageSvc.getByKey('device', StorageType.SESSIONSTORAGE);
    this.getDeviceMonitoring();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main')
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  getDeviceMonitoring() {
    this.spinner.start('main');
    this.svc.getDeviceMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring = res.monitoring;
      this.getMonitoringDetails();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getMonitoringDetails() {
    this.svc.getMonitoringConfig(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringDetails = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.monitoringDetails = null;
      this.buildForm();
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.svc.buildForm(this.monitoringDetails);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
  }

  activateMonitoring() {
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      this.spinner.start('main');
      if (this.monitoring.configured && this.monitoringDetails) {
        this.svc.updateMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Monitoring details updated successfully.'));
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.enableMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.form = null;
          this.resetConfig(true);
          this.spinner.stop('main');
          this.notification.success(new Notification('Monitoring enabled successfully.'));
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err.error) {
      this.nonFieldErr = err.error;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  resetConfig(configState: boolean) {
    this.device.configured = configState;
    this.storageSvc.put('device', this.device, StorageType.SESSIONSTORAGE);
    this.svc.monitoringEnabled();
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalSvc.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteConfig() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = null;
      this.resetConfig(false);
      this.spinner.stop('main');
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      this.getDeviceMonitoring();
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Something went wrong!! Please try again'));
    });
  }

  toggleMonitoring() {
    this.spinner.start('main');
    this.svc.toggleMonitoring(this.deviceId, this.device.deviceType, this.monitoring.enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring.enabled = !this.monitoring.enabled;
      this.spinner.stop('main');
      this.getDeviceMonitoring();
    }, err => {
      this.spinner.stop('main');
    });
  }

}
