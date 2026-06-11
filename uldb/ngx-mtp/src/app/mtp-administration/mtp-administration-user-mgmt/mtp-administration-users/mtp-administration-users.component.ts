import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { MtpAdministrationUsersService, UserViewData } from './mtp-administration-users.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TenantType } from './mtp-administration-users-crud/mtp-administration-users-crud.type';

@Component({
  selector: 'mtp-administration-users',
  templateUrl: './mtp-administration-users.component.html',
  styleUrls: ['./mtp-administration-users.component.scss'],
  providers: [MtpAdministrationUsersService]
})
export class MtpAdministrationUsersComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  tenantSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Tenants',
  };

  currentCriteria: SearchCriteria;
  viewData: UserViewData[] = [];
  tenantList: Array<TenantType> = [];
  popOverList: string[];
  extraRoles: string[];
  selectedView: UserViewData;
  count: number;
  action: 'delete' | 'enable' | 'disable';
  buttonMessage: 'Delete' | 'Enable' | 'Disable';

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private userService: MtpAdministrationUsersService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', is_active: '' }], multiValueParam: { tenants: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUsers();
    this.getTenants();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '', is_active: '' }], multiValueParam: { tenants: [] } };
    this.getUsers();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.userService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get users.'));
    });
  }

  getTenants() {
    this.tenantList = [];
    this.userService.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tenantList = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get tenants.'));
      this.spinner.stop('main');
    });
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  showTenants(view: UserViewData) {
    this.popOverList = view.extraTenantsList;
  }

  showRoles(view: UserViewData) {
    this.popOverList = view.extraRolesList;
  }

  import() {
    this.router.navigate(['import'], { relativeTo: this.route });
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: UserViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  resetPassword(view: UserViewData) {
    if (!view.isActive) {
      return;
    } else {
      this.spinner.start('main');
      this.userService.resetPassword(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Password reset link sent successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Something went wrong. Please try again!!'));
      });
    }
  }

  toggle(view: UserViewData) {
    if (view.isActive) {
      this.action = 'disable';
      this.buttonMessage = 'Disable'
    } else {
      this.action = 'enable';
      this.buttonMessage = 'Enable'
    }
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  delete(view: UserViewData) {
    this.action = 'delete';
    this.buttonMessage = 'Delete'
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  manageUser() {
    if (this.action == 'delete') {
      this.confirmDelete();
    } else {
      this.confirmToggle();
    }
  }

  confirmToggle() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.userService.toggle(this.selectedView.uuid, !this.selectedView.isActive).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      if (this.selectedView.isActive) {
        this.notification.success(new Notification('User disabled successfully.'));
        this.getUsers();
      } else {
        this.notification.success(new Notification('User enabled successfully.'));
        this.getUsers();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.userService.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('User deleted successfully.'));
      this.getUsers();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to delete user. Please try again.'));
    })
  }
}
