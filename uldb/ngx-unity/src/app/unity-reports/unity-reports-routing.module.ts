import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageScheduleCrudComponent } from './manage-schedule/manage-schedule-crud/manage-schedule-crud.component';
import { ManageScheduleComponent } from './manage-schedule/manage-schedule.component';
import { ReportManagementCrudComponent } from './report-management/report-management-crud/report-management-crud.component';
import { ReportManagementPreviewComponent } from './report-management/report-management-preview/report-management-preview.component';
import { ReportManagementComponent } from './report-management/report-management.component';
import { UnityReportsComponent } from './unity-reports.component';

const routes: Routes = [
  {
    path: '',
    component: UnityReportsComponent,
    children: [
      // Keep /reports as the module entry and send users to the active reports list.
      {
        path: '',
        redirectTo: 'manage-reports',
        pathMatch: 'full',
      },
      // Legacy report URLs are redirected to the flattened route structure for bookmark/RBAC compatibility.
      {
        path: 'manage',
        redirectTo: 'manage-reports',
        pathMatch: 'full',
      },
      {
        path: 'manage/reports',
        redirectTo: 'manage-reports',
        pathMatch: 'full',
      },
      {
        path: 'manage/reports/create',
        redirectTo: 'manage-reports/create',
        pathMatch: 'full',
      },
      {
        path: 'manage/reports/:reportId/update',
        redirectTo: 'manage-reports/:reportId/update',
        pathMatch: 'full',
      },
      {
        path: 'manage/reports/:feature/:reportId/preview',
        redirectTo: 'manage-reports/:feature/:reportId/preview',
        pathMatch: 'full',
      },
      // Legacy schedule URLs are redirected for the same compatibility reason as report URLs.
      {
        path: 'manage/schedules',
        redirectTo: 'manage-schedules',
        pathMatch: 'full',
      },
      {
        path: 'manage/schedules/:feature/create',
        redirectTo: 'manage-schedules/:feature/create',
        pathMatch: 'full',
      },
      {
        path: 'manage/schedules/:feature/:scheduleId/update',
        redirectTo: 'manage-schedules/:feature/:scheduleId/update',
        pathMatch: 'full',
      },
      {
        path: 'manage-reports',
        component: ReportManagementComponent,
        data: {
          breadcrumb: {
            title: 'Manage',
          },
        },
      },
      {
        path: 'manage-reports/create',
        component: ReportManagementCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'manage-reports/:reportId/update',
        component: ReportManagementCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update',
          },
        },
      },
      {
        path: 'manage-reports/:feature/:reportId/preview',
        component: ReportManagementPreviewComponent,
        data: {
          breadcrumb: {
            title: 'Preview',
          },
        },
      },
      {
        path: 'manage-schedules',
        component: ManageScheduleComponent,
        data: {
          breadcrumb: {
            title: 'Schedules',
          },
        },
      },
      {
        path: 'manage-schedules/:feature/create',
        component: ManageScheduleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create',
          },
        },
      },
      {
        path: 'manage-schedules/:feature/:scheduleId/update',
        component: ManageScheduleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update',
          },
        },
      },
    ],
  },
];

/**
 * Defines the child route configuration for the Unity Reports feature module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnityReportsRoutingModule {}
