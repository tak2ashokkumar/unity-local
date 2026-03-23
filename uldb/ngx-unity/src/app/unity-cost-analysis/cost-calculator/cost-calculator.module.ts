import { NgModule } from '@angular/core';
import { AppCoreModule } from 'src/app/app-core/app-core.module';

import { CostCalculatorRoutingModule } from './cost-calculator-routing.module';
import { CostCalculatorComponent } from './cost-calculator.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { DecimalPipe } from '@angular/common';
import { AwsInstanceListComponent } from './aws-instance-list/aws-instance-list.component';
import { AzureInstanceListComponent } from './azure-instance-list/azure-instance-list.component';
import { GcpInstanceListComponent } from './gcp-instance-list/gcp-instance-list.component';
import { G3InstanceListComponent } from './g3-instance-list/g3-instance-list.component';
import { CostComparatorComponent } from './cost-comparator/cost-comparator.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CostCalculatorComponent, AwsInstanceListComponent, AzureInstanceListComponent, GcpInstanceListComponent, G3InstanceListComponent, CostComparatorComponent],
  imports: [
    AppCoreModule,
    SharedModule,
    CostCalculatorRoutingModule,
    NgxSliderModule
  ],
  providers: [
    DecimalPipe
  ]
})
export class CostCalculatorModule { }
