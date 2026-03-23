import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitedCloudSharedModule } from '../../shared/united-cloud-shared.module';
import { PublicCloudAzureSummaryComponent } from './public-cloud-azure-summary/public-cloud-azure-summary.component';
import { PublicCloudAzureSummaryDetailsComponent } from './public-cloud-azure-summary/public-cloud-azure-summary-details/public-cloud-azure-summary-details.component';

@NgModule({
  declarations: [
    PublicCloudAzureSummaryComponent,
    PublicCloudAzureSummaryDetailsComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitedCloudSharedModule
  ]
})
export class PublicCloudAzureModule { }
