import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { UnitedCloudSharedModule } from '../../shared/united-cloud-shared.module';
import { PublicCloudAwsSummaryComponent } from './public-cloud-aws-summary/public-cloud-aws-summary.component';
import { PublicCloudAwsSummaryDetailsComponent } from './public-cloud-aws-summary/public-cloud-aws-summary-details/public-cloud-aws-summary-details.component';

@NgModule({
  declarations: [
    PublicCloudAwsSummaryComponent,
    PublicCloudAwsSummaryDetailsComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitedCloudSharedModule
  ],
})
export class PublicCloudAwsModule { }
