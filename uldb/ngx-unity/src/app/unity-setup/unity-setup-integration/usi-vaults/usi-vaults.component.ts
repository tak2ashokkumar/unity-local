import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-vaults',
  templateUrl: './usi-vaults.component.html',
  styleUrls: ['./usi-vaults.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiVaultsComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/cyberark.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;
  vaults: any[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private svc: UnitySetupIntegrationService,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.DEVOPS_AUTOMATION) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.DEVOPS_AUTOMATION) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.INTEGRATIONS)) {
      this.getVaults();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getVaults() {
    this.vaults = [];
    this.svc.getVaultsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vaults = res;
    });
  }

  viewVaults() {
    this.router.navigate(['vaults'], { relativeTo: this.route });
  }

  addVaults() {
    this.router.navigate(['vaults', 'create'], { relativeTo: this.route });
  }
}
