import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { NutanixStorageContainersDetailsService } from './nutanix-storage-containers-details.service';

@Component({
  selector: 'nutanix-storage-containers-details',
  templateUrl: './nutanix-storage-containers-details.component.html',
  styleUrls: ['./nutanix-storage-containers-details.component.scss'],
  providers: [NutanixStorageContainersDetailsService]
})
export class NutanixStorageContainersDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  scId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: any;
  hostData: any;
  constructor(private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixStorageContainersDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.scId = params.get('scId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
  }

  ngOnInit(): void {
    this.getVmDetails();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getVmDetails() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.scId, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildForm(this.hostData);
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.detailFormValidationMessages = this.svc.detailFormValidationMessages;
    this.detailForm.disable({ emitEvent: false });
  }
}