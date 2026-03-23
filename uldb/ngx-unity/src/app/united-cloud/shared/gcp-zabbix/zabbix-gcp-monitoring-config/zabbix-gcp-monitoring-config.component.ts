import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GcpMonitoringConfig } from '../gcp-zabbix-monitoring.type';
import { Subject, Subscription } from 'rxjs';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ZabbixGcpMonitoringConfigService } from './zabbix-gcp-monitoring-config.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DOWNLOAD_AGENT_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'zabbix-gcp-monitoring-config',
  templateUrl: './zabbix-gcp-monitoring-config.component.html',
  styleUrls: ['./zabbix-gcp-monitoring-config.component.scss']
})
export class ZabbixGcpMonitoringConfigComponent implements OnInit, OnDestroy {

  monitoringDetails: GcpMonitoringConfig;
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  monitoringEnabled: boolean;

  deviceId: string = '';
  device: DeviceTabData;
  monitoring: DeviceMonitoringType;

  nonFieldErr: string = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  downloadAgentUrl: string;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private configSvc: ZabbixGcpMonitoringConfigService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.downloadAgentUrl = DOWNLOAD_AGENT_BY_DEVICE_TYPE(this.device.deviceType, this.deviceId);
    this.getDeviceMonitoring();
    this.getCollectors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  refreshData(){
    this.getDeviceMonitoring();
    this.getCollectors();
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

  getDeviceMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.getDeviceMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring = res.monitoring;
      if (this.monitoring.configured) {
        this.getMonitoringDetails();
      } else {
        this.monitoringDetails = null;
        this.spinnerService.stop('main');
        this.buildForm();
      }
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getCollectors() {
    this.configSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.configSvc.buildForm(this.monitoringDetails);
    this.formErrors = this.configSvc.resetFormErrors();
    this.formValidationMessages = this.configSvc.formValidationMessages;
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
      this.spinnerService.start('main');
      if (this.monitoringDetails) {
        this.configSvc.updateMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Monitoring details updated successfully.'));
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.configSvc.enableMonitoring(this.deviceId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinnerService.stop('main');
          this.resetConfig(true);
          this.notification.success(new Notification('Monitoring enabled successfully.'));
          // this.getMonitoringDetails();
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
      this.spinnerService.stop('main');
      this.resetConfig(false);
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      // this.getMonitoringDetails();
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
