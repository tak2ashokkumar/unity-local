import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { PrivateCloudRoutingModule } from './private-cloud-routing.module';
import { PrivateCloudComponent } from './private-cloud.component';
import { PrivateCloudService } from './private-cloud.service';
import { PrivateCloudResolverService } from './private-cloud-resolver.service';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { PrivateCloudAssetsComponent } from './private-cloud-assets/private-cloud-assets.component';

@NgModule({
  declarations: [
    PrivateCloudComponent,
    PrivateCloudAssetsComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    PrivateCloudRoutingModule,
    UnitedCloudSharedModule
  ],
  providers: [PrivateCloudService, PrivateCloudResolverService]
})
export class PrivateCloudModule { }
