import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DashboardGCPCloud } from './gcp.type';
import { DashboardOCICloud } from './oci.type';
import { DashboardPublicCloudWidgetViewData, GCPViewData, OCIViewData, PublicCloudService } from './public-cloud.service';

@Component({
  selector: 'public-cloud',
  templateUrl: './public-cloud.component.html',
  styleUrls: ['./public-cloud.component.scss'],
  providers: [PublicCloudService]
})
export class PublicCloudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  awsViewData = new DashboardPublicCloudWidgetViewData();
  azureViewData = new DashboardPublicCloudWidgetViewData();
  oracleViewData = new DashboardPublicCloudWidgetViewData();
  // gcpViewData: GCPViewData[] = [];
  // ociViewData: OCIViewData[] = []
  gcpViewData = new DashboardPublicCloudWidgetViewData();

  widgetState: string = 'initial';
  gcpWidgetState: string = 'initial';
  ociWidgetState: string = 'initial';
  showPublicClouds: boolean = false;

  constructor(private svc: PublicCloudService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getAWSSummary();
    this.getAzureSummary();
    // this.getGCPClouds();
    this.getGCPSummary();
    this.getOracleSummary();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // showOrHidePublicClouds(length: number) {
  showOrHidePublicClouds() {
    if (!this.showPublicClouds) {
      this.showPublicClouds = (this.awsViewData?.subscriptions > 0 || this.azureViewData?.subscriptions > 0 || this.oracleViewData?.subscriptions > 0 || this.gcpViewData?.subscriptions > 0) ? true : false;
    }
  }

  onLazyLoad(event: string) {
    // // this.pollForCloudsUpdate();
    // this.pollForGcpWidegtDataUpdate();
    // // this.pollForOCIWidgetDataUpdate();
  }

  getAWSSummary() {
    this.svc.getAWSSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.awsViewData = this.svc.convertToWidgetViewData(data, 'AWS');
      this.showOrHidePublicClouds();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching AWS Clouds. Please try again.'));
    });
  }

  getAzureSummary() {
    this.svc.getAzureSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.azureViewData = this.svc.convertToWidgetViewData(data, 'Azure');
      this.showOrHidePublicClouds();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching Azure Clouds. Please try again.'));
    });
  }

  // getGCPClouds() {
  //   this.svc.getGCPClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<DashboardGCPCloud>) => {
  //     this.gcpViewData = this.svc.convertToGCPViewData(data.results);
  //     this.showOrHidePublicClouds(this.gcpViewData.length);
  //   }, (err: HttpErrorResponse) => {
  //     this.notification.error(new Notification('Problem occurred in fetching GCP Clouds. Please try again.'));
  //   });
  // }

  getGCPSummary() {
    this.svc.getGCPSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.gcpViewData = this.svc.convertToWidgetViewData(data, 'GCP');
      this.showOrHidePublicClouds();      
      // this.showOrHidePublicClouds(this.gcpViewData.length);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching GCP Clouds. Please try again.'));
    });
  }

  getOracleSummary() {
    this.svc.getOracleSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.oracleViewData = this.svc.convertToWidgetViewData(data, 'Oracle');
      this.showOrHidePublicClouds();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching Oracle Clouds. Please try again.'));
    });
  }

  pollForCloudsUpdate() {
    this.svc.pollForCloudsUpdate().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.widgetState = 'updated';
    }, (err: HttpErrorResponse) => {
    });
  }

  pollForGcpWidegtDataUpdate() {
    this.svc.pollForGcpWidegtDataUpdate().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.gcpWidgetState = 'updated';
    }, (err: HttpErrorResponse) => {
    });
  }

  pollForOCIWidgetDataUpdate() {
    this.svc.pollForOCIWidgetDataUpdate().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.ociWidgetState = 'updated';
    }, (err: HttpErrorResponse) => {
    });
  }
}
