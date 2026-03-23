import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvailabilityCostInsightsComponent } from './availability-cost-insights/availability-cost-insights.component';
import { CostIntelligenceComponent } from './cost-intelligence.component';
import { DynamicCostInsightsComponent } from './dynamic-cost-insights/dynamic-cost-insights.component';
import { FixedSpendInsightsComponent } from './fixed-spend-insights/fixed-spend-insights.component';
import { FunctionalCostInsightsComponent } from './functional-cost-insights/functional-cost-insights.component';
import { OperationalSpendInsightsComponent } from './operational-spend-insights/operational-spend-insights.component';
import { UnifiedCostIntelligenceHubComponent } from './unified-cost-intelligence-hub/unified-cost-intelligence-hub.component';
import { CostByDeviceTypeDetailsComponent } from './cost-by-device-type-details/cost-by-device-type-details.component';

const routes: Routes = [
  {
    path: 'cost-intelligence',
    component: CostIntelligenceComponent,
    data: {
      breadcrumb: {
        title: 'Cost Intelligence',
        stepbackCount: 0
      }
    },
    children: [
      {
        path: 'summary',
        component: UnifiedCostIntelligenceHubComponent,
        data: {
          breadcrumb: {
            title: 'Unified Cost Intelligence Hub',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'functional-cost-insights',
        component: FunctionalCostInsightsComponent,
        data: {
          breadcrumb: {
            title: 'Functional Cost Insights',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'dynamic-cost-insights',
        component: DynamicCostInsightsComponent,
        data: {
          breadcrumb: {
            title: 'Dynamic Cost Insights',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'operational-spend-insights',
        component: OperationalSpendInsightsComponent,
        data: {
          breadcrumb: {
            title: 'Operational Spend Insights',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'fixed-spend-insights',
        component: FixedSpendInsightsComponent,
        data: {
          breadcrumb: {
            title: 'Fixed Spend Insights',
            stepbackCount: 1
          }
        },
      },
      {
        path: 'availability-cost-insights',
        component: AvailabilityCostInsightsComponent,
        data: {
          breadcrumb: {
            title: 'Availability Cost Insights',
            stepbackCount: 1
          }
        },
      },
    ]
  },
  {
    path: 'cost-intelligence/details/:deviceType',
    component: CostByDeviceTypeDetailsComponent,
    data: {
      breadcrumb: {
        title: 'Cost Intelligence Details',
        stepbackCount: 1
      }
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostIntelligenceRoutingModule { }
