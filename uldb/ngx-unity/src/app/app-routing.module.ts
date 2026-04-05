import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AppMainComponent } from './app-main/app-main.component';
import { TwoFactorAuthComponent } from './app-main/two-factor-auth/two-factor-auth.component';
import { UserProfileSettingsComponent } from './app-main/user-profile-settings/user-profile-settings.component';
import { AppTermialViewComponent } from './app-termial-view/app-termial-view.component';
import { AppWelcomePageComponent } from './app-welcome-page/app-welcome-page.component';
import { DefaultComponent } from './default/default.component';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { WelcomePageGuardService } from './welcome-page-guard.service';
import { UserProfileAddModelComponent } from './app-main/user-profile-settings/user-profile-add-model/user-profile-add-model.component';

export const routes: Routes = [
  {
    path: '',
    component: AppMainComponent,
    children: [
      {
        path: 'default',
        component: DefaultComponent,
        canActivate: [WelcomePageGuardService]
      },
      { path: 'welcomepage', component: AppWelcomePageComponent },
      // ...APP_DASHBOARD_ROUTES,
      {
        path: 'app-dashboard',
        data: {
          breadcrumb: {
            title: 'Dashboard'
          }
        },
        loadChildren: () => import('src/app/app-dashboard/app-dashboard.module').then(m => m.AppDashboardModule)
      },
      {
        path: 'home',
        loadChildren: () => import('src/app/app-home/app-home.module').then(m => m.AppHomeModule)
      },
      {
        path: 'unityview',
        data: {
          breadcrumb: {
            title: 'Unity View'
          }
        },
        loadChildren: () => import('src/app/united-view/united-view.module').then(m => m.UnitedViewModule)
      },
      {
        path: 'unitycloud',
        data: {
          breadcrumb: {
            title: 'Unity Cloud'
          }
        },
        loadChildren: () => import('src/app/united-cloud/united-cloud.module').then(m => m.UnitedCloudModule)
      },
      {
        path: 'services',
        data: {
          breadcrumb: {
            title: 'Unity Services'
          }
        },
        loadChildren: () => import('src/app/unity-services/unity-services.module').then(m => m.UnityServicesModule)
      },
      {
        path: 'cost-analysis',
        data: {
          breadcrumb: {
            title: 'Cost Analysis'
          }
        },
        loadChildren: () => import('src/app/unity-cost-analysis/unity-cost-analysis.module').then(m => m.UnityCostAnalysisModule)
      },
      {
        path: 'unity-ai-lifecycle',
        data: {
          breadcrumb: {
            title: 'AI Lifecycle Management'
          }
        },
        loadChildren: () => import('src/app/unity-ai-lifecycle/unity-ai-lifecycle.module').then(m => m.UnityAiLifecycleModule)
      },
      {
        path: 'reports',
        data: {
          breadcrumb: {
            title: 'Unity Reports'
          }
        },
        loadChildren: () => import('src/app/unity-reports/unity-reports.module').then(m => m.UnityReportsModule)
      },
      {
        path: 'setup',
        data: {
          breadcrumb: {
            title: 'Unity Setup'
          }
        },
        loadChildren: () => import('src/app/unity-setup/unity-setup.module').then(m => m.UnitySetupModule)
      },
      {
        path: 'support',
        data: {
          breadcrumb: {
            title: 'Support',
          }
        },
        loadChildren: () => import('src/app/unity-support/unity-support.module').then(m => m.UnitySupportModule)
      },
      {
        path: 'dev-settings',
        data: {
          breadcrumb: {
            title: 'Developer Settings',
          }
        },
        loadChildren: () => import('src/app/unity-dev-settings/unity-dev-settings.module').then(m => m.UnityDevSettingsModule)
      },
      {
        path: 'unity-search',
        component: GlobalSearchComponent,
        data: {
          breadcrumb: {
            title: 'Global Search',
          }
        },
        // children: [
        //   {
        //     path: 'advanced-search',
        //     component: GlobalSearchComponent,
        //     data: {
        //       breadcrumb: {
        //         title: 'Global Advanced Search'
        //       }
        //     }
        //   },
        // ]
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            component: UserProfileSettingsComponent,
            data: {
              breadcrumb: {
                title: 'Profile Settings'
              }
            }
          },
          {
            path: 'profile/add-model',
            component: UserProfileAddModelComponent,
            data: {
              breadcrumb: {
                title: 'Add Model'
              }
            }
          },
          {
            path: 'profile/edit-model/:modelId',
            component: UserProfileAddModelComponent,
            data: {
              breadcrumb: {
                title: 'Edit Model'
              }
            }
          },
          {
            path: 'twofactor',
            component: TwoFactorAuthComponent,
            data: {
              breadcrumb: {
                title: 'Two Factor Authentication'
              }
            }
          }
        ]
      },
      {
        path: '',
        redirectTo: 'default', pathMatch: 'full'
      }
    ]
  },
  {
    path: 'unityterminal',
    component: AppTermialViewComponent
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
