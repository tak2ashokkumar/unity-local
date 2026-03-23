import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PermissionSetViewData, UsumPermissionSetsService } from './usum-permission-sets.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usum-permission-sets',
  templateUrl: './usum-permission-sets.component.html',
  styleUrls: ['./usum-permission-sets.component.scss'],
  providers: [UsumPermissionSetsService]
})
export class UsumPermissionSetsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: PermissionSetViewData[] = [];
  permissionsList: string[] = [];
  selectedPermissionView: PermissionSetViewData;
  togglePermissionSetData: PermissionSetViewData;
  @ViewChild('toggleConfirmPermissionSet') toggleConfirmPermissionSet: ElementRef;
  toggleConfirmPermissionSetModalRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UsumPermissionSetsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getPermissionSets();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getPermissionSets();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getPermissionSets();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPermissionSets();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getPermissionSets();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getPermissionSets();
  }

  getPermissionSets() {
    this.svc.getPermissionSets(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Permission Sets.'));
    })
  }

  showPermissions(view: PermissionSetViewData) {
    this.permissionsList = view.permissionsList;
  }

  togglePermissionSet(view: PermissionSetViewData) {
    if (view.isDefault) {
      return;
    }
    this.togglePermissionSetData = view;
    this.toggleConfirmPermissionSetModalRef = this.modalService.show(this.toggleConfirmPermissionSet, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmTogglePermissionSet() {
    this.spinner.start('main');
    this.toggleConfirmPermissionSetModalRef.hide();
    this.svc.togglePermissionSet(this.togglePermissionSetData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification(`Permission Set ${this.togglePermissionSetData.toggleTootipMsg} successfully`));
      this.getPermissionSets();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  deletePermissionSet(view: PermissionSetViewData) {
    if (view.isDefault) {
      return;
    }
    this.selectedPermissionView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeletePermissionSet() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deletePermissionSet(this.selectedPermissionView.permissionSetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getPermissionSets();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Permission Set. Please try again later.'));
    })
  }

  goToCreatePermissionSet() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditPermissionSet(view: PermissionSetViewData) {
    if (view.isDefault) {
      return;
    }
    this.router.navigate([view.permissionSetId, 'edit'], { relativeTo: this.route });
  }

}