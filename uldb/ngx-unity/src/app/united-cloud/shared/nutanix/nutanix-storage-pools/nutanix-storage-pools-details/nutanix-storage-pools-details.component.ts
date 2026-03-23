import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NutanixStoragePoolsDetailsService } from './nutanix-storage-pools-details.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'nutanix-storage-pools-details',
  templateUrl: './nutanix-storage-pools-details.component.html',
  styleUrls: ['./nutanix-storage-pools-details.component.scss'],
  providers: [NutanixStoragePoolsDetailsService]
})
export class NutanixStoragePoolsDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  spId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: any;
  hostData: any;
  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixStoragePoolsDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.spId = params.get('spId'));
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
    this.svc.getDeviceDetails(this.pcId, this.spId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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