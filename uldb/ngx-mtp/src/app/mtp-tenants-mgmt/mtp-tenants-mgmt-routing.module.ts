import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpTenantsMgmtComponent } from './mtp-tenants-mgmt.component';
import { MtpTenantsMgmtCrudComponent } from './mtp-tenants-mgmt-crud/mtp-tenants-mgmt-crud.component';
import { MtpTenantsMgmtDetailsComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details/mtp-tenants-mgmt-details.component';
import { MtpTenantsMgmtDetailsMapComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details/mtp-tenants-mgmt-details-map/mtp-tenants-mgmt-details-map.component';
import { MtpTenantsMgmtDetailsActivityLogComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details-activity-log/mtp-tenants-mgmt-details-activity-log.component';
import { MtpTenantsMgmtUserDetailsUpdateComponent } from './mtp-tenants-mgmt-user-details-update/mtp-tenants-mgmt-user-details-update.component';
import { MtpTenantMgmtOverviewComponent } from './mtp-tenant-mgmt-overview/mtp-tenant-mgmt-overview.component';
import { MtpTenantsMgmtResolverService } from './mtp-tenants-mgmt-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: MtpTenantsMgmtComponent,
    children: [
      {
        path: ':groupId/:tenantId/overview',
        component: MtpTenantMgmtOverviewComponent,
        children: [
          {
            path: 'details',
            component: MtpTenantsMgmtDetailsComponent
          },
          {
            path: 'activitylog',
            component: MtpTenantsMgmtDetailsActivityLogComponent
          }
        ]
      }
    ]
  },
  {
    path: 'create',
    component: MtpTenantsMgmtCrudComponent
  },
  {
    path: ':groupId/:uuid/update',
    component: MtpTenantsMgmtCrudComponent
  },
  {
    path: ':groupId/:tenantuuid/:useruuid/updatedetails',
    component: MtpTenantsMgmtUserDetailsUpdateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpTenantsMgmtRoutingModule { }
