import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NutanixDiskDetailsService } from './nutanix-disk-details.service';

@Component({
  selector: 'nutanix-disk-details',
  templateUrl: './nutanix-disk-details.component.html',
  styleUrls: ['./nutanix-disk-details.component.scss'],
  providers: [NutanixDiskDetailsService]
})

export class NutanixDiskDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: any;
  diskData: any;
  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixDiskDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
  }

  ngOnInit(): void {
    this.getDeviceDetails();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceDetails() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.deviceId, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.diskData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildDetailForm(this.diskData);
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.detailFormValidationMessages = this.svc.detailFormValidationMessages;
    this.detailForm.disable({ emitEvent: false });
  }
}
