import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { PublicCloudRoutingModule } from './public-cloud-routing.module';
import { PublicCloudComponent } from './public-cloud.component';
import { PublicCloudResolverService } from './public-cloud-resolver.service';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { PublicCloudAwsModule } from './public-cloud-aws/public-cloud-aws.module';
import { PublicCloudGcpModule } from './public-cloud-gcp/public-cloud-gcp.module';
import { PublicCloudAzureModule } from './public-cloud-azure/public-cloud-azure.module';
import { PublicCloudOciModule } from './public-cloud-oci/public-cloud-oci.module';

@NgModule({
  declarations: [PublicCloudComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    PublicCloudRoutingModule,
    PublicCloudAwsModule,
    PublicCloudGcpModule,
    PublicCloudAzureModule,
    PublicCloudOciModule
  ],
  providers: [PublicCloudResolverService]
})
export class PublicCloudModule { }
