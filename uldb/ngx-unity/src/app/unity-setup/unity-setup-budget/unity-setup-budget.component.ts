import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UnitySetupBudgetService, budgetViewData } from './unity-setup-budget.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'unity-setup-budget',
  templateUrl: './unity-setup-budget.component.html',
  styleUrls: ['./unity-setup-budget.component.scss'],
  providers: [UnitySetupBudgetService]
})

export class UnitySetupBudgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  budgetViewData: budgetViewData[] = [];
  count: number;
  budgetUuid: string;
  modalRef: BsModalRef;
  @ViewChild('costSyncModel') costSyncModel: ElementRef;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  budgetDeleteModalRef: BsModalRef;

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private budgetService: UnitySetupBudgetService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ status: '', scope: '', period: '' }]
    };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.budgetList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ status: '', scope: '', period: '' }] };
    this.budgetList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.budgetList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.budgetList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.budgetList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.budgetList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.budgetList();
  }

  budgetList() {
    this.budgetService.getBudget(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.budgetViewData = this.budgetService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Budget'));
    });
  }

  toggleStatus(index: number, status: boolean) {
    this.budgetService.toggleStatus(this.budgetViewData[index].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.budgetList();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change budget status'));
    });
  }

  budgetDetail(view: budgetViewData) {
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });
  }

  createBudget() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editBudget(view: budgetViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteBudget(budgetUuid: string) {
    this.budgetUuid = budgetUuid;
    this.budgetDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmBudgetDelete() {
    this.budgetDeleteModalRef.hide();
    this.spinner.start('main');
    this.budgetService.deleteBudget(this.budgetUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Budget deleted successfully.'));
      // this.getTaskData();
      this.budgetList();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Budget can not be deleted!! Please try again.'));
    });
  }

  syncBudget(index: number, status: boolean) {
    this.spinner.start('main');
    this.modalRef.hide();
    this.budgetService.syncBudget().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.budgetList();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to sync budget status'));
    });
  }

  costSync() {
    this.modalRef = this.modalService.show(this.costSyncModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }




}
