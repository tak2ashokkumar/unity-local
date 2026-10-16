import { Component } from '@angular/core';
import { AppLevelService } from '../app-level.service';
import { UserInfoService } from '../shared/user-info.service';

@Component({
  selector: 'app-no-permissions',
  templateUrl: './no-permissions.component.html',
  styleUrls: ['./no-permissions.component.scss']
})
export class NoPermissionsComponent {

  constructor(
    public user: UserInfoService,
    private appService: AppLevelService
  ) { }

  get organizationName(): string {
    const userDetails = this.user.userDetails;
    return userDetails && userDetails.org ? userDetails.org.name : 'Organization';
  }

  get userEmail(): string {
    const userDetails = this.user.userDetails;
    return userDetails ? userDetails.email : '';
  }

  logout() {
    this.appService.logout();
  }
}
