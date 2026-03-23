import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppDynamicsAccountsViewData, UsiEventIngestionAppDynamicsService } from './usi-event-ingestion-app-dynamics.service';
import { TabData } from 'src/app/shared/tabdata';
import { Subject } from 'rxjs';
import { UsiEventIngestionAppDynamicsCrudService } from './usi-event-ingestion-app-dynamics-crud/usi-event-ingestion-app-dynamics-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UsiEventIngestionCommonService } from '../usi-event-ingestion-common/usi-event-ingestion-common.service';
import { ZabbixAccountViewData } from '../usi-event-ingestion-zabbix/usi-event-ingestion-zabbix.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';

@Component({
  selector: 'usi-event-ingestion-app-dynamics',
  templateUrl: './usi-event-ingestion-app-dynamics.component.html',
  styleUrls: ['./usi-event-ingestion-app-dynamics.component.scss'],
  providers: [UsiEventIngestionAppDynamicsService]
})
export class UsiEventIngestionAppDynamicsComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'App Dynamics Event Ingestion',
    url: '/setup/integration/appdynamics'
  }];

  private ngUnsubscribe = new Subject();
  viewData: AppDynamicsAccountsViewData[] = [];
  selectedView: ZabbixAccountViewData;

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
    private appDynamicsService: UsiEventIngestionAppDynamicsService) { }

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
    this.appDynamicsService.getAcccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.appDynamicsService.convertToViewData(data);
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

  testPayloadModal(view: ZabbixAccountViewData) {
    this.isSubmit = true;
    this.selectedView = view;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalService.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.nonFieldErr = '';
    this.payloadForm = this.appDynamicsService.buildPayloadForm();
    this.payloadFormErrors = this.appDynamicsService.resetPaylodFormErrors();
    this.payloadValidationMessages = this.appDynamicsService.payloadValidationMessages;
  }

  submitPayload() {
    this.spinner.start('main');
    this.isSubmit = false;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.appDynamicsService.getPayloadResponse(obj.payload, this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.handlePayloadFormError(err.error);
    });
  }

  handlePayloadFormError(err: any) {
    this.payloadFormErrors = this.appDynamicsService.resetPaylodFormErrors();
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

  editAccount(data: AppDynamicsAccountsViewData) {
    // this.crudService.addOrEdit(data.uuid);
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(data: AppDynamicsAccountsViewData) {
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

  goToSettings(source?: string) {
    const queryParams = { source: '1200' };
    this.router.navigate(['services/aiml/rules/appdynamics'], { queryParams });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
