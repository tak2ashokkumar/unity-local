import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConnectToUnityService, ConnectionRequestModalViewData } from './connect-to-unity.service';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { merge as _merge } from 'lodash-es';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'connect-to-unity',
  templateUrl: './connect-to-unity.component.html',
  styleUrls: ['./connect-to-unity.component.scss'],
  providers: [ConnectToUnityService]
})
export class ConnectToUnityComponent implements OnInit, OnDestroy {
  @Input() onbDetails: OnbDetails;
  @Output() reloadStatusDetails: EventEmitter<string> = new EventEmitter<string>();
  viewData: ConnectionRequestModalViewData;
  private ngUnsubscribe = new Subject();
  unityConstants: UnityConstants;
  addAgentShown: boolean = false;

  selectedTab: string = 'request-connection';

  @ViewChild('requested') requested: ElementRef;
  requestedModalRef: BsModalRef;

  @ViewChild('createRequest') createRequest: ElementRef;
  createRequestModalRef: BsModalRef;
  formErrors: any;
  validationMessages: any;
  requestForm: FormGroup;

  constructor(private modalService: BsModalService,
    private connectToUnityService: ConnectToUnityService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private utilService: AppUtilityService) { }

  ngOnInit() {
    this.viewData = this.connectToUnityService.converToViewData(this.onbDetails);
    this.getUnityConsts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUnityConsts() {
    this.connectToUnityService.getUnityConstants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.unityConstants = res;
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleModalShow() {
    this.addAgentShown = !this.addAgentShown;
    const className = this.addAgentShown ? 'modal-xl d-none' : 'modal-xl';
    this.createRequestModalRef.setClass(className);
  }

  requestAnotherConnection() {
    this.requestedModalRef.hide();
    this.buildRequestForm();
  }

  buildRequestForm() {
    this.formErrors = this.connectToUnityService.resetFormErrors();
    this.validationMessages = this.connectToUnityService.validationMessages;
    this.requestForm = this.connectToUnityService.createForm();
    this.selectedTab = 'request-connection';
    this.createRequestModalRef = this.modalService.show(this.createRequest, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  requestConnection() {
    if (this.viewData.connectionRequested) {
      this.requestedModalRef = this.modalService.show(this.requested, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    } else {
      this.buildRequestForm();
    }
  }

  submitRequest() {
    if (this.requestForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.requestForm, this.validationMessages, this.formErrors);
      this.requestForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.requestForm, this.validationMessages, this.formErrors); });
    } else {
      this.createRequestModalRef.hide();
      const data: ConnectionRequest = <ConnectionRequest>this.requestForm.getRawValue();
      this.spinner.start('main');
      this.formErrors = this.connectToUnityService.resetFormErrors();
      this.connectToUnityService.submitRequest(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.reloadStatusDetails.emit();
        this.createRequestModalRef.hide();
        this.notificationService.success(new Notification('Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you'));
      }, err => {
        this.spinner.stop('main');
        this.createRequestModalRef.hide();
        this.notificationService.error(new Notification('Error while creating VPN.'));
      });
    }
  }
}