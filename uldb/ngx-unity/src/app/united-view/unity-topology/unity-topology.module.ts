import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnityAzureTopologyViewComponent } from './unity-azure-topology-view/unity-azure-topology-view.component';
import { UnityGcpTopologyViewComponent } from './unity-gcp-topology-view/unity-gcp-topology-view.component';
import { UnityOciTopologyViewComponent } from './unity-oci-topology-view/unity-oci-topology-view.component';
import { UnityTopologyViewComponent } from './unity-topology-view/unity-topology-view.component';
import { UnityTopologyComponent } from './unity-topology.component';

@NgModule({
  declarations: [
    UnityTopologyComponent,
    UnityTopologyViewComponent,
    UnityAzureTopologyViewComponent,
    UnityOciTopologyViewComponent,
    UnityGcpTopologyViewComponent
  ],
  imports: [
    SharedModule,
    AppCoreModule
  ],
  exports: [
    UnityTopologyComponent
  ]
})
export class UnityTopologyModule { }
