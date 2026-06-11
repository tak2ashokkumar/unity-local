import { NgModule } from '@angular/core';

import { ChartsModule } from 'ng2-charts';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { MtpTicketMgmtRoutingModule } from './mtp-ticket-mgmt-routing.module';
import { MtpTicketMgmtComponent } from './mtp-ticket-mgmt.component';
import { MtpTicketDetailsComponent } from './mtp-ticket-details/mtp-ticket-details.component';
import { MtpCreateTicketComponent } from './mtp-create-ticket/mtp-create-ticket.component';


@NgModule({
  declarations: [
    MtpTicketMgmtComponent,
    MtpTicketDetailsComponent,
    MtpCreateTicketComponent
  ],
  imports: [
    SharedModule,
    AppCoreModule,
    ChartsModule,
    MtpTicketMgmtRoutingModule
  ]
})
export class MtpTicketMgmtModule { }
