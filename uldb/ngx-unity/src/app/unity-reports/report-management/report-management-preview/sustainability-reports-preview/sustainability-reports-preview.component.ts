import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  ReportManagementSustainabilityReportsPreviewService,
  SustainabilityReportType,
} from './sustainability-reports-preview.service';

/**
 * Coordinates the Report Management Sustainability Reports Preview screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-sustainability-reports-preview',
  templateUrl: './sustainability-reports-preview.component.html',
  styleUrls: ['./sustainability-reports-preview.component.scss'],
})
export class ReportManagementSustainabilityReportsPreviewComponent
  implements OnInit
{
  /**
   * Stores the active report identifier from the current route or row action.
   */
  @Input('reportId') reportId: string = null;
  /**
   * Stores the table-ready rows rendered by the template.
   */
  viewData: SustainabilityReportType;
  private ngUnsubscribe = new Subject();
  /**
   * Stores the gcp product value used by Report Management Sustainability Reports Preview Component.
   */
  gcpProduct = [];
  /**
   * Stores the gcp region value used by Report Management Sustainability Reports Preview Component.
   */
  gcpRegion = [];
  /**
   * Stores the gcp project value used by Report Management Sustainability Reports Preview Component.
   */
  gcpProject = [];
  /**
   * Stores the gcp month value used by Report Management Sustainability Reports Preview Component.
   */
  gcpMonth = [];
  /**
   * Stores the gcp quarter value used by Report Management Sustainability Reports Preview Component.
   */
  gcpQuarter = [];
  /**
   * Stores the gcp year value used by Report Management Sustainability Reports Preview Component.
   */
  gcpYear = [];
  /**
   * Stores the aws account value used by Report Management Sustainability Reports Preview Component.
   */
  awsAccount = [];
  /**
   * Stores the aws month value used by Report Management Sustainability Reports Preview Component.
   */
  awsMonth = [];
  /**
   * Stores the aws quarter value used by Report Management Sustainability Reports Preview Component.
   */
  awsQuarter = [];
  /**
   * Stores the aws year value used by Report Management Sustainability Reports Preview Component.
   */
  awsYear = [];

  constructor(
    private svc: ReportManagementSustainabilityReportsPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) {}

  /**
   * Initializes Report Management Sustainability Reports Preview Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    // Sustainability preview is summary-oriented and does not use the generic paginated table path.
    this.getTableData();
  }

  /**
   * Loads or returns table data for the current workflow.
   *
   * @returns Nothing.
   */
  getTableData() {
    this.svc
      .getData(this.reportId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.viewData = data;
          this.setData();
          this.spinner.stop('main');
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
          this.spinner.stop('main');
        }
      );
  }

  /**
   * Executes the set data workflow for Report Management Sustainability Reports Preview Component.
   *
   * @returns Nothing.
   */
  setData() {
    if (this.viewData?.gcp) {
      this.gcpProduct = Object.keys(this.viewData.gcp.product).map((key) => ({
        key,
        value: this.viewData.gcp.product[key],
      }));
      this.gcpRegion = Object.keys(this.viewData.gcp.region).map((key) => ({
        key,
        value: this.viewData.gcp.region[key],
      }));
      this.gcpProject = Object.keys(this.viewData.gcp.project).map((key) => ({
        key,
        value: this.viewData.gcp.project[key],
      }));
      this.gcpMonth = Object.keys(this.viewData.gcp.month).map((key) => ({
        key,
        value: this.viewData.gcp.month[key],
      }));
      this.gcpQuarter = Object.keys(this.viewData.gcp.quarter).map((key) => ({
        key,
        value: this.viewData.gcp.quarter[key],
      }));
      this.gcpYear = Object.keys(this.viewData.gcp.year).map((key) => ({
        key,
        value: this.viewData.gcp.year[key],
      }));
    }
    if (this.viewData?.aws) {
      this.awsAccount = Object.keys(this.viewData.aws.accounts).map((key) => ({
        key,
        value: this.viewData.aws.accounts[key],
      }));
      this.awsMonth = Object.keys(this.viewData.aws.month).map((key) => ({
        key,
        value: this.viewData.aws.month[key],
      }));
      this.awsQuarter = Object.keys(this.viewData.aws.quarter).map((key) => ({
        key,
        value: this.viewData.aws.quarter[key],
      }));
      this.awsYear = Object.keys(this.viewData.aws.year).map((key) => ({
        key,
        value: this.viewData.aws.year[key],
      }));
    }
  }
}
