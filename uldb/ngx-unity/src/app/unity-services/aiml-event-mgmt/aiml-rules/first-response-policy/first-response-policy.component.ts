import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { FirstResponsePolicyService, FirstResponsePolicyViewdata } from './first-response-policy.service';
import moment from 'moment';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FirstResponsePolicy } from '../first-response-policy.type';

@Component({
  selector: 'first-response-policy',
  templateUrl: './first-response-policy.component.html',
  styleUrls: ['./first-response-policy.component.scss'],
  providers: [FirstResponsePolicyService],
})

export class FirstResponsePolicyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  count: number;
  currentCriteria: SearchCriteria;

  logDateRange: Array<string> = [moment().subtract(1, 'M').set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss'), moment().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss')];
  start_date: string = moment(this.logDateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
  end_date: string = moment(this.logDateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  @ViewChild('confirmenable') confirmenable: ElementRef;
  confirmEnableModalRef: BsModalRef;
  @ViewChild('confirmdisable') confirmdisable: ElementRef;
  confirmDisableModalRef: BsModalRef;

  selectedPolicy: FirstResponsePolicyViewdata;
  viewData: FirstResponsePolicyViewdata[] = [];

  constructor(private policySvc: FirstResponsePolicyService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TEN, params: [{ status: '', start_date: this.start_date, end_date: this.end_date }] };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.getPolicyList();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.searchValue = '';
    this.getPolicyList();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPolicyList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getPolicyList();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getPolicyList();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getPolicyList();
  }

  setDates() {
    this.start_date = moment(this.logDateRange[0]).set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss');
    this.end_date = moment(this.logDateRange[1]).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params[0].start_date = this.start_date;
    this.currentCriteria.params[0].end_date = this.end_date;
    this.getPolicyList();
  }

  getPolicyList() {
    this.spinner.start('main');
    this.viewData = [];
    this.policySvc.getPolicyList(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: PaginatedResult<FirstResponsePolicy>) => {
      this.count = res.count;
      this.viewData = this.policySvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching policys!!'));
    });
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getPolicyList();
  }

  addPolicy() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  viewPolicy(view: FirstResponsePolicyViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  editPolicy(view: FirstResponsePolicyViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  deletePolicy(view: FirstResponsePolicyViewdata) {
    this.selectedPolicy = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.policySvc.deletePolicy(this.selectedPolicy.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getPolicyList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Policy deleted successfully.'));
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Policy could not be deleted!!'));
    });
  }

  enablePolicy(view: FirstResponsePolicyViewdata) {
    if (view.active) {
      return;
    }
    this.selectedPolicy = view;
    this.confirmEnableModalRef = this.modalService.show(this.confirmenable, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEnable() {
    this.spinner.start('main');
    this.policySvc.enablePolicy(this.selectedPolicy.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmEnableModalRef.hide();
      this.getPolicyList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Policy enabled successfully.'));
    }, err => {
      this.confirmEnableModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Policy could not be enabled!!'));
    });
  }

  disablePolicy(view: FirstResponsePolicyViewdata) {
    if (!view.active) {
      return;
    }
    this.selectedPolicy = view;
    this.confirmDisableModalRef = this.modalService.show(this.confirmdisable, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDisable() {
    this.spinner.start('main');
    this.policySvc.disablePolicy(this.selectedPolicy.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDisableModalRef.hide();
      this.getPolicyList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Policy disabled successfully.'));
    }, err => {
      this.confirmDisableModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Policy could not be disabled!!'));
    });
  }
}