import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserGroupViewData, UsumUserGroupsService } from './usum-user-groups.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usum-user-groups',
  templateUrl: './usum-user-groups.component.html',
  styleUrls: ['./usum-user-groups.component.scss'],
  providers: [UsumUserGroupsService]
})
export class UsumUserGroupsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: UserGroupViewData[] = [];
  usersList: string[] = [];
  userRolesList: string[];
  selectedUserGroupView: UserGroupViewData;
  toggleUserGroupData: UserGroupViewData;
  @ViewChild('toggleConfirmUserGroup') toggleConfirmUserGroup: ElementRef;
  toggleConfirmUserGroupModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UsumUserGroupsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUserGroups();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getUserGroups();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUserGroups();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUserGroups();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getUserGroups();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUserGroups();
  }

  getUserGroups() {
    this.svc.getUserGroups(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch User Groups.'));
    })
  }

  showUsers(view: UserGroupViewData) {
    this.usersList = view.usersList;
  }

  showUserRoles(view: UserGroupViewData) {
    this.userRolesList = view.userRolesList;
  }

  toggleUserGroup(view: UserGroupViewData) {
    this.toggleUserGroupData = view;
    this.toggleConfirmUserGroupModalRef = this.modalService.show(this.toggleConfirmUserGroup, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmToggleUserGroup() {
    this.spinner.start('main');
    this.toggleConfirmUserGroupModalRef.hide();
    this.svc.toggleUserGroup(this.toggleUserGroupData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification(`User Group ${this.toggleUserGroupData.toggleTootipMsg} successfully`));
      this.getUserGroups();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  deleteUserGroup(view: UserGroupViewData) {
    this.selectedUserGroupView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmdeleteUserGroup() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteUserGroup(this.selectedUserGroupView.userGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getUserGroups();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete User Group. Please try again later.'));
    })
  }

  goToCreateUserGroup() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditUserGroup(view: UserGroupViewData) {
    this.router.navigate([view.userGroupId, 'edit'], { relativeTo: this.route });
  }

}
