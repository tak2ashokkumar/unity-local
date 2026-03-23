import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'usi-network-controllers',
  templateUrl: './usi-network-controllers.component.html',
  styleUrls: ['./usi-network-controllers.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiNetworkControllersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  addtooltipMsg: string;
  viewtooltipMsg: string;
  networkControllers = _clone(networkControllers);
  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UnitySetupIntegrationService,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = 'Integrate';
    this.viewtooltipMsg = 'View Details';
    this.getNetworkControllersList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getNetworkControllersList() {
    this.svc.getNetworkControllersList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {

      if (!res || !Array.isArray(res)) {
        return;
      }

      res.forEach(item => {
        if (item.type?.toLowerCase() == "viptela") {
          this.networkControllers.viptela.length += 1;
        }
        if (item.type?.toLowerCase() == "meraki") {
          this.networkControllers.meraki.length += 1;
        }
      });
    })
  }

  goToaddViptela() {
    this.router.navigate(['viptela', 'create'], { relativeTo: this.route });
  }

  goToViptelaViewDetails() {
    this.router.navigate(['viptela'], { relativeTo: this.route });
  }

  goToaddCiscoMeraki() {
    this.router.navigate(['meraki', 'create'], { relativeTo: this.route });
  }

  goToCiscoMerakiViewDetails() {
    this.router.navigate(['meraki'], { relativeTo: this.route });
  }

}

const networkControllers = {
  'viptela': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Viptela.svg`,
    'length': 0
  },
  'meraki': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/miraki.svg`,
    'length': 0
  }
}