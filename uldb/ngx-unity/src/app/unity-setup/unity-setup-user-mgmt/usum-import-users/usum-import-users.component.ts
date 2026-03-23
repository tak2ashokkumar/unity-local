import { Component, OnDestroy, OnInit } from '@angular/core';
import { AzureUserType, ImportUserViewData, UsumImportUsersService } from './usum-import-users.service';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usum-import-users',
  templateUrl: './usum-import-users.component.html',
  styleUrls: ['./usum-import-users.component.scss'],
  providers: [UsumImportUsersService]
})
export class UsumImportUsersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  accounts: Array<AzureManageAccountsType> = [];
  selectedAccount: string = '';
  viewData: ImportUserViewData[] = [];
  selectedUsers: string[] = [];
  selectedAll: boolean = false;
  users: Array<AzureUserType> = [];
  constructor(private spinner: AppSpinnerService,
    private svc: UsumImportUsersService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAzureAccounts();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.selectedAccount = '';
    this.selectedAll = false;
    this.selectedUsers = [];
    this.getAzureAccounts();
  }

  getAzureAccounts() {
    this.accounts = [];
    this.svc.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = data;
      this.accounts = this.accounts.filter(account => account.azure_ad_integ == true);
      if (data.length) {
        this.selectedAccount = this.accounts[0].uuid;
        this.getAzureUsers();
      }
      if (!data.length) {
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Azure Accounts.'));
      this.spinner.stop('main');
    });
  }

  getUsers() {
    this.spinner.start('main');
    this.selectedAll = false;
    this.selectedUsers = [];
    this.getAzureUsers();
  }

  getAzureUsers() {
    this.svc.getAzureUsers(this.selectedAccount).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.users = data;
      this.viewData = this.svc.convertToViewData(data);
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
    const filteredUsers: AzureUserType[] = this.users.filter(user => this.selectedUsers.includes(user.mail));
    this.spinner.start('main');
    this.svc.importUsersFromAzureAD(this.selectedAccount, filteredUsers).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.notification.success(new Notification('Users imported successfully'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedUsers = [];
      this.selectedAll = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('User could not be imported'));
      this.goBack();
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}