import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GroupViewData, MtpAdministrationGroupService } from './mtp-administration-group.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { RoleType } from '../mtp-administration-roles/mtp-administration-roles.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TenantType, UserType } from '../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';

@Component({
  selector: 'mtp-administration-group',
  templateUrl: './mtp-administration-group.component.html',
  styleUrls: ['./mtp-administration-group.component.scss'],
  providers: [MtpAdministrationGroupService]
})
export class MtpAdministrationGroupComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  userListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "email",
    keyToSelect: "email",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Users',
  };

  roleListSettings: IMultiSelectSettings = {
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

  roleSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Roles',
  };

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

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  currentCriteria: SearchCriteria;
  viewData: GroupViewData[] = [];
  count: number;
  roles: Array<RoleType> = [];
  users: Array<UserType> = [];
  popOverList: string[];
  tenants: Array<TenantType> = [];
  selectedView: GroupViewData;
  action: 'delete' | 'enable' | 'disable';
  buttonMessage: 'Delete' | 'Enable' | 'Disable';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private groupService: MtpAdministrationGroupService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { tenants: [], user_email: [], role_name: [] } }
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getGroups();
    this.getUsers();
    this.getRoles();
    this.getTenants();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { tenants: [], user_email: [], role_name: [] } }
    this.getGroups();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGroups();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  getGroups() {
    this.groupService.getGroups(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.groupService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get groups.'));
    });
  }

  getUsers() {
    this.users = [];
    this.groupService.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.users = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get users.'));
      this.spinner.stop('main');
    });
  }

  getRoles() {
    this.roles = [];
    this.groupService.getRoles().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.roles = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get roles.'));
      this.spinner.stop('main');
    });
  }

  getTenants() {
    this.tenants = [];
    this.groupService.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tenants = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get tenants.'));
      this.spinner.stop('main');
    });
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  showUsers(view: GroupViewData) {
    this.popOverList = view.extraUsersList;
  }

  showRoles(view: GroupViewData) {
    this.popOverList = view.extraRolesList;
  }

  showTenants(view: GroupViewData) {
    this.popOverList = view.extraTenantsList;
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: GroupViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  toggle(view: GroupViewData) {
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

  delete(view: GroupViewData) {
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
    this.groupService.toggle(this.selectedView.uuid, !this.selectedView.isActive).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      if (this.selectedView.isActive) {
        this.notification.success(new Notification('User group disabled successfully.'));
        this.getGroups();
      } else {
        this.notification.success(new Notification('User group enabled successfully.'));
        this.getGroups();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.groupService.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('User group deleted successfully.'));
      this.getGroups();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete user group. Please try again.'));
    })
  }
}
