import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AzureUserType,
  AzureUsersPaginatedResponse,
  AzureUsersQueryParams,
  AzureUsersResponse,
  ImportUsersFromAzurePayload,
  ImportUserViewData,
  UsumImportUsersService
} from './usum-import-users.service';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { finalize, takeUntil } from 'rxjs/operators';

const DEFAULT_IMPORT_USER_PAGE_SIZE = 25;

@Component({
  selector: 'usum-import-users',
  templateUrl: './usum-import-users.component.html',
  styleUrls: ['./usum-import-users.component.scss'],
  providers: [UsumImportUsersService]
})
export class UsumImportUsersComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  accounts: Array<AzureManageAccountsType> = [];
  selectedAccount: string = '';
  searchValue: string = '';
  currentPage: number = 1;
  pageSize: number = DEFAULT_IMPORT_USER_PAGE_SIZE;
  hasNext: boolean = false;
  hasPrevious: boolean = false;
  showUserCount: boolean = false;
  userCount: number = 0;
  viewData: ImportUserViewData[] = [];
  selectedUsers: string[] = [];
  excludedUsers: string[] = [];
  selectedAll: boolean = false;
  users: Array<AzureUserType> = [];
  selectedUsersPrimaryLabel: string = '';
  selectedUsersMoreLabel: string = '';
  selectedUsersPopoverLabels: string[] = [];

  private nextLink: string = '';
  private nextLinkStack: string[] = [];

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

  refreshData(_pageNo: number): void {
    this.spinner.start('main');
    this.selectedAccount = '';
    this.resetGraphPagination();
    this.resetSelections();
    this.getAzureAccounts();
  }

  getAzureAccounts(): void {
    this.accounts = [];
    this.svc.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = (data || []).filter(account => account.azure_ad_integ === true);
      if (this.accounts.length) {
        this.selectedAccount = this.accounts[0].uuid;
        this.resetGraphPagination();
        this.getAzureUsers();
        return;
      }
      this.clearTableData();
      this.spinner.stop('main');
    }, () => {
      this.notification.error(new Notification('Failed to get Azure Accounts.'));
      this.spinner.stop('main');
    });
  }

  onAccountChanged(): void {
    this.spinner.start('main');
    this.resetGraphPagination();
    this.resetSelections();
    this.getAzureUsers();
  }

  onSearched(event: string): void {
    const searchValue: string = event ? event.trim() : '';
    if (this.searchValue === searchValue) {
      return;
    }
    this.searchValue = searchValue;
    this.spinner.start('main');
    this.resetGraphPagination();
    if (this.selectedAll) {
      this.resetSelections();
    } else {
      this.updateSelectionSummary();
    }
    this.getAzureUsers();
  }

  pageSizeChange(pageSize: number): void {
    const selectedPageSize: number = Number(pageSize);
    if (this.pageSize === selectedPageSize) {
      return;
    }
    this.spinner.start('main');
    this.pageSize = selectedPageSize;
    this.resetGraphPagination();
    this.getAzureUsers();
  }

  nextPage(): void {
    if (!this.canGoNext) {
      return;
    }
    const requestedPage: number = this.currentPage + 1;
    const cursorStack: string[] = [...this.nextLinkStack, this.nextLink];
    this.spinner.start('main');
    this.getAzureUsers(this.nextLink, requestedPage, cursorStack);
  }

  previousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }
    const requestedPage: number = Math.max(this.currentPage - 1, 1);
    const cursorStack: string[] = this.nextLinkStack.slice(0, -1);
    const previousLink: string = cursorStack.length ? cursorStack[cursorStack.length - 1] : '';
    this.spinner.start('main');
    this.getAzureUsers(previousLink, requestedPage, cursorStack);
  }

  getAzureUsers(nextLink: string = '', requestedPage: number = 1, nextLinkStack: string[] = []): void {
    if (!this.selectedAccount) {
      this.clearTableData();
      this.spinner.stop('main');
      return;
    }
    this.svc.getAzureUsers(this.selectedAccount, this.getAzureUsersQuery(nextLink, requestedPage))
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinner.stop('main')))
      .subscribe(data => {
        this.setAzureUsersResponse(data, requestedPage, nextLinkStack);
      }, () => {
        this.viewData = [];
        this.users = [];
        this.nextLink = '';
        this.hasNext = false;
        this.hasPrevious = false;
        this.showUserCount = false;
        this.userCount = 0;
        this.notification.error(new Notification('Failed to get users.'));
      });
  }

  selectAll(): void {
    if (!this.viewData.length) {
      this.selectedAll = false;
      this.updateSelectionSummary();
      return;
    }
    if (this.isSelectAllChecked) {
      this.resetSelections();
      return;
    }
    this.selectedAll = true;
    this.selectedUsers = [];
    this.excludedUsers = [];
    this.syncCurrentPageSelections();
    this.updateSelectionSummary();
  }

  select(view: ImportUserViewData): void {
    const email: string = this.trimEmail(view.email);
    if (!view.canSelect || !email) {
      return;
    }
    if (this.selectedAll) {
      if (this.isExcludedUser(email)) {
        this.removeExcludedUser(email);
      } else {
        this.addExcludedUser(email);
      }
      this.syncCurrentPageSelections();
      this.updateSelectionSummary();
      return;
    }
    if (this.isSelectedUser(email)) {
      this.removeSelectedUser(email);
    } else {
      this.addSelectedUser(email);
    }
    this.syncCurrentPageSelections();
    this.updateSelectionSummary();
  }

  confirmImport(): void {
    if (!this.hasSelectedUsers) {
      return;
    }
    const payload: ImportUsersFromAzurePayload = this.getImportUsersPayload();
    this.spinner.start('main');
    this.svc.importUsersFromAzureAD(this.selectedAccount, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.resetSelections();
      this.spinner.stop('main');
      this.notification.success(new Notification('Users imported successfully'));
      this.goBack();
    }, () => {
      this.resetSelections();
      this.spinner.stop('main');
      this.notification.error(new Notification('User could not be imported'));
      this.goBack();
    });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  get isSelectAllChecked(): boolean {
    return this.selectedAll && !this.excludedUsers.length;
  }

  get canGoNext(): boolean {
    return this.hasNext && !!this.nextLink;
  }

  get canGoPrevious(): boolean {
    return this.hasPrevious && (this.currentPage > 1 || !!this.nextLinkStack.length);
  }

  get hasSelectedUsers(): boolean {
    return this.selectedAll || !!this.selectedUsers.length;
  }

  trackByUser(index: number, view: ImportUserViewData): string {
    return view.email || `${view.firstName}-${view.lastName}-${index}`;
  }

  trackByAccount(_index: number, account: AzureManageAccountsType): string {
    return account.uuid;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private setAzureUsersResponse(data: AzureUsersResponse, requestedPage: number, nextLinkStack: string[]): void {
    this.users = this.getResponseResults(data);
    this.viewData = this.svc.convertToViewData(this.users);
    this.nextLinkStack = [...nextLinkStack];
    const currentResultCount: number = this.getResponseCount(data, this.users.length);

    if (Array.isArray(data)) {
      this.currentPage = requestedPage;
      this.nextLink = '';
      this.hasNext = false;
      this.hasPrevious = this.currentPage > 1 || !!this.nextLinkStack.length;
      this.showUserCount = true;
      this.userCount = currentResultCount;
    } else {
      const response: AzureUsersPaginatedResponse = data;
      this.currentPage = response.page || requestedPage;
      this.nextLink = response.next || '';
      this.hasNext = !!response.has_next || !!this.nextLink;
      this.hasPrevious = !!response.has_previous || this.currentPage > 1 || !!this.nextLinkStack.length;
      this.showUserCount = !this.hasNext;
      this.userCount = this.showUserCount ? this.getResolvedUserCount(currentResultCount) : 0;
    }

    this.syncCurrentPageSelections();
  }

  private getResponseResults(data: AzureUsersResponse): AzureUserType[] {
    return Array.isArray(data) ? data : (data.results || []);
  }

  private getResponseCount(data: AzureUsersResponse, fallbackCount: number): number {
    return Array.isArray(data) || data.count === undefined ? fallbackCount : data.count;
  }

  private getResolvedUserCount(currentResultCount: number): number {
    return this.currentPage <= 1 ? currentResultCount : ((this.currentPage - 1) * this.pageSize) + currentResultCount;
  }

  private getAzureUsersQuery(nextLink: string, requestedPage: number): AzureUsersQueryParams {
    const query: AzureUsersQueryParams = {
      page: requestedPage,
      pageSize: this.pageSize
    };
    const searchValue: string = this.getActiveSearchValue();
    if (nextLink) {
      query.nextLink = nextLink;
    }
    if (searchValue) {
      query.search = searchValue;
    }
    return query;
  }

  private clearTableData(): void {
    this.users = [];
    this.viewData = [];
    this.showUserCount = false;
    this.userCount = 0;
    this.resetGraphPagination();
  }

  private resetGraphPagination(): void {
    this.currentPage = 1;
    this.nextLink = '';
    this.nextLinkStack = [];
    this.hasNext = false;
    this.hasPrevious = false;
  }

  private resetSelections(): void {
    this.selectedUsers = [];
    this.excludedUsers = [];
    this.selectedAll = false;
    this.syncCurrentPageSelections();
    this.updateSelectionSummary();
  }

  private syncCurrentPageSelections(): void {
    this.viewData.forEach(view => {
      const email: string = this.normalizeEmail(view.email);
      view.isSelected = view.canSelect && !!email && (this.selectedAll ? !this.isExcludedUser(email) : this.isSelectedUser(email));
    });
  }

  private getImportUsersPayload(): ImportUsersFromAzurePayload {
    if (this.selectedAll) {
      const payload: ImportUsersFromAzurePayload = {
        is_all_selected: true
      };
      const searchValue: string = this.getActiveSearchValue();
      if (this.excludedUsers.length) {
        payload.excluded_users = [...this.excludedUsers];
      }
      if (searchValue) {
        payload.search = searchValue;
      }
      return payload;
    }

    return {
      selected_users: [...this.selectedUsers],
      is_all_selected: false
    };
  }

  private addSelectedUser(email: string): void {
    const trimmedEmail: string = this.trimEmail(email);
    if (trimmedEmail && !this.isSelectedUser(email)) {
      this.selectedUsers.push(trimmedEmail);
    }
  }

  private removeSelectedUser(email: string): void {
    const selectedUserIndex: number = this.findEmailIndex(this.selectedUsers, email);
    if (selectedUserIndex !== -1) {
      this.selectedUsers.splice(selectedUserIndex, 1);
    }
  }

  private isSelectedUser(email: string): boolean {
    return this.findEmailIndex(this.selectedUsers, email) !== -1;
  }

  private addExcludedUser(email: string): void {
    const trimmedEmail: string = this.trimEmail(email);
    if (trimmedEmail && !this.isExcludedUser(email)) {
      this.excludedUsers.push(trimmedEmail);
    }
  }

  private removeExcludedUser(email: string): void {
    const excludedUserIndex: number = this.findEmailIndex(this.excludedUsers, email);
    if (excludedUserIndex !== -1) {
      this.excludedUsers.splice(excludedUserIndex, 1);
    }
  }

  private isExcludedUser(email: string): boolean {
    return this.findEmailIndex(this.excludedUsers, email) !== -1;
  }

  private findEmailIndex(list: string[], email: string): number {
    const normalizedEmail: string = this.normalizeEmail(email);
    return normalizedEmail ? list.findIndex(value => this.normalizeEmail(value) === normalizedEmail) : -1;
  }

  private updateSelectionSummary(): void {
    if (this.selectedAll) {
      const searchValue: string = this.getActiveSearchValue();
      this.selectedUsersPrimaryLabel = searchValue ? 'All matching users' : 'All users';
      this.selectedUsersPopoverLabels = [searchValue ? `Search: ${searchValue}` : 'All users selected.'];
      if (this.excludedUsers.length) {
        this.selectedUsersPopoverLabels = this.selectedUsersPopoverLabels.concat(
          this.excludedUsers.map(email => `Excluded: ${email}`)
        );
      }
      this.selectedUsersMoreLabel = this.excludedUsers.length ? `-${this.excludedUsers.length}` : 'Details';
      return;
    }

    this.selectedUsersPrimaryLabel = this.selectedUsers.length.toString();
    this.selectedUsersMoreLabel = `+${this.selectedUsers.length}`;
    this.selectedUsersPopoverLabels = [...this.selectedUsers];
  }

  private getActiveSearchValue(): string {
    return this.searchValue ? this.searchValue.trim() : '';
  }

  private trimEmail(email: string): string {
    return email ? email.trim() : '';
  }

  private normalizeEmail(email: string): string {
    return email ? email.trim().toLowerCase() : '';
  }

}
