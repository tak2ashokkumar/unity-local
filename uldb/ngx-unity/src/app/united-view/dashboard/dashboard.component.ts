import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UnityModules, UnityPermissionSet } from 'src/app/shared/permissions/unity-permission-set';
import { MapService } from 'src/app/map.service';
import { PermissionService } from 'src/app/shared/permissions/permission.service';
import { UserInfoService } from 'src/app/shared/user-info.service';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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

  ngOnInit() { }

  refreshData(pageNo: number) {
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

export const WIDGET_DATA_ERROR: string = 'No data found';
