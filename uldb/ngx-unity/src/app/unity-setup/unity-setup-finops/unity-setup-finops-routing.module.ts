import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitySetupFinopsComponent } from './unity-setup-finops.component';
import { UsfCrudComponent } from './usf-crud/usf-crud.component';
import { UsfDeviceMappingComponent } from './usf-device-mapping/usf-device-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: UnitySetupFinopsComponent,
    data: {
      breadcrumb: {
        title: 'Building Block'
      }
    }
  },
  {
    path: 'devicemap/:Id',
    component: UsfDeviceMappingComponent,
    data: {
      breadcrumb: {
        title: 'Device Mapping'
      }
    }
  },
  {
    path: 'add',
    component: UsfCrudComponent,
    data: {
      breadcrumb: {
        title: 'Create Building Blocks'
      }
    }
  },
  {
    path: ':id/edit',
    component: UsfCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit Building Blocks'
      }
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupFinopsRoutingModule { }
