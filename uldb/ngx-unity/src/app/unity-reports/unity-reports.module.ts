import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnityReportsRoutingModule } from './unity-reports-routing.module';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { InventoryReportsComponent } from './inventory-reports/inventory-reports.component';
import { CloudInventoryReportComponent } from './inventory-reports/cloud-inventory-report/cloud-inventory-report.component';
import { DatacenterInventoryReportComponent } from './inventory-reports/datacenter-inventory-report/datacenter-inventory-report.component';
import { ReportSchedulesComponent } from './report-schedules/report-schedules.component';
import { ReportSchedulesCrudComponent } from './report-schedules-crud/report-schedules-crud.component';
import { ReportSchedulesCrudService } from './report-schedules-crud/report-schedules-crud.service';
import { UnityReportsComponent } from './unity-reports.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { ManageScheduleComponent } from './manage-schedule/manage-schedule.component';
import { ManageReportCrudComponent } from './manage-reports/manage-report-crud/manage-report-crud.component';
import { ManageScheduleCrudComponent } from './manage-schedule/manage-schedule-crud/manage-schedule-crud.component';
import { ManageReportCrudService } from './manage-reports/manage-report-crud/manage-report-crud.service';
import { DatacenterReportCrudComponent } from './manage-reports/manage-report-crud/datacenter-report-crud/datacenter-report-crud.component';
import { PublicCloudReportCrudComponent } from './manage-reports/manage-report-crud/public-cloud-report-crud/public-cloud-report-crud.component';
import { PrivateCloudReportCrudComponent } from './manage-reports/manage-report-crud/private-cloud-report-crud/private-cloud-report-crud.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ManageReportPreviewComponent } from './manage-reports/manage-report-preview/manage-report-preview.component';
import { PrivateReportPreviewComponent } from './manage-reports/manage-report-preview/private-report-preview/private-report-preview.component';
import { PublicReportPreviewComponent } from './manage-reports/manage-report-preview/public-report-preview/public-report-preview.component';
import { DatacenterReportPreviewComponent } from './manage-reports/manage-report-preview/datacenter-report-preview/datacenter-report-preview.component';
import { ItsmReportPreviewComponent } from './manage-reports/manage-report-preview/itsm-report-preview/itsm-report-preview.component';
import { SustainabilityReportPreviewComponent } from './manage-reports/manage-report-preview/sustainability-report-preview/sustainability-report-preview.component';
import { EventMgmtReportCrudComponent } from './manage-reports/manage-report-crud/event-mgmt-report-crud/event-mgmt-report-crud.component';
import { ItsmReportCrudComponent } from './manage-reports/manage-report-crud/itsm-report-crud/itsm-report-crud.component';
import { SustainabilityReportCrudComponent } from './manage-reports/manage-report-crud/sustainability-report-crud/sustainability-report-crud.component';
import { EventMgmtReportPreviewComponent } from './manage-reports/manage-report-preview/event-mgmt-report-preview/event-mgmt-report-preview.component';
import { CloudInventoryReportCrudComponent } from './manage-reports/manage-report-crud/cloud-inventory-report-crud/cloud-inventory-report-crud.component';
import { DcInventoryPreviewComponent } from './manage-reports/manage-report-preview/dc-inventory-preview/dc-inventory-preview.component';
import { CloudInventoryPreviewComponent } from './manage-reports/manage-report-preview/cloud-inventory-preview/cloud-inventory-preview.component';
import { CostAnalysisPreviewComponent } from './manage-reports/manage-report-preview/cost-analysis-preview/cost-analysis-preview.component';
import { SustainabilityReportsPreviewComponent } from './manage-reports/manage-report-preview/sustainability-reports-preview/sustainability-reports-preview.component';
import { ManageReportsNewTempComponent } from './manage-reports-new-temp/manage-reports-new-temp.component';
import { ManageReportCrudNewComponent } from './manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.component';
import { PerformanceReportCrudComponent } from './manage-reports/manage-report-crud/performance-report-crud/performance-report-crud.component';
import { PerformanceReportPreviewComponent } from './manage-reports/manage-report-preview/performance-report-preview/performance-report-preview.component';
@NgModule({
  declarations: [
    CloudInventoryReportComponent,
    InventoryReportsComponent,
    DatacenterInventoryReportComponent,
    ReportSchedulesComponent,
    ReportSchedulesCrudComponent,
    UnityReportsComponent,
    ManageReportsComponent,
    ManageScheduleComponent,
    ManageReportCrudComponent,
    ManageScheduleCrudComponent,
    DatacenterReportCrudComponent,
    PublicCloudReportCrudComponent,
    PrivateCloudReportCrudComponent,
    ManageReportPreviewComponent,
    PrivateReportPreviewComponent,
    PublicReportPreviewComponent,
    DatacenterReportPreviewComponent,
    ItsmReportPreviewComponent,
    SustainabilityReportPreviewComponent,
    EventMgmtReportCrudComponent,
    ItsmReportCrudComponent,
    SustainabilityReportCrudComponent,
    EventMgmtReportPreviewComponent,
    CloudInventoryReportCrudComponent,
    DcInventoryPreviewComponent,
    CloudInventoryPreviewComponent,
    CostAnalysisPreviewComponent,
    SustainabilityReportsPreviewComponent,
    ManageReportsNewTempComponent,
    ManageReportCrudNewComponent,
    PerformanceReportCrudComponent,
    PerformanceReportPreviewComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    ChartsModule,
    UnityReportsRoutingModule,
    PerfectScrollbarModule,
  ],
  providers: [ReportSchedulesCrudService,
    ManageReportCrudService]
})
export class UnityReportsModule { }
