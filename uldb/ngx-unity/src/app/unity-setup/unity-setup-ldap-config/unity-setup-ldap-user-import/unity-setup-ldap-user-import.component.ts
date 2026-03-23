import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LDAPUserViewData, UnitySetupLdapUserImportService } from './unity-setup-ldap-user-import.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { LDAPUserType } from '../unity-setup-ldap-config.type';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'unity-setup-ldap-user-import',
  templateUrl: './unity-setup-ldap-user-import.component.html',
  styleUrls: ['./unity-setup-ldap-user-import.component.scss'],
  providers: [UnitySetupLdapUserImportService]
})
export class UnitySetupLdapUserImportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: LDAPUserViewData[] = [];
  selectedUsers: string[] = [];
  selectedAll: boolean = false;
  ldapUsers: Array<LDAPUserType> = [];
  ldapConfigId: string;
  @ViewChild('importuser') importuser: ElementRef;
  importModalRef: BsModalRef;

  nonFieldErr: string = '';
  importForm: FormGroup;
  importFormErrors: any;
  importValidationMessages: any;

  constructor(private svc: UnitySetupLdapUserImportService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.ldapConfigId = params.get('ldapConfigId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getLDAPUsers();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getLDAPUsers();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getLDAPUsers();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getLDAPUsers();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getLDAPUsers();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.selectedAll = false;
    this.selectedUsers = [];
    this.currentCriteria.pageNo = pageNo;
    this.getLDAPUsers();
  }

  buildImportForm() {
    this.nonFieldErr = '';
    this.importForm = this.svc.buildImportForm();
    this.importFormErrors = this.svc.resetImportFormErrors();
    this.importValidationMessages = this.svc.validationImportMessages;
  }

  importLDAPUserByForm() {
    this.buildImportForm();
    this.importModalRef = this.modalService.show(this.importuser, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmImportLDAPUserByForm() {
    if (this.importForm.invalid) {
      this.importFormErrors = this.utilService.validateForm(this.importForm, this.importValidationMessages, this.importFormErrors);
      this.importForm.valueChanges.subscribe((data: any) => { this.importFormErrors = this.utilService.validateForm(this.importForm, this.importValidationMessages, this.importFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.svc.importLDAPUserByForm(this.ldapConfigId, this.importForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.importModalRef.hide();
        this.notification.success(new Notification('LDAP user imported successfully'));
        this.goBack();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleImportError(err.error);
      });
    }
  }

  handleImportError(err: any) {
    this.importFormErrors = this.svc.resetImportFormErrors();
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
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  getLDAPUsers() {
    this.svc.getLDAPUsers(this.ldapConfigId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.ldapUsers = data.results;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.notification.error(new Notification('Failed to get users.'));
      this.spinner.stop('main');
    });
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.selectedUsers = [];
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedUsers.push(view.email);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
    }
  }

  select(view: LDAPUserViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedUsers.splice(this.selectedUsers.indexOf(view.email), 1);
    } else {
      this.selectedUsers.push(view.email);
    }
    this.selectedAll = this.selectedUsers.length == this.viewData.length;
  }

  confirmImportLDAPUsers() {
    const filteredUsers: LDAPUserType[] = this.ldapUsers.filter(user => this.selectedUsers.includes(user.email));
    this.spinner.start('main');
    this.svc.importLDAPUsers(this.ldapConfigId, filteredUsers).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.notification.success(new Notification('LDAP Users imported successfully'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('LDAP Users could not be imported'));
      this.goBack();
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}