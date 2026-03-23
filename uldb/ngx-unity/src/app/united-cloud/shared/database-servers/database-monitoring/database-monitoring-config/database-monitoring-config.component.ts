import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatabaseMonitoringConfigService, DBMonitoringDetailsType } from './database-monitoring-config.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DatabaseServer } from '../../../entities/database-servers.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'database-monitoring-config',
  templateUrl: './database-monitoring-config.component.html',
  styleUrls: ['./database-monitoring-config.component.scss']
})
export class DatabaseMonitoringConfigComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  nonFieldErr: string = '';
  dbInstanceId: string;
  dbDetails: DatabaseServer;
  monitoringDetails: DBMonitoringDetailsType;
  monitoring: DeviceMonitoringType;
  dbForm: FormGroup;
  dbFormErrors: any;
  dbFormValidationMessages: any;
  dbType: string;

  odbcForm: FormGroup;
  odbcFormErrors: any;
  odbcFormValidationMessages: any;

  agentForm: FormGroup;
  agentFormErrors: any;
  agentFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private configSvc: DatabaseMonitoringConfigService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.dbInstanceId = params.get('deviceid');
    });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    // this.getDBMonitoringDetails();
    this.getDBServer();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMonitoringDetails() {
    this.configSvc.getMonitoringConfig(this.dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringDetails = res;
      this.buildAddEditForm();
    }, err => {
      this.monitoringDetails = null;
      this.buildAddEditForm();
    });
  }

  getDBServer() {
    this.configSvc.getDB(this.dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dbDetails = res;
      this.dbType = res.db_type.name;
      this.monitoring = res.monitoring;
      if (this.monitoring.configured) {
        this.getMonitoringDetails();
      } else {
        this.monitoringDetails = null;
        this.buildAddEditForm();
      }
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  private buildOtherForm(type: string) {
    this.resetOtherForm();
    switch (type) {
      case 'ODBC':
        this.odbcForm = this.configSvc.createODBCForm(this.monitoringDetails);
        this.odbcFormErrors = this.configSvc.resetODBCFormErrors();
        this.odbcFormValidationMessages = this.configSvc.odbcFormValidationMessages;
        break;
      case 'Agent':
        this.agentForm = this.configSvc.createAgentForm(this.monitoringDetails, this.dbType);
        this.agentFormErrors = this.configSvc.resetAgentFormErrors();
        this.agentFormValidationMessages = this.configSvc.agentFormValidationMessages;
        break;
      default:
        this.resetOtherForm();
        break;
    }
  }

  resetOtherForm() {
    this.odbcForm = null;
    this.odbcFormErrors = null;
    this.odbcFormValidationMessages = null;
    this.agentForm = null;
    this.agentFormErrors = null;
    this.agentFormValidationMessages = null;
  }

  buildAddEditForm() {
    this.dbForm = this.configSvc.createConnectionForm(this.monitoringDetails);
    this.dbFormErrors = this.configSvc.resetFormErrors();
    this.dbFormValidationMessages = this.configSvc.formValidationMessages;
    if (this.monitoringDetails && this.monitoringDetails.connection_type) {
      this.buildOtherForm(this.monitoringDetails.connection_type);
    } else {
      this.resetOtherForm();
    }
    this.nonFieldErr = '';
    this.dbForm.get('connection_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.buildOtherForm(val);
    });
  }

  handleError(err: any) {
    this.nonFieldErr = null;
    this.dbFormErrors = this.configSvc.resetFormErrors();
    this.odbcFormErrors = this.configSvc.resetODBCFormErrors();
    this.agentFormErrors = this.configSvc.resetAgentFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.dbForm.controls) {
          this.dbFormErrors[field] = err[field][0];
        }
        if (this.odbcForm && field in this.odbcForm.controls) {
          this.odbcFormErrors[field] = err[field][0];
        }
        if (this.agentForm && field in this.agentForm.controls) {
          this.agentFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  resetConfig(configState: boolean) {
    let device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    device.configured = configState;
    this.storageService.put('device', device, StorageType.SESSIONSTORAGE);
    this.configSvc.monitoringEnabled();
  }

  validateODBCForm() {
    if (this.odbcForm.invalid) {
      this.odbcFormErrors = this.utilService.validateForm(this.odbcForm, this.odbcFormValidationMessages, this.odbcFormErrors);
      this.odbcForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.odbcFormErrors = this.utilService.validateForm(this.odbcForm, this.odbcFormValidationMessages, this.odbcFormErrors); });
    }
    if (this.dbForm.valid && this.odbcForm.valid) {
      this.submitMonitoringConfig(Object.assign({}, this.dbForm.getRawValue(), this.odbcForm.getRawValue()));
    }
  }

  validateAgentForm() {
    if (this.agentForm.invalid) {
      this.agentFormErrors = this.utilService.validateForm(this.agentForm, this.agentFormValidationMessages, this.agentFormErrors);
      this.agentForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.agentFormErrors = this.utilService.validateForm(this.agentForm, this.agentFormValidationMessages, this.agentFormErrors); });
    }
    if (this.dbForm.valid && this.agentForm.valid) {
      this.submitMonitoringConfig(Object.assign({}, this.dbForm.getRawValue(), this.agentForm.getRawValue()));
    }
  }

  confirmMonitoringConfig() {
    if (this.dbForm.invalid) {
      this.dbFormErrors = this.utilService.validateForm(this.dbForm, this.dbFormValidationMessages, this.dbFormErrors);
      this.dbForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.dbFormErrors = this.utilService.validateForm(this.dbForm, this.dbFormValidationMessages, this.dbFormErrors); });
    }
    switch (this.dbForm.get('connection_type').value) {
      case 'ODBC':
        this.validateODBCForm();
        break;
      case 'Agent':
        this.validateAgentForm();
        break;
    }
  }

  private submitMonitoringConfig(data: DBMonitoringDetailsType) {
    this.spinnerService.start('main');
    if (this.monitoringDetails) {
      this.configSvc.updateMonitoring(this.dbInstanceId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinnerService.stop('main');
        this.notification.success(new Notification('Monitoring details updated successfully.'));
        this.getDBServer();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.configSvc.enableMonitoring(this.dbInstanceId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinnerService.stop('main');
        this.resetConfig(true);
        this.notification.success(new Notification('Monitoring enabled successfully.'));
        this.getMonitoringDetails();
        this.getDBServer();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteConfig() {
    this.spinnerService.start('main');
    this.configSvc.deleteMonitoring(this.dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.resetConfig(false);
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      // this.getMonitoringDetails();
      this.confirmDeleteModalRef.hide();
      this.getDBServer();
    }, err => {
      this.notification.success(new Notification('Something went wrong!! Please try again'));
      this.confirmDeleteModalRef.hide();
      this.spinnerService.stop('main');
    });
  }

  toggleMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.toggleMonitoring(this.dbInstanceId, this.monitoring.enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring.enabled = !this.monitoring.enabled;
      this.spinnerService.stop('main');
      this.getDBServer();
    }, err => {
      this.spinnerService.stop('main');
    });
  }
}
