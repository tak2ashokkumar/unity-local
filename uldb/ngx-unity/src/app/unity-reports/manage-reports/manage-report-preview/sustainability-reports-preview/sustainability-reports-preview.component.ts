import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SustainabilityReportsPreviewService, SustainabilityReportType, ViewDataModel } from './sustainability-reports-preview.service';


@Component({
  selector: 'sustainability-reports-preview',
  templateUrl: './sustainability-reports-preview.component.html',
  styleUrls: ['./sustainability-reports-preview.component.scss']
})
export class SustainabilityReportsPreviewComponent implements OnInit {

  @Input('reportId') reportId: string = null;
  viewData: SustainabilityReportType;
  private ngUnsubscribe = new Subject();
  gcpProduct = [];
  gcpRegion = [];
  gcpProject = [];
  gcpMonth = [];
  gcpQuarter = [];
  gcpYear = [];
  awsAccount = [];
  awsMonth = [];
  awsQuarter = [];
  awsYear = [];

  constructor(private svc: SustainabilityReportsPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getTableData();
  }

  getTableData() {
    this.svc.getData(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = data;
      this.setData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
    })
  }

  setData() {
    if (this.viewData?.gcp) {
      this.gcpProduct = Object.keys(this.viewData.gcp.product).map(key => ({ key, value: this.viewData.gcp.product[key] }));
      this.gcpRegion = Object.keys(this.viewData.gcp.region).map(key => ({ key, value: this.viewData.gcp.region[key] }));
      this.gcpProject = Object.keys(this.viewData.gcp.project).map(key => ({ key, value: this.viewData.gcp.project[key] }));
      this.gcpMonth = Object.keys(this.viewData.gcp.month).map(key => ({ key, value: this.viewData.gcp.month[key] }));
      this.gcpQuarter = Object.keys(this.viewData.gcp.quarter).map(key => ({ key, value: this.viewData.gcp.quarter[key] }));
      this.gcpYear = Object.keys(this.viewData.gcp.year).map(key => ({ key, value: this.viewData.gcp.year[key] }));
    }
    if (this.viewData?.aws) {
      this.awsAccount = Object.keys(this.viewData.aws.accounts).map(key => ({ key, value: this.viewData.aws.accounts[key] }));
      this.awsMonth = Object.keys(this.viewData.aws.month).map(key => ({ key, value: this.viewData.aws.month[key] }));
      this.awsQuarter = Object.keys(this.viewData.aws.quarter).map(key => ({ key, value: this.viewData.aws.quarter[key] }));
      this.awsYear = Object.keys(this.viewData.aws.year).map(key => ({ key, value: this.viewData.aws.year[key] }));
    }
  }
}
