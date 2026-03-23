import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageOntapClusterLUNDetailsViewData, StorageOntapLunDetailsService } from './storage-ontap-lun-details.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'storage-ontap-lun-details',
  templateUrl: './storage-ontap-lun-details.component.html',
  styleUrls: ['./storage-ontap-lun-details.component.scss'],
  providers: [StorageOntapLunDetailsService]
})
export class StorageOntapLunDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  lunId: string;

  view: StorageOntapClusterLUNDetailsViewData = new StorageOntapClusterLUNDetailsViewData();
  constructor(private svc: StorageOntapLunDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageSvc: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.lunId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getDetails();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDetails();
  }

  getDetails() {
    this.spinner.start('main');
    this.svc.getDetails(this.clusterId, this.lunId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.svc.convertToViewdata(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.view = null;
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

}
