import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MtpCreateTicketService } from './mtp-create-ticket.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { MTPTicketInstance, MTPTicketPriorityType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { CRMTenant } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'mtp-create-ticket',
  templateUrl: './mtp-create-ticket.component.html',
  styleUrls: ['./mtp-create-ticket.component.scss'],
  providers: [MtpCreateTicketService]
})
export class MtpCreateTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ticketTypeList: MTPTicketType[] = [];
  ticketPriorityList: MTPTicketPriorityType[] = [];

  tenants: CRMTenant[] = [];
  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  attachmentForm: FormGroup;;
  constructor(private svc: MtpCreateTicketService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    this.getInstance();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  instance: MTPTicketInstance;
  getInstance() {
    this.spinner.start('main');
    this.svc.getInstance().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.instance = res.getFirst();
        this.getDropdownData();
      }
      this.spinner.stop('main');
    }, err => {
      this.instance = null;
      this.spinner.stop('main');
    });
  }

  getDropdownData() {
    this.svc.getDropdownData(this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ tenants, types, priorities }) => {
      if (tenants) {
        this.tenants = _clone(tenants);
      } else {
        this.tenants = [];
        this.notification.error(new Notification("Error while fetching tenant list"));
      }

      if (types) {
        this.ticketTypeList = _clone(types);
        this.ticketForm.get('type').patchValue(this.ticketTypeList[0].value);
      } else {
        this.ticketTypeList = [];
        this.notification.error(new Notification("Error while fetching issue types"));
      }

      if (priorities) {
        this.ticketPriorityList = _clone(priorities);
        this.ticketForm.get('priority').patchValue(this.ticketPriorityList.find((priority) => priority.display_name == 'Normal').value);
      } else {
        this.ticketPriorityList = [];
        this.notification.error(new Notification("Error while fetching priorities list"));
      }
    });
  }

  buildForm() {
    this.ticketForm = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;

    this.attachmentForm = this.svc.buildAttachmentForm();
  }

  get attachments() {
    return Object.keys(this.attachmentForm.controls);
  }

  detectFiles(files: FileList) {
    for (let index = 0; index < files.length; index++) {
      if (this.attachments.includes(files.item(index).name)) {
        continue;
      } else {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentForm.addControl(files.item(index).name, new FormControl(e.target.result));
        }
        reader.readAsDataURL(files.item(index));
      }
    }
  }

  removeFiles(attachment: string) {
    this.attachmentForm.removeControl(attachment);
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  onSubmit() {
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.svc.resetFormErrors();
      const data = this.svc.toFormData(this.ticketForm.getRawValue(), this.attachmentForm.getRawValue());
      this.svc.saveTicket(this.instance.uuid, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Ticket submitted successfully, it will be visible in portal in few minutes. Our Support team will soon contact you.'));
        this.goBack();
      }, err => {
        this.handleError(err);
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to creating ticket.'));
      });
    }
  }

  reset() {
    this.buildForm();
  }

  goBack() {
    this.router.navigate(['ticketmgmt']);
  }
}
