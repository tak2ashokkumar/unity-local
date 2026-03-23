import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ServerPowerToggleService, PowerToggleInput } from './server-power-toggle.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';

@Component({
  selector: 'server-power-toggle',
  templateUrl: './server-power-toggle.component.html',
  styleUrls: ['./server-power-toggle.component.scss']
})
export class ServerPowerToggleComponent implements OnInit, OnDestroy {
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('authenticate') authenticate: ElementRef;
  confirmModalRef: BsModalRef;
  authModalref: BsModalRef;
  input: PowerToggleInput;
  authForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  private ngUnsubscribe = new Subject();
  constructor(private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private toggleService: ServerPowerToggleService,
    private notificationService: AppNotificationService) {
    this.toggleService.toggleAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: PowerToggleInput) => {
      this.input = res;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAction() {
    return this.input.currentPowerStatus ? 'Off' : 'On';
  }

  buildForm() {
    this.authForm = this.toggleService.buildForm(this.input);
    this.formErrors = this.toggleService.resetFormErrors();
    this.validationMessages = this.toggleService.validationMessages;
  }

  cancelConfirm() {
    this.confirmModalRef.hide();
    this.toggleService.toggledSuccess(null);
  }

  cancelAuth() {
    this.authModalref.hide();
    this.toggleService.toggledSuccess(null);
  }

  confirmToggle() {
    this.buildForm();
    this.confirmModalRef.hide();
    this.authModalref = this.modalService.show(this.authenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.authForm, this.validationMessages, this.formErrors);
      this.authForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.authForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.toggleService.resetFormErrors();
      this.handleTogglePower();
    }
  }

  handleTogglePower() {
    switch (this.input.deviceType) {
      case DeviceMapping.BARE_METAL_SERVER: this.toggleBMSPower();
        break;
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE: this.toggleVMwarePower();
        break;
      case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: this.toggleOpenStackPower();
        break;
      case DeviceMapping.VCLOUD: this.togglevCloudVMPower();
        break;
      case DeviceMapping.PROXMOX:
      case DeviceMapping.G3_KVM:
        this.togglevProxmoxVMPower();
        break;
      default:
        break;
    }
  }

  toggleBMSPower() {
    this.toggleService.validateAuth(this.input.deviceType, this.input.deviceId, this.authForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.authModalref.hide();
        this.toggleService.togglePowerStatus(this.input).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
          const msg: string = this.input.currentPowerStatus ? 'Stopped ' + this.input.deviceName + ' Successfully' : 'Started ' + this.input.deviceName + ' Successfully';
          this.notificationService.success(new Notification(msg));
          this.spinner.stop('main');
          this.toggleService.toggledSuccess(this.input.deviceId);
        }, (err: any) => {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
        });
      }, err => {
        this.formErrors.invalidCred = 'Invalid Credential';
        this.spinner.stop('main');
      });
  }

  toggleVMwarePower() {
    this.authModalref.hide();
    this.toggleService.togglePowerStatus(this.input, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.spinner.stop('main');
      if (res['task_id']) {
        res['vmId'] = this.input.deviceId;
        this.toggleService.toggledSuccess(res);
      } else {
        this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
      }
    }, (err: any) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
    });
  }

  toggleOpenStackPower() {
    this.authModalref.hide();
    this.toggleService.togglePowerStatus(this.input, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.spinner.stop('main');
      if (res['instance_id']) {
        this.toggleService.toggledSuccess(res);
      } else {
        this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
      }
    }, (err: any) => {
      this.spinner.stop('main');
      this.toggleService.toggledSuccess(null);
      this.notificationService.error(new Notification(err.error));
    });
  }

  togglevCloudVMPower() {
    this.authModalref.hide();
    this.toggleService.togglePowerStatus(this.input, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.spinner.stop('main');
      if (res['task_id']) {
        this.toggleService.toggledSuccess(res);
      } else {
        this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
      }
    }, (err: any) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
    });
  }

  togglevProxmoxVMPower() {
    this.authModalref.hide();
    this.toggleService.togglePowerStatus(this.input, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.spinner.stop('main');
      if (res['task_id']) {
        this.toggleService.toggledSuccess(res);
      } else {
        this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
      }
    }, (err: any) => {
      this.spinner.stop('main');
      this.toggleService.toggledSuccess(null);
      this.notificationService.error(new Notification('Something went wrong !... Please try again later'));
    });
  }
}