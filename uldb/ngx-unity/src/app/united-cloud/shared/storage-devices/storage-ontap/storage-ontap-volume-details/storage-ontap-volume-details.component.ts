import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageOntapClusterVolumeDetailsViewData, StorageOntapVolumeDetailsService } from './storage-ontap-volume-details.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityChartData } from 'src/app/shared/chart-config.service';

@Component({
  selector: 'storage-ontap-volume-details',
  templateUrl: './storage-ontap-volume-details.component.html',
  styleUrls: ['./storage-ontap-volume-details.component.scss'],
  providers: [StorageOntapVolumeDetailsService]
})
export class StorageOntapVolumeDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  volumeId: string;

  view: StorageOntapClusterVolumeDetailsViewData = new StorageOntapClusterVolumeDetailsViewData();
  lunChartData: UnityChartData;
  constructor(private svc: StorageOntapVolumeDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageSvc: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.volumeId = params.get('id'));
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
    this.svc.getDetails(this.clusterId, this.volumeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.svc.convertToViewdata(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.view = null;
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

  getTopEntities() {
    this.spinner.start('top_luns');
    this.svc.getTopEntities(this.clusterId, this.volumeId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.lunChartData = this.svc.convertToTopNChartData(res.luns);
      this.spinner.stop('top_luns');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('top_luns');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

}
