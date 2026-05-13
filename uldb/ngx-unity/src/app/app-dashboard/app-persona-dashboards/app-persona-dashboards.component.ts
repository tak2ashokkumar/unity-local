import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppPersonaDashboardsService, PersonaDashboardListViewData } from './app-persona-dashboards.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-persona-dashboards',
  templateUrl: './app-persona-dashboards.component.html',
  styleUrls: ['./app-persona-dashboards.component.scss'],
  providers: [AppPersonaDashboardsService]
})
export class AppPersonaDashboardsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: PersonaDashboardListViewData[] = [];
  selectedView: PersonaDashboardListViewData;

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  @ViewChild('confirmStatusChangeRef') confirmStatusChangeRef: ElementRef;
  modalRef: BsModalRef;
  popOverList: string[] = [];
  constructor(private svc: AppPersonaDashboardsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDashboardList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getDashboardList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDashboardList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDashboardList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDashboardList();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getDashboardList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    this.getDashboardList();
  }

  getDashboardList() {
    this.svc.getDashboardList(this.currentCriteria).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, error => {
      this.notification.error(error);
      this.spinner.stop('main');
    });
  }

  showGroups(view: PersonaDashboardListViewData) {
    this.popOverList = view.extraGroups;
  }

  toggleStatus(view: PersonaDashboardListViewData, status: boolean) {
    // if (view.isActive == status) {
    //   return;
    // }
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmStatusChangeRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }
  confirmToggleStatus() {
    this.modalRef.hide();
    this.selectedView.status = this.selectedView.status == 'draft' ? 'published' : 'draft';
    this.svc.saveStatus(this.selectedView.dashboardId, this.selectedView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDashboardList();
      this.notification.success(new Notification(`Status updated successfully.`));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to update status.`));
    });
  }

  viewDashboard(view: PersonaDashboardListViewData) {
    this.router.navigate([view.dashboardId], { relativeTo: this.route });
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: PersonaDashboardListViewData) {
    this.router.navigate([view.dashboardId, 'edit'], { relativeTo: this.route });
  }

  delete(view: PersonaDashboardListViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }
  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.dashboardId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Dashboard deleted successfully.'));
      this.getDashboardList();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      if (err?.status != 500) {
        let msg = err.error?.msg ? err.error.msg : err.error;
        this.notification.error(new Notification(msg));
      } else {
        this.notification.error(new Notification('Failed to delete Dashboard. Tryagain later.'));
      }
    })
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
