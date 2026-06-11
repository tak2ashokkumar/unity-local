import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MtpReportMgmtRoutingModule } from './mtp-report-mgmt-routing.module';
import { MtpReportMgmtComponent } from './mtp-report-mgmt.component';


@NgModule({
  declarations: [
    MtpReportMgmtComponent
  ],
  imports: [
    CommonModule,
    MtpReportMgmtRoutingModule
  ]
})
export class MtpReportMgmtModule { }
