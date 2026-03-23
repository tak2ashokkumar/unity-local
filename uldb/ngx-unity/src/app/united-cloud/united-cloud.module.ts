import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from '../app-core/app-core.module';

import { AssetsModule } from './assets/assets.module';
import { DatacenterModule } from './datacenter/datacenter.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PrivateCloudModule } from './private-cloud/private-cloud.module';
import { PublicCloudModule } from './public-cloud/public-cloud.module';
import { MeshServicesModule } from './unity-cloud-services/unity-cloud-services.module';
import { UnityconnectModule } from './unityconnect/unityconnect.module';
import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { BusinessServiceModule } from './business-service/business-service.module';
import { UnityApplicationsModule } from './unity-applications/unity-applications.module';



@NgModule({
  declarations: [],
  imports: [
    AppCoreModule,
    SharedModule,
    // UnitedCloudRoutingModule,
    PrivateCloudModule,
    PublicCloudModule,
    DatacenterModule,
    AssetsModule,
    InfrastructureModule,
    UnityconnectModule,
    MeshServicesModule,
    UnityApplicationsModule,
    EchartsxModule,
    ChartsModule,
    NgxGraphModule,
    BusinessServiceModule
  ],
  providers: [],
  exports: [
  ]
})
export class UnitedCloudModule { }
