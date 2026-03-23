import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { UnitySetupManagementService, UnitySetupManagementViewData } from './unity-setup-management.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'unity-setup-management',
  templateUrl: './unity-setup-management.component.html',
  styleUrls: ['./unity-setup-management.component.scss'],
  providers: [UnitySetupManagementService]
})
export class UnitySetupManagementComponent implements OnInit, OnDestroy {
  @Input() onbDetails: OnbDetails;
  @Output() reloadStatusDetails: EventEmitter<string> = new EventEmitter<string>();

  private ngUnsubscribe = new Subject();
  viewData: UnitySetupManagementViewData;

  @ViewChild('template') template: ElementRef;
  templateModalRef: BsModalRef;

  constructor(private modalService: BsModalService,
    private setupManagementService: UnitySetupManagementService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService) { }

  ngOnInit() {
    this.viewData = this.setupManagementService.converToViewData(this.onbDetails);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  manage() {
    this.templateModalRef = this.modalService.show(this.template, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  activate() {
    this.spinner.start('main');
    this.setupManagementService.activate().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinner.stop('main');
      this.reloadStatusDetails.emit();
      this.templateModalRef.hide();
      this.notificationService.success(new Notification('Enabled management access for your account. :)'));
    }, err => {
      this.spinner.stop('main');
      this.reloadStatusDetails.emit();
      this.templateModalRef.hide();
      this.notificationService.error(new Notification('Error while activate managmenet access. Please contact support@unityonecloud.com'));

    });
  }
}