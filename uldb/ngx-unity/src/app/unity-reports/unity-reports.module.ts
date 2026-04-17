import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { ManageScheduleCrudComponent } from './manage-schedule/manage-schedule-crud/manage-schedule-crud.component';
import { ManageScheduleComponent } from './manage-schedule/manage-schedule.component';
import { ReportManagementCloudInventoryCrudComponent } from './report-management/report-management-crud/cloud-inventory-report-crud/cloud-inventory-report-crud.component';
import { ReportManagementPerformanceCrudComponent } from './report-management/report-management-crud/performance-report-crud/performance-report-crud.component';
import { ReportManagementCrudCommonComponent } from './report-management/report-management-crud/report-management-crud-common/report-management-crud-common.component';
import { ReportManagementCrudComponent } from './report-management/report-management-crud/report-management-crud.component';
import { ReportManagementCloudInventoryPreviewComponent } from './report-management/report-management-preview/cloud-inventory-preview/cloud-inventory-preview.component';
import { ReportManagementCostAnalysisPreviewComponent } from './report-management/report-management-preview/cost-analysis-preview/cost-analysis-preview.component';
import { ReportManagementDcInventoryPreviewComponent } from './report-management/report-management-preview/dc-inventory-preview/dc-inventory-preview.component';
import { ReportManagementPerformanceReportPreviewComponent } from './report-management/report-management-preview/performance-report-preview/performance-report-preview.component';
import { ReportManagementPreviewComponent } from './report-management/report-management-preview/report-management-preview.component';
import { ReportManagementSustainabilityReportsPreviewComponent } from './report-management/report-management-preview/sustainability-reports-preview/sustainability-reports-preview.component';
import { ReportManagementComponent } from './report-management/report-management.component';
import { UnityReportsRoutingModule } from './unity-reports-routing.module';
import { UnityReportsComponent } from './unity-reports.component';

/**
 * Declares and wires the active Unity Reports feature components, services, and routes.
 */
@NgModule({
  declarations: [
    // Shell and schedule screens.
    UnityReportsComponent,
    ManageScheduleComponent,
    ManageScheduleCrudComponent,
    // Active report management, CRUD, and preview screens.
    ReportManagementComponent,
    ReportManagementCrudComponent,
    ReportManagementCloudInventoryCrudComponent,
    ReportManagementPerformanceCrudComponent,
    ReportManagementCrudCommonComponent,
    ReportManagementPreviewComponent,
    ReportManagementCloudInventoryPreviewComponent,
    ReportManagementDcInventoryPreviewComponent,
    ReportManagementCostAnalysisPreviewComponent,
    ReportManagementSustainabilityReportsPreviewComponent,
    ReportManagementPerformanceReportPreviewComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    ChartsModule,
    UnityReportsRoutingModule,
    PerfectScrollbarModule,
  ],
})
export class UnityReportsModule { }
