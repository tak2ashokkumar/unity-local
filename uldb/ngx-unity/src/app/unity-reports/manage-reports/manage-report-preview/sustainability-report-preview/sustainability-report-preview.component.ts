import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ManageReportDatacenterDeviceViewData, ManageReportSustainabilityAwsReportViewData, ManageReportSustainabilityGcpReportViewData, SustainabilityReportPreviewService } from './sustainability-report-preview.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ManageReportDatacenterDeviceType, ManageReportSustainabilityAwsType, ManageReportSustainabilityGcpType } from './sustainability-report-preview.type';

@Component({
  selector: 'sustainability-report-preview',
  templateUrl: './sustainability-report-preview.component.html',
  styleUrls: ['./sustainability-report-preview.component.scss'],
  providers: [SustainabilityReportPreviewService]
})
export class SustainabilityReportPreviewComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Input('reportId') reportId: string = null;
  resultType: string;
  datacenterDevicesViewData: ManageReportDatacenterDeviceViewData[] = [];
  sustainabilityAwsReportViewData: ManageReportSustainabilityAwsReportViewData = new ManageReportSustainabilityAwsReportViewData();
  sustainabilityGcpReportViewData: ManageReportSustainabilityGcpReportViewData = new ManageReportSustainabilityGcpReportViewData();
  constructor(private sustainabilitySvc: SustainabilityReportPreviewService,
    private spinner: AppSpinnerService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getReportPreviewById();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportPreviewById() {
    this.sustainabilitySvc.getReportPreviewById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resultType = res.type;
      switch (res.type) {
        case 'sustainability_devices':
          res = <ManageReportDatacenterDeviceType>res;
          this.datacenterDevicesViewData = this.sustainabilitySvc.convertDatacenterDeviceDataToViewData(res.data);
          break;
        case 'sustainability_aws':
          res = <ManageReportSustainabilityAwsType>res;
          this.sustainabilityAwsReportViewData = this.sustainabilitySvc.convertAwsCo2DataToViewData(res);
          break;
        case 'sustainability_gcp':
          res = <ManageReportSustainabilityGcpType>res;
          this.sustainabilityGcpReportViewData = this.sustainabilitySvc.convertGcpCo2DataToViewData(res);
          break;
      }
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report preview!! Please try again.'));
      this.spinner.stop('main');
    });
  }
}