import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpDashboardComponent } from './mtp-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MtpDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpDashboardRoutingModule { }
