import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'usi-others',
  templateUrl: './usi-others.component.html',
  styleUrls: ['./usi-others.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiOthersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  addtooltipMsg: string;
  viewtooltipMsg: string;
  // addtooltipMsgForSdwan: string;
  // viewtooltipMsgForSdwan: string;
  others = _clone(others);

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UnitySetupIntegrationService,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasCompleteAccess(UnityModules.PRIVATE_CLOUD) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.PRIVATE_CLOUD) ? 'View Details' : 'You do not have permission';
    // this.addtooltipMsgForSdwan = 'Integrate';
    // this.viewtooltipMsgForSdwan = 'View Details';
    if (this.userService.hasViewAccess(UnityModules.PRIVATE_CLOUD)) {
      this.getOthersList();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOthersList() {
    this.svc.getOthersList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // let tm = res.find((tm) => tm.type == 'Veeam');
      // if (tm) {
      //   this.others.veeam.length = res.filter(t => t.type == 'Veeam').length;
      //   tm = null;
      // }
      // let sd = res.find((tm) => tm.type == 'sdwan');
      // if (sd) {
      //   this.others.sdwan.length = res.filter(t => t.type == 'sdwan').length;
      //   sd = null;
      // }

      if (!res || !Array.isArray(res)) {
        return;
      }

      res.forEach(item => {
        if (item.type?.toLowerCase() === "veeam") {
          this.others.veeam.length += 1;
        }
        // else if (item.type?.toLowerCase() === "sdwan") {
        //   this.others.sdwan.length += 1;
        // }
      });
    })
  }

  goToaddVeeam() {
    this.router.navigate(['veeam', 'create'], { relativeTo: this.route });
  }

  goToVeeamViewDetails() {
    this.router.navigate(['veeam'], { relativeTo: this.route });
  }

  // gotToAddSdwan() {
  //   this.router.navigate(['sdwan', 'create'], { relativeTo: this.route });
  // }

  // goToSdwanViewDetails() {
  //   this.router.navigate(['sdwan'], { relativeTo: this.route });
  // }

}

const others = {
  'veeam': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Veeam_logo.svg`,
    'length': 0
  },
  // 'sdwan': {
  //   'imageURL': `${environment.assetsUrl}external-brand/logos/Update_SDWAN.svg`,
  //   'length': 0
  // }
}
