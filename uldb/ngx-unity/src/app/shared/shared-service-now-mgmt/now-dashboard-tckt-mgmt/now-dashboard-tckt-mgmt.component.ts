import { Component, OnInit } from '@angular/core';
import { SharedServiceNowMgmtComponent } from '../shared-service-now-mgmt.component';
import { ServiceNowTicketViewData } from '../shared-service-now-mgmt.service';
import { StorageType } from '../../app-storage/storage-type';

@Component({
  selector: 'now-dashboard-tckt-mgmt',
  templateUrl: './now-dashboard-tckt-mgmt.component.html',
  styleUrls: ['./now-dashboard-tckt-mgmt.component.scss']
})
export class NowDashboardTcktMgmtComponent extends SharedServiceNowMgmtComponent {

  goToDetails(view: ServiceNowTicketViewData) {
    if (view.isEnhanceDetailsPage) {
      this.storage.put('selectedTicketSysId', view.sysId, StorageType.SESSIONSTORAGE);
    }
    this.router.navigateByUrl(view.detailsUrl);
  }
}
