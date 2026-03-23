import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CostIntelligenceRoutingModule } from './cost-intelligence-routing.module';
import { CostIntelligenceComponent } from './cost-intelligence.component';
import { UnifiedCostIntelligenceHubComponent } from './unified-cost-intelligence-hub/unified-cost-intelligence-hub.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FunctionalCostInsightsComponent } from './functional-cost-insights/functional-cost-insights.component';
import { DynamicCostInsightsComponent } from './dynamic-cost-insights/dynamic-cost-insights.component';
import { OperationalSpendInsightsComponent } from './operational-spend-insights/operational-spend-insights.component';
import { FixedSpendInsightsComponent } from './fixed-spend-insights/fixed-spend-insights.component';
import { AvailabilityCostInsightsComponent } from './availability-cost-insights/availability-cost-insights.component';
import { ChartsModule } from 'ng2-charts';
import { EchartsxModule } from 'echarts-for-angular';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { CostByDeviceTypeDetailsComponent } from './cost-by-device-type-details/cost-by-device-type-details.component';

/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};


@NgModule({
  declarations: [
    CostIntelligenceComponent,
    UnifiedCostIntelligenceHubComponent,
    FunctionalCostInsightsComponent,
    DynamicCostInsightsComponent,
    OperationalSpendInsightsComponent,
    FixedSpendInsightsComponent,
    AvailabilityCostInsightsComponent,
    CostByDeviceTypeDetailsComponent
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    CommonModule,
    ChartsModule,
    EchartsxModule,
    CostIntelligenceRoutingModule
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ]
})
export class CostIntelligenceModule { }
