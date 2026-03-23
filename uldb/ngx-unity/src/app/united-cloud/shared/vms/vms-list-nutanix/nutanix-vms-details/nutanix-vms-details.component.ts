import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NutanixVmsDetailsService } from './nutanix-vms-details.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { NutanixVMDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';

@Component({
  selector: 'nutanix-vms-details',
  templateUrl: './nutanix-vms-details.component.html',
  styleUrls: ['./nutanix-vms-details.component.scss'],
  providers: [NutanixVmsDetailsService]
})
export class NutanixVmsDetailsComponent implements OnInit {
  
  private ngUnsubscribe = new Subject();
  vmId: string;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;

  hostData: NutanixVMDetailsType;
  nonFieldErr: any;
  pcId: string;

  constructor(private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private svc: NutanixVmsDetailsService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.vmId = params.get('vmId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
  }

  ngOnInit(): void {
    this.getVmDetails();
  }

  getVmDetails(){
    if(this.pcId){
      this.getVmDetailsBycloudId();
    }
    else{
      this.getVmDetailsByVMId();
    }
  }

  getVmDetailsBycloudId() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.vmId, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.hostData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  getVmDetailsByVMId() {
    this.spinner.start('main');
    this.svc.getDeviceDetailsById(this.vmId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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