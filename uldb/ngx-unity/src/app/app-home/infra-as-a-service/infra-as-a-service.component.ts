import { Component, OnInit } from '@angular/core';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UnityPermissionSet } from 'src/app/shared/unity-rbac-permissions/unity-permission-set';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';
import { UserInfoService } from 'src/app/shared/user-info.service';


@Component({
  selector: 'infra-as-a-service',
  templateUrl: './infra-as-a-service.component.html',
  styleUrls: ['./infra-as-a-service.component.scss']
})
export class InfraAsAServiceComponent implements OnInit {
  privateCloudPermissionSet: UnityPermissionSet;
  publicCloudPermissionSet: UnityPermissionSet;
  servicesPermissionSet: UnityPermissionSet;
  constructor(private user: UserInfoService,
    private permissionService: PermissionService) {
    this.privateCloudPermissionSet = this.permissionService.getPermissionSet(UnityModules.PRIVATE_CLOUD);
    this.publicCloudPermissionSet = this.permissionService.getPermissionSet(UnityModules.PUBLIC_CLOUD);
    this.servicesPermissionSet = this.permissionService.getPermissionSet(UnityModules.SERVICES);
  }

  ngOnInit() {
  }

  showPrivateCloudWidgets(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.privateCloudPermissionSet?.view;
  }

  showPublicCloudWidgets(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.publicCloudPermissionSet?.view;
  }

  showServicesWidgets(): boolean {
    return this.user.isDashboardOnlyUser ? true : this.servicesPermissionSet?.view;
  }


}
