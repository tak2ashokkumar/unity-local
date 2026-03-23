import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LDAPConfigViewData, UnitySetupLdapConfigService } from './unity-setup-ldap-config.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { takeUntil } from 'rxjs/operators';
import { LDAP_CONFIG_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'unity-setup-ldap-config',
  templateUrl: './unity-setup-ldap-config.component.html',
  styleUrls: ['./unity-setup-ldap-config.component.scss'],
  providers: [UnitySetupLdapConfigService]
})
export class UnitySetupLdapConfigComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  viewData: LDAPConfigViewData[] = [];
  selectedView: LDAPConfigViewData;
  isIntergrationPage: boolean;

  @ViewChild('deleteConfirm') deleteConfirm: ElementRef;
  deleteModalRef: BsModalRef;
  constructor(private svc: UnitySetupLdapConfigService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.router.url.includes('integration')) {
      this.isIntergrationPage = true;
    }
    this.getLDAPConfigs();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getLDAPConfigs();
  }

  getLDAPConfigs() {
    this.svc.getLDAPConfigs().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  syncNow(view: LDAPConfigViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.ldapConfigId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getLDAPConfigs();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  goToEdit(view: LDAPConfigViewData) {
    this.router.navigate([view.ldapConfigId, 'edit'], { relativeTo: this.route });
  }

  goToImportUser(view: LDAPConfigViewData) {
    this.router.navigate([view.ldapConfigId, 'ldap-user-import'], { relativeTo: this.route });
  }

  delete(view: LDAPConfigViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteConfig(this.selectedView.ldapConfigId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('LDAP Config deleted successfully.'));
      this.getLDAPConfigs();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete LDAP Config!! Please try again.'));
    });
  }

  createTicket(data: LDAPConfigViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('LDAP URL', data.ldapUrl), metadata: LDAP_CONFIG_TICKET_METADATA(data.ldapUrl, data.username)
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}