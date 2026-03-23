import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GreenItDashboardComponent } from './green-it-dashboard/green-it-dashboard.component';
import { GreenItEmissionDetailsComponent } from './green-it-emission-details/green-it-emission-details.component';
import { GreenItUsageComponent } from './green-it-usage/green-it-usage.component';
import { GreenITComponent } from './green-it.component';
import { GreenItGuard } from './green-it.guard';
import { GreenItSubscribeComponent } from './green-it-subscribe/green-it-subscribe.component';

const routes: Routes = [
  {
    path: 'greeenIT',
    component: GreenITComponent,
    data: {
      breadcrumb: {
        title: 'Sustainability',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'dashboard',
        component: GreenItDashboardComponent,
        canActivate: [GreenItGuard],
        data: {
          breadcrumb: {
            title: 'Dashboard',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'emission-details',
        component: GreenItEmissionDetailsComponent,
        canActivate: [GreenItGuard],
        data: {
          breadcrumb: {
            title: 'Emission Details',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'usage',
        component: GreenItUsageComponent,
        canActivate: [GreenItGuard],
        data: {
          breadcrumb: {
            title: 'Usage',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'subscribe',
        component: GreenItSubscribeComponent,
        canActivate: [GreenItGuard],
        data: {
          breadcrumb: {
            title: 'Subscribe',
            stepbackCount: 0
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GreenITRoutingModule { }
