import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NutanixHostDetailsService } from './nutanix-host-details.service';

@Component({
  selector: 'nutanix-host-details',
  templateUrl: './nutanix-host-details.component.html',
  styleUrls: ['./nutanix-host-details.component.scss'],
  providers: [NutanixHostDetailsService]
})
export class NutanixHostDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  hostId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: any;
  hostData: any;
  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixHostDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.hostId = params.get('hostId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
  }

  ngOnInit(): void {
    this.getHostDetails();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getHostDetails() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.hostId, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildDetailForm(this.hostData);
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.detailFormValidationMessages = this.svc.detailFormValidationMessages;
    this.detailForm.disable({ emitEvent: false });
  }
}
