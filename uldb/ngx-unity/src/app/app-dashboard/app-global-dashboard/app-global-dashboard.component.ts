import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UnityModules, UnityPermissionSet } from 'src/app/app.component';
import { MapService } from 'src/app/map.service';
import { TabData } from 'src/app/shared/tabdata';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'app-global-dashboard',
  templateUrl: './app-global-dashboard.component.html',
  styleUrls: ['./app-global-dashboard.component.scss']
})
export class AppGlobalDashboardComponent implements OnInit {
  public tabItems: TabData[] = tabItems;

  reloading: boolean = false;
  isAIMLEnabled: boolean = false;
  datacenterPermissionSet: UnityPermissionSet;
  privateCloudPermissionSet: UnityPermissionSet;
  publicCloudPermissionSet: UnityPermissionSet;
  aimlPermissionSet: UnityPermissionSet;
  maintenancePermissionSet: UnityPermissionSet;
  ticketMgmtPermissionSet: UnityPermissionSet;
  dashboardPermissionSet: UnityPermissionSet;
  constructor(private cdr: ChangeDetectorRef,
    public mapService: MapService,
    private user: UserInfoService) {
    this.isAIMLEnabled = this.user.isAIMLEnabled;
    this.privateCloudPermissionSet = new UnityPermissionSet(UnityModules.PRIVATE_CLOUD);
    this.publicCloudPermissionSet = new UnityPermissionSet(UnityModules.PUBLIC_CLOUD);
    this.datacenterPermissionSet = new UnityPermissionSet(UnityModules.DATACENTER);
    this.ticketMgmtPermissionSet = new UnityPermissionSet(UnityModules.TICKET_MANAGEMENT);
    this.aimlPermissionSet = new UnityPermissionSet(UnityModules.AIML_EVENT_MANAGEMENT);
    this.maintenancePermissionSet = new UnityPermissionSet(UnityModules.MAINTENENCE);
    this.dashboardPermissionSet = new UnityPermissionSet(UnityModules.DASHBOARD);
  }

  ngOnInit(): void {
  }

  refreshData() {
    this.reloading = true;
    this.cdr.detectChanges();
    this.reloading = false;
    this.cdr.detectChanges();
  }

  showDCMapWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : (this.datacenterPermissionSet.view && !this.mapService.mapHidden);
  }

  showInfraAsServiceWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : (this.privateCloudPermissionSet.view || this.publicCloudPermissionSet.view);
  }

  showDCWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.datacenterPermissionSet.view;
  }

  showAssetsUnderMgmtWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : (this.privateCloudPermissionSet.view || this.datacenterPermissionSet.view);
  }

  showMaintenanceWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.maintenancePermissionSet.view;
  }

  showAIMLWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.aimlPermissionSet.view;
  }

  showAlertsWidget(): boolean {
    return !this.showAIMLWidget() && (this.user.isDashboardOnlyUser ? true : (this.privateCloudPermissionSet.view || this.datacenterPermissionSet.view));
  }

  showTicketMgmtWidget(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.ticketMgmtPermissionSet.view;
  }

}

export const tabItems: TabData[] = [

];
