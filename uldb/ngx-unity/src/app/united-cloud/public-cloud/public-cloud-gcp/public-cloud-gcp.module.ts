import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GcpSnapshotsComponent } from './gcp-overview/gcp-snapshots/gcp-snapshots.component';
import { GcpVmsComponent } from './gcp-overview/gcp-vms/gcp-vms.component';
import { GcpOverviewComponent } from './gcp-overview/gcp-overview.component';
import { GcpDashboardComponent } from './gcp-dashboard/gcp-dashboard.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitedCloudSharedModule } from '../../shared/united-cloud-shared.module';
import { GcpContainerControllerComponent } from './gcp-overview/gcp-container-controllers/gcp-container-controllers.component';
import { PublicCloudGcpSummaryComponent } from './public-cloud-gcp-summary/public-cloud-gcp-summary.component';
import { PublicCloudGcpSummaryDetailsComponent } from './public-cloud-gcp-summary/public-cloud-gcp-summary-details/public-cloud-gcp-summary-details.component';

@NgModule({
  declarations: [
    GcpDashboardComponent,
    GcpOverviewComponent,
    GcpVmsComponent,
    GcpSnapshotsComponent,
    GcpContainerControllerComponent,
    PublicCloudGcpSummaryComponent,
    PublicCloudGcpSummaryDetailsComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitedCloudSharedModule
  ]
})
export class PublicCloudGcpModule { }
