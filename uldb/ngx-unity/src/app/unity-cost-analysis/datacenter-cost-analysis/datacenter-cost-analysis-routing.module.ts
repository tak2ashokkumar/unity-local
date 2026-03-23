import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatacenterCostAnalysisComponent } from './datacenter-cost-analysis.component';
import { DatacenterCostSummaryComponent } from './datacenter-cost-summary/datacenter-cost-summary.component';
import { DatacenterBillDetailsComponent } from './datacenter-bill-details/datacenter-bill-details.component';

const routes: Routes = [
  {
    path: 'datacenter',
    component: DatacenterCostAnalysisComponent,
    data: {
      breadcrumb: {
        title: 'Datacenter',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'summary',
        component: DatacenterCostSummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'billdetails',
        component: DatacenterBillDetailsComponent,
        data: {
          breadcrumb: {
            title: 'Bill Details',
            stepbackCount: 1
          }
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatacenterCostAnalysisRoutingModule { }
