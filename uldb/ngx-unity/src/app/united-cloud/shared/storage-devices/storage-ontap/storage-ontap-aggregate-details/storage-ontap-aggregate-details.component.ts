import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageOntapAggregateDetailsService, StorageOntapClusterAggragateDetailsViewData } from './storage-ontap-aggregate-details.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { UnityChartData } from 'src/app/shared/chart-config.service';

@Component({
  selector: 'storage-ontap-aggregate-details',
  templateUrl: './storage-ontap-aggregate-details.component.html',
  styleUrls: ['./storage-ontap-aggregate-details.component.scss'],
  providers: [StorageOntapAggregateDetailsService]
})
export class StorageOntapAggregateDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  aggregateId: string;

  view: StorageOntapClusterAggragateDetailsViewData;
  volumeChartData: UnityChartData;
  lunChartData: UnityChartData;
  constructor(private svc: StorageOntapAggregateDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageSvc: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.aggregateId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getDetails();
      this.getTopEntities();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDetails();
    this.getTopEntities();
  }

  getDetails() {
    this.spinner.start('main');
    this.svc.getDetails(this.clusterId, this.aggregateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.svc.convertToViewdata(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.view = null;
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

  getTopEntities() {
    this.spinner.start('top_volumes');
    this.spinner.start('top_luns');
    this.svc.getTopEntities(this.clusterId, this.aggregateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.volumeChartData = this.svc.convertToTopNChartData(res.volumes);
      this.lunChartData = this.svc.convertToTopNChartData(res.luns);
      this.spinner.stop('top_volumes');
      this.spinner.stop('top_luns');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_volumes');
      this.spinner.stop('top_luns');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

}
