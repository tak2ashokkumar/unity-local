import { Component, Input, OnInit } from '@angular/core';
import { DatacenterReportPreviewService, ManageReportDCInventoryReportViewData, ManageReportDCReportFilterData } from './datacenter-report-preview.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ManageReportDataType } from './datacenter-report-preview.type';

@Component({
  selector: 'datacenter-report-preview',
  templateUrl: './datacenter-report-preview.component.html',
  styleUrls: ['./datacenter-report-preview.component.scss'],
  providers: [DatacenterReportPreviewService]
})
export class DatacenterReportPreviewComponent implements OnInit {

  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();

  // dropdown selection variable
  selectedDropdownData: ManageReportDCReportFilterData = new ManageReportDCReportFilterData();

  reportViewdata: ManageReportDCInventoryReportViewData = new ManageReportDCInventoryReportViewData();
  FaIconMapping = FaIconMapping;
  selectedReport: ManageReportDataType;
  constructor(private dcSvc: DatacenterReportPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) { }

  ngOnInit(): void {
    this.getReportById();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportById() {
    this.spinner.start('main');
    this.dcSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedReport = res;
      this.generateReport();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  generateReport() {
    let reportData = this.selectedReport.report_meta;
    this.selectedDropdownData.cabUUID = reportData.cabinets ? reportData.cabinets : [];
    this.selectedDropdownData.dcUUID = reportData.datacenters ? reportData.datacenters : [];
    this.selectedDropdownData.device_list = reportData.reportType == 'device';
    if (this.selectedDropdownData.device_list) {
      this.getDevicesViewReport();
    } else {
      this.getCabinetViewReport();
    }
  }

  getCabinetViewReport() {
    this.spinner.start('main');
    this.dcSvc.generateDCCabinetViewReport(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.reportViewdata = this.dcSvc.convertToDCInfoViewData(data.result.data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  getDevicesViewReport() {
    this.spinner.start('main');
    this.dcSvc.generateDCDevicesViewReport(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.reportViewdata = this.dcSvc.convertToDevicesInfoViewData(data.result.data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }
}