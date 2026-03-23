import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ADVANCE_DICOVERY_ON_BOARDING_ROUTES } from './advanced-device-discovery/advanced-device-discovery-routing.const';
import { EXCEL_ON_BOARDING_ROUTES } from './excel-on-boarding/excel-on-boarding-routing.const';
import { DEVICE_DISCOVERY_ON_BOARDING_ROUTES } from './unity-setup-device-discovery/unity-setup-device-discovery-routing.const';
import { UnitySetupOnBoardingResolverService } from './unity-setup-on-boarding-resolver.service';
import { UnitySetupOnBoardingComponent } from './unity-setup-on-boarding.component';
import { AdvancedDiscoveryConnectivityComponent } from './advanced-discovery-connectivity/advanced-discovery-connectivity.component';
import { AdvancedDiscoveryPolicyCrudComponent } from './advanced-device-discovery/advanced-discovery-network-scan/advanced-discovery-policy-crud/advanced-discovery-policy-crud.component';

const routes: Routes = [
  {
    path: '',
    component: UnitySetupOnBoardingComponent,
    resolve: {
      collectors: UnitySetupOnBoardingResolverService
    },
    data: {
      breadcrumb: {
        title: 'Onboarding'
      }
    },
    children: [
      {
        path: 'connectivity',
        component: AdvancedDiscoveryConnectivityComponent,
        data: {
          breadcrumb: {
            title: 'Connectivity'
          }
        }
      },
      ...DEVICE_DISCOVERY_ON_BOARDING_ROUTES,
      ...ADVANCE_DICOVERY_ON_BOARDING_ROUTES,
      ...EXCEL_ON_BOARDING_ROUTES
    ]
  },
  {
    path:'discovery-policy',
    component:AdvancedDiscoveryPolicyCrudComponent
  },
  {
    path: 'discovery-policy/:policyId/edit',
    component: AdvancedDiscoveryPolicyCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit',
        stepbackCount: 0
      }
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupOnBoardingRoutingModule { }
