import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ADVANCE_DICOVERY_ON_BOARDING_ROUTES } from './advanced-device-discovery/advanced-device-discovery-routing.const';
import { AdvancedDiscoveryPolicyCrudComponent } from './advanced-device-discovery/advanced-discovery-network-scan/advanced-discovery-policy-crud/advanced-discovery-policy-crud.component';
import { AdvancedDiscoveryConnectivityRequestComponent } from './advanced-discovery-connectivity/advanced-discovery-connectivity-request/advanced-discovery-connectivity-request.component';
import { AdvancedDiscoveryConnectivityComponent } from './advanced-discovery-connectivity/advanced-discovery-connectivity.component';
import { ApplicationOnboardingCrudComponent } from './application-onboarding/application-onboarding-crud/application-onboarding-crud.component';
import { ApplicationOnboardingComponent } from './application-onboarding/application-onboarding.component';
import { EXCEL_ON_BOARDING_ROUTES } from './excel-on-boarding/excel-on-boarding-routing.const';
import { DEVICE_DISCOVERY_ON_BOARDING_ROUTES } from './unity-setup-device-discovery/unity-setup-device-discovery-routing.const';
import { UnitySetupOnBoardingResolverService } from './unity-setup-on-boarding-resolver.service';
import { UnitySetupOnBoardingComponent } from './unity-setup-on-boarding.component';

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
        path: 'connectivity/request-access',
        component: AdvancedDiscoveryConnectivityRequestComponent,
        data: {
          breadcrumb: {
            title: 'Request Access'
          }
        }
      },
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
      ...EXCEL_ON_BOARDING_ROUTES,
      {
        path: 'application-onboarding',
        component: ApplicationOnboardingComponent,
        data: {
          breadcrumb: {
            title: 'Application Onboarding'
          }
        }
      },
    ]
  },
  {
    path: 'discovery-policy',
    component: AdvancedDiscoveryPolicyCrudComponent
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
  // Top-level (outside the onboarding host) so the outer stepper is not rendered
  // on the APM wizard - same pattern as the discovery-policy routes above.
  {
    path: 'application-onboarding/create',
    component: ApplicationOnboardingCrudComponent,
    data: {
      breadcrumb: {
        title: 'Onboard Application'
      }
    }
  },
  {
    path: 'application-onboarding/:id/edit',
    component: ApplicationOnboardingCrudComponent,
    data: {
      breadcrumb: {
        title: 'Edit Application'
      }
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySetupOnBoardingRoutingModule { }
