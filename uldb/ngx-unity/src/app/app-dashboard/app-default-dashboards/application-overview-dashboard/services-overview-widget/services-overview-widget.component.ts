import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ServicesOverviewWidgetService, ServiceViewData } from './services-overview-widget.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'services-overview-widget',
  templateUrl: './services-overview-widget.component.html',
  styleUrls: ['./services-overview-widget.component.scss'],
  providers: [ServicesOverviewWidgetService]
})
export class ServicesOverviewWidgetComponent implements OnInit, OnDestroy, OnChanges {
  private ngUnsubscribe = new Subject();
  @Input("appId") appId: number;
  currentCriteria: SearchCriteria;
  serviceViewData: ServiceViewData[] = [];
  count: number;
  avgThroughput: string;
  avgLatency: string;
  avgAvailablility: string;
  serviceLoader: string = 'service-overview';


  constructor(private svc: ServicesOverviewWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getServiceOverviewData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.appId?.currentValue) {
      this.appId = changes?.appId?.currentValue;
      setTimeout(() => {
        this.getServiceOverviewData();
      }, 0);
    }
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getServiceOverviewData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getServiceOverviewData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getServiceOverviewData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getServiceOverviewData();
  }


  getServiceOverviewData() {
    this.spinner.start(this.serviceLoader);
    this.svc.getServiceOverviewData(this.currentCriteria, this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.serviceViewData = this.svc.convertToServiceViewData(res.results);
      this.avgThroughput = res.avg_throughput;
      this.avgLatency = res.avg_latency;
      this.avgAvailablility = res.avg_availability;
      this.spinner.stop(this.serviceLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.serviceLoader);
      this.notification.error(new Notification('Failed to get Component Health data. Try again later'));
    });
  }

}
