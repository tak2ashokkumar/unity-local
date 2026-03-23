import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { aws_routes } from './public-cloud-aws/public-cloud-aws-routing.module';
import { azure_routes } from './public-cloud-azure/public-cloud-azure-routing.module';
import { gcp_routes } from './public-cloud-gcp/public-cloud-gcp-routing.module';
import { oci_routes } from './public-cloud-oci/public-cloud-oci-routing.module';
import { PublicCloudResolverService } from './public-cloud-resolver.service';
import { PublicCloudComponent } from './public-cloud.component';

const routes: Routes = [
  {
    path: 'publiccloud',
    component: PublicCloudComponent,
    resolve: {
      tabItems: PublicCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Public Cloud',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'publiccloud/aws',
    component: PublicCloudComponent,
    resolve: {
      tabItems: PublicCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Public Cloud',
        stepbackCount: 0
      }
    },
    children: aws_routes
  },
  {
    path: 'publiccloud/gcp',
    component: PublicCloudComponent,
    resolve: {
      tabItems: PublicCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Public Cloud',
        stepbackCount: 0
      }
    },
    children: gcp_routes
  },
  {
    path: 'publiccloud/azure',
    component: PublicCloudComponent,
    resolve: {
      tabItems: PublicCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Public Cloud',
        stepbackCount: 0
      }
    },
    children: azure_routes
  },
  {
    path: 'publiccloud/oracle',
    component: PublicCloudComponent,
    resolve: {
      tabItems: PublicCloudResolverService
    },
    data: {
      breadcrumb: {
        title: 'Public Cloud',
        stepbackCount: 0
      }
    },
    children: oci_routes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicCloudRoutingModule { }
