import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpReportMgmtComponent } from './mtp-report-mgmt.component';

const routes: Routes = [
  {
    path: '',
    component: MtpReportMgmtComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpReportMgmtRoutingModule { }
