import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfrastructureRoutingModule } from './infrastructure-routing.module';
import { InfrastructureComponent } from './infrastructure.component';
import { InfrastructureNetworkDevicesComponent } from './infrastructure-network-devices/infrastructure-network-devices.component';
import { InfrastructureInterfaceDetailsComponent } from './infrastructure-interface-details/infrastructure-interface-details.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChartsModule } from 'ng2-charts';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { InfrastructureIotDevicesComponent } from './infrastructure-iot-devices/infrastructure-iot-devices.component';
import { EchartsxModule } from 'echarts-for-angular';


@NgModule({
  declarations: [
    InfrastructureComponent,
    InfrastructureNetworkDevicesComponent,
    InfrastructureInterfaceDetailsComponent,
    InfrastructureIotDevicesComponent
  ],
  imports: [
    // CommonModule,
    AppCoreModule,
    SharedModule,
    InfrastructureRoutingModule,
    PerfectScrollbarModule,
    ChartsModule,
    UnitedCloudSharedModule,
    EchartsxModule
  ]
})
export class InfrastructureModule { }
