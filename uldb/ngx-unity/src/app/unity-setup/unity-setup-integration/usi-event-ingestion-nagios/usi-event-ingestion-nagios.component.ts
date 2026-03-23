import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { UsiEventIngestionNagiosCrudService } from './usi-event-ingestion-nagios-crud/usi-event-ingestion-nagios-crud.service';
import { NagiosAccountViewData, UsiEventIngestionNagiosService } from './usi-event-ingestion-nagios.service';
import { UsiEventIngestionCommonService } from '../usi-event-ingestion-common/usi-event-ingestion-common.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';

@Component({
  selector: 'usi-event-ingestion-nagios',
  templateUrl: './usi-event-ingestion-nagios.component.html',
  styleUrls: ['./usi-event-ingestion-nagios.component.scss'],
  providers: [UsiEventIngestionNagiosService]
})
export class UsiEventIngestionNagiosComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'Nagios Event Ingestion',
    url: '/setup/integration/nagios'
  }];

  private ngUnsubscribe = new Subject();
  viewData: NagiosAccountViewData[] = [];
  selectedView: NagiosAccountViewData;

  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;

  nonFieldErr: string = '';
  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;
  isSubmit: boolean = true;

  constructor(private crudService: UsiEventIngestionCommonService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private nagiosService: UsiEventIngestionNagiosService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getAccountsData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getAccountsData();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinner.start('main');
    this.getAccountsData();
  }

  getAccountsData() {
    this.nagiosService.getAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.nagiosService.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Accounts'));
    });
  }

  addAccount() {
    // this.crudService.addOrEdit(null);
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  testPayloadModal(view: NagiosAccountViewData) {
    this.isSubmit = true;
    this.selectedView = view;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalService.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.nonFieldErr = '';
    this.payloadForm = this.nagiosService.buildPayloadForm();
    this.payloadFormErrors = this.nagiosService.resetPaylodFormErrors();
    this.payloadValidationMessages = this.nagiosService.payloadValidationMessages;
  }

  submitPayload() {
    this.spinner.start('main');
    this.isSubmit = false;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.nagiosService.getPayloadResponse(obj.payload, this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.handlePayloadFormError(err.error);
    });
  }

  handlePayloadFormError(err: any) {
    this.payloadFormErrors = this.nagiosService.resetPaylodFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.payloadForm.controls) {
          this.payloadFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.payloadModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  editAccount(data: NagiosAccountViewData) {
    // this.crudService.addOrEdit(data.uuid);
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(data: NagiosAccountViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKeyOrUrl(value: string, displayName: string) {
    try {
      navigator.clipboard.writeText(value)
        .then(() => {
          this.notification.success(new Notification(`${displayName} copied to clipboard.`));
        })
    } catch (err) {
      this.notification.error(new Notification(`Failed to copy ${displayName}. Please try again later.`));
    }
  }

  goToSettings() {
    this.router.navigate(['services/aiml/rules/nagios']);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
