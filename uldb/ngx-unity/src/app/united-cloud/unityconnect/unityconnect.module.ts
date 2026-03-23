import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';


import { UnityconnectRoutingModule } from './unityconnect-routing.module';
import { UnityConnectComponent } from './unity-connect.component';
import { UnityconnectBandwidthComponent } from './unityconnect-bandwidth/unityconnect-bandwidth.component';
import { UnityconnectVxcComponent } from './unityconnect-vxc/unityconnect-vxc.component';
import { UnityconnectBandwidthGraphComponent } from './unityconnect-bandwidth/unityconnect-bandwidth-graph/unityconnect-bandwidth-graph.component';
import { UnityconnectBandwidthGraphUsageComponent } from './unityconnect-bandwidth/unityconnect-bandwidth-graph/unityconnect-bandwidth-graph-usage/unityconnect-bandwidth-graph-usage.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { UnityconnectBandwidthBillingComponent } from './unityconnect-bandwidth-billing/unityconnect-bandwidth-billing.component';
import { UnityconnectNetworkConnectionComponent } from './unityconnect-network-connection/unityconnect-network-connection.component';
import { UnityconnectNetworkBillingComponent } from './unityconnect-network-billing/unityconnect-network-billing.component';
import { ChartsModule } from 'ng2-charts';
import { GraphPortComponent } from './graph-port/graph-port.component';

@NgModule({
  declarations: [UnityConnectComponent,
    UnityconnectBandwidthComponent,
    UnityconnectVxcComponent,
    UnityconnectBandwidthGraphComponent,
    UnityconnectBandwidthGraphUsageComponent,
    UnityconnectBandwidthBillingComponent,
    UnityconnectNetworkConnectionComponent,
    UnityconnectNetworkBillingComponent,
    GraphPortComponent,
  ],
  imports: [
    AppCoreModule,
    ChartsModule,
    SharedModule,
    UnityconnectRoutingModule,
    UnitedCloudSharedModule
  ]
})
export class UnityconnectModule { }
