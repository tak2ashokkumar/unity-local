import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ManageEngineInstanceHistoryViewData, ManageEngineInstancesViewData, UsiManageEngineService } from './usi-manage-engine.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-manage-engine',
  templateUrl: './usi-manage-engine.component.html',
  styleUrls: ['./usi-manage-engine.component.scss'],
  providers: [UsiManageEngineService]
})
export class UsiManageEngineComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: ManageEngineInstancesViewData[] = [];
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  manageEngineId: string;

  historyCurrentCriteria: SearchCriteria;
  historyCount: number = 0;
  @ViewChild('history') history: ElementRef;
  historyModalRef: BsModalRef;
  viewHistoryData: ManageEngineInstanceHistoryViewData[] = [];
  constructor(private svc: UsiManageEngineService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.historyCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  historyPageChange(pageNo: number) {
    this.spinner.start('main');
    this.historyCurrentCriteria.pageNo = pageNo;
    this.getInstancesHistory();
  }

  historyPageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.historyCurrentCriteria.pageSize = pageSize;
    this.historyCurrentCriteria.pageNo = 1;
    this.getInstancesHistory();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewdata(res.results);
      this.count = res.count;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(data: ManageEngineInstancesViewData) {
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route });
  }

  delete(data: ManageEngineInstancesViewData) {
    this.manageEngineId = data.uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.svc.delete(this.manageEngineId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.notification.success(new Notification('Manage Engine deleted successfully'));
      this.getInstances();
    }, (err) => {
      this.notification.error(new Notification('Error while deleting Manage Engine. Please try again'));
    });
  }

  viewHistory(data: ManageEngineInstancesViewData) {
    this.spinner.start('main');
    this.viewHistoryData = [];
    this.historyCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.manageEngineId = data.uuid;
    this.getInstancesHistory();
    this.historyModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  getInstancesHistory() {
    this.svc.getInstancesHistory(this.manageEngineId, this.historyCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewHistoryData = this.svc.convertToInstanceHistoryViewdata(res.results);
      this.historyCount = res.count;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
