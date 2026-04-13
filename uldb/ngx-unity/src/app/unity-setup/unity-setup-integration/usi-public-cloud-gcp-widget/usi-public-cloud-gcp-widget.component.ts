import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudGcpCrudService } from 'src/app/shared/public-cloud-gcp-crud/public-cloud-gcp-crud.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-public-cloud-gcp-widget',
  templateUrl: './usi-public-cloud-gcp-widget.component.html',
  styleUrls: ['./usi-public-cloud-gcp-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiPublicCloudGcpWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Google_Cloud_Platform-Logo 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: PublicCloudGcpCrudService) { }

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
      let k = res.find(pc => pc.cloud_type == PlatFormMapping.GCP);
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addGcpAccount() {
    this.router.navigate(['gcp/add'], { relativeTo: this.route })
  }

  viewGcpAccount() {
    this.router.navigate(['gcp/instances'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/publiccloud/gcp/']);
  }
}
