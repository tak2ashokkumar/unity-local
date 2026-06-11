import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtpTicketMgmtComponent } from './mtp-ticket-mgmt.component';
import { MtpTicketDetailsComponent } from './mtp-ticket-details/mtp-ticket-details.component';
import { MtpCreateTicketComponent } from './mtp-create-ticket/mtp-create-ticket.component';

const routes: Routes = [
  {
    path: '',
    component: MtpTicketMgmtComponent
  },
  {
    path: 'ticket/create',
    component: MtpCreateTicketComponent
  },
  {
    path: 'ticket/:id',
    component: MtpTicketDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MtpTicketMgmtRoutingModule { }
