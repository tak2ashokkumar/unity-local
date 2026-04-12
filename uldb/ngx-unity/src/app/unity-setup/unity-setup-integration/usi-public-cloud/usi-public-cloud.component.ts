import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-public-cloud',
  templateUrl: './usi-public-cloud.component.html',
  styleUrls: ['./usi-public-cloud.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiPublicCloudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  addtooltipMsg: string;
  viewtooltipMsg: string;
  publicClouds = PublicClouds;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.PUBLIC_CLOUD) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.PUBLIC_CLOUD) ? 'View Details' : 'You do not have permission';
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
        this.publicClouds.azure.length = res.filter(pc => pc.cloud_type == 'Azure').length;
        k = null;
      }
      k = res.find(pc => pc.cloud_type == PlatFormMapping.AWS);
      if (k) {
        this.publicClouds.aws.length = res.filter(pc => pc.cloud_type == 'AWS').length;
        k = null;
      }
      k = res.find(pc => pc.cloud_type == PlatFormMapping.GCP);
      if (k) {
        this.publicClouds.gcp.length = res.filter(pc => pc.cloud_type == 'GCP').length;
        k = null;
      }
      k = res.find(pc => pc.cloud_type == PlatFormMapping.ORACLE);
      if (k) {
        this.publicClouds.oracle.length = res.filter(pc => pc.cloud_type == 'Oracle').length;
        k = null;
      }
    })
  }

  addAzureAccount() {
    this.router.navigate(['azure', 'add'], { relativeTo: this.route });
  }

  viewAzureAccounts() {
    this.router.navigate(['azure/instances'], { relativeTo: this.route });
  }

  addAWSAccount() {
    this.router.navigate(['aws', 'add'], { relativeTo: this.route });
  }

  viewAWSAccounts() {
    this.router.navigate(['aws/instances'], { relativeTo: this.route });
  }

  addGCPAccount() {
    this.router.navigate(['gcp/add'], { relativeTo: this.route })
  }

  viewGCPAccount() {
    this.router.navigate(['gcp/instances'], { relativeTo: this.route });
  }

  addOracleAccount() {
    this.router.navigate(['oracle/add'], { relativeTo: this.route });
  }

  viewOracleAccount() {
    this.router.navigate(['oracle/instances'], { relativeTo: this.route });
  }
}

const PublicClouds = {
  'azure': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Microsoft_Azure_Logo 1.svg`,
    'length': 0
  },
  'aws': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/aws-integ.svg`,
    'length': 0
  },
  'gcp': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Google_Cloud_Platform-Logo 1.svg`,
    'length': 0
  },
  'oracle': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Oracle-cloud 1.svg`,
    'length': 0
  }
}
