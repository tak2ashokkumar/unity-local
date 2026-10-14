import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EsxiScheduleHistoryViewData, EsxiViewData, PrivateCloudEsxiService } from './private-cloud-esxi.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'private-cloud-esxi',
  templateUrl: './private-cloud-esxi.component.html',
  styleUrls: ['./private-cloud-esxi.component.scss'],
  providers: [PrivateCloudEsxiService]
})
export class PrivateCloudEsxiComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  count: number;
  viewData: EsxiViewData[] = [];
  selectedView: EsxiViewData;
  scheduleHistoryData: EsxiScheduleHistoryViewData[] = [];


  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;
  @ViewChild('scheduleHistory') scheduleHistory: ElementRef;

  scheduleHistoryCount: number;
  scheduleHistoryView: EsxiViewData;
  scheduleHistoryRef: BsModalRef;


  constructor(private service: PrivateCloudEsxiService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit(): void {
    this.getAccounts()
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }


  getAccounts() {
    this.viewData = [];
    this.spinner.start('main');
    this.service.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.service.convertToViewData(res.results);
      console.log(this.viewData)
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to get Esxi accounts.`));
    })
  }

  addAccount() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editAccount(view: EsxiViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(view: EsxiViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.service.deleteAccount(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to delete Account. Please try again.'));
    });
  }

  popTagList: string[];

  showTags(view: EsxiViewData) {
    this.popTagList = view.extraServers;
  }

  syncNow(view: EsxiViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.service.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getScheduleHistory(view?: EsxiViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.service.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count;
      this.scheduleHistoryData = this.service.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if (view) {
        this.scheduleHistoryRef = this.modalService.show(this.scheduleHistory, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  // loadResources(view: any) {
  //   this.router.navigate([view.uuid, 'resources'], { relativeTo: this.route });
  // }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
