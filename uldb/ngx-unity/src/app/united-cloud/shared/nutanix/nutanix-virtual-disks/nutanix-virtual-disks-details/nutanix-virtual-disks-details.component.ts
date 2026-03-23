import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NutanixVirtualDisksDetailsService } from './nutanix-virtual-disks-details.service';

@Component({
  selector: 'nutanix-virtual-disks-details',
  templateUrl: './nutanix-virtual-disks-details.component.html',
  styleUrls: ['./nutanix-virtual-disks-details.component.scss'],
  providers: [NutanixVirtualDisksDetailsService]
})
export class NutanixVirtualDisksDetailsComponent implements OnInit, OnDestroy  {
  private ngUnsubscribe = new Subject();
  pcId: string;
  diskId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: any;
  hostData: any;
  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixVirtualDisksDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.diskId = params.get('diskId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
  }

  ngOnInit(): void {
    this.getDetails();
  }
  
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDetails() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.diskId, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, () => {
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