import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { NewRelicAccountViewData, UsiEventIngestionNewRelicService } from './usi-event-ingestion-new-relic.service';
import { UsiEventIngestionNewRelicCrudService } from './usi-event-ingestion-new-relic-crud/usi-event-ingestion-new-relic-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UsiEventIngestionCommonService } from '../usi-event-ingestion-common/usi-event-ingestion-common.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';

@Component({
  selector: 'usi-event-ingestion-new-relic',
  templateUrl: './usi-event-ingestion-new-relic.component.html',
  styleUrls: ['./usi-event-ingestion-new-relic.component.scss'],
  providers: [UsiEventIngestionNewRelicService]
})
export class UsiEventIngestionNewRelicComponent implements OnInit {

  public tabItems: TabData[] = [{
    name: 'New Relic Event Ingestion',
    url: '/setup/integration/new-relic'
  }];

  private ngUnsubscribe = new Subject();
  viewData: NewRelicAccountViewData[] = [];
  selectedView: NewRelicAccountViewData;

  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;

  nonFieldErr: string = '';
  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;
  isSubmit: boolean = true;

  constructor(private crudService: UsiEventIngestionCommonService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private zabbixService: UsiEventIngestionNewRelicService,
    private router: Router,
    private modalService: BsModalService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
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
    this.zabbixService.getAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.zabbixService.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('New Relic to get Accounts'));
    });
  }

  addAccount() {
    // this.crudService.addOrEdit(null);
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  testPayloadModal(view: NewRelicAccountViewData) {
    this.isSubmit = true;
    this.selectedView = view;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalService.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.nonFieldErr = '';
    this.payloadForm = this.zabbixService.buildPayloadForm();
    this.payloadFormErrors = this.zabbixService.resetPaylodFormErrors();
    this.payloadValidationMessages = this.zabbixService.payloadValidationMessages;
  }

  submitPayload() {
    this.spinner.start('main');
    this.isSubmit = false;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.zabbixService.getPayloadResponse(obj.payload, this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.handlePayloadFormError(err.error);
    });
  }

  handlePayloadFormError(err: any) {
    this.payloadFormErrors = this.zabbixService.resetPaylodFormErrors();
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

  editAccount(data: NewRelicAccountViewData) {
    // this.crudService.addOrEdit(data.uuid);
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(data: NewRelicAccountViewData) {
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

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
