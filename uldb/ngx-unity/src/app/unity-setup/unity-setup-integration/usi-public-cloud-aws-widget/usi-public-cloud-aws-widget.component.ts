import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudAwsCrudService } from 'src/app/shared/public-cloud-aws-crud/public-cloud-aws-crud.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { UnityModules } from 'src/app/app.component';

@Component({
  selector: 'usi-public-cloud-aws-widget',
  templateUrl: './usi-public-cloud-aws-widget.component.html',
  styleUrls: ['./usi-public-cloud-aws-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiPublicCloudAwsWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/amazon-web-services.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: PublicCloudAwsCrudService) { }

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
      let k = res.find(pc => pc.cloud_type == PlatFormMapping.AWS);
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addAwsAccount() {
    this.crudSvc.addOrEdit(null);
  }

  addAccount() {
    this.router.navigate(['aws', 'add'], { relativeTo: this.route });
  }

  viewAccounts() {
    this.router.navigate(['aws/instances'], { relativeTo: this.route });
  }

  viewAwsAccount() {
    this.router.navigate(['/unitycloud/publiccloud/aws/']);
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/publiccloud/aws/']);
  }
}