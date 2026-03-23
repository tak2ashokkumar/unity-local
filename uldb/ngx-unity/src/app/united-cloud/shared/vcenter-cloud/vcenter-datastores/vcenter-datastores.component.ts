import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatastoreViewdata, VcenterDatastoresService } from './vcenter-datastores.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'vcenter-datastores',
  templateUrl: './vcenter-datastores.component.html',
  styleUrls: ['./vcenter-datastores.component.scss'],
  providers: [VcenterDatastoresService]
})
export class VcenterDatastoresComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: DatastoreViewdata[] = [];

  clusterId: string;
  constructor(private notificationService: AppNotificationService,
    private spinner: AppSpinnerService,
    private svc: VcenterDatastoresService,
    private route: ActivatedRoute) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.clusterId = params.get('clusterId');
    })
    this.route.parent.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      if (params.has('pcId')) {
        this.pcId = params.get('pcId');
      }
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDatastores();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getDatastores();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDatastores();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDatastores();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDatastores();
  }

  getDatastores() {
    this.svc.getDatastores(this.currentCriteria, this.pcId, this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Failed to fetch datastores. Please try again.'));
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

}
