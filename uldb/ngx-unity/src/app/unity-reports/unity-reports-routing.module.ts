import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryReportsComponent } from './inventory-reports/inventory-reports.component';
import { CloudInventoryReportComponent } from './inventory-reports/cloud-inventory-report/cloud-inventory-report.component';
import { DatacenterInventoryReportComponent } from './inventory-reports/datacenter-inventory-report/datacenter-inventory-report.component';
import { ReportSchedulesComponent } from './report-schedules/report-schedules.component';
import { UnityReportsComponent } from './unity-reports.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { ManageScheduleComponent } from './manage-schedule/manage-schedule.component';
import { ManageReportCrudComponent } from './manage-reports/manage-report-crud/manage-report-crud.component';
import { ManageScheduleCrudComponent } from './manage-schedule/manage-schedule-crud/manage-schedule-crud.component';
import { ManageReportPreviewComponent } from './manage-reports/manage-report-preview/manage-report-preview.component';
import { ManageReportsNewTempComponent } from './manage-reports-new-temp/manage-reports-new-temp.component';
import { ManageReportCrudNewComponent } from './manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.component';

const routes: Routes = [
  {
    path: 'inventory',
    component: InventoryReportsComponent,
    data: {
      breadcrumb: {
        title: 'Inventory'
      }
    },
    children: [
      {
        path: 'cloud',
        component: CloudInventoryReportComponent,
        data: {
          breadcrumb: {
            title: 'Cloud',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'cloud/:scheduleId',
        component: CloudInventoryReportComponent,
        data: {
          breadcrumb: {
            title: 'Cloud',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'datacenter',
        component: DatacenterInventoryReportComponent,
        data: {
          breadcrumb: {
            title: 'Datacenter',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'datacenter/:scheduleId',
        component: DatacenterInventoryReportComponent,
        data: {
          breadcrumb: {
            title: 'Datacenter',
            stepbackCount: 0
          }
        }
      }
    ]
  },
  {
    path: 'schedules',
    component: ReportSchedulesComponent,
    data: {
      breadcrumb: {
        title: 'Reports'
      }
    }
  },
  {
    path: 'manage',
    component: UnityReportsComponent,
    data: {
      breadcrumb: {
        title: 'Manage'
      }
    },
    children: [
      {
        path: 'reports',
        component: ManageReportsComponent,
        data: {
          breadcrumb: {
            title: 'Reports'
          }
        }
      },
      {
        path: 'reports/create',
        component: ManageReportCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'reports/:reportId/update',
        component: ManageReportCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update'
          }
        }
      },
      {
        path: 'reports/:feature/:reportId/preview',
        component: ManageReportPreviewComponent,
        data: {
          breadcrumb: {
            title: 'Preview'
          }
        }
      },
      {
        path: 'new-reports',
        component: ManageReportsNewTempComponent,
        data: {
          breadcrumb: {
            title: 'New Reports'
          }
        }
      },
      {
        path: 'new-reports/create',
        component: ManageReportCrudNewComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'new-reports/:reportId/update',
        component: ManageReportCrudNewComponent,
        data: {
          breadcrumb: {
            title: 'Update'
          }
        }
      },
      
      {
        path: 'new-reports/:feature/:reportId/preview',
        component: ManageReportPreviewComponent,
        data: {
          breadcrumb: {
            title: 'Preview'
          }
        }
      },
      {
        path: 'schedules',
        component: ManageScheduleComponent,
        data: {
          breadcrumb: {
            title: 'Schedules'
          }
        }
      },
      {
        path: 'schedules/:feature/create',
        component: ManageScheduleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'schedules/:feature/:scheduleId/update',
        component: ManageScheduleCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update'
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityReportsRoutingModule { }
