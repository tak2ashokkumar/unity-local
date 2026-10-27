import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DeviceTabData } from '../../device-tab/device-tab.component';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

import { OciZabbixMonitoringConfig } from './zabbix-oci-monitoring-config.type';
import { ZabbixOciMonitoringConfigService } from './zabbix-oci-monitoring-config.service';
import { DOWNLOAD_AGENT_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';

@Component({
  selector: 'zabbix-oci-monitoring-config',
  templateUrl: './zabbix-oci-monitoring-config.component.html',
  styleUrls: ['./zabbix-oci-monitoring-config.component.scss']
})
export class ZabbixOciMonitoringConfigComponent implements OnInit, OnDestroy {
  monitoringDetails: OciZabbixMonitoringConfig;
  private ngUnsubscribe = new Subject();

  deviceId = '';
  device: DeviceTabData;
  monitoring: DeviceMonitoringType;

  downloadAgentUrl: string;

  nonFieldErr = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  regions: { display: string; value: string }[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  regionSettings = {
    isSimpleArray: false,
    lableToDisplay: 'display',
    keyToSelect: 'value',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true
  };

  constructor(private configSvc: ZabbixOciMonitoringConfigService,
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
    this.getRegions();
  }

  ngOnDestroy() {
    this.confirmDeleteModalRef?.hide();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDeviceMonitoring();
    this.getCollectors();
    this.getRegions();
  }

  getDeviceMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.getDeviceMonitoring(this.deviceId, this.device.deviceType)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
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

  getMonitoringDetails() {
    this.configSvc.getMonitoringConfig(this.deviceId, this.device.deviceType)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.monitoringDetails = res;
        this.spinnerService.stop('main');
        this.buildForm();
      }, err => {
        this.monitoringDetails = null;
        this.spinnerService.stop('main');
        this.buildForm();
      });
  }

  getCollectors() {
    this.configSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getRegions() {
    this.configSvc.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regions = res;
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.configSvc.buildForm(this.monitoringDetails);
    this.formErrors = this.configSvc.resetFormErrors();
    this.formValidationMessages = this.configSvc.formValidationMessages;
  }

  handlePrivateKeyInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.get('key_content').setValue(e.target.result);
        this.formErrors.key_content = '';
      }
      reader.readAsDataURL(files.item(index));
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
          this.getDeviceMonitoring();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, {
      class: '',
      keyboard: true,
      ignoreBackdropClick: true
    });
  }

  confirmDeleteConfig() {
    this.spinnerService.start('main');
    this.confirmDeleteModalRef.hide();
    this.configSvc.deleteMonitoring(this.deviceId, this.device.deviceType)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.spinnerService.stop('main');
        this.resetConfig(false);
        this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
        this.getDeviceMonitoring();
      }, err => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      });
  }

  toggleMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.toggleMonitoring(this.deviceId, this.device.deviceType, this.monitoring.enabled)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.monitoring.enabled = !this.monitoring.enabled;
        this.spinnerService.stop('main');
        this.getDeviceMonitoring();
      }, err => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      });
  }
}
