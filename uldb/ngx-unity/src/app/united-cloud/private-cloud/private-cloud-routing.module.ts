import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';

import { PrivateCloudComponent } from './private-cloud.component';
import { PrivateCloudResolverService } from './private-cloud-resolver.service';

import { DevicesRoutes } from 'src/app/united-cloud/shared/shared-route';
import { PcCrudComponent } from 'src/app/app-shared-crud/pc-crud/pc-crud.component';



const routes: Routes = [
  {
    path: 'pccloud',
    component: PrivateCloudComponent,
    resolve: {
      tabItems: PrivateCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Private Cloud'
      }
    }
  },
  {
    path: 'pccloud/:pcId',
    component: PrivateCloudComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      tabItems: PrivateCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Private Cloud'
      }
    },
    children: DevicesRoutes
  },
  // For no Private clouds scenario
  {
    path: 'pccloud/new/add',
    component: PcCrudComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateCloudRoutingModule { }