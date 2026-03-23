import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnityApplicationsComponent } from './unity-applications.component';
import { ApplicationDiscoveryDataComponent } from './application-discovery-data/application-discovery-data.component';
import { APPLICATION_COMPONENTS_ROUTES } from './application-discovery-data/application-discovery-data-routing.const';

const routes: Routes = [
  {
    path: 'applications',
    component: UnityApplicationsComponent,
    data: {
      breadcrumb: {
        title: 'Applications',
        stepbackCount: 0
      }
    },
  },
  {
    path: 'applications/:appId',
    component: ApplicationDiscoveryDataComponent,
    data: {
      breadcrumb: {
        title: 'Applications',
        stepbackCount: 0
      }
    },
    children: APPLICATION_COMPONENTS_ROUTES
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnityApplicationsRoutingModule { }
