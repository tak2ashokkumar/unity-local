import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MtpTenantsMgmtRoutingModule } from './mtp-tenants-mgmt-routing.module';
import { MtpTenantsMgmtComponent } from './mtp-tenants-mgmt.component';
import { SharedModule } from '../shared/shared.module';
import { MtpTenantsMgmtCrudComponent } from './mtp-tenants-mgmt-crud/mtp-tenants-mgmt-crud.component';
import { AppCoreModule } from '../app-core/app-core.module';
import { MtpTenantsMgmtDetailsComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details/mtp-tenants-mgmt-details.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MtpTenantsMgmtDetailsMapComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details/mtp-tenants-mgmt-details-map/mtp-tenants-mgmt-details-map.component';
import { MtpTenantsMgmtDetailsActivityLogComponent } from './mtp-tenant-mgmt-overview/mtp-tenants-mgmt-details-activity-log/mtp-tenants-mgmt-details-activity-log.component';
import { MtpTenantsMgmtUserDetailsUpdateComponent } from './mtp-tenants-mgmt-user-details-update/mtp-tenants-mgmt-user-details-update.component';
import { MtpTenantMgmtOverviewComponent } from './mtp-tenant-mgmt-overview/mtp-tenant-mgmt-overview.component';
import { SidebarModule } from '../sidebar/sidebar.module';
import { MtpTenantsMgmtResolverService } from './mtp-tenants-mgmt-resolver.service';
import { MtpTenantsMgmtService } from './mtp-tenants-mgmt.service';

@NgModule({
  declarations: [
    MtpTenantsMgmtComponent,
    MtpTenantsMgmtCrudComponent,
    MtpTenantsMgmtDetailsComponent,
    MtpTenantsMgmtDetailsMapComponent,
    MtpTenantsMgmtDetailsActivityLogComponent,
    MtpTenantsMgmtUserDetailsUpdateComponent,
    MtpTenantMgmtOverviewComponent,
  ],
  imports: [
    AppCoreModule,
    CommonModule,
    SharedModule,
    MtpTenantsMgmtRoutingModule,
    CollapseModule,
    SidebarModule,
  ],
  providers: [MtpTenantsMgmtResolverService, MtpTenantsMgmtService]
})
export class MtpTenantsMgmtModule { }
