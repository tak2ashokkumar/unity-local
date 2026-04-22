import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { LDAP_CONFIG_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { TabData } from 'src/app/shared/tabdata';
import { UnitySetupLdapCrudService } from '../../app-shared-crud/unity-setup-ldap-crud/unity-setup-ldap-crud.service';
import { LDAPConfigViewData, UnitySetupImportUserService } from './unity-setup-import-user.service';

@Component({
  selector: 'unity-setup-import-user',
  templateUrl: './unity-setup-import-user.component.html',
  styleUrls: ['./unity-setup-import-user.component.scss']
})
export class UnitySetupImportUserComponent implements OnInit, OnDestroy {
  ldaps: LDAPConfig[] = [];
  viewData: LDAPConfigViewData[] = [];
  @ViewChild('importuser') importuser: ElementRef;
  private ngUnsubscribe = new Subject();

  importModalRef: BsModalRef;
  importForm: FormGroup;
  importFormErrors: any;
  importValidationMessages: any;

  nonFieldErr: string = '';
  selectedLdapId: number;
  poll: boolean = false;

  constructor(private ldapService: UnitySetupImportUserService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private notificationService: AppNotificationService,
    private crudSvc: UnitySetupLdapCrudService) {
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getLDAP();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.getLDAP();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinnerService.start('main');
    this.getLDAP();
  }

  getLDAP() {
    this.ldapService.getLDAP().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ldaps = res;
      this.viewData = this.ldapService.convertToViewData(res);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  add() {
    // this.crudSvc.addOrEdit(null);
  }

  edit(view: LDAPConfigViewData) {
    // this.crudSvc.addOrEdit(view);
  }

  delete(view: LDAPConfigViewData) {
    // this.crudSvc.delete(view.id);
  }

  buildImportForm(ldap: LDAPConfigViewData) {
    this.nonFieldErr = '';
    this.importForm = this.ldapService.buildImportForm(ldap);
    this.importFormErrors = this.ldapService.resetImportFormErrors();
    this.importValidationMessages = this.ldapService.validationImportMessages;
  }

  importUser(view: LDAPConfigViewData) {
    this.buildImportForm(view);
    this.importModalRef = this.modalService.show(this.importuser, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmImportUser() {
    if (this.importForm.invalid) {
      this.importFormErrors = this.utilService.validateForm(this.importForm, this.importValidationMessages, this.importFormErrors);
      this.importForm.valueChanges
        .subscribe((data: any) => { this.importFormErrors = this.utilService.validateForm(this.importForm, this.importValidationMessages, this.importFormErrors); });
      return;
    } else {
      this.ldapService.importLDAPUser(this.importForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.importModalRef.hide();
          this.notificationService.success(new Notification('LDAP user imported successfully'));
          this.spinnerService.stop('main');
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleImportError(err.error);
        });
    }
  }

  handleImportError(err: any) {
    this.importFormErrors = this.ldapService.resetImportFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.importForm.controls) {
          this.importFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.importModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  createTicket(data: LDAPConfigViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('LDAP URL', data.ldapUrl), metadata: LDAP_CONFIG_TICKET_METADATA(data.ldapUrl, data.username)
    });
  }

}
