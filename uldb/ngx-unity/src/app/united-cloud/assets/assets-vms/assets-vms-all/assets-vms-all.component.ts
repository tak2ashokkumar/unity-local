import { Component, OnInit, OnDestroy } from '@angular/core';
import { from, Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AssetsVmsAllService, AllVMViewData } from './assets-vms-all.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'assets-vms-all',
  templateUrl: './assets-vms-all.component.html',
  styleUrls: ['./assets-vms-all.component.scss'],
  providers: [AssetsVmsAllService]
})
export class AssetsVmsAllComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  viewData: AllVMViewData[] = [];
  filteredviewData: AllVMViewData[] = [];
  pagedviewData: AllVMViewData[] = [];
  fieldsToFilterOn: string[] = ['cloud_name', 'cloud_type', 'os', 'name'];
  count: number;
  constructor(private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private vmsService: AssetsVmsAllService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getAllVms();
    this.syncAllVms();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredviewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAllVms();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAllVms();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAllVms();
    this.syncAllVms();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAllVms();
  }

  getAllVms() {
    this.vmsService.getAllVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.vmsService.convertToViewData(res.results);
      this.getDeviceData();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching virtual machines'));
    });
  }

  syncAllVms() {
    this.vmsService.syncAllVms().pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.spinnerService.stop('main');
      this.getAllVms();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(err.error));
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(filter(e => e.cloudType == 'Custom Cloud'),
      mergeMap((e) => this.vmsService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

}
