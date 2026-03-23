import { Component, OnInit } from '@angular/core';
import { UnityModules, UnityPermissionSet } from 'src/app/app.component';
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
  constructor(private user: UserInfoService,) {
    this.privateCloudPermissionSet = new UnityPermissionSet(UnityModules.PRIVATE_CLOUD);
    this.publicCloudPermissionSet = new UnityPermissionSet(UnityModules.PUBLIC_CLOUD);
    this.servicesPermissionSet = new UnityPermissionSet(UnityModules.SERVICES);
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
