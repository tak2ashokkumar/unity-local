import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { RoleViewData, UsumRolesService } from './usum-roles.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usum-roles',
  templateUrl: './usum-roles.component.html',
  styleUrls: ['./usum-roles.component.scss'],
  providers: [UsumRolesService]
})
export class UsumRolesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: RoleViewData[] = [];
  selectedRoleView: RoleViewData;
  userGropusNameList: string[] = [];
  permissionsList: string[] = [];
  usersList: string[] = [];
  toggleRoleData: RoleViewData;
  @ViewChild('toggleConfirmRole') toggleConfirmRole: ElementRef;
  toggleConfirmRoleModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UsumRolesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getRoles();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getRoles();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  getRoles() {
    this.svc.getRoles(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Permissions.'));
    })
  }

  showPermissions(view: RoleViewData) {
    this.permissionsList = view.permissionsList;
  }

  // showUserGroupsNames(view: RoleViewData) {
  //   this.userGropusNameList = view.userGroupsNameList;
  // } 

  showUsers(view: RoleViewData) {
    this.usersList = view.usersList;
  }

  toggleRole(view: RoleViewData) {
    if (view.isDefault) {
      return;
    }
    this.toggleRoleData = view;
    this.toggleConfirmRoleModalRef = this.modalService.show(this.toggleConfirmRole, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmToggleRole() {
    this.spinner.start('main');
    this.toggleConfirmRoleModalRef.hide();
    this.svc.toggleRole(this.toggleRoleData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification(`Role ${this.toggleRoleData.toggleTootipMsg} successfully`));
      this.getRoles();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  deleteRole(view: RoleViewData) {
    if (view.isDefault) {
      return;
    }
    this.selectedRoleView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteRole() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteRole(this.selectedRoleView.roleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getRoles();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Role. Please try again later.'));
    })
  }

  goToCreateRole() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditRole(view: RoleViewData) {
    if (view.isDefault) {
      return;
    }
    this.router.navigate([view.roleId, 'edit'], { relativeTo: this.route });
  }

}