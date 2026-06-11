import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AppMainComponent } from './app-main/app-main.component';
import { MtpActivityLogsComponent } from './mtp-activity-logs/mtp-activity-logs.component';
import { UserAccessGuard } from './user-access.guard';
import { MTPModules } from './app-level.service';
import { MtpMaintenanceCrudComponent } from './mtp-maintenance-crud/mtp-maintenance-crud.component';
import { MtpMaintenanceComponent } from './mtp-maintenance/mtp-maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: AppMainComponent,
    children: [
      {
        path: 'dashboard',
        data: {
          breadcrumb: {
            title: 'Dashboard'
          },
          module: MTPModules.DASHBOARD
        },
        canActivate: [UserAccessGuard],
        loadChildren: () => import('./mtp-dashboard/mtp-dashboard.module').then(m => m.MtpDashboardModule)
      },
      {
        path: 'tenantsmgmt',
        data: {
          breadcrumb: {
            title: 'Tenants Management'
          },
          module: MTPModules.TENANT_MANAGEMENT
        },
        canActivate: [UserAccessGuard],
        loadChildren: () => import('./mtp-tenants-mgmt/mtp-tenants-mgmt.module').then(m => m.MtpTenantsMgmtModule)
      },
      {
        path: 'administration',
        data: {
          breadcrumb: {
            title: 'Administration'
          }
        },
        canActivateChild: [UserAccessGuard],
        loadChildren: () => import('./mtp-administration/mtp-administration.module').then(m => m.MtpAdministrationModule)
      },
      {
        path: 'ticketmgmt',
        data: {
          breadcrumb: {
            title: 'Ticket Management'
          },
          module: MTPModules.TICKET_MANAGEMENT
        },
        canActivate: [UserAccessGuard],
        loadChildren: () => import('./mtp-ticket-mgmt/mtp-ticket-mgmt.module').then(m => m.MtpTicketMgmtModule)
      },
      {
        path: 'aiml',
        data: {
          breadcrumb: {
            title: 'AIML Management'
          },
          module: MTPModules.EVENT_MANAGEMENT
        },
        canActivate: [UserAccessGuard],
        loadChildren: () => import('./mtp-aiml-mgmt/mtp-aiml-mgmt.module').then(m => m.MtpAimlMgmtModule)
      },
      {
        path: 'reportmgmt',
        data: {
          breadcrumb: {
            title: 'Report Management'
          }
        },
        canActivate: [UserAccessGuard],
        loadChildren: () => import('./mtp-report-mgmt/mtp-report-mgmt.module').then(m => m.MtpReportMgmtModule)
      },
      {
        path: 'activity-logs',
        component: MtpActivityLogsComponent,
        data: {
          breadcrumb: {
            title: 'Activity Logs'
          }
        },
      },
      {
        path: '',
        redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'maintenance',
        component: MtpMaintenanceComponent,
        data: {
          breadcrumb: {
            title: 'Maintenance'
          }
        },
      },
      {
        path: 'maintenance/create',
        component: MtpMaintenanceCrudComponent,
        data: {
          breadcrumb: {
            title: 'Maintenance Crud'
          }
        },
      },
      {
        path: 'maintenance/:smId/edit',
        component: MtpMaintenanceCrudComponent,
        data: {
          breadcrumb: {
            title: 'Maintenance Crud'
          }
        },
        
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
