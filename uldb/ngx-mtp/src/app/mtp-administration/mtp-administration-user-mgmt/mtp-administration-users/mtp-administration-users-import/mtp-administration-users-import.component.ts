import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AzureAccountsType } from 'src/app/mtp-administration/mtp-administration-integrations/azure-details/azure-details.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ImportUserViewData, MtpAdministrationUsersImportService } from './mtp-administration-users-import.service';
import { ImportUserType } from './mtp-administration-users-import.types';

@Component({
  selector: 'mtp-administration-users-import',
  templateUrl: './mtp-administration-users-import.component.html',
  styleUrls: ['./mtp-administration-users-import.component.scss'],
  providers: [MtpAdministrationUsersImportService]
})
export class MtpAdministrationUsersImportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  accounts: Array<AzureAccountsType> = [];
  selectedAccount: string = '';
  viewData: ImportUserViewData[] = [];
  selectedUsers: string[] = [];
  selectedAll: boolean = false;
  users: Array<ImportUserType> = [];

  constructor(private spinner: AppSpinnerService,
    private importService: MtpAdministrationUsersImportService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAccounts();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.selectedAccount = '';
    this.getAccounts();
  }

  getAccounts() {
    this.accounts = [];
    this.importService.getAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = data;
      if (data.length) {
        this.getUsers(this.accounts[0].uuid);
        this.selectedAccount = this.accounts[0].uuid;
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get accounts.'));
      this.spinner.stop('main');
    });
  }

  getUsers(accountId: string) {
    this.importService.getUsers(accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.users = data;
      this.viewData = this.importService.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get users.'));
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

  select(view: ImportUserViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedUsers.splice(this.selectedUsers.indexOf(view.email), 1);
    } else {
      this.selectedUsers.push(view.email);
    }
    this.selectedAll = this.selectedUsers.length == this.viewData.length;
  }

  confirmImport() {
    const filteredUsers: ImportUserType[] = this.users.filter(user => this.selectedUsers.includes(user.mail));
    this.spinner.start('main');
    this.importService.importUsers(filteredUsers).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.goBack();
      this.notification.success(new Notification('Users imported successfully'));
    }, (err: HttpErrorResponse) => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.goBack();
      this.notification.error(new Notification('User could not be imported'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
