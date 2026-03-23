import { NgModule } from '@angular/core';

import { EchartsxModule } from 'echarts-for-angular';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { AwsMeshesComponent } from './mesh-services/aws-meshes/aws-meshes.component';
import { AwsVirtualRoutersComponent } from './mesh-services/aws-meshes/aws-virtual-services/aws-virtual-routers/aws-virtual-routers.component';
import { AwsVirtualServicesComponent } from './mesh-services/aws-meshes/aws-virtual-services/aws-virtual-services.component';
import { AwsVisNetworkComponent } from './mesh-services/aws-meshes/aws-vis-network/aws-vis-network.component';
import { IstioDestinationRulesComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-destination-rules/istio-destination-rules.component';
import { IstioOverviewComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-overview.component';
import { IstioContainersComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-pods/istio-containers/istio-containers.component';
import { IstioPodsComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-pods/istio-pods.component';
import { IstioServicesComponent } from './mesh-services/istio-virtual-services/istio-overview/istio-services/istio-services.component';
import { IstioVirtualServicesComponent } from './mesh-services/istio-virtual-services/istio-virtual-services.component';
import { IstioVisNetworkComponent } from './mesh-services/istio-virtual-services/istio-vis-network/istio-vis-network.component';
import { MeshServicesCrudComponent } from './mesh-services/mesh-services-crud/mesh-services-crud.component';
import { MeshServicesCrudService } from './mesh-services/mesh-services-crud/mesh-services-crud.service';
import { MeshServicesComponent } from './mesh-services/mesh-services.component';
import { ServiceTreeComponent } from './mesh-services/service-tree/service-tree.component';
import { MeshBackendComponent } from './mesh-services/tds/neg/mesh-backend/mesh-backend.component';
import { NegComponent } from './mesh-services/tds/neg/neg.component';
import { TdsVisNetworkComponent } from './mesh-services/tds/tds-vis-network/tds-vis-network.component';
import { TdsComponent } from './mesh-services/tds/tds.component';
import { NonMeshServicesComponent } from './non-mesh-services/non-mesh-services.component';
import { MeshServicesRoutingModule } from './unity-cloud-services-routing.module';
import { UnityCloudServicesComponent } from './unity-cloud-services.component';

@NgModule({
  declarations: [
    UnityCloudServicesComponent,
    MeshServicesComponent,
    NonMeshServicesComponent,
    TdsComponent,
    NegComponent,
    MeshBackendComponent,
    AwsMeshesComponent,
    AwsVirtualServicesComponent,
    AwsVirtualRoutersComponent,
    IstioVirtualServicesComponent,
    IstioOverviewComponent,
    IstioServicesComponent,
    IstioDestinationRulesComponent,
    MeshServicesCrudComponent,
    IstioPodsComponent,
    IstioContainersComponent,
    ServiceTreeComponent,
    TdsVisNetworkComponent,
    AwsVisNetworkComponent,
    IstioVisNetworkComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    MeshServicesRoutingModule,
    EchartsxModule,
    ChartsModule,
    PerfectScrollbarModule,
    UnitedCloudSharedModule
  ],
  providers: [MeshServicesCrudService]
})
export class MeshServicesModule { }
