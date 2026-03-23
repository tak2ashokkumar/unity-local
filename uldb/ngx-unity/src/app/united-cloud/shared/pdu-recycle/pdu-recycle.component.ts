import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PduRecycleService, PDUToRecycle, PDUSocketAuthType, PDUSocketRecycleType } from './pdu-recycle.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StatusState } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'pdu-recycle',
  templateUrl: './pdu-recycle.component.html',
  styleUrls: ['./pdu-recycle.component.scss']
})
export class PduRecycleComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  pduToRecycle: PDUToRecycle = new PDUToRecycle();

  @ViewChild('pduRecycle') pduRecycle: ElementRef;
  @ViewChild('pduSelectedSocketRecycle') pduSelectedSocketRecycle: ElementRef;
  modalRef: BsModalRef;
  pduRecycleAuthForm: FormGroup;
  authFormErrors: any;
  validationMessages: any;
  pduRecycleSocketForm: FormGroup;
  socketFormErrors: any;

  constructor(private recycleService: PduRecycleService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private builder: FormBuilder, ) {
    this.recycleService.recyclePDUAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((pdu: any) => {
      this.pduToRecycle = pdu;
      this.showRecycleDetails();
    });
    this.recycleService.recycleSelectedSocketsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((pdu: any) => {
      this.pduToRecycle = pdu;
      this.showRecycleDetails();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  showRecycleDetails() {
    this.pduRecycleAuthForm = this.recycleService.buildPDUAuthForm(this.pduToRecycle);
    this.authFormErrors = this.recycleService.resetAuthFormErrors();
    this.pduRecycleSocketForm = this.recycleService.buildPDUSocketForm(this.pduToRecycle);
    this.socketFormErrors = this.recycleService.resetSocketFormErrors();
    this.validationMessages = this.recycleService.validationMessages;
    if (this.pduToRecycle.sockets.length) {
      this.modalRef = this.modalService.show(this.pduSelectedSocketRecycle, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    } else {
      Array(this.pduToRecycle.socketCount).fill(null).map((e, i) => this.pduToRecycle.sockets.push(i + 1));
      this.modalRef = this.modalService.show(this.pduRecycle, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }
  }

  toggleCheckSocket(index: number) {
    let sockets = this.pduRecycleSocketForm.get('outlets') as FormArray;
    const checked = sockets.getRawValue().indexOf(index);
    if (checked != -1) {
      sockets.removeAt(checked);
    } else {
      sockets.push(this.builder.control(index));
    }
  }

  recyclePDU() {
    let obj = <PDUSocketRecycleType>Object.assign({}, this.pduRecycleAuthForm.getRawValue(), this.pduRecycleSocketForm.getRawValue());
    this.recycleService.recyclePDUSockets(this.pduToRecycle, obj)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        if (status.result.status) {
          this.notificationService.success(new Notification(status.result.data));
        } else {
          this.notificationService.error(new Notification(status.result.data));
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification(err.error));
      }, () => {
        this.spinner.stop('main');
      })
  }

  checkPduRecycleAuth() {
    this.recycleService.checkPDUAuth(this.pduToRecycle, <PDUSocketAuthType>this.pduRecycleAuthForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe((status: string) => {
        if (status == StatusState.SUCCESS) {
          this.recyclePDU();
        } else {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Authentication Failed. Please try again'));
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification(err.error));
      })
  }

  onRecycleRequest() {
    if (this.pduRecycleAuthForm.invalid || this.pduRecycleSocketForm.invalid) {
      this.authFormErrors = this.utilService.validateForm(this.pduRecycleAuthForm, this.validationMessages, this.authFormErrors);
      this.socketFormErrors = this.recycleService.validateSocketForm(this.pduRecycleSocketForm, this.validationMessages, this.socketFormErrors);
      this.pduRecycleAuthForm.valueChanges.subscribe(() => {
        this.authFormErrors = this.utilService.validateForm(this.pduRecycleAuthForm, this.validationMessages, this.authFormErrors);
      });
      this.pduRecycleSocketForm.valueChanges.subscribe(() => {
        this.socketFormErrors = this.recycleService.validateSocketForm(this.pduRecycleSocketForm, this.validationMessages, this.socketFormErrors);
      })
      return;
    } else {
      this.authFormErrors = this.recycleService.resetAuthFormErrors();
      this.socketFormErrors = this.recycleService.resetSocketFormErrors();
      this.modalRef.hide();
      this.spinner.start('main');
      this.checkPduRecycleAuth();
    }
  }

}
