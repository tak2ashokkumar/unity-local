import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { LDAPConfigType } from '../../unity-setup-ldap-config/unity-setup-ldap-config.type';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-ldap-widget',
  templateUrl: './usi-ldap-widget.component.html',
  styleUrls: ['./usi-ldap-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiLdapWidgetComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/LDAP.svg`;
  addtooltipMsg: string;
  viewtooltipMsg: string;
  ldapConfigs: LDAPConfigType[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private svc: UnitySetupIntegrationService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.USER_MANAGEMENT) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.USER_MANAGEMENT) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.USER_MANAGEMENT)) {
      this.getLDAPConfigs();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getLDAPConfigs() {
    this.ldapConfigs = [];
    this.svc.getLDAPConfigs().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ldapConfigs = res;
    });
  }

  addLdapAccount() {
    this.router.navigate(['ldap-config', 'create'], { relativeTo: this.route });
  }

  viewLdapAccount() {
    this.router.navigate(['ldap-config'], { relativeTo: this.route });
  }
}
