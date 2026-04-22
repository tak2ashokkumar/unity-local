import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudOciCrudService } from 'src/app/app-shared-crud/public-cloud-oci-crud/public-cloud-oci-crud.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-public-cloud-oracle-widget',
  templateUrl: './usi-public-cloud-oracle-widget.component.html',
  styleUrls: ['./usi-public-cloud-oracle-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiPublicCloudOracleWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Oracle-cloud 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: PublicCloudOciCrudService) { }

  ngOnInit(): void {
    // this.addtooltipMsg = this.userService.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
    if (this.userService.hasViewAccess(UnityModules.PUBLIC_CLOUD)) {
      this.getPublicClouds();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPublicClouds() {
    this.svc.getPublicClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let k = res.find(pc => pc.cloud_type == PlatFormMapping.ORACLE);
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addOracleAccount() {
    this.crudSvc.addOrEdit(null);
  }

  addAccount() {
    this.router.navigate(['oracle/add'], { relativeTo: this.route });
  }

  viewOracleAccount() {
    this.router.navigate(['oracle/instances'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    // this.router.navigate(['/unitycloud/publiccloud/oracle/']);
  }
}
