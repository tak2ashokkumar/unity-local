import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudAzureCrudService } from 'src/app/shared/public-cloud-azure-crud/public-cloud-azure-crud.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';

@Component({
  selector: 'usi-public-cloud-azure-widget',
  templateUrl: './usi-public-cloud-azure-widget.component.html',
  styleUrls: ['./usi-public-cloud-azure-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiPublicCloudAzureWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Microsoft_Azure_Logo 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: PublicCloudAzureCrudService) { }

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
      let k = res.find(pc => pc.cloud_type == PlatFormMapping.AZURE);
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addAzureAccount() {
    this.crudSvc.addOrEdit(null);
  }

  addAccount() {
    this.router.navigate(['azure','add'], { relativeTo: this.route });
  }

  viewAccounts() {
    this.router.navigate(['azure/instances'], { relativeTo: this.route });
  }

  viewAzureAccount() {
    this.router.navigate(['/unitycloud/publiccloud/azure/']);
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/publiccloud/azure/']);
  }
}
