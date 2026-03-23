import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CostCalculatorComponent } from './cost-calculator.component';

const routes: Routes = [
  {
    path: 'cost-calculator',
    component: CostCalculatorComponent,
    data: {
      breadcrumb: {
        title: 'Cost Calculator',
        stepbackCount: 0
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostCalculatorRoutingModule { }
