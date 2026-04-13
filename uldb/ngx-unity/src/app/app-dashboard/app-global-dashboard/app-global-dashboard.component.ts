import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/map.service';
import { TabData } from 'src/app/shared/tabdata';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UnityPermissionSet } from 'src/app/shared/unity-rbac-permissions/unity-permission-set';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';
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
    private user: UserInfoService,
    private permissionService: PermissionService) {
    this.isAIMLEnabled = this.user.isAIMLEnabled;
    this.privateCloudPermissionSet = this.permissionService.getPermissionSet(UnityModules.PRIVATE_CLOUD);
    this.publicCloudPermissionSet = this.permissionService.getPermissionSet(UnityModules.PUBLIC_CLOUD);
    this.datacenterPermissionSet = this.permissionService.getPermissionSet(UnityModules.DATACENTER);
    this.ticketMgmtPermissionSet = this.permissionService.getPermissionSet(UnityModules.TICKET_MANAGEMENT);
    this.aimlPermissionSet = this.permissionService.getPermissionSet(UnityModules.AIML_EVENT_MANAGEMENT);
    this.maintenancePermissionSet = this.permissionService.getPermissionSet(UnityModules.MAINTENENCE);
    this.dashboardPermissionSet = this.permissionService.getPermissionSet(UnityModules.DASHBOARD);
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
