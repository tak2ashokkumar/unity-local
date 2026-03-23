import { Component, OnInit } from '@angular/core';
import { SharedTcktMgmtComponent } from '../shared-tckt-mgmt.component';
import { TICKET_TYPE } from '../../app-utility/app-utility.service';

@Component({
  selector: 'dashboard-shared-tckt-mgmt',
  templateUrl: './dashboard-shared-tckt-mgmt.component.html',
  styleUrls: ['./dashboard-shared-tckt-mgmt.component.scss']
})
export class DashboardSharedTcktMgmtComponent extends SharedTcktMgmtComponent {
}
