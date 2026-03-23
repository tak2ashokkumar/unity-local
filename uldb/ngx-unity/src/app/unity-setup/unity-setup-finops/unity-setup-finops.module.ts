import { NgModule } from '@angular/core';
import { UnitySetupFinopsRoutingModule } from './unity-setup-finops-routing.module';
import { UnitySetupFinopsComponent } from './unity-setup-finops.component';
import { UsfFunctionalComponent } from './usf-functional/usf-functional.component';
import { UsfBasicComponent } from './usf-basic/usf-basic.component';
import { UsfOperationalComponent } from './usf-operational/usf-operational.component';
import { UsfComponentsComponent } from './usf-components/usf-components.component';
import { UsfSoftwareComponent } from './usf-software/usf-software.component';
import { UsffComputeComponent } from './usf-functional/usff-compute/usff-compute.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { UsffOsConfigComponent } from './usf-functional/usff-os-config/usff-os-config.component';
import { UsffStorageComponent } from './usf-functional/usff-storage/usff-storage.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UsfCrudComponent } from './usf-crud/usf-crud.component';
import { UsfDeviceMappingComponent } from './usf-device-mapping/usf-device-mapping.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    UnitySetupFinopsComponent,
    UsfCrudComponent,
    UsfBasicComponent,
    UsfComponentsComponent,
    UsfFunctionalComponent,
    UsffComputeComponent,
    UsffOsConfigComponent,
    UsffStorageComponent,
    UsfOperationalComponent,
    UsfSoftwareComponent,
    UsfDeviceMappingComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    CommonModule,
    UnitySetupFinopsRoutingModule,
    CollapseModule,
    NgSelectModule
  ]
})
export class UnitySetupFinopsModule { }