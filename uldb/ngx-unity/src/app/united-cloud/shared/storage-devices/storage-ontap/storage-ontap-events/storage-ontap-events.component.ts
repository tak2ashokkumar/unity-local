import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { OntapItemEventsViewData, StorageOntapEventsService } from './storage-ontap-events.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'storage-ontap-events',
  templateUrl: './storage-ontap-events.component.html',
  styleUrls: ['./storage-ontap-events.component.scss'],
  providers: [StorageOntapEventsService]
})
export class StorageOntapEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  itemId: string;
  item: { name: string, type: string, state: string };
  currentCriteria: SearchCriteria;

  count: number;
  viewData: OntapItemEventsViewData[] = [];
  constructor(private svc: StorageOntapEventsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.itemId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    let item = <{ name: string, type: string, state: string }>this.storageSvc.getByKey('ontap-entity', StorageType.SESSIONSTORAGE);
    this.item = item;
    this.spinner.start('main');
    this.getEvents();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getEvents();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  refreshData() {
    this.spinner.start('main');
    this.getEvents();
  }

  getEvents() {
    this.svc.getEvents(this.clusterId, this.item.name, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.count = res.length;
      this.viewData = this.svc.convertDetailsToViewdata(res);
    }, err => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Error while fetching events'))
    });
  }

}
