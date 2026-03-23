import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiPureStorageCrudService } from 'src/app/shared/usi-pure-storage-crud/usi-pure-storage-crud.service';
import { PureStorageViewData, UsisPureService } from './usis-pure.service';

@Component({
  selector: 'usis-pure',
  templateUrl: './usis-pure.component.html',
  styleUrls: ['./usis-pure.component.scss'],
  providers: [UsisPureService]
})
export class UsisPureComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number;
  viewData: PureStorageViewData[] = [];
  constructor(private service: UsisPureService,
    private crudService: UsiPureStorageCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getDevices();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDevices();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getDevices();
  }

  getDevices() {
    this.spinner.start('main');
    this.viewData = [];
    this.count = 0;
    this.service.getPureStorageDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.service.convertToviewData(res.results);
      this.getStorageData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Pure Storage clusters. Please try again.'));
    });
  }

  getStorageData() {
    from(this.viewData).pipe(mergeMap(e => this.service.getStorageData(e)), takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => {
        }
      );
  }

  addPureStorage() {
    // this.crudService.addOrEdit(null);
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editInstance(data: any) {
    // this.crudService.addOrEdit(data.deviceId);
    this.router.navigate([data.deviceId,'edit'], { relativeTo: this.route });
  }

  deleteInstance(data: any) {
    this.crudService.delete(data.deviceId);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onPureStorageCrud(event: CRUDActionTypes) {
    this.getDevices();
  }
}
