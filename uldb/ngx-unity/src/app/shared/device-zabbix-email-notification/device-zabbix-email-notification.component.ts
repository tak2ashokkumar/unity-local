import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { DeviceZabbixEmailNotificationService } from './device-zabbix-email-notification.service';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Notification } from '../app-notification/notification.type';
import { DeviceZabbixAlertNotification } from './device-zabbix-email-notification.type';

@Component({
  selector: 'device-zabbix-email-notification',
  templateUrl: './device-zabbix-email-notification.component.html',
  styleUrls: ['./device-zabbix-email-notification.component.scss'],
})
export class DeviceZabbixEmailNotificationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  deviceType: DeviceMapping;
  nonFieldErr: string = '';

  alertConfig: DeviceZabbixAlertNotification;
  alertNotificationEnabled: boolean = true;
  @ViewChild('emailNotificationFormRef') emailNotificationFormRef: ElementRef;
  emailNotificationModelRef: BsModalRef;
  zabbixEmailNotificationForm: FormGroup;
  zabbixEmailNotificationFormErrors: any;
  zabbixEmailNotificationFormValidationMessages: any;
  userList: User[] = [];
  selectedUsers: User[] = [];
  noUsers = false;

  @ViewChild('confirmNotificationRef') confirmNotificationRef: ElementRef;
  confirmNotificationModalRef: BsModalRef;

  constructor(private emailNotificationService: DeviceZabbixEmailNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.emailNotificationService.notificationAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.deviceId = param.deviceId;
      this.deviceType = param.deviceType;
      this.nonFieldErr = '';
      this.getDeviceZabbixAlertConfig();
    });
  }

  ngOnInit() {
    this.getUserList();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUserList() {
    this.emailNotificationService.getUserList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userList = res;
    }, err => {
      this.userList = [];
    });
  }

  getDeviceZabbixAlertConfig() {
    this.spinner.start('main');
    this.emailNotificationService.getDeviceZabbixAlertConfig(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertConfig = res;
      if (this.alertConfig) {
        if (this.alertConfig.org_config.is_enabled) {
          this.nonFieldErr = null;
          this.alertNotificationEnabled = this.alertConfig.is_enabled;
        } else {
          this.nonFieldErr = 'Email notifications are disabled for the organisation.';
          this.alertNotificationEnabled = this.alertConfig.org_config.is_enabled;
        }
        this.selectedUsers = this.userList.filter(user => this.alertConfig.users.find(usr => usr.id == user.id));
      }
      this.spinner.stop('main');
      this.buildZabbixEmailNotificationForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get alert config for device. Tryagain later.'))
    });
  }

  buildZabbixEmailNotificationForm() {
    this.zabbixEmailNotificationForm = this.emailNotificationService.buildZabbixEmailNotificationForm();
    this.zabbixEmailNotificationFormErrors = this.emailNotificationService.resetZabbixEmailNotificationFormErrors();
    this.zabbixEmailNotificationFormValidationMessages = this.emailNotificationService.zabbixEmailNotificationFormValidationMessages;
    this.emailNotificationModelRef = this.modalService.show(this.emailNotificationFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  manageZabbixNotification() {
    if (!this.alertConfig.org_config.is_enabled) {
      return;
    }
    this.confirmNotificationModalRef = this.modalService.show(this.confirmNotificationRef, Object.assign({}, { class: 'modal-dialog-centered mb-5', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmZabbixNotification() {
    this.emailNotificationService.manageZabbixNotification(this.deviceId, this.deviceType, !this.alertNotificationEnabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmNotificationModalRef.hide();
      this.emailNotificationModelRef.hide();
      this.getDeviceZabbixAlertConfig();
    }, (err: HttpErrorResponse) => {
      this.confirmNotificationModalRef.hide();
      this.emailNotificationModelRef.hide();
      this.notification.error(new Notification(`Failed to ${this.alertNotificationEnabled ? 'enable' : 'disable'} Alert config. Tryagain later.`));
    });
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.selectedUsers.push(e.item);
    this.zabbixEmailNotificationForm.get('input').setValue('');
    if (this.selectedUsers.length) {
      this.zabbixEmailNotificationForm.get('input').setValidators([]);
    } else {
      this.zabbixEmailNotificationForm.get('input').setValidators([Validators.required, NoWhitespaceValidator]);
    }
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
  }

  manageSelectedUsers(index: number) {
    this.selectedUsers.splice(index, 1);
    if (this.selectedUsers.length) {
      this.zabbixEmailNotificationForm.get('input').setValidators([]);
    } else {
      this.zabbixEmailNotificationForm.get('input').setValidators([Validators.required, NoWhitespaceValidator]);
    }
  }

  onSubmitZabbixEmailNotificationForm() {
    if (!this.selectedUsers.length) {
      this.zabbixEmailNotificationFormErrors = this.utilService.validateForm(this.zabbixEmailNotificationForm, this.zabbixEmailNotificationFormValidationMessages, this.zabbixEmailNotificationFormErrors);
      this.zabbixEmailNotificationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.zabbixEmailNotificationFormErrors = this.utilService.validateForm(this.zabbixEmailNotificationForm, this.zabbixEmailNotificationFormValidationMessages, this.zabbixEmailNotificationFormErrors);
      });
    } else {
      this.emailNotificationService.saveZabbixNotificationEmails(this.deviceId, this.deviceType, this.selectedUsers).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.emailNotificationModelRef.hide();
      }, (err: HttpErrorResponse) => {
        this.emailNotificationModelRef.hide();
        this.notification.error(new Notification(`Failed to update Alert config. Tryagain later.`));
      });
    }
  }

}
